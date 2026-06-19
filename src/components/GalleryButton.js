import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, radius, shadows } from '../theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A compact icon button that opens the device photo library.
 * Positioned to the left of the shutter on the camera screen.
 */
export default function GalleryButton({ onPress, disabled = false }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.85, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Pick from photo library"
      style={[styles.button, animatedStyle]}
    >
      <Text style={styles.icon}>🖼️</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  icon: {
    fontSize: 22,
  },
});
