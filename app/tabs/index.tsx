import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Mic, Volume2, Dog, Settings, Play } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { Platform } from "react-native";

// Removed unused width variable

export default function MonitorScreen() {
  const router = useRouter();
  const { 
    dog, 
    isOnboarded, 
    isLoading,
    isMonitoring, 
    isBarking,
    startMonitoring, 
    stopMonitoring, 
    simulateBarkDetection,
    endCurrentSession,
    customSoundUri,
    settings
  } = useApp();

  const audioLevelRef = useRef(0);

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isOnboarded, router]);

  useEffect(() => {
    return () => {
      if (isMonitoring) {
        endCurrentSession();
      }
    };
  }, [isMonitoring]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleToggleMonitoring = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isMonitoring) {
      await stopMonitoring();
      endCurrentSession();
    } else {
      // Check if user has recorded a custom sound when sound is enabled
      if (settings.soundEnabled && settings.useCustomSound && !customSoundUri) {
        Alert.alert(
          "⚠️ No Custom Sound Recorded",
          "When a bark is detected:\n\n✅ Device will vibrate strongly\n❌ No sound will play (not recorded yet)\n\nRecord a custom sound for full functionality.",
          [
            { 
              text: "Record Sound First", 
              onPress: () => router.push("/record-sound"),
              style: "default"
            },
            { 
              text: "Start Monitoring (Vibration Only)", 
              onPress: () => startMonitoring(),
              style: "cancel"
            }
          ]
        );
        return;
      }
      
      await startMonitoring();
    }
  };

  const handleTestResponse = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!isMonitoring) {
      Alert.alert(
        "Start Monitoring First",
        "You need to start monitoring before testing the response.",
        [{ text: "OK" }]
      );
      return;
    }
    
    console.log("🧪 User triggered test response");
    simulateBarkDetection();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Dog Info */}
      <View style={styles.header}>
        <View style={styles.dogInfoContainer}>
          {dog.photo ? (
            <View style={styles.dogImageContainer}>
              <Image source={{ uri: dog.photo }} style={styles.dogImage} />
              <View style={styles.dogImageBorder} />
            </View>
          ) : (
            <View style={styles.dogPlaceholder}>
              <Dog size={32} color={Colors.primary} />
            </View>
          )}
          <View style={styles.dogInfo}>
            <Text style={styles.dogName}>{dog.name || "Your Dog"}</Text>
            <Text style={styles.dogBreed}>{dog.breed || "Add dog details"}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push("/dog-profile")}
        >
          <Settings size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Monitoring Card */}
      <View style={styles.monitoringSection}>
        <LinearGradient
          colors={isBarking ? ['#FF6B6B', '#FF8E53'] : isMonitoring ? [Colors.primary, '#0099CC'] : [Colors.surface, Colors.card]}
          style={[styles.monitorCard, isBarking && styles.barkingCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isMonitoring && styles.activeIndicator]} />
            <TouchableOpacity style={styles.microphoneIconContainer}>
              <Mic size={48} color={audioLevelRef.current > 0.5 ? '#FF6B6B' : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.statusText}>
              {isBarking 
                ? "Bark Detected!" 
                : isMonitoring 
                  ? "Monitoring Active" 
                  : "Ready to Monitor"}
            </Text>
          </View>

          <View style={styles.visualContainer}>
            {isBarking ? (
              <View style={styles.barkingVisual}>
                <Volume2 size={60} color={Colors.white} />
                <View style={styles.soundWaves}>
                  {[...Array(5)].map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.soundWave, 
                        { 
                          width: 20 + i * 10,
                          height: 20 + i * 10,
                        }
                      ]} 
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.micContainer}>
                <Mic size={60} color={isMonitoring ? Colors.white : Colors.primary} />
                {isMonitoring && (
                  <View style={styles.listeningIndicator}>
                    <Text style={styles.listeningText}>Listening...</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Text style={styles.monitorDescription}>
            {isBarking 
              ? "Playing calming response..." 
              : isMonitoring 
                ? "Listening for barking or whining" 
                : "Tap start to begin monitoring your dog"}
          </Text>

          <TouchableOpacity
            style={[styles.monitorButton, isMonitoring && styles.stopButton]}
            onPress={handleToggleMonitoring}
          >
            <Text style={styles.buttonText}>
              {isMonitoring ? "STOP MONITORING" : "START MONITORING"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleTestResponse}
        >
          <Play size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Test Response</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => router.push("/record-sound")}
        >
          <Mic size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Record Sound</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How CrateQuiet Works</Text>
        <Text style={styles.infoText}>
          • Monitors your dog's sounds in real-time{'\n'}
          • Detects barking and whining automatically{'\n'}
          • Plays calming responses to soothe your dog{'\n'}
          • Tracks progress over time
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  dogInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dogImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  dogImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  dogImageBorder: {
    position: "absolute",
    top: -3,
    left: -3,
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dogPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  dogBreed: {
    fontSize: 14,
    color: Colors.textLight,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  monitoringSection: {
    marginBottom: 30,
  },
  monitorCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    minHeight: 320,
    justifyContent: "space-between",
  },
  barkingCard: {
    transform: [{ scale: 1.02 }],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.inactive,
    marginRight: 10,
  },
  activeIndicator: {
    backgroundColor: Colors.success,
  },
  statusText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  visualContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  barkingVisual: {
    alignItems: "center",
    position: "relative",
  },
  soundWaves: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  soundWave: {
    position: "absolute",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.white,
    opacity: 0.3,
  },
  micContainer: {
    alignItems: "center",
  },
  listeningIndicator: {
    marginTop: 12,
  },
  listeningText: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  monitorDescription: {
    color: Colors.white,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.9,
  },
  monitorButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  microphoneIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
});