import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '../theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A toggle button for the camera torch / flash.
 * Shows a lightning bolt that glows when active.
 */
export default function FlashButton({ active = false, onPress }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Turn off flash' : 'Turn on flash'}
      accessibilityState={{ selected: active }}
      style={[
        styles.button,
        active && styles.buttonActive,
        animatedStyle,
      ]}
    >
      <Text style={[styles.icon, active && styles.iconActive]}>⚡</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(255,193,7,0.25)',
    borderColor: 'rgba(255,193,7,0.45)',
    ...shadows.glow,
    shadowColor: '#FFC107',
  },
  icon: {
    fontSize: 18,
    opacity: 0.7,
  },
  iconActive: {
    opacity: 1,
  },
});
