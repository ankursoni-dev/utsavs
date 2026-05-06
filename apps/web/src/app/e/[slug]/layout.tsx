import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

/**
 * Guest event shell — public, themed via ThemeProvider.
 *
 * In the real app, the theme will be loaded from the event by slug. For the
 * scaffold we hardcode `royal-ivory` so the route renders against tokens.
 */
export default function GuestEventLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme="royal-ivory" className="min-h-screen">
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--theme-bg)',
          color: 'var(--theme-text)',
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
