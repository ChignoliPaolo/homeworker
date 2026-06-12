import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors } from '../theme/theme';

const SIZE = 84;

/**
 * The single, prominent shutter button. Provides haptic feedback on press and
 * shows a spinner while a capture is being processed.
 */
export default function CaptureButton({ onPress, disabled = false, busy = false }) {
  const handlePress = () => {
    if (disabled || busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || busy}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Capture homework"
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={({ pressed }) => [styles.outer, pressed && styles.outerPressed, disabled && styles.disabled]}
    >
      <View style={styles.inner}>{busy ? <ActivityIndicator color={colors.primaryDark} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerPressed: { transform: [{ scale: 0.92 }], opacity: 0.9 },
  disabled: { opacity: 0.45 },
  inner: {
    width: SIZE - 18,
    height: SIZE - 18,
    borderRadius: (SIZE - 18) / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
