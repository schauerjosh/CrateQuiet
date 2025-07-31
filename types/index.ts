export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  photo: string | null;
}

export interface SessionEvent {
  time: string;
  type: 'bark' | 'start' | 'end';
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in minutes
  barkCount: number;
  isActive: boolean;
  events: SessionEvent[];
}

export interface Settings {
  sensitivity: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  useCustomSound: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image: string;
}