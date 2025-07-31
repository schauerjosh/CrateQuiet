import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Mic, Play, Square, Save } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

export default function RecordSoundScreen() {
  const router = useRouter();
  const { startRecording, stopRecording, isRecording, playSound, customSoundUri } = useApp();
  
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize with existing custom sound if available
    if (customSoundUri) {
      setRecordedUri(customSoundUri);
    }

    // Clean up timer on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [customSoundUri]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimer(interval);
    } else {
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRecordingDuration(0);
    await startRecording();
  };

  const handleStopRecording = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const uri = await stopRecording();
    if (uri) {
      setRecordedUri(uri);
    }
  };

  const handlePlayRecording = async () => {
    if (recordedUri) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setIsPlaying(true);
      await playSound(recordedUri);
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000); // Assume sound is less than 3 seconds
    }
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Sound Saved",
        "Your custom sound has been saved successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordingCard}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {isRecording ? formatTime(recordingDuration) : "00:00"}
          </Text>
          <Text style={styles.instructionText}>
            {isRecording 
              ? "Recording in progress..." 
              : recordedUri 
                ? "Recording complete" 
                : "Press the microphone to start"}
          </Text>
        </View>

        <View style={styles.visualizer}>
          {isRecording && (
            <View style={styles.visualizerBars}>
              {[...Array(20)].map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.visualizerBar, 
                    { 
                      height: Math.random() * 50 + 10, 
                      backgroundColor: Colors.primary 
                    }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          {isRecording ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopRecording}
            >
              <Square size={24} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.recordButton]}
              onPress={handleStartRecording}
            >
              <Mic size={24} color={Colors.white} />
            </TouchableOpacity>
          )}

          {recordedUri && !isRecording && (
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton, isPlaying && styles.playingButton]}
              onPress={handlePlayRecording}
              disabled={isPlaying}
            >
              <Play size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Recording Tips</Text>
        <Text style={styles.infoText}>
          • Record in a quiet environment{"\n"}
          • Speak clearly and calmly{"\n"}
          • Keep the recording short (5-10 seconds){"\n"}
          • Use a soothing voice that your dog recognizes
        </Text>
      </View>

      {recordedUri && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color={Colors.white} style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Save and Use This Sound</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  recordingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  visualizer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  visualizerBars: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  visualizerBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
  },
  recordButton: {
    backgroundColor: Colors.primary,
  },
  stopButton: {
    backgroundColor: Colors.error,
  },
  playButton: {
    backgroundColor: Colors.accent,
  },
  playingButton: {
    opacity: 0.7,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: "500",
  },
});