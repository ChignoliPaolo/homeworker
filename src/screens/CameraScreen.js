import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import CaptureButton from '../components/CaptureButton';
import LoadingOverlay from '../components/LoadingOverlay';
import ScanFrame from '../components/ScanFrame';
import SolutionSheet from '../components/SolutionSheet';
import { solveHomework } from '../services/apiService';
import { colors, spacing, typography } from '../theme/theme';

/**
 * The main screen: a full-screen camera with a single capture button. Taking a
 * photo shows a loading overlay, sends the image to the Vision API, and reveals
 * the solution in a bottom sheet that slides up over the camera.
 */
export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const sheetRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);
  const [capturedUri, setCapturedUri] = useState(null);

  const openSheet = useCallback(() => {
    // Small delay ensures React has committed state updates before we open.
    setTimeout(() => sheetRef.current?.snapToIndex(0), 50);
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isProcessing || !isReady) return;

    setError(null);
    setSolution(null);
    setIsProcessing(true);

    try {
      let photoData = { base64: null, uri: null };
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.6,
          base64: true,
          skipProcessing: false,
        });
        photoData = { base64: photo.base64, uri: photo.uri };
        setCapturedUri(photo.uri);
      } catch (photoErr) {
        // In mock mode, we can still proceed without a real photo
        console.warn('takePictureAsync failed:', photoErr?.message);
      }

      const { solution: result } = await solveHomework({
        base64: photoData.base64,
        uri: photoData.uri,
        mimeType: 'image/jpeg',
      });

      setSolution(result);
      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      openSheet();
    } catch (err) {
      console.warn('solveHomework failed:', err?.message);
      setError(err?.message ?? 'Unexpected error. Please try again.');
      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      openSheet();
    }
  }, [isProcessing, isReady, openSheet]);

  const handleSheetClose = useCallback(() => {
    setSolution(null);
    setError(null);
    setCapturedUri(null);
  }, []);

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />

      {/* Scan frame overlay */}
      <ScanFrame />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]} pointerEvents="none">
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.brandRow}>
          <Text style={styles.brand}>HomeWorker</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI Tutor</Text>
          </View>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(500).delay(600)} style={styles.hintPill}>
          <Text style={styles.hint}>Point at a question and tap to solve</Text>
        </Animated.View>
      </View>

      {/* Bottom gradient fade */}
      <View style={[styles.bottomFade, { height: 160 + insets.bottom }]} pointerEvents="none" />

      {/* Shutter */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.lg }]}>
        <CaptureButton onPress={handleCapture} busy={isProcessing} disabled={!isReady} />
      </View>

      <LoadingOverlay visible={isProcessing} />

      <SolutionSheet
        ref={sheetRef}
        solution={solution}
        error={error}
        imageUri={capturedUri}
        onClose={handleSheetClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  brand: {
    ...typography.brand,
    color: colors.text,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 2 },
  },
  badge: {
    backgroundColor: 'rgba(124,92,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(124,92,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
  },
  badgeText: {
    ...typography.small,
    color: colors.primaryLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Simulated gradient: a semi-transparent dark overlay that fades the bottom
    backgroundColor: 'rgba(13,11,26,0.45)',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
