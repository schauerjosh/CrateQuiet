
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { Colors, Layout } from '../constants';
import { StorageService } from '../utils/storage';
import { SubscriptionPlan } from '../types';

interface PaywallScreenProps {
  onSubscribe: () => void;
  onClose: () => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    duration: 'monthly',
    features: [
      'Unlimited monitoring sessions',
      'Advanced bark detection',
      'Custom response sounds',
      'Detailed progress analytics',
      'Training session notes',
      'Photo progress tracking',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 49.99,
    duration: 'annual',
    features: [
      'Everything in Monthly',
      'Save 58% annually',
      'Priority customer support',
      'Advanced training programs',
      'Multi-dog support',
      'Export training data',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 99.99,
    duration: 'lifetime',
    features: [
      'Everything in Annual',
      'One-time payment',
      'Future feature updates',
      'Premium training content',
      'Community access',
      'White-glove onboarding',
    ],
  },
];

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onSubscribe,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save subscription status
      await StorageService.setSubscriptionStatus(true);
      
      Alert.alert(
        'Welcome to CrateQuiet Premium!',
        'Your subscription has been activated. Enjoy unlimited access to all premium features.',
        [{ text: 'Get Started', onPress: onSubscribe }]
      );
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        'Subscription Failed',
        'There was an issue processing your subscription. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const restorePurchases = async () => {
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Restore Complete',
        'Your purchases have been restored successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'No previous purchases found for this account.',
        [{ text: 'OK' }]
      );
    }
  };

  const getSelectedPlan = () => {
    return subscriptionPlans.find(plan => plan.id === selectedPlan) || subscriptionPlans[1];
  };

  const getPriceDisplay = (plan: SubscriptionPlan) => {
    switch (plan.duration) {
      case 'monthly':
        return `$${plan.price}/month`;
      case 'annual':
        return `$${plan.price}/year`;
      case 'lifetime':
        return `$${plan.price} once`;
      default:
        return `$${plan.price}`;
    }
  };

  const getSavingsText = (plan: SubscriptionPlan) => {
    if (plan.duration === 'annual') {
      const monthlyTotal = 9.99 * 12;
      const savings = Math.round(((monthlyTotal - plan.price) / monthlyTotal) * 100);
      return `Save ${savings}%`;
    }
    if (plan.duration === 'lifetime') {
      return 'Best Value';
    }
    return null;
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundLight]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CrateQuiet Premium</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.heroIcon}
            >
              <Ionicons name="trophy" size={48} color={Colors.background} />
            </LinearGradient>
            
            <Text style={styles.heroTitle}>Unlock All Lessons</Text>
            <Text style={styles.heroSubtitle}>
              Unlock all lessons, progress tracking, and multi-dog support
            </Text>
          </View>

          {/* Premium Features */}
          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Unlimited monitoring sessions</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Advanced bark detection AI</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Custom response sounds library</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Detailed progress analytics</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Multi-dog profile support</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Export training data</Text>
              </View>
            </View>
          </Card>

          {/* Subscription Plans */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            
            {subscriptionPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[
                      styles.planName,
                      selectedPlan === plan.id && styles.planNameSelected,
                    ]}>
                      {plan.name}
                    </Text>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === plan.id && styles.planPriceSelected,
                    ]}>
                      {getPriceDisplay(plan)}
                    </Text>
                  </View>
                  
                  <View style={styles.planSelection}>
                    {getSavingsText(plan) && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{getSavingsText(plan)}</Text>
                      </View>
                    )}
                    <View style={[
                      styles.radioButton,
                      selectedPlan === plan.id && styles.radioButtonSelected,
                    ]}>
                      {selectedPlan === plan.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Social Proof */}
          <Card style={styles.socialProofCard}>
            <Text style={styles.socialProofTitle}>Trusted by 10,000+ Dog Parents</Text>
            
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "CrateQuiet helped us stop our puppy's whining in just 3 days! 
                The monitoring feature is incredible."
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah M., Golden Retriever Owner</Text>
            </View>
            
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "Finally, a solution that actually works. Our rescue dog is now 
                comfortable in his crate thanks to CrateQuiet."
              </Text>
              <Text style={styles.testimonialAuthor}>- Mike T., Rescue Dog Parent</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={`Start ${getSelectedPlan().name} Plan`}
            onPress={handleSubscribe}
            loading={isProcessing}
            size="large"
          />
          
          <TouchableOpacity onPress={restorePurchases} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimerText}>
            Cancel anytime. No long-term commitments.
          </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  closeButton: {
    padding: Layout.spacing.sm,
  },
  headerTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  heroTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    marginBottom: Layout.spacing.lg,
  },
  featuresTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  featuresList: {
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
  plansContainer: {
    marginBottom: Layout.spacing.lg,
  },
  plansTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  planNameSelected: {
    color: Colors.primary,
  },
  planPrice: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  planPriceSelected: {
    color: Colors.primary,
  },
  planSelection: {
    alignItems: 'flex-end',
  },
  savingsBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.sm,
  },
  savingsText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.background,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  socialProofCard: {
    marginBottom: Layout.spacing.lg,
  },
  socialProofTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  testimonial: {
    marginBottom: Layout.spacing.lg,
  },
  testimonialText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: Layout.spacing.sm,
  },
  testimonialAuthor: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
  },
  restoreButton: {
    marginTop: Layout.spacing.md,
    padding: Layout.spacing.sm,
  },
  restoreText: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  disclaimerText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});
