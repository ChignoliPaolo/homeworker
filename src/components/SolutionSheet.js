import React, { forwardRef, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Markdown from 'react-native-markdown-display';

import { colors, radius, spacing, typography } from '../theme/theme';

/**
 * A draggable bottom sheet that slides up over the camera to present the AI
 * solution. Renders Markdown (headings, lists, code, blockquotes, and LaTeX
 * text) and shows a friendly error state when the request fails.
 *
 * Controlled imperatively by the parent via a ref:
 *   sheetRef.current?.snapToIndex(0)  // open
 *   sheetRef.current?.close()         // dismiss
 *
 * NOTE ON MATH: `react-native-markdown-display` renders structured Markdown but
 * does not typeset LaTeX. Inline `$...$` / `$$...$$` therefore appears as plain
 * text. For fully rendered formulas, swap the <Markdown> block for a KaTeX
 * WebView (react-native-webview + katex auto-render) — see README notes.
 */
/** Dimmed backdrop that closes the sheet when tapped outside. */
function SheetBackdrop(props) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.5}
    />
  );
}

const SolutionSheet = forwardRef(function SolutionSheet(
  { solution, error, imageUri, onClose, onChange },
  ref,
) {
  const snapPoints = useMemo(() => ['55%', '92%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={onChange}
      backdropComponent={SheetBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{error ? 'Couldn’t solve this' : 'Solution'}</Text>
        <Pressable
          onPress={() => ref?.current?.close()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close solution"
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" /> : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Try retaking the photo with better lighting and framing.</Text>
          </View>
        ) : (
          <Markdown style={markdownStyles}>{solution ?? ''}</Markdown>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default SolutionSheet;

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: colors.surface },
  handle: { backgroundColor: colors.handle, width: 44 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.title, color: colors.text },
  close: { color: colors.textMuted, fontSize: 20, fontWeight: '600' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  errorBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorTitle: { ...typography.subtitle, color: colors.danger },
  errorText: { ...typography.body, color: colors.text },
  errorHint: { ...typography.caption, color: colors.textMuted },
});

/** Dark-theme styling for the Markdown renderer. */
const markdownStyles = StyleSheet.create({
  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
  heading1: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.sm },
  heading2: { color: colors.text, fontSize: 19, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
  heading3: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: spacing.sm },
  strong: { color: colors.text, fontWeight: '800' },
  em: { color: colors.text, fontStyle: 'italic' },
  bullet_list: { marginVertical: spacing.xs },
  ordered_list: { marginVertical: spacing.xs },
  list_item: { marginVertical: 2 },
  blockquote: {
    backgroundColor: colors.surfaceAlt,
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
  },
  code_inline: {
    color: colors.success,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    fontFamily: 'monospace',
  },
  code_block: {
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontFamily: 'monospace',
  },
  fence: {
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontFamily: 'monospace',
  },
  link: { color: colors.primary },
  hr: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
});
