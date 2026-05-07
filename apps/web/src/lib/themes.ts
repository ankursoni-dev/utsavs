/**
 * Re-export of theme tokens from `@repo/shared-types`.
 *
 * The canonical home for these tokens is the shared-types package so the
 * backend (Prisma `EventTheme` enum) and frontend (CSS variable injection)
 * stay aligned. Existing imports from `@/lib/themes` continue to work.
 */
export { THEMES, THEME_NAMES, type ThemeName, type ThemeTokens } from '@repo/shared-types';
