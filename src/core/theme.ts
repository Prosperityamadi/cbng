/**
 * Core Theme & Color Tokens
 * Centralized theme colors to prevent hardcoded values across the codebase.
 */
export const THEME_COLORS = {
  // Two-tone Primary Red Palette (as seen in the Finbank / NemiCapital brand reference)
  primary: '#9C113D',             // Core brand primary midtone
  primaryCrimson: '#B81446',      // Vibrant, luminous top/highlight red
  primaryBurgundy: '#5A0620',     // Deep, rich wine/shadow burgundy
  
  // Gradients combining the two primary red variants
  gradients: {
    primaryVertical: 'linear-gradient(180deg, #B81446 0%, #8A0E34 45%, #5A0620 100%)',
    primaryHorizontal: 'linear-gradient(90deg, #8A0E34 0%, #680927 50%, #5A0620 100%)',
    primaryDiagonal: 'linear-gradient(135deg, #B81446 0%, #8A0E34 50%, #5A0620 100%)',
  },

  // Secondary Cream Palette
  secondary: '#F7F1EB',           // Signature cream background
  secondaryDark: '#EDE3D7',
  secondaryLight: '#FCFAF7',

  // Neutrals & Accents
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#1A1818',
  textMuted: '#5C5652',
  textLight: '#9C958F',
  
  borderSubtle: 'rgba(156, 17, 61, 0.12)',
  divider: '#E5DCD2',
} as const;

export type ThemeColors = typeof THEME_COLORS;
