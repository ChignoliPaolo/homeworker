import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';

import CameraScreen from './src/screens/CameraScreen';
import PermissionScreen from './src/components/PermissionScreen';
import { colors } from './src/theme/theme';

/**
 * App root: wires up the gesture/safe-area providers, handles camera
 * permissions, and performs the initial "routing" between the permission
 * prompt and the full-screen camera experience.
 */
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  // Request camera access immediately on first launch (zero-friction).
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const renderRoute = () => {
    // Permission state still resolving.
    if (!permission) return <View style={styles.flex} />;
    // Granted → jump straight into the camera.
    if (permission.granted) return <CameraScreen />;
    // Denied → explain why and offer to grant / open settings.
    return <PermissionScreen status={permission} onRequest={requestPermission} />;
  };

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {renderRoute()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
});
