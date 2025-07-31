import React, { useState } from "react";
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Volume2, Vibrate, Bell, Mic, HelpCircle } from "lucide-react-native";
import Slider from "@/components/Slider";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings, customSoundUri, playSound } = useApp();
  
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleSensitivityChange = (value: number) => {
    setLocalSettings(prev => ({ ...prev, sensitivity: value }));
  };

  const handleToggleSwitch = (setting: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSaveSettings = async () => {
    await saveSettings(localSettings);
    if (Platform.OS !== 'web') {
      Alert.alert("Settings Saved", "Your settings have been updated successfully.");
    }
  };

  const handlePlayCustomSound = () => {
    if (customSoundUri) {
      playSound(customSoundUri);
    } else {
      if (Platform.OS !== 'web') {
        Alert.alert(
          "No Custom Sound", 
          "You haven't recorded a custom sound yet. Would you like to record one now?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Record", onPress: () => router.push("/record-sound") }
          ]
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Detection Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection</Text>
        
        <View style={styles.sensitivityContainer}>
          <Text style={styles.settingLabel}>Sensitivity</Text>
          <View style={styles.sensitivitySlider}>
            <Text style={styles.sensitivityLabel}>Low</Text>
            <Slider
              value={localSettings.sensitivity}
              onValueChange={handleSensitivityChange}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.inactive}
              thumbTintColor={Colors.primary}
              style={styles.slider}
            />
            <Text style={styles.sensitivityLabel}>High</Text>
          </View>
          <Text style={styles.sensitivityValue}>
            {Math.round(localSettings.sensitivity * 100)}%
          </Text>
        </View>
      </View>

      {/* Response Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Response</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Vibrate size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate when bark detected</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.inactive}
            onValueChange={() => handleToggleSwitch('vibrationEnabled')}
            value={localSettings.vibrationEnabled}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Volume2 size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Sound Response</Text>
              <Text style={styles.settingDescription}>Play calming sound</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.inactive}
            onValueChange={() => handleToggleSwitch('soundEnabled')}
            value={localSettings.soundEnabled}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Get notified of activity</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.inactive}
            onValueChange={() => handleToggleSwitch('notificationsEnabled')}
            value={localSettings.notificationsEnabled}
          />
        </View>
      </View>

      {/* Custom Sound */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Sound</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Mic size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Use Custom Sound</Text>
              <Text style={styles.settingDescription}>
                {customSoundUri ? "Custom sound recorded" : "Use default calming sound"}
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.inactive}
            onValueChange={() => handleToggleSwitch('useCustomSound')}
            value={localSettings.useCustomSound}
            disabled={!customSoundUri}
          />
        </View>
        
        <View style={styles.soundButtons}>
          <TouchableOpacity 
            style={styles.soundButton}
            onPress={() => router.push("/record-sound")}
          >
            <Mic size={16} color={Colors.background} />
            <Text style={styles.soundButtonText}>Record New</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.soundButton, styles.secondaryButton, !customSoundUri && styles.disabledButton]}
            onPress={handlePlayCustomSound}
            disabled={!customSoundUri}
          >
            <Volume2 size={16} color={customSoundUri ? Colors.primary : Colors.inactive} />
            <Text style={[styles.soundButtonText, styles.secondaryButtonText, !customSoundUri && styles.disabledButtonText]}>
              Play Sound
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        
        <TouchableOpacity style={styles.helpItem}>
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.helpText}>How to Use CrateQuiet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpItem}>
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.helpText}>Training Tips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpItem}>
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.helpText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
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
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
  },
  sensitivityContainer: {
    alignItems: "center",
  },
  sensitivitySlider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  sensitivityLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500",
  },
  sensitivityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  soundButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  soundButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.inactive,
  },
  soundButtonText: {
    color: Colors.background,
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  disabledButtonText: {
    color: Colors.inactive,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  helpText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
});