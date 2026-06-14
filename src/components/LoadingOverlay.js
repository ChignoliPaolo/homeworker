import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '../theme/theme';

/**
 * A sleek full-screen overlay shown while the captured image is being analyzed.
 * Blocks interaction with the camera underneath and fades in/out smoothly.
 */

const DOT_COUNT = 3;
const DOT_SIZE = 10;
const DOT_DELAYS = [0, 200, 400];
const DOT_DURATION = 900;
const GLOW_DURATION = 1500;

/** A single animated dot that pulses opacity with a staggered delay. */
function AnimatedDot({ delay }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.0, { duration: DOT_DURATION / 2 }),
        -1,
        true,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function LoadingOverlay({ visible, message = 'Analyzing your homework…' }) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(220)}
      style={styles.overlay}
      pointerEvents="auto"
    >
      <GlowCard>
        <Text style={styles.emoji}>🔍</Text>

        <View style={styles.dotsRow}>
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <AnimatedDot key={i} delay={DOT_DELAYS[i]} />
          ))}
        </View>

        <Text style={styles.text}>{message}</Text>
      </GlowCard>
    </Animated.View>
  );
}

/** Card wrapper with a pulsing glow (scale + opacity oscillation). */
function GlowCard({ children }) {
  const scale = useSharedValue(1.0);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.03, { duration: GLOW_DURATION }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(1.0, { duration: GLOW_DURATION }),
      -1,
      true,
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,11,26,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  card: {
    minWidth: 240,
    paddingVertical: 28,
    paddingHorizontal: spacing.xl, // 32
    borderRadius: radius.lg, // 24
    backgroundColor: colors.surfaceGlass, // rgba(255,255,255,0.06)
    borderWidth: 1,
    borderColor: colors.borderLight, // rgba(255,255,255,0.14)
    alignItems: 'center',
    gap: spacing.md, // 16
  },
  emoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // 8
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary, // #7C5CFF
  },
  text: {
    ...typography.subtitle, // fontSize: 16, fontWeight: '600'
    color: colors.text, // #F0EEFF
    textAlign: 'center',
  },
});
