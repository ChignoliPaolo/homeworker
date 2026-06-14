import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/theme';

const LINE_THICKNESS = 3;
const LINE_LENGTH = 32;
const BRACKET_COLOR = colors.primary; // #7C5CFF at 70 % opacity

/**
 * Camera overlay that renders four animated corner brackets (L-shapes) forming
 * a centered scan rectangle. The corners pulse between 50 % and 90 % opacity
 * to draw the student's attention without being distracting.
 */
export default function ScanFrame() {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const frameW = screenW * 0.75;
  const frameH = screenH * 0.5;

  // ── Breathing animation ──
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,   // infinite
      true,  // reverse
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // ── Corner positions relative to the centered frame ──
  const left = (screenW - frameW) / 2;
  const top = (screenH - frameH) / 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, animatedStyle]}
    >
      {/* ── Top-left corner ── */}
      <Animated.View style={[styles.line, styles.horizontal, { top, left }]} />
      <Animated.View style={[styles.line, styles.vertical, { top, left }]} />

      {/* ── Top-right corner ── */}
      <Animated.View
        style={[styles.line, styles.horizontal, { top, left: left + frameW - LINE_LENGTH }]}
      />
      <Animated.View
        style={[styles.line, styles.vertical, { top, left: left + frameW - LINE_THICKNESS }]}
      />

      {/* ── Bottom-left corner ── */}
      <Animated.View
        style={[styles.line, styles.horizontal, { top: top + frameH - LINE_THICKNESS, left }]}
      />
      <Animated.View
        style={[styles.line, styles.vertical, { top: top + frameH - LINE_LENGTH, left }]}
      />

      {/* ── Bottom-right corner ── */}
      <Animated.View
        style={[
          styles.line,
          styles.horizontal,
          { top: top + frameH - LINE_THICKNESS, left: left + frameW - LINE_LENGTH },
        ]}
      />
      <Animated.View
        style={[
          styles.line,
          styles.vertical,
          { top: top + frameH - LINE_LENGTH, left: left + frameW - LINE_THICKNESS },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  line: {
    position: 'absolute',
    backgroundColor: BRACKET_COLOR,
    opacity: 0.7,
    borderRadius: LINE_THICKNESS / 2,
  },
  horizontal: {
    width: LINE_LENGTH,
    height: LINE_THICKNESS,
  },
  vertical: {
    width: LINE_THICKNESS,
    height: LINE_LENGTH,
  },
});
