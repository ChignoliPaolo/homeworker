import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '../theme/theme';

const SIZE = 80;
const INNER_SIZE = SIZE - 20;
const RING_THICKNESS = 3;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The single, prominent shutter button. Provides haptic feedback on press and
 * shows a spinner while a capture is being processed.
 */
export default function CaptureButton({ onPress, disabled = false, busy = false }) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  // ── Idle pulse animation ──
  useEffect(() => {
    if (disabled || busy) {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
      return;
    }

    scale.value = withRepeat(
      withTiming(1.06, { duration: 1800 }),
      -1,   // infinite
      true,  // reverse
    );
  }, [disabled, busy, scale]);

  // ── Animated style (pulse + press) ──
  const animatedStyle = useAnimatedStyle(() => {
    const baseScale = pressed.value
      ? withSpring(0.88, { damping: 15 })
      : scale.value;

    return {
      transform: [{ scale: baseScale }],
      opacity: disabled ? 0.4 : 1,
    };
  });

  const handlePressIn = () => {
    if (disabled || busy) return;
    pressed.value = true;
  };

  const handlePressOut = () => {
    pressed.value = false;
  };

  const handlePress = () => {
    if (disabled || busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || busy}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Capture homework"
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={[styles.wrapper, animatedStyle]}
    >
      {/* Outer ring – secondary colour */}
      <View style={styles.ringOuter}>
        {/* Inner ring – primary colour */}
        <View style={styles.ringInner}>
          {/* White shutter circle */}
          <View style={styles.inner}>
            {busy ? (
              <ActivityIndicator color={colors.primaryDark} />
            ) : null}
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  ringOuter: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.secondary,
    padding: RING_THICKNESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: (SIZE - RING_THICKNESS * 2) / 2,
    backgroundColor: colors.primary,
    padding: RING_THICKNESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
