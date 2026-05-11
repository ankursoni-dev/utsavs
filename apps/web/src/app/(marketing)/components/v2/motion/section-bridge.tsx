import type { ReactElement } from 'react';

interface SectionBridgeProps {
  fromColor?: string;
  toColor?: string;
  height?: string;
}

/**
 * SectionBridge — a pure-markup gradient bridge between sections.
 * Renders a thin div with a linear-gradient from `fromColor` to `toColor`.
 * Server Component (no 'use client' — no interactivity needed).
 */
export function SectionBridge({
  fromColor = 'transparent',
  toColor = 'transparent',
  height = '120px',
}: SectionBridgeProps): ReactElement {
  return (
    <div
      className="w-full pointer-events-none relative z-10"
      style={{
        height,
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
      }}
      aria-hidden="true"
    />
  );
}
