import { Dimensions, PixelRatio } from 'react-native';

/**
 * 10-foot UI scaling.
 *
 * TV layouts are designed against a 1920x1080 reference. `scaledPixels`
 * converts a design pixel value into a value that holds its proportion on
 * whatever resolution the device actually renders at (720p, 1080p, 4K).
 *
 * This mirrors the `scaledPixels` hook used in the AmazonAppDev
 * multi-tv-app-sample, kept as a plain function so it can be used outside
 * of React components (e.g. in StyleSheet.create at module scope).
 */
const REFERENCE_WIDTH = 1920;

export const scaledPixels = (designPixels: number): number => {
  const { width } = Dimensions.get('window');
  const ratio = width / REFERENCE_WIDTH;
  return PixelRatio.roundToNearestPixel(designPixels * ratio);
};

export const theme = {
  colors: {
    // Warm near-black base (not pure #000 — softer on OLED, more premium).
    background: '#0B0C10',
    surface: 'rgba(18, 20, 28, 0.86)',
    surfaceSolid: '#12141C',
    surfaceRaised: '#1B1E29',
    // Richer, slightly deepened accents (less neon, more premium).
    primary: '#38BDF8', // SideKick accent (sky) — general mode
    primaryDeep: '#0EA5E9',
    sports: '#7CE65B', // sports mode accent (green)
    sportsDeep: '#4ADE80',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(236, 240, 248, 0.74)',
    textMuted: 'rgba(236, 240, 248, 0.46)',
    focusRing: '#FFFFFF',
    listening: '#FB7185', // mic-active rose
    statPositive: '#7CE65B',

    // ----- Landing-page (grid) palette -----
    card: '#161922',
    cardElevated: '#20242F',
    focusBorder: '#FFFFFF',
    focus: '#38BDF8', // glow color on focused cards
    scrimDark: 'rgba(8, 9, 13, 0.78)',
  },
  spacing: {
    xs: scaledPixels(8),
    sm: scaledPixels(16),
    md: scaledPixels(24),
    lg: scaledPixels(40),
    xl: scaledPixels(64),
  },
  radius: {
    sm: scaledPixels(8),
    md: scaledPixels(16),
    lg: scaledPixels(24),
    pill: scaledPixels(999),
  },
  font: {
    // 10-foot readable sizes
    caption: scaledPixels(22),
    body: scaledPixels(28),
    title: scaledPixels(40),
    hero: scaledPixels(60),
    stat: scaledPixels(72),
  },
  // Type hierarchy tokens (weights + tracking) for a 2026 look.
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },
  tracking: {
    tight: -0.5, // display/hero
    normal: 0,
    wide: 1.5, // labels / badges
    wider: 2.5, // small caps brand
  },
  // Width of the non-blocking answer panel (right edge of screen).
  overlayWidth: scaledPixels(620),

  // ----- Landing-page layout -----
  // TV-safe margins (keeps content away from the bezel/overscan).
  safeZones: {
    horizontal: scaledPixels(60),
    vertical: scaledPixels(40),
  },
  card: {
    width: scaledPixels(420),
    height: scaledPixels(260),
    radius: scaledPixels(12),
    gap: scaledPixels(20),
  },
  heroHeight: scaledPixels(620),
} as const;

export type Theme = typeof theme;
