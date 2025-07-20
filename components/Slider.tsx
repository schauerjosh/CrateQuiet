import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Layout } from '../constants';

interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  unit?: string;
}

const CustomSlider: React.FC<SliderProps> = ({
  label,
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  unit = '',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}{unit}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  label: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  value: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  slider: {
    height: 40,
  },
  thumb: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
});

export default CustomSlider;
