
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Slider } from '../components';
import { Colors, Layout } from '../constants';
import { StorageService } from '../utils/storage';
import { audioService } from '../services/audioService';
import { UserSettings } from '../types';

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    sensitivity: 5,
    vibrationEnabled: true,
    soundResponseEnabled: true,
    responseVolume: 0.7,
  });
  const [dogName, setDogName] = useState('');
  const [trainingGoal, setTrainingGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await StorageService.getUserSettings();
      setSettings(userSettings);
      setDogName(userSettings.dogName || '');
      setTrainingGoal(userSettings.trainingGoal || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const updatedSettings: UserSettings = {
        ...settings,
        dogName: dogName.trim() || undefined,
        trainingGoal: trainingGoal.trim() || undefined,
      };

      await StorageService.saveUserSettings(updatedSettings);
      await audioService.updateSensitivity(settings.sensitivity);
      
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSensitivityChange = (value: number) => {
    setSettings(prev => ({ ...prev, sensitivity: value }));
  };

  const handleVibrationToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, vibrationEnabled: value }));
  };

  const handleSoundToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, soundResponseEnabled: value }));
  };

  const handleVolumeChange = (value: number) => {
    setSettings(prev => ({ ...prev, responseVolume: value / 100 }));
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all training sessions, settings, and bark events. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
              loadSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const getSensitivityDescription = (value: number): string => {
    if (value <= 2) return 'Very Low - Only loud barks';
    if (value <= 4) return 'Low - Moderate barks';
    if (value <= 6) return 'Medium - Most barks';
    if (value <= 8) return 'High - Soft barks and whines';
    return 'Very High - All sounds';
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your crate training experience</Text>
          </View>

          {/* Dog Profile */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="paw" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Dog Profile</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dog's Name</Text>
              <TextInput
                style={styles.textInput}
                value={dogName}
                onChangeText={setDogName}
                placeholder="Enter your dog's name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Training Goal</Text>
              <TextInput
                style={styles.textInput}
                value={trainingGoal}
                onChangeText={setTrainingGoal}
                placeholder="e.g., Reduce crate anxiety"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </Card>

          {/* Detection Settings */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Detection Settings</Text>
            </View>

            <Slider
              label="Bark Sensitivity"
              value={settings.sensitivity}
              onValueChange={handleSensitivityChange}
              minimumValue={1}
              maximumValue={10}
              step={1}
            />
            <Text style={styles.sensitivityDescription}>
              {getSensitivityDescription(settings.sensitivity)}
            </Text>
          </Card>

          {/* Response Settings */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Response Settings</Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Vibration Response</Text>
                <Text style={styles.settingDescription}>
                  Vibrate device when bark is detected
                </Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: Colors.surfaceLight, true: Colors.primaryLight }}
                thumbColor={settings.vibrationEnabled ? Colors.primary : Colors.textMuted}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Response</Text>
                <Text style={styles.settingDescription}>
                  Play calming sound when bark is detected
                </Text>
              </View>
              <Switch
                value={settings.soundResponseEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: Colors.surfaceLight, true: Colors.primaryLight }}
                thumbColor={settings.soundResponseEnabled ? Colors.primary : Colors.textMuted}
              />
            </View>

            {settings.soundResponseEnabled && (
              <Slider
                label="Response Volume"
                value={Math.round(settings.responseVolume * 100)}
                onValueChange={handleVolumeChange}
                minimumValue={10}
                maximumValue={100}
                step={10}
                unit="%"
              />
            )}
          </Card>

          {/* Privacy */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Privacy & Data</Text>
            </View>

            <Text style={styles.privacyText}>
              🔒 All audio recordings and training data stay on your device
            </Text>
            <Text style={styles.privacyText}>
              📵 No cloud uploads or third-party sharing
            </Text>
            <Text style={styles.privacyText}>
              🔐 No account creation required
            </Text>
            <Text style={styles.privacyText}>
              ✅ GDPR and CCPA compliant
            </Text>

            <Button
              title="Clear All Data"
              onPress={clearAllData}
              variant="outline"
              size="medium"
              style={styles.clearButton}
            />
          </Card>

          {/* App Info */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>App Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Developer</Text>
              <Text style={styles.infoValue}>CrateQuiet Team</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title="Save Settings"
            onPress={saveSettings}
            loading={isLoading}
            size="large"
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
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Layout.spacing.md,
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  inputLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  sensitivityDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Layout.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  privacyText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
    lineHeight: 20,
  },
  clearButton: {
    marginTop: Layout.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  infoLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
});
