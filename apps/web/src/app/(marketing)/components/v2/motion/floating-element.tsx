'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingElementProps {
  children: ReactNode;
  /** Vertical amplitude in px. Default 4. Applied via --float-amplitude CSS variable. */
  amplitude?: number;
  /** Animation duration in seconds. Default 4. */
  duration?: number;
  /** Animation delay in seconds. Default 0. */
  delay?: number;
  className?: string;
}

/**
 * Wraps children in a container that gently floats up and down using the
 * `float-y` CSS keyframe defined in globals.css.
 *
 * CSS variables on the element control amplitude, duration, and delay so a
 * single global keyframe (`float-y`) serves all instances.
 *
 * Respects `prefers-reduced-motion: reduce` via the global CSS media query in
 * globals.css — the `float-element` class animation is disabled at the CSS
 * level when motion is reduced.
 */
export function FloatingElement({
  children,
  amplitude = 4,
  duration = 4,
  delay = 0,
  className,
}: FloatingElementProps) {
  return (
    <div
      className={cn('float-element', className)}
      style={
        {
          '--float-amplitude': `${amplitude}px`,
          '--float-duration': `${duration}s`,
          '--float-delay': `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
