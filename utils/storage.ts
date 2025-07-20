
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrainingSession, UserSettings, BarkEvent } from '../types';

const KEYS = {
  TRAINING_SESSIONS: 'training_sessions',
  USER_SETTINGS: 'user_settings',
  BARK_EVENTS: 'bark_events',
  SUBSCRIPTION_STATUS: 'subscription_status',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

export class StorageService {
  // Training Sessions
  static async saveTrainingSession(session: TrainingSession): Promise<void> {
    try {
      const existingSessions = await this.getTrainingSessions();
      const updatedSessions = [...existingSessions, session];
      await AsyncStorage.setItem(KEYS.TRAINING_SESSIONS, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error saving training session:', error);
    }
  }

  static async getTrainingSessions(): Promise<TrainingSession[]> {
    try {
      const sessions = await AsyncStorage.getItem(KEYS.TRAINING_SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting training sessions:', error);
      return [];
    }
  }

  // User Settings
  static async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  static async getUserSettings(): Promise<UserSettings> {
    try {
      const settings = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      return settings ? JSON.parse(settings) : {
        sensitivity: 5,
        vibrationEnabled: true,
        soundResponseEnabled: true,
        responseVolume: 0.7,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        sensitivity: 5,
        vibrationEnabled: true,
        soundResponseEnabled: true,
        responseVolume: 0.7,
      };
    }
  }

  // Bark Events
  static async saveBarkEvent(event: BarkEvent): Promise<void> {
    try {
      const existingEvents = await this.getBarkEvents();
      const updatedEvents = [...existingEvents, event];
      
      // Keep only last 1000 events to prevent storage overflow
      if (updatedEvents.length > 1000) {
        updatedEvents.splice(0, updatedEvents.length - 1000);
      }
      
      await AsyncStorage.setItem(KEYS.BARK_EVENTS, JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Error saving bark event:', error);
    }
  }

  static async getBarkEvents(): Promise<BarkEvent[]> {
    try {
      const events = await AsyncStorage.getItem(KEYS.BARK_EVENTS);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error getting bark events:', error);
      return [];
    }
  }

  // Subscription Status
  static async setSubscriptionStatus(isPremium: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SUBSCRIPTION_STATUS, JSON.stringify(isPremium));
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  }

  static async getSubscriptionStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(KEYS.SUBSCRIPTION_STATUS);
      return status ? JSON.parse(status) : false;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return false;
    }
  }

  // Onboarding
  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }

  static async getOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
      return completed ? JSON.parse(completed) : false;
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
