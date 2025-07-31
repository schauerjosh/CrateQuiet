import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Vibration, Platform, Alert } from "react-native";
import { Dog, Session, Settings, SessionEvent } from "@/types";

const STORAGE_KEYS = {
  DOG_PROFILE: "dog_profile",
  SESSIONS: "sessions",
  SETTINGS: "settings",
  CUSTOM_SOUND: "custom_sound",
  ONBOARDED: "onboarded",
};

const DEFAULT_SETTINGS: Settings = {
  sensitivity: 1.0, // Max threshold for least aggressive detection
  vibrationEnabled: true,
  soundEnabled: true,
  notificationsEnabled: true,
  useCustomSound: false,
};

const DEFAULT_DOG: Dog = {
  id: "default",
  name: "",
  breed: "",
  age: 0,
  photo: null,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [dog, setDog] = useState<Dog>(DEFAULT_DOG);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customSoundUri, setCustomSoundUri] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isBarking, setIsBarking] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [monitoringRecording, setMonitoringRecording] = useState<Audio.Recording | null>(null);
  const [monitoringTimer, setMonitoringTimer] = useState<number | null>(null);
  const [isBarkCooldown, setIsBarkCooldown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (monitoringTimer) {
        clearInterval(monitoringTimer);
      }
      if (monitoringRecording) {
        monitoringRecording.stopAndUnloadAsync().catch(console.error);
      }
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const dogData = await AsyncStorage.getItem(STORAGE_KEYS.DOG_PROFILE);
      if (dogData) {
        setDog(JSON.parse(dogData));
      }

      const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (sessionsData) {
        setSessions(JSON.parse(sessionsData));
      }

      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }

      const customSound = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_SOUND);
      if (customSound) {
        setCustomSoundUri(customSound);
      }

      const onboarded = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED);
      setIsOnboarded(onboarded === "true");
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDog = async (updatedDog: Dog) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DOG_PROFILE, JSON.stringify(updatedDog));
      setDog(updatedDog);
    } catch (error) {
      console.error("Error saving dog profile:", error);
    }
  };

  const saveSettings = async (updatedSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const saveCustomSound = async (uri: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SOUND, uri);
      setCustomSoundUri(uri);
    } catch (error) {
      console.error("Error saving custom sound:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
      setIsOnboarded(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const addSession = async (session: Session) => {
    try {
      const updatedSessions = [...sessions, session];
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };

  const startRecording = async () => {
    try {
      if (recording) {
        await stopRecording();
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return null;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        await saveCustomSound(uri);
      }
      
      return uri;
    } catch (error) {
      console.error("Failed to stop recording", error);
      return null;
    }
  };

  const playSound = async (uri: string) => {
    try {
      console.log("🎵 Preparing to play sound:", uri);
      
      // Unload previous sound if exists
      if (sound) {
        console.log("🔄 Unloading previous sound");
        await sound.unloadAsync();
        setSound(null);
      }

      // Configure audio mode for speaker playback
      console.log("🔧 Setting audio mode for speaker playback");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false, // Force speaker on Android
      });

      console.log("📱 Creating sound object");
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false, // Don't auto-play, we'll control it
          volume: 0.4, // Slightly louder for better audibility
          isLooping: false,
          rate: 1.0,
          shouldCorrectPitch: true,
        }
      );
      
      setSound(newSound);
      
      // Set up playback status monitoring
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log("✅ Sound playback finished");
            newSound.unloadAsync().then(() => {
              setSound(null);
            }).catch(console.error);
          }
        } else if (status.error) {
          console.error("❌ Sound playback error:", status.error);
        }
      });

      // Start playback
      console.log("▶️ Starting sound playback");
      await newSound.playAsync();
      console.log("✅ Sound playback initiated successfully");
      
    } catch (error) {
      console.error("❌ Failed to play sound:", error);
      throw error;
    }
  };

  const playResponseSound = async () => {
    try {
      console.log("🔊 Playing response sound sequence...", { 
        soundEnabled: settings.soundEnabled, 
        useCustomSound: settings.useCustomSound, 
        customSoundUri: !!customSoundUri,
        vibrationEnabled: settings.vibrationEnabled,
        platform: Platform.OS
      });
      // STEP 1: Immediate strong vibration (if enabled)
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        try {
          console.log(`📳 About to trigger vibration. Platform: ${Platform.OS}`);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          console.log("✅ Haptics vibration triggered");
        } catch (hapticsError) {
          console.error("❌ Haptics failed, trying Vibration.vibrate:", hapticsError);
          try {
            Vibration.vibrate(500);
            console.log("✅ Fallback vibration triggered with Vibration.vibrate");
          } catch (vibError) {
            console.error("❌ Fallback vibration also failed:", vibError);
          }
        }
      } else {
        console.log("⚠️ Vibration not triggered: disabled or web platform");
      }
      // STEP 2: Wait 2 seconds, then play sound (if available and enabled)
      setTimeout(async () => {
        if (settings.soundEnabled && settings.useCustomSound && customSoundUri) {
          console.log("🎵 Playing custom sound after vibration delay:", customSoundUri);
          try {
            await playSound(customSoundUri);
            console.log("✅ Custom sound playback completed");
          } catch (soundError) {
            console.error("❌ Failed to play custom sound:", soundError);
          }
        } else if (settings.soundEnabled && settings.useCustomSound && !customSoundUri) {
          console.log("⚠️ Sound enabled but no custom sound recorded");
        } else {
          console.log("🔇 Sound playback disabled in settings");
        }
      }, 2000); // 2 second delay after vibration
    } catch (error) {
      console.error("❌ Critical error in response sound sequence:", error);
      // Emergency fallback - at least try to vibrate
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        try {
          console.log("🚨 Attempting emergency fallback vibration");
          Vibration.vibrate(500);
        } catch (fallbackError) {
          console.error("❌ Even fallback vibration failed:", fallbackError);
        }
      }
    }
  };

  const startMonitoringMicrophone = async () => {
    try {
      if (Platform.OS === 'web') {
        console.log("Web monitoring not fully supported, using simulation");
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Audio permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
        isMeteringEnabled: true, // Enable metering for audio level detection
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setMonitoringRecording(newRecording);

      console.log("Recording started, beginning audio level monitoring...");

      // Check audio levels every 100ms for more responsive detection
      const timer = setInterval(async () => {
        try {
          const status = await newRecording.getStatusAsync();
          if (status.isRecording && typeof status.metering === 'number') {
            // iOS metering is typically -160 to 0 dB, Android varies
            // Normalize to 0-1 scale with more aggressive detection
            let normalizedLevel = 0;
            
            if (Platform.OS === 'ios') {
              // iOS: -160 to 0 dB range
              normalizedLevel = Math.max(0, Math.min(1, (status.metering + 160) / 160));
            } else {
              // Android: typically -120 to 0 dB range
              normalizedLevel = Math.max(0, Math.min(1, (status.metering + 120) / 120));
            }
            
            // Use a much lower threshold for bark detection
            const baseThreshold = 0.9; // Very high base threshold to avoid false positives
            const userSensitivity = settings.sensitivity; // 0.0 to 1.0
            const finalThreshold = baseThreshold + (userSensitivity * 0.1); // Max threshold of 1.0
            
            console.log(`Audio: ${normalizedLevel.toFixed(3)} | Threshold: ${finalThreshold.toFixed(3)} | Raw: ${status.metering}`);
            
            // Detect bark if level exceeds threshold
            if (normalizedLevel > finalThreshold) {
              // Only process bark if monitoring is still active
            //   if (isMonitoring) {
                console.log(`🐕 BARK DETECTED! Level: ${normalizedLevel.toFixed(3)}, Threshold: ${finalThreshold.toFixed(3)}`);
                handleBarkDetected();
            //   } else {
            //     console.log("🚫 Bark detected but monitoring is not active, ignoring.");
            //   }
            }
          } else {
            console.log("Recording status:", { isRecording: status.isRecording, metering: status.metering });
          }
        } catch (error) {
          console.error("Error checking audio levels:", error);
        }
      }, 100); // Faster polling for better responsiveness

      setMonitoringTimer(timer as unknown as number);
      console.log("Microphone monitoring started successfully with enhanced detection");
    } catch (error) {
      console.error("Failed to start monitoring microphone:", error);
    }
  };

  const stopMonitoringMicrophone = async () => {
    try {
      if (monitoringTimer) {
        clearInterval(monitoringTimer);
        setMonitoringTimer(null);
      }

      if (monitoringRecording) {
        await monitoringRecording.stopAndUnloadAsync();
        setMonitoringRecording(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      console.log("Microphone monitoring stopped");
    } catch (error) {
      console.error("Failed to stop monitoring microphone:", error);
    }
  };

  const handleBarkDetected = async () => {
    // if (!isMonitoring) {
    //   console.log("🚫 Bark detection ignored - not monitoring");
    //   return;
    // }
    // Always allow the first bark after monitoring starts
    if (!isBarkCooldown) {
      setIsBarkCooldown(true);
      setIsBarking(true);
      console.log("🚨 BARK DETECTED! Starting immediate response sequence...");
      try {
        await playResponseSound();
      } catch (error) {
        console.error("❌ Error in response sequence:", error);
        
        // Emergency fallback - just vibrate if everything else fails
        if (settings.vibrationEnabled && Platform.OS !== 'web') {
          try {
            console.log("🚨 Emergency vibration fallback");
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch (vibError) {
            console.error("❌ Even emergency vibration failed:", vibError);
          }
        }
      }
      
      // Update session data in background
      try {
        const now = new Date();
        const existingSession = sessions.find(s => {
          const sessionDate = new Date(s.date);
          return sessionDate.toDateString() === now.toDateString() && s.isActive;
        });

        if (existingSession) {
          const barkEvent: SessionEvent = { time: now.toISOString(), type: 'bark' };
          const updatedSessions = sessions.map(s => {
            if (s.id === existingSession.id) {
              return {
                ...s,
                barkCount: s.barkCount + 1,
                events: [...s.events, barkEvent]
              };
            }
            return s;
          });
          
          await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
          setSessions(updatedSessions);
          console.log("📊 Session updated with bark event");
        } else {
          const startEvent: SessionEvent = { time: now.toISOString(), type: 'start' };
          const barkEvent: SessionEvent = { time: now.toISOString(), type: 'bark' };
          const newSession: Session = {
            id: Date.now().toString(),
            date: now.toISOString(),
            duration: 0,
            barkCount: 1,
            isActive: true,
            events: [startEvent, barkEvent]
          };
          
          await addSession(newSession);
          console.log("📊 New session created with bark event");
        }
      } catch (sessionError) {
        console.error("❌ Failed to update session data:", sessionError);
      }
      
      // Reset barking state after 10 seconds to prevent immediate retrigger
      setTimeout(() => {
        setIsBarking(false);
        setIsBarkCooldown(false);
        console.log("✅ Bark state reset - ready for next detection");
      }, 10000);
    } else {
      console.log("🚫 Bark detection ignored - in cooldown");
    }
  };

  const startMonitoring = async () => {
    console.log("Starting monitoring");
    setIsMonitoring(true);
    await startMonitoringMicrophone();
  };

  const stopMonitoring = async () => {
    console.log("Stopping monitoring");
    setIsMonitoring(false);
    setIsBarking(false);
    await stopMonitoringMicrophone();
  };

  const simulateBarkDetection = async () => {
    if (!isMonitoring) {
      console.log("Not monitoring, ignoring bark simulation");
      return;
    }
    
    console.log("Simulating bark detection");
    await handleBarkDetected();
  };

  const endCurrentSession = async () => {
    const activeSession = sessions.find(s => s.isActive);
    
    if (activeSession) {
      const now = new Date();
      const startTime = new Date(activeSession.date);
      const durationMs = now.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      
      const endEvent: SessionEvent = { time: now.toISOString(), type: 'end' };
      const updatedSessions = sessions.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            isActive: false,
            duration: durationMinutes,
            events: [...s.events, endEvent]
          };
        }
        return s;
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    }
  };

  return {
    dog,
    saveDog,
    sessions,
    addSession,
    settings,
    saveSettings,
    customSoundUri,
    saveCustomSound,
    isOnboarded,
    isLoading,
    completeOnboarding,
    isMonitoring,
    isBarking,
    startMonitoring,
    stopMonitoring,
    simulateBarkDetection,
    startRecording,
    stopRecording,
    isRecording,
    playSound,
    endCurrentSession,
  };
});