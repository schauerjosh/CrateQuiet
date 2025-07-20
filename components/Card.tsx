
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Layout } from '../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient = false,
}) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={[Colors.card, Colors.surface]}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    shadowColor: Colors.background,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
