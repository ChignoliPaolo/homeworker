import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../theme/theme';

/**
 * Shown when camera permission is missing. If the user permanently denied
 * access (`canAskAgain === false`), we deep-link them to the system settings.
 */
export default function PermissionScreen({ status, onRequest }) {
  const insets = useSafeAreaInsets();
  const permanentlyDenied = status?.granted === false && status?.canAskAgain === false;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.emoji}>📸</Text>
      <Text style={styles.title}>Camera access needed</Text>
      <Text style={styles.body}>
        HomeWorker uses your camera to snap homework, exercises, and test questions so it can solve
        them instantly. Your photos are only used to generate an answer.
      </Text>

      <Pressable
        onPress={permanentlyDenied ? () => Linking.openSettings() : onRequest}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{permanentlyDenied ? 'Open Settings' : 'Allow Camera'}</Text>
      </Pressable>
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
    gap: spacing.md,
  },
  emoji: { fontSize: 56, marginBottom: spacing.sm },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { ...typography.subtitle, color: colors.text },
});
