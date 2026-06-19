import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  FadeInDown,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { colors, radius, shadows, spacing, typography } from '../theme/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

/* ── Subject badge colour map ── */
const SUBJECT_COLORS = {
  Math:        { bg: 'rgba(124,92,255,0.18)', border: 'rgba(124,92,255,0.35)', text: '#9B7FFF', emoji: '📐' },
  Physics:     { bg: 'rgba(91,141,239,0.18)', border: 'rgba(91,141,239,0.35)', text: '#5B8DEF', emoji: '⚛️' },
  Chemistry:   { bg: 'rgba(52,211,153,0.18)', border: 'rgba(52,211,153,0.35)', text: '#34D399', emoji: '🧪' },
  Biology:     { bg: 'rgba(52,211,153,0.18)', border: 'rgba(52,211,153,0.35)', text: '#34D399', emoji: '🧬' },
  History:     { bg: 'rgba(251,191,36,0.18)',  border: 'rgba(251,191,36,0.35)',  text: '#FBBF24', emoji: '📜' },
  Literature:  { bg: 'rgba(255,107,157,0.18)', border: 'rgba(255,107,157,0.35)', text: '#FF6B9D', emoji: '📚' },
  Programming: { bg: 'rgba(52,211,153,0.18)',  border: 'rgba(52,211,153,0.35)',  text: '#34D399', emoji: '💻' },
  Geography:   { bg: 'rgba(91,141,239,0.18)',  border: 'rgba(91,141,239,0.35)',  text: '#5B8DEF', emoji: '🌍' },
  Economics:   { bg: 'rgba(251,191,36,0.18)',  border: 'rgba(251,191,36,0.35)',  text: '#FBBF24', emoji: '📊' },
};

const DEFAULT_SUBJECT_STYLE = { bg: 'rgba(124,92,255,0.15)', border: 'rgba(124,92,255,0.30)', text: colors.primaryLight, emoji: '📝' };

function getSubjectStyle(subject) {
  if (!subject) return null;
  return SUBJECT_COLORS[subject] ?? DEFAULT_SUBJECT_STYLE;
}

/**
 * A solution panel that slides up from the bottom over the camera.
 *
 * Controlled imperatively by the parent via a ref:
 *   sheetRef.current?.snapToIndex(0)  // open
 *   sheetRef.current?.close()         // dismiss
 */

const SolutionSheet = forwardRef(function SolutionSheet(
  { solution, subject, error, imageUri, onClose, onRetry },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useImperativeHandle(ref, () => ({
    snapToIndex: () => {
      setVisible(true);
      // ── Feature 6: Haptic on open ──
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    close: () => {
      setVisible(false);
      onClose?.();
    },
  }), [onClose]);

  if (!visible) return null;

  const dismiss = () => {
    // ── Feature 6: Haptic on close ──
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setVisible(false);
    onClose?.();
  };

  // ── Feature 3: Copy to clipboard ──
  const handleCopy = async () => {
    if (!solution) return;
    try {
      await Clipboard.setStringAsync(solution);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e?.message);
    }
  };

  // ── Feature 4: Share solution ──
  const handleShare = async () => {
    if (!solution) return;
    try {
      await Share.share({
        message: solution,
        title: 'HomeWorker Solution',
      });
    } catch (e) {
      console.warn('Share failed:', e?.message);
    }
  };

  // ── Feature 5: Retry ──
  const handleRetry = () => {
    dismiss();
    onRetry?.();
  };

  const subjectStyle = getSubjectStyle(subject);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        entering={SlideInDown.duration(400).springify().damping(18)}
        exiting={SlideOutDown.duration(280)}
        style={styles.panel}
      >
        {/* Glow border top */}
        <View style={styles.glowBorder} />

        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(300)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>{error ? '⚠️' : '✨'}</Text>
            <Text style={styles.headerTitle}>
              {error ? "Couldn't solve this" : 'Solution'}
            </Text>
            {/* ── Feature 7: Subject badge ── */}
            {subjectStyle && !error && (
              <View style={[styles.subjectBadge, { backgroundColor: subjectStyle.bg, borderColor: subjectStyle.border }]}>
                <Text style={styles.subjectEmoji}>{subjectStyle.emoji}</Text>
                <Text style={[styles.subjectText, { color: subjectStyle.text }]}>{subject}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {/* Feature 3: Copy button */}
            {solution && !error && (
              <Pressable
                onPress={handleCopy}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Copy solution"
                style={({ pressed }) => [
                  styles.actionBtn,
                  pressed && styles.actionBtnPressed,
                  copied && styles.actionBtnActive,
                ]}
              >
                <Text style={styles.actionIcon}>{copied ? '✓' : '📋'}</Text>
              </Pressable>
            )}
            {/* Feature 4: Share button */}
            {solution && !error && (
              <Pressable
                onPress={handleShare}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Share solution"
                style={({ pressed }) => [
                  styles.actionBtn,
                  pressed && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.actionIcon}>↗</Text>
              </Pressable>
            )}
            {/* Close button */}
            <Pressable
              onPress={dismiss}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close solution"
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {imageUri ? (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={styles.previewWrapper}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="cover"
              />
              {/* Gradient fade at bottom of image */}
              <View style={styles.previewFade} />
            </Animated.View>
          ) : null}

          {error ? (
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              style={styles.errorBox}
            >
              <Text style={styles.errorEmoji}>😕</Text>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
              <View style={styles.errorDivider} />
              <Text style={styles.errorHint}>
                💡 Try retaking the photo with better lighting and framing.
              </Text>
            </Animated.View>
          ) : solution ? (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <SimpleMD>{solution}</SimpleMD>
            </Animated.View>
          ) : (
            <Text style={styles.emptyText}>No solution available.</Text>
          )}

          {/* ── Feature 5: Retry / Retake button ── */}
          <Animated.View entering={FadeInDown.delay(350).duration(300)} style={styles.retryRow}>
            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && styles.retryBtnPressed,
              ]}
            >
              <Text style={styles.retryIcon}>📸</Text>
              <Text style={styles.retryText}>Retake</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
});

export default SolutionSheet;

/* ────────────────────────── SimpleMD renderer ────────────────────────── */

/**
 * Lightweight Markdown renderer using native Text/View.
 * Handles headings, bold, bullet/numbered lists, blockquotes, code fences.
 */
function SimpleMD({ children }) {
  if (!children) return null;
  const lines = String(children).split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <View key={`code-${elements.length}`} style={md.codeBlock}>
          <View style={md.codeBlockAccent} />
          <Text style={md.codeText}>{codeLines.join('\n')}</Text>
        </View>,
      );
      codeLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '') {
      elements.push(<View key={`sp-${i}`} style={{ height: 10 }} />);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <View key={i} style={md.h2Wrapper}>
          <Text style={md.h2}>{renderInline(trimmed.slice(3))}</Text>
          <View style={md.headingUnderline} />
        </View>,
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <View key={i} style={md.h1Wrapper}>
          <Text style={md.h1}>{renderInline(trimmed.slice(2))}</Text>
          <View style={md.headingUnderline} />
        </View>,
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      elements.push(
        <View key={i} style={md.blockquote}>
          <View style={md.blockquoteBar} />
          <Text style={md.blockquoteText}>{renderInline(trimmed.slice(2))}</Text>
        </View>,
      );
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      elements.push(
        <View key={i} style={md.listItem}>
          <View style={md.bulletDot} />
          <Text style={[md.body, md.listText]}>{renderInline(trimmed.slice(2))}</Text>
        </View>,
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <View key={i} style={md.listItem}>
          <View style={md.numberBadge}>
            <Text style={md.numberText}>{numMatch[1]}</Text>
          </View>
          <Text style={[md.body, md.listText]}>{renderInline(numMatch[2])}</Text>
        </View>,
      );
      continue;
    }

    elements.push(
      <Text key={i} style={md.body}>{renderInline(trimmed)}</Text>,
    );
  }

  if (inCodeBlock) flushCode();

  return <View style={{ minHeight: 40 }}>{elements}</View>;
}

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<Text key={`t-${last}`}>{text.slice(last, match.index)}</Text>);
    }
    if (match[2]) {
      parts.push(<Text key={`b-${match.index}`} style={md.bold}>{match[2]}</Text>);
    } else if (match[3]) {
      parts.push(<Text key={`c-${match.index}`} style={md.inlineCode}>{match[3]}</Text>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<Text key={`t-${last}`}>{text.slice(last)}</Text>);
  }

  return parts.length > 0 ? parts : text;
}

