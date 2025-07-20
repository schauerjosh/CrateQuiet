
export interface TrainingSession {
  id: string;
  date: Date;
  duration: number;
  barksDetected: number;
  notes?: string;
  photos?: string[];
  success: boolean;
}

export interface AudioData {
  timestamp: number;
  volume: number;
  frequency: number;
  isBark: boolean;
}

export interface WaveformData {
  samples: number[];
  timestamp: number;
}

export interface UserSettings {
  sensitivity: number;
  vibrationEnabled: boolean;
  soundResponseEnabled: boolean;
  responseVolume: number;
  dogName?: string;
  trainingGoal?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'annual' | 'lifetime';
  features: string[];
}

export interface BarkEvent {
  timestamp: Date;
  volume: number;
  duration: number;
  confidence: number;
}
