'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { THEMES, type ThemeName } from '@/lib/themes';

interface ThemeProviderProps {
  /** Event theme name. Falls back to `royal-ivory`. */
  theme: ThemeName;
  children: ReactNode;
  /** Optional className applied to the wrapper div. */
  className?: string;
}

/**
 * Injects the event theme as CSS custom properties on a subtree.
 *
 * Used only on guest-facing routes (`e/[slug]/...`). Organizer / host shells
 * read base tokens directly from `globals.css`.
 *
 * Usage:
 *   <ThemeProvider theme={event.theme}>
 *     <GuestEventPage ... />
 *   </ThemeProvider>
 */
export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  const style = useMemo<CSSProperties>(() => {
    const tokens = THEMES[theme] ?? THEMES['royal-ivory'];
    return {
      // Cast to a record so React accepts CSS custom properties.
      ['--theme-primary' as string]: tokens.primary,
      ['--theme-secondary' as string]: tokens.secondary,
      ['--theme-accent' as string]: tokens.accent,
      ['--theme-bg' as string]: tokens.bg,
      ['--theme-text' as string]: tokens.text,
      ['--theme-grad' as string]: tokens.grad,
    };
  }, [theme]);

  return (
    <div data-theme={theme} className={className} style={style}>
      {children}
    </div>
  );
}
