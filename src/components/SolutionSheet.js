import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '../theme/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * A solution panel that slides up from the bottom over the camera.
 *
 * Controlled imperatively by the parent via a ref:
 *   sheetRef.current?.snapToIndex(0)  // open
 *   sheetRef.current?.close()         // dismiss
 */

const SolutionSheet = forwardRef(function SolutionSheet(
  { solution, error, imageUri, onClose },
  ref,
) {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    snapToIndex: () => setVisible(true),
    close: () => {
      setVisible(false);
      onClose?.();
    },
  }), [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        setVisible(false);
        onClose?.();
      }}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setVisible(false);
            onClose?.();
          }}
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        entering={SlideInDown.duration(350).springify().damping(18)}
        exiting={SlideOutDown.duration(250)}
        style={styles.panel}
      >
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {error ? "Couldn't solve this" : 'Solution'}
          </Text>
          <Pressable
            onPress={() => {
              setVisible(false);
              onClose?.();
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close solution"
          >
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="cover"
            />
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorHint}>
                Try retaking the photo with better lighting and framing.
              </Text>
            </View>
          ) : solution ? (
            <SimpleMD>{solution}</SimpleMD>
          ) : (
            <Text style={styles.emptyText}>No solution available.</Text>
          )}
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
      elements.push(<View key={`sp-${i}`} style={{ height: 8 }} />);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <Text key={i} style={md.h2}>{renderInline(trimmed.slice(3))}</Text>,
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <Text key={i} style={md.h1}>{renderInline(trimmed.slice(2))}</Text>,
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      elements.push(
        <View key={i} style={md.blockquote}>
          <Text style={md.body}>{renderInline(trimmed.slice(2))}</Text>
        </View>,
      );
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      elements.push(
        <View key={i} style={md.listItem}>
          <Text style={md.bullet}>{'\u2022'}</Text>
          <Text style={[md.body, md.listText]}>{renderInline(trimmed.slice(2))}</Text>
        </View>,
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <View key={i} style={md.listItem}>
          <Text style={md.bullet}>{numMatch[1]}.</Text>
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
  h1: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.sm },
  h2: { color: colors.text, fontSize: 19, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
  bold: { fontWeight: '800' },
  inlineCode: {
    color: colors.success,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  blockquote: {
    backgroundColor: colors.surfaceAlt,
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
  },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2, paddingRight: spacing.md },
  listText: { flex: 1 },
  bullet: { color: colors.textMuted, fontSize: 16, width: 24, lineHeight: 24 },
  codeBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  codeText: { color: colors.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.88,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
  },
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
  scroll: { flexGrow: 0 },
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
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
