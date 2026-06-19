import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import CaptureButton from '../components/CaptureButton';
import FlashButton from '../components/FlashButton';
import GalleryButton from '../components/GalleryButton';
import LoadingOverlay from '../components/LoadingOverlay';
import ScanFrame from '../components/ScanFrame';
import SolutionSheet from '../components/SolutionSheet';
import { solveHomework, parseSubject } from '../services/apiService';
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
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState(null);
  const [capturedUri, setCapturedUri] = useState(null);

  // ── Feature 2: Flash / Torch Toggle ──
  const [torchEnabled, setTorchEnabled] = useState(false);

  // ── Feature 8: Pinch-to-Zoom ──
  const [zoom, setZoom] = useState(0);
  const zoomRef = useRef(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      zoomRef.current = zoom;
    })
    .onUpdate((event) => {
      // Map pinch scale to 0–1 zoom range, starting from the current level
      const newZoom = Math.min(1, Math.max(0, zoomRef.current + (event.scale - 1) * 0.5));
      setZoom(newZoom);
    });

  const openSheet = useCallback(() => {
    // Small delay ensures React has committed state updates before we open.
    setTimeout(() => sheetRef.current?.snapToIndex(0), 50);
  }, []);

  /**
   * Core solve flow — takes base64 + uri, sends to AI, shows result.
   * Shared by both camera capture and gallery import.
   */
  const processSolve = useCallback(async (photoData) => {
    setError(null);
    setSolution(null);
    setSubject(null);
    setIsProcessing(true);
    setCapturedUri(photoData.uri);

    try {
      const { solution: rawResult } = await solveHomework({
        base64: photoData.base64,
        uri: photoData.uri,
        mimeType: 'image/jpeg',
      });

      // ── Feature 7: Subject auto-detection ──
      const { subject: detectedSubject, cleanSolution } = parseSubject(rawResult);

      setSolution(cleanSolution);
      setSubject(detectedSubject);
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
  }, [openSheet]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isProcessing || !isReady) return;

    try {
      let photoData = { base64: null, uri: null };
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.6,
          base64: true,
          skipProcessing: false,
        });
        photoData = { base64: photo.base64, uri: photo.uri };
      } catch (photoErr) {
        // In mock mode, we can still proceed without a real photo
        console.warn('takePictureAsync failed:', photoErr?.message);
      }

      await processSolve(photoData);
    } catch (err) {
      // Fallback: already handled inside processSolve
    }
  }, [isProcessing, isReady, processSolve]);

  // ── Feature 1: Photo Library Import ──
  const handlePickImage = useCallback(async () => {
    if (isProcessing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      await processSolve({ base64: asset.base64, uri: asset.uri });
    } catch (err) {
      console.warn('Image picker failed:', err?.message);
    }
  }, [isProcessing, processSolve]);

  // ── Feature 5: Retry / Re-scan ──
  const handleRetry = useCallback(() => {
    // The sheet will close itself via onClose, then we re-trigger capture.
    setTimeout(() => handleCapture(), 400);
  }, [handleCapture]);

  const handleSheetClose = useCallback(() => {
    setSolution(null);
    setSubject(null);
    setError(null);
    setCapturedUri(null);
  }, []);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchEnabled}
          zoom={zoom}
          onCameraReady={() => setIsReady(true)}
        />
      </GestureDetector>

      {/* Scan frame overlay */}
      <ScanFrame />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]} pointerEvents="box-none">
        <View style={styles.topBarContent} pointerEvents="box-none">
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.brandRow}>
            <Text style={styles.brand}>HomeWorker</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI Tutor</Text>
            </View>
          </Animated.View>

          {/* Feature 2: Flash toggle — top-right */}
          <Animated.View entering={FadeIn.duration(500).delay(400)} style={styles.flashPosition}>
            <FlashButton
              active={torchEnabled}
              onPress={() => setTorchEnabled((prev) => !prev)}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.duration(500).delay(600)} style={styles.hintPill}>
          <Text style={styles.hint}>Point at a question and tap to solve</Text>
        </Animated.View>
      </View>

      {/* Bottom gradient fade */}
      <View style={[styles.bottomFade, { height: 160 + insets.bottom }]} pointerEvents="none" />

      {/* Controls row: gallery — shutter — (placeholder for symmetry) */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.controlsRow}>
          <GalleryButton onPress={handlePickImage} disabled={isProcessing} />
          <CaptureButton onPress={handleCapture} busy={isProcessing} disabled={!isReady} />
          {/* Empty view to balance the row (same width as GalleryButton) */}
          <View style={styles.controlPlaceholder} />
        </View>
      </View>

      <LoadingOverlay visible={isProcessing} />

      <SolutionSheet
        ref={sheetRef}
        solution={solution}
        subject={subject}
        error={error}
        imageUri={capturedUri}
        onClose={handleSheetClose}
        onRetry={handleRetry}
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
  topBarContent: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
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
  flashPosition: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  controlPlaceholder: {
    width: 52,
    height: 52,
  },
});