/* ──────────────────────────── Styles ──────────────────────────── */

const md = StyleSheet.create({
  h1Wrapper: { marginTop: spacing.lg, marginBottom: spacing.sm },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h2Wrapper: { marginTop: spacing.md, marginBottom: spacing.xs },
  h2: { color: colors.text, fontSize: 19, fontWeight: '700' },
  headingUnderline: {
    height: 2,
    width: 40,
    borderRadius: 1,
    backgroundColor: colors.primary,
    opacity: 0.5,
    marginTop: 6,
  },
  body: { color: colors.text, fontSize: 16, lineHeight: 25 },
  bold: { fontWeight: '800', color: colors.primaryLight },
  inlineCode: {
    color: colors.success,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    overflow: 'hidden',
  },
  blockquote: {
    backgroundColor: 'rgba(124,92,255,0.08)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginVertical: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  blockquoteBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  blockquoteText: { color: colors.text, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingRight: spacing.md,
  },
  listText: { flex: 1 },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 9,
    marginRight: 12,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(124,92,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  numberText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  codeBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingLeft: spacing.lg,
    marginVertical: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  codeBlockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.secondary,
  },
  codeText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,11,26,0.65)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.88,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  headerEmoji: { fontSize: 20 },
  headerTitle: { ...typography.title, color: colors.text },

  /* ── Feature 7: Subject badge ── */
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  subjectEmoji: { fontSize: 12 },
  subjectText: {
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── Header action buttons ── */
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPressed: { opacity: 0.6, transform: [{ scale: 0.9 }] },
  actionBtnActive: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  actionIcon: { fontSize: 14 },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: { opacity: 0.6, transform: [{ scale: 0.9 }] },
  closeIcon: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  scroll: { flexGrow: 0 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl * 2 },
  previewWrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  preview: {
    width: '100%',
    height: 170,
    backgroundColor: colors.surfaceAlt,
  },
  previewFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'transparent',
    // Simulated bottom fade with a semi-transparent overlay
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  errorBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,90,110,0.15)',
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  errorEmoji: { fontSize: 36, marginBottom: spacing.xs },
  errorTitle: { ...typography.subtitle, color: colors.danger, textAlign: 'center' },
  errorText: { ...typography.body, color: colors.text, textAlign: 'center' },
  errorDivider: {
    height: 1,
    width: '80%',
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  errorHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },

  /* ── Feature 5: Retry button ── */
  retryRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  retryBtnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  retryIcon: { fontSize: 16 },
  retryText: {
    ...typography.subtitle,
    color: colors.text,
  },
});
