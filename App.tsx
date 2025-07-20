
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from './utils/storage';
import { Colors, Layout } from './constants';
import { OnboardingScreen, PaywallScreen } from './screens';
import { TabNavigator } from './navigation/TabNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const [onboardingCompleted, subscriptionStatus] = await Promise.all([
        StorageService.getOnboardingCompleted(),
        StorageService.getSubscriptionStatus(),
      ]);

      setHasCompletedOnboarding(onboardingCompleted);
      setIsPremium(subscriptionStatus);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  const handleSubscribe = () => {
    setIsPremium(true);
    setShowPaywall(false);
  };

  const handleShowPaywall = () => {
    setShowPaywall(true);
  };

  const handleClosePaywall = () => {
    setShowPaywall(false);
  };

  if (isLoading) {
    return (
      <LinearGradient 
        colors={[Colors.background, Colors.backgroundLight]} 
        style={styles.loadingContainer}
      >
        <StatusBar style="light" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading CrateQuiet...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: Colors.background },
          }}
        >
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              {showPaywall && (
                <Stack.Screen 
                  name="Paywall"
                  options={{ 
                    presentation: 'modal',
                    gestureEnabled: true,
                  }}
                >
                  {() => (
                    <PaywallScreen 
                      onSubscribe={handleSubscribe}
                      onClose={handleClosePaywall}
                    />
                  )}
                </Stack.Screen>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    fontWeight: '500',
  },
});
