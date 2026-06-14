import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '../theme/theme';

/**
 * Shown when camera permission is missing. If the user permanently denied
 * access (`canAskAgain === false`), we deep-link them to the system settings.
 */
export default function PermissionScreen({ status, onRequest }) {
  const insets = useSafeAreaInsets();
  const permanentlyDenied = status?.granted === false && status?.canAskAgain === false;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Decorative circle with camera emoji */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.iconCircle}
      >
        <Text style={styles.emoji}>📸</Text>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(150).duration(500)}
        style={styles.title}
      >
        Camera access needed
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.body}
      >
        HomeWorker uses your camera to snap homework, exercises, and test questions so it can solve
        them instantly. Your photos are only used to generate an answer.
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(450).duration(500)}>
        <Pressable
          onPress={permanentlyDenied ? () => Linking.openSettings() : onRequest}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {permanentlyDenied ? 'Open Settings' : 'Allow Camera'}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.Text entering={FadeIn.delay(700)} style={styles.hint}>
        Your photos are only used to generate answers
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124,92,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    ...shadows.glow,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    ...typography.small,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
