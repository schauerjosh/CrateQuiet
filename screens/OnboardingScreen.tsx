import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { Colors, Layout } from '../constants';
import { StorageService } from '../utils/storage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to CrateQuiet',
    description: 'Gentle, effective crate training for your dog. Get started with your first lesson!',
    icon: 'paw',
    image: require('../assets/onboarding/Onboarding-GentleTraining.png'),
  },
  {
    title: 'Real-time Monitoring',
    description: 'CrateQuiet listens for your dog\'s barks and whines 24/7, providing instant feedback.',
    icon: 'volume-high',
  },
  {
    title: 'Smart Responses',
    description: 'When barking is detected, the app responds with gentle vibrations and calming sounds.',
    icon: 'phone-portrait',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your dog\'s improvement with detailed analytics and training session logs.',
    icon: 'trending-up',
  },
  {
    title: 'Privacy First',
    description: 'All audio recordings stay on your device. No cloud uploads or third-party sharing.',
    icon: 'shield-checkmark',
    image: require('../assets/onboarding/Onboarding-PrivacySecurity.png'),
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await StorageService.setOnboardingCompleted(true);
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          {currentStep < onboardingSteps.length - 1 && (
            <Button title="Skip" onPress={handleSkip} variant="outline" size="small" />
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.stepCard} gradient>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.iconBackground}
              >
                <Ionicons
                  name={currentStepData.icon}
                  size={48}
                  color={Colors.background}
                />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>

            {currentStepData.image && (
              <Image source={currentStepData.image} style={styles.image} />
            )}
          </Card>

          {currentStep === 0 && (
            <Card style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Why Choose CrateQuiet?</Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.featureText}>Stop crate whining instantly</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.featureText}>24/7 automatic monitoring</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.featureText}>Gentle training responses</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={styles.featureText}>Privacy-focused approach</Text>
                </View>
              </View>
            </Card>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    marginRight: Layout.spacing.sm,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  stepCard: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  iconContainer: {
    marginBottom: Layout.spacing.lg,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  description: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  image: {
    width: Layout.window.width - 80,
    height: 200,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.lg,
  },
  featuresCard: {
    marginBottom: Layout.spacing.lg,
  },
  featuresTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  featureList: {
    gap: Layout.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  featureText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
});
