
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Layout } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    if (variant === 'outline') {
      baseStyle.push(styles.outline);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return [...baseStyle, textStyle];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.background}
        />
      );
    }
    
    return (
      <Text style={getTextStyle()}>
        {title}
      </Text>
    );
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={getButtonStyle()}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
  small: {
    height: 36,
    paddingHorizontal: Layout.spacing.md,
  },
  medium: {
    height: 48,
    paddingHorizontal: Layout.spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: Layout.spacing.xl,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.buttonDisabled,
    opacity: 0.6,
  },
  text: {
    color: Colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: Layout.fontSize.sm,
  },
  mediumText: {
    fontSize: Layout.fontSize.md,
  },
  largeText: {
    fontSize: Layout.fontSize.lg,
  },
  outlineText: {
    color: Colors.primary,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
