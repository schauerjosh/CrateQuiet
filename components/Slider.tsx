import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  clamp,
} from 'react-native-reanimated';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

interface GestureContext extends Record<string, unknown> {
  startX: number;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.1,
  minimumTrackTintColor = '#4A6FA5',
  maximumTrackTintColor = '#E8E8E8',
  thumbTintColor = '#4A6FA5',
  style,
}) => {
  const SLIDER_WIDTH = 200;
  const THUMB_SIZE = 20;
  
  const translateX = useSharedValue((value - minimumValue) / (maximumValue - minimumValue) * SLIDER_WIDTH);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = clamp(
        (context.startX as number) + event.translationX,
        0,
        SLIDER_WIDTH
      );
    },
    onEnd: () => {
      const newValue = minimumValue + (translateX.value / SLIDER_WIDTH) * (maximumValue - minimumValue);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = clamp(steppedValue, minimumValue, maximumValue);
      
      translateX.value = (clampedValue - minimumValue) / (maximumValue - minimumValue) * SLIDER_WIDTH;
      runOnJS(onValueChange)(clampedValue);
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - THUMB_SIZE / 2 }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  // Fallback for web - simple touch-based slider
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
          <View 
            style={[
              styles.activeTrack, 
              { 
                backgroundColor: minimumTrackTintColor,
                width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`
              }
            ]} 
          />
          <View 
            style={[
              styles.thumb, 
              { 
                backgroundColor: thumbTintColor,
                left: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`
              }
            ]} 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor, width: SLIDER_WIDTH }]}>
        <Animated.View style={[styles.activeTrack, { backgroundColor: minimumTrackTintColor }, trackStyle]} />
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.thumb, { backgroundColor: thumbTintColor }, thumbStyle]} />
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Slider;