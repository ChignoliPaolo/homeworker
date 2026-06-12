import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import CaptureButton from '../components/CaptureButton';
import LoadingOverlay from '../components/LoadingOverlay';
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
    // Defer to the next frame so the sheet mounts before we snap it open.
    requestAnimationFrame(() => sheetRef.current?.snapToIndex(0));
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isProcessing || !isReady) return;

    setError(null);
    setSolution(null);
    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
        skipProcessing: false,
      });
      setCapturedUri(photo.uri);

      const { solution: result } = await solveHomework({
        base64: photo.base64,
        uri: photo.uri,
        mimeType: 'image/jpeg',
      });

      setSolution(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setError(err?.message ?? 'Unexpected error. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setIsProcessing(false);
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

      {/* Top hint */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="none">
        <Text style={styles.brand}>HomeWorker</Text>
        <Text style={styles.hint}>Point at a question and tap to solve</Text>
      </View>

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
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', gap: 2 },
  brand: { ...typography.brand, color: colors.text, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 },
  hint: { ...typography.caption, color: 'rgba(255,255,255,0.85)', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
});
