/**
 * Minimal, dark-first design tokens shared across the app.
 * Keeping these in one place makes the UI consistent and easy to retheme.
 */

export const colors = {
  background: '#0B0B0F',
  surface: '#15151C',
  surfaceAlt: '#1F1F2A',
  primary: '#4F8CFF',
  primaryDark: '#2F6BE0',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.65)',
  textFaint: 'rgba(255,255,255,0.45)',
  danger: '#FF5A5F',
  success: '#37D399',
  overlay: 'rgba(0,0,0,0.55)',
  handle: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.08)',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 16, lg: 24, pill: 999 };

export const typography = {
  brand: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 15, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
};
