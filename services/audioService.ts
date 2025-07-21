import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { StorageService } from '../utils/storage';
import { BarkEvent, UserSettings } from '../types';

export interface AudioAnalysisResult {
  volume: number;
  isBark: boolean;
  confidence: number;
  frequency: number;
}

export class AudioService {
  private recording: Audio.Recording | null = null;
  private isListening: boolean = false;
  private sensitivity: number = 5;
  private onBarkDetected?: (event: BarkEvent) => void;
  private onAudioData?: (data: AudioAnalysisResult) => void;
  private responseSound: Audio.Sound | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private waveformData: number[] = [];
  private customSoundUri: string | null = null;
  
  constructor() {
    this.setupAudio();
    this.loadResponseSound();
  }

  private async setupAudio(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }

  private async loadResponseSound(): Promise<void> {
    try {
      // For now, we'll skip loading external sounds and generate simple tones
      // In production, this would load local audio assets
      console.log('Response sound system initialized (using haptic feedback only)');
    } catch (error) {
      console.warn('Could not load response sound:', error);
    }
  }

  public async startListening(
    onBarkDetected?: (event: BarkEvent) => void,
    onAudioData?: (data: AudioAnalysisResult) => void
  ): Promise<boolean> {
    if (this.isListening) return true;

    try {
      this.onBarkDetected = onBarkDetected;
      this.onAudioData = onAudioData;

      // Load user settings
      const settings = await StorageService.getUserSettings();
      this.sensitivity = settings.sensitivity;

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();
      this.isListening = true;

      // Start monitoring audio levels
      this.startAudioAnalysis();

      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return false;
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.isListening = false;
    } catch (error) {
      console.error('Error stopping audio recording:', error);
    }
  }

  private startAudioAnalysis(): void {
    this.intervalId = setInterval(async () => {
      if (!this.recording || !this.isListening) return;

      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          // Simulate audio analysis - in production, this would analyze actual audio data
          const simulatedVolume = Math.random() * 100;
          const simulatedFrequency = 800 + Math.random() * 1200; // Dog bark frequency range
          
          // Generate waveform data
          this.updateWaveform(simulatedVolume);
          
          // Detect bark based on volume and frequency
          const isBark = this.detectBark(simulatedVolume, simulatedFrequency);
          const confidence = isBark ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3;
          
          const analysisResult: AudioAnalysisResult = {
            volume: simulatedVolume,
            isBark,
            confidence,
            frequency: simulatedFrequency,
          };

          // Notify listeners
          this.onAudioData?.(analysisResult);

          // Handle bark detection
          if (isBark && confidence > 0.6) {
            await this.handleBarkDetected(analysisResult);
          }
        }
      } catch (error) {
        console.error('Error in audio analysis:', error);
      }
    }, 100); // Analyze every 100ms
  }

  private updateWaveform(volume: number): void {
    this.waveformData.push(volume);
    if (this.waveformData.length > 100) {
      this.waveformData.shift();
    }
  }

  public getWaveformData(): number[] {
    return [...this.waveformData];
  }

  private detectBark(volume: number, frequency: number): boolean {
    // Bark detection algorithm
    // Further filter out background noise
    const baseThreshold = 50; // Ignore anything below this
    const volumeThreshold = Math.max(baseThreshold, (10 - this.sensitivity) * 8);
    const isLoudEnough = volume > volumeThreshold;
    const isInBarkFrequency = frequency >= 500 && frequency <= 2000;
    return isLoudEnough && isInBarkFrequency;
  }

  private async handleBarkDetected(analysis: AudioAnalysisResult): Promise<void> {
    const barkEvent: BarkEvent = {
      timestamp: new Date(),
      volume: analysis.volume,
      duration: 1, // Approximate duration
      confidence: analysis.confidence,
    };

    // Save bark event
    await StorageService.saveBarkEvent(barkEvent);

    // Notify callback
    this.onBarkDetected?.(barkEvent);

    // Trigger responses
    await this.triggerResponses();
  }

  private async triggerResponses(): Promise<void> {
    try {
      const settings = await StorageService.getUserSettings();

      // Vibration response
      if (settings.vibrationEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Add a second vibration for more noticeable feedback
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 200);
      }

      // Sound response - for now just additional haptic feedback
      if (settings.soundResponseEnabled) {
        // Since we don't have audio files yet, use haptic patterns as "sound"
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 100);
        setTimeout(async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 300);
      }
    } catch (error) {
      console.error('Error triggering responses:', error);
    }
  }

  public async updateSensitivity(sensitivity: number): Promise<void> {
    this.sensitivity = sensitivity;
    const settings = await StorageService.getUserSettings();
    settings.sensitivity = sensitivity;
    await StorageService.saveUserSettings(settings);
  }

  public isRecording(): boolean {
    return this.isListening;
  }

  public async cleanup(): Promise<void> {
    await this.stopListening();
    if (this.responseSound) {
      await this.responseSound.unloadAsync();
      this.responseSound = null;
    }
  }

  public async recordCustomSound(): Promise<string | null> {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      // Wait for user to stop recording externally
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
              // Move to app storage
              const dest = FileSystem.documentDirectory + 'custom-response.m4a';
              await FileSystem.moveAsync({ from: uri, to: dest });
              this.customSoundUri = dest;
              resolve(dest);
            } else {
              resolve(null);
            }
          } catch (err) {
            reject(err);
          }
        }, 3000); // 3 seconds max recording
      });
    } catch (error) {
      console.error('Error recording custom sound:', error);
      return null;
    }
  }

  public async playCustomSound(): Promise<void> {
    try {
      if (!this.customSoundUri) return;
      const { sound } = await Audio.Sound.createAsync({ uri: this.customSoundUri });
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 5000);
    } catch (error) {
      console.error('Error playing custom sound:', error);
    }
  }
}

export const audioService = new AudioService();
