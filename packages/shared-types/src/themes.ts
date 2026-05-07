/**
 * The 6 event themes from `design-system.md` ADR-004.
 *
 * `theme` is stored on the Event entity as the `EventTheme` enum string.
 * The `ThemeName` strings here are the kebab-case display equivalents used
 * as the lookup key for token sets injected as CSS custom properties.
 *
 * Organizer / host shells do NOT use these themes — they always render the
 * base palette. Theming is a guest-facing concern.
 */

export const THEME_NAMES = [
  'royal-ivory',
  'modern-emerald',
  'midnight-sangeet',
  'minimal-luxury',
  'floral-sunset',
  'temple-classic',
] as const;

export type ThemeName = (typeof THEME_NAMES)[number];

export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  /** CSS gradient (use directly in `background-image`). */
  grad: string;
}

export const THEMES: Record<ThemeName, ThemeTokens> = {
  'royal-ivory': {
    primary: '#C8A96B', // champagne
    secondary: '#F0E6D2', // champagne-lt (ivory)
    accent: '#5B1A2B', // maroon
    bg: '#FBF9F6', // bg-alt
    text: '#171717',
    grad: 'linear-gradient(135deg, #F0E6D2 0%, #C8A96B 100%)',
  },
  'modern-emerald': {
    primary: '#0F4C3A', // emerald
    secondary: '#D4E8DF', // emerald-lt
    accent: '#C8A96B', // champagne
    bg: '#FBF9F6',
    text: '#171717',
    grad: 'linear-gradient(135deg, #0F4C3A 0%, #1B1F3B 100%)',
  },
  'midnight-sangeet': {
    primary: '#1B1F3B', // navy
    secondary: '#3A3F6B', // navy-lt
    accent: '#7C3AED', // violet
    bg: '#0E1024',
    text: '#FBF9F6',
    grad: 'linear-gradient(135deg, #1B1F3B 0%, #7C3AED 100%)',
  },
  'minimal-luxury': {
    primary: '#1A1A1A', // charcoal
    secondary: '#E8DFD0', // beige
    accent: '#C8A96B', // champagne
    bg: '#FBF9F6',
    text: '#171717',
    grad: 'linear-gradient(135deg, #1A1A1A 0%, #E8DFD0 100%)',
  },
  'floral-sunset': {
    primary: '#F4C4A0', // peach
    secondary: '#E8B8B8', // rose
    accent: '#5B1A2B', // maroon
    bg: '#FBF9F6',
    text: '#171717',
    grad: 'linear-gradient(135deg, #F4C4A0 0%, #E8B8B8 100%)',
  },
  'temple-classic': {
    primary: '#5B1A2B', // maroon
    secondary: '#A88B4A', // brass
    accent: '#C8A96B', // champagne
    bg: '#FBF9F6',
    text: '#171717',
    grad: 'linear-gradient(135deg, #5B1A2B 0%, #A88B4A 100%)',
  },
};
