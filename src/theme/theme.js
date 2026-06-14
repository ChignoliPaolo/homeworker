/**
 * Modern, dark-first design tokens with a vibrant violet/indigo palette.
 * Designed for a premium, student-friendly experience with glassmorphism effects.
 */

export const colors = {
  // ── Core surfaces ──
  background:   '#0D0B1A',
  surface:      '#161229',
  surfaceAlt:   '#1E1835',
  surfaceGlass: 'rgba(255,255,255,0.06)',

  // ── Accent ──
  primary:       '#7C5CFF',
  primaryLight:  '#9B7FFF',
  primaryDark:   '#5B3FD6',
  secondary:     '#5B8DEF',
  accent:        '#FF6B9D',

  // ── Semantic ──
  success:  '#34D399',
  warning:  '#FBBF24',
  danger:   '#FF5A6E',

  // ── Text ──
  text:       '#F0EEFF',
  textMuted:  'rgba(240,238,255,0.62)',
  textFaint:  'rgba(240,238,255,0.38)',

  // ── Utility ──
  overlay:     'rgba(13,11,26,0.82)',
  handle:      'rgba(255,255,255,0.28)',
  border:      'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.14)',
  glow:        'rgba(124,92,255,0.35)',
};

export const gradients = {
  accent:     [colors.primary, colors.secondary],
  accentWarm: [colors.primary, colors.accent],
  surface:    [colors.surface, colors.background],
  overlay:    ['transparent', 'rgba(13,11,26,0.92)'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const typography = {
  brand:    { fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  title:    { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption:  { fontSize: 13, fontWeight: '500' },
  small:    { fontSize: 11, fontWeight: '500' },
};

export const shadows = {
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
};
