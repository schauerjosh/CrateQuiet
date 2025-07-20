
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Layout } from '../constants';

interface WaveformViewProps {
  data: number[];
  isActive: boolean;
  barkDetected?: boolean;
}

export const WaveformView: React.FC<WaveformViewProps> = ({
  data,
  isActive,
  barkDetected = false,
}) => {
  const animatedValues = useRef(
    data.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = data.map((value, index) => {
      const normalizedValue = Math.max(0.1, Math.min(1, value / 100));
      return Animated.timing(animatedValues[index], {
        toValue: normalizedValue,
        duration: 100,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [data]);

  const getBarColor = () => {
    if (barkDetected) return Colors.waveformBark;
    if (isActive) return Colors.waveformActive;
    return Colors.waveformInactive;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {animatedValues.map((animValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 60],
                }),
                backgroundColor: getBarColor(),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
  },
  bar: {
    width: 3,
    backgroundColor: Colors.waveformInactive,
    borderRadius: 1.5,
  },
});
