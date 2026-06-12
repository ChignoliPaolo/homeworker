import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, spacing, typography } from '../theme/theme';

/**
 * A sleek full-screen overlay shown while the captured image is being analyzed.
 * Blocks interaction with the camera underneath and fades in/out smoothly.
 */
export default function LoadingOverlay({ visible, message = 'Analyzing your homework…' }) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(180)}
      style={styles.overlay}
      pointerEvents="auto"
    >
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  card: {
    minWidth: 220,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
  },
  text: { ...typography.subtitle, color: colors.text, textAlign: 'center' },
});
