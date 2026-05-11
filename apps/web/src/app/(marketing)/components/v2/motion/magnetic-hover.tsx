'use client';

import { type ReactNode, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MagneticHoverProps {
  children: ReactNode;
  className?: string;
  /**
   * Displacement multiplier. Default 1 — max displacement is ~8px.
   * Set to 0 to disable without removing the component.
   */
  strength?: number;
}

const SPRING_CONFIG = { stiffness: 150, damping: 15, mass: 0.1 };

/**
 * Wraps children in a motion div that subtly follows the cursor when hovered,
 * creating a magnetic pull effect.
 *
 * Respects `prefers-reduced-motion: reduce` — when active, renders a plain
 * div with no motion values applied.
 *
 * Displacement is intentionally small (max ±8px × strength) to feel
 * subtle and premium rather than distracting.
 */
export function MagneticHover({ children, className, strength = 1 }: MagneticHoverProps) {
  // useReducedMotion() is SSR-safe: returns null on the server and syncs to the
  // actual preference after hydration. Defaulting to false means both server and
  // client initially render the motion branch (no hydration mismatch).
  const prefersReduced = useReducedMotion() ?? false;

  // Motion values are always created (hooks must be unconditional).
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  const containerRef = useRef<HTMLDivElement>(null);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    // Clamp displacement to ±8px * strength.
    const maxDisplacement = 8 * strength;
    const clamp = (v: number) => Math.max(-maxDisplacement, Math.min(maxDisplacement, v));

    rawX.set(clamp(offsetX / 6));
    rawY.set(clamp(offsetY / 6));
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(className)}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
