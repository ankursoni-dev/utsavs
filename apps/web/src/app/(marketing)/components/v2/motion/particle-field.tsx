'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ParticleFieldProps {
  count?: number;
  type?: 'leaves' | 'confetti' | 'dots';
  speed?: 'slow' | 'normal' | 'fast';
  /**
   * Override particle colors. Used by 'confetti' and 'dots' types.
   * Compared by joined string, not reference, so inline arrays are safe.
   */
  colors?: string[];
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  rotation?: number;
}

const SPEED_RANGES: Record<string, [number, number]> = {
  slow: [10, 16],
  normal: [6, 12],
  fast: [3, 6],
};

const DEFAULT_CONFETTI_COLORS = ['#C8A96B', '#7C2D6E', '#FFFFFF', '#E8D5A3'];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Renders an ambient particle field using CSS animations defined in globals.css.
 *
 * Particles are generated in a useEffect so Math.random() never runs during
 * SSR — the component hydrates cleanly with no particle mismatch.
 *
 * Respects `prefers-reduced-motion: reduce` — when active, no particles are
 * rendered (the outer div remains in the DOM for structural safety but is empty).
 *
 * Cleanup: the setState calls are deferred via setTimeout; the timeout is
 * cleared on unmount.
 */
export function ParticleField({
  count = 20,
  type = 'leaves',
  speed = 'normal',
  colors,
  className,
}: ParticleFieldProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Stringify colors for stable dep comparison — equivalent arrays (same content,
  // different reference) are treated as identical, preventing infinite re-generation
  // when consumers pass inline array literals like colors={['#fff', '#000']}.
  const colorsKey = colors ? colors.join('|') : '';

  useEffect(() => {
    // Respect user motion preference — render nothing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const [minDuration, maxDuration] = SPEED_RANGES[speed];
    const palette =
      colors ?? (type === 'leaves' ? ['#C8A96B', '#E8D5A3'] : DEFAULT_CONFETTI_COLORS);

    const generated: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      duration: randomBetween(minDuration, maxDuration),
      delay: randomBetween(0, maxDuration),
      size: type === 'leaves' ? randomBetween(4, 12) : randomBetween(4, 8),
      color: palette[Math.floor(Math.random() * palette.length)],
      rotation: randomBetween(0, 360),
    }));

    // Defer setState to avoid synchronous state-in-effect lint violation.
    const id = setTimeout(() => setParticles(generated), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- colorsKey replaces colors for stable comparison
  }, [count, type, speed, colorsKey]);

  // Per-particle timing, positioning, and (for confetti) color. Animation-name comes from CSS class.
  const getParticleStyle = (p: Particle): React.CSSProperties => {
    const base: React.CSSProperties = {
      left: `${p.left}%`,
      width: `${p.size}px`,
      height: `${p.size}px`,
      animationDuration: `${p.duration}s`,
      animationDelay: `${p.delay}s`,
    };

    if (type === 'leaves') {
      return { ...base, opacity: 0 };
    }

    if (type === 'confetti') {
      return {
        ...base,
        background: p.color,
        transform: `rotate(${p.rotation ?? 0}deg)`,
        opacity: 0,
      };
    }

    // dots
    return { ...base, background: p.color };
  };

  // CSS class carries animation-name; base .particle class carries position:absolute etc.
  const getParticleClass = (): string => {
    if (type === 'confetti') return 'particle particle-confetti';
    if (type === 'dots') return 'particle particle-dot';
    return 'particle';
  };

  const particleClass = getParticleClass();

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span key={p.id} className={particleClass} style={getParticleStyle(p)} />
      ))}
    </div>
  );
}
