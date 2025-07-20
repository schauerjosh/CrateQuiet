import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as KeepAwake from 'expo-keep-awake';
import { Button, Card, WaveformView, Slider } from '../components';
import { Colors, Layout } from '../constants';
import { audioService, AudioAnalysisResult } from '../services/audioService';
import { StorageService } from '../utils/storage';
import { BarkEvent, UserSettings } from '../types';
import { Switch } from 'react-native';
import * as Haptics from 'expo-haptics';

export const MonitoringScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [barkDetected, setBarkDetected] = useState(false);
  const [barkCount, setBarkCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0));
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  const barkAnimation = useRef(new Animated.Value(0)).current;
  const sessionStartTime = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettings();
    return () => {
      stopMonitoring();
    };
  }, []);

  useEffect(() => {
    if (barkDetected) {
      Animated.sequence([
        Animated.timing(barkAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(barkAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setBarkDetected(false), 500);
    }
  }, [barkDetected]);

  const loadSettings = async () => {
    const userSettings = await StorageService.getUserSettings();
    setSettings(userSettings);
  };

  const startMonitoring = async () => {
    try {
      const success = await audioService.startListening(
        handleBarkDetected,
        handleAudioData
      );

      if (success) {
        setIsListening(true);
        sessionStartTime.current = new Date();
        setBarkCount(0);
        setSessionDuration(0);
        
        // Keep screen awake during monitoring
        KeepAwake.activateKeepAwake();
        
        // Start session timer
        intervalRef.current = setInterval(() => {
          if (sessionStartTime.current) {
            const elapsed = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000);
            setSessionDuration(elapsed);
          }
        }, 1000);
      } else {
        Alert.alert(
          'Permission Required',
          'CrateQuiet needs microphone access to monitor your dog. Please enable microphone permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error starting monitoring:', error);
      Alert.alert('Error', 'Failed to start monitoring. Please try again.');
    }
  };

  const stopMonitoring = async () => {
    await audioService.stopListening();
    setIsListening(false);
    KeepAwake.deactivateKeepAwake();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save training session if there was activity
    if (sessionStartTime.current && sessionDuration > 0) {
      await saveTrainingSession();
    }
  };

  const handleBarkDetected = (event: BarkEvent) => {
    setBarkDetected(true);
    setBarkCount(prev => {
      const newCount = prev + 1;
      // Trigger vibration every 5th bark
      if (newCount > 0 && newCount % 5 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      return newCount;
    });
  };

  const handleAudioData = (data: AudioAnalysisResult) => {
    setCurrentVolume(data.volume);
    
    // Update waveform data
    const newWaveformData = audioService.getWaveformData();
    if (newWaveformData.length > 0) {
      setWaveformData(newWaveformData.slice(-50));
    }
  };

  const saveTrainingSession = async () => {
    if (!sessionStartTime.current) return;

    const session = {
      id: Date.now().toString(),
      date: sessionStartTime.current,
      duration: sessionDuration,
      barksDetected: barkCount,
      success: barkCount === 0,
      notes: undefined,
      photos: undefined,
    };

    await StorageService.saveTrainingSession(session);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeColor = () => {
    if (currentVolume > 70) return Colors.error;
    if (currentVolume > 40) return Colors.warning;
    return Colors.success;
  };

  const handleSensitivityChange = (value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      sensitivity: value,
    });
  };

  const handleVibrationToggle = (value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      vibrationEnabled: value,
    });
  };

  const handleSoundToggle = (value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      soundResponseEnabled: value,
    });
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Crate Monitor</Text>
            <Text style={styles.subtitle}>
              {isListening ? 'Listening for barks and whines' : 'Tap start to begin monitoring'}
            </Text>
          </View>

          {/* Status Card */}
          <Card style={styles.statusCard} gradient>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, isListening && styles.statusActive]} />
              <Text style={styles.statusText}>
                {isListening ? 'Monitoring Active' : 'Monitoring Stopped'}
              </Text>
            </View>
            
            {isListening && (
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{formatDuration(sessionDuration)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Barks Detected</Text>
                  <Animated.Text 
                    style={[
                      styles.statValue,
                      {
                        transform: [{
                          scale: barkAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        }],
                        color: barkDetected ? Colors.error : Colors.primary,
                      },
                    ]}
                  >
                    {barkCount}
                  </Animated.Text>
                </View>
              </View>
            )}
          </Card>

          {/* Waveform Visualization */}
          <Card style={styles.waveformCard}>
            <View style={styles.waveformHeader}>
              <Text style={styles.cardTitle}>Audio Level</Text>
              <View style={styles.volumeIndicator}>
                <View 
                  style={[
                    styles.volumeBar,
                    { backgroundColor: getVolumeColor() },
                  ]}
                />
                <Text style={styles.volumeText}>{Math.round(currentVolume)}%</Text>
              </View>
            </View>
            
            <WaveformView
              data={waveformData}
              isActive={isListening}
              barkDetected={barkDetected}
            />
          </Card>

          {/* Sensitivity Settings */}
          {settings && (
            <Card style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Ionicons name="volume-high" size={24} color={Colors.primary} />
                <Text style={styles.settingLabel}>Sensitivity</Text>
                <Slider
                  label="Sensitivity"
                  value={settings.sensitivity}
                  onValueChange={handleSensitivityChange}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  unit="/10"
                />
              </View>
              <View style={styles.settingRow}>
                <Ionicons 
                  name={settings.vibrationEnabled ? "phone-portrait" : "phone-portrait-outline"} 
                  size={24} 
                  color={settings.vibrationEnabled ? Colors.primary : Colors.textMuted} 
                />
                <Text style={styles.settingLabel}>Vibration Response</Text>
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={handleVibrationToggle}
                  thumbColor={settings.vibrationEnabled ? Colors.success : Colors.surfaceLight}
                  trackColor={{ false: Colors.surfaceLight, true: Colors.success }}
                />
              </View>
              <View style={styles.settingRow}>
                <Ionicons 
                  name={settings.soundResponseEnabled ? "volume-high" : "volume-mute"} 
                  size={24} 
                  color={settings.soundResponseEnabled ? Colors.primary : Colors.textMuted} 
                />
                <Text style={styles.settingLabel}>Sound Response</Text>
                <Switch
                  value={settings.soundResponseEnabled}
                  onValueChange={handleSoundToggle}
                  thumbColor={settings.soundResponseEnabled ? Colors.success : Colors.surfaceLight}
                  trackColor={{ false: Colors.surfaceLight, true: Colors.success }}
                />
              </View>
            </Card>
          )}

          {/* Dog Profile */}
          {settings?.dogName && (
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Ionicons name="paw" size={32} color={Colors.primary} />
                <View>
                  <Text style={styles.dogName}>{settings.dogName}</Text>
                  <Text style={styles.dogGoal}>{settings.trainingGoal || 'Crate Training'}</Text>
                </View>
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Control Button */}
        <View style={styles.controlContainer}>
          <Button
            title={isListening ? 'Stop Monitoring' : 'Start Monitoring'}
            onPress={isListening ? stopMonitoring : startMonitoring}
            size="large"
            variant={isListening ? 'secondary' : 'primary'}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  header: {
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: Layout.spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textMuted,
    marginRight: Layout.spacing.md,
  },
  statusActive: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  statValue: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  waveformCard: {
    marginBottom: Layout.spacing.lg,
  },
  waveformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  cardTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  volumeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeBar: {
    width: 8,
    height: 16,
    borderRadius: 4,
    marginRight: Layout.spacing.sm,
  },
  volumeText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  settingsCard: {
    marginBottom: Layout.spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  settingLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  settingValue: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  profileCard: {
    marginBottom: Layout.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dogName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Layout.spacing.md,
  },
  dogGoal: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.md,
  },
  controlContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
});
