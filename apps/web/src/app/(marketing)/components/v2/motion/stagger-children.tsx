'use client';

import { Children, type ElementType, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useScrollReveal } from './use-scroll-reveal';
import { cn } from '@/lib/utils';

export interface StaggerChildrenProps {
  children: ReactNode;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  /** Default true. Trigger stagger when element scrolls into view. */
  triggerOnScroll?: boolean;
  threshold?: number;
  /** Seconds to wait before staggering begins. Default 0. */
  delayChildren?: number;
  as?: 'div' | 'ul' | 'ol' | 'section';
  /**
   * Default true. When true, each direct child is automatically wrapped in a
   * motion.div with directional enter/exit variants.
   * When false, the container parent variants are set up but children must
   * manage their own motion variants (opt-in to stagger cascade).
   */
  wrapChildren?: boolean;
  /**
   * If provided, StaggerChildren skips its own IntersectionObserver and uses
   * this boolean as its visible signal. Use when an ancestor already tracks
   * in-view state to avoid stacking observers.
   */
  parentInView?: boolean;
}

const itemHidden: Record<string, { opacity: number; y?: number; x?: number }> = {
  up: { opacity: 0, y: 20 },
  down: { opacity: 0, y: -20 },
  left: { opacity: 0, x: -20 },
  right: { opacity: 0, x: 20 },
};

const itemVisible: Record<string, { opacity: number; y?: number; x?: number }> = {
  up: { opacity: 1, y: 0 },
  down: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
};

/**
 * Wraps a list of children and staggers their entrance animation when the
 * container scrolls into view.
 *
 * When `wrapChildren=true` (default), each direct child is wrapped in a
 * `motion.div` that participates in the parent stagger cascade automatically.
 *
 * When `wrapChildren=false`, children must be `motion.*` components themselves
 * and declare `variants` with `hidden`/`visible` keys to participate.
 *
 * Respects `prefers-reduced-motion: reduce` — when active, renders children
 * statically with no animation.
 */
export function StaggerChildren({
  children,
  stagger = 0.1,
  direction = 'up',
  className,
  triggerOnScroll = true,
  threshold = 0.2,
  delayChildren = 0,
  as = 'div',
  wrapChildren = true,
  parentInView,
}: StaggerChildrenProps) {
  // useReducedMotion() is SSR-safe: returns null on the server and syncs to the
  // actual preference after hydration. Defaulting to false means both server and
  // client initially render the motion branch (no hydration mismatch).
  const prefersReduced = useReducedMotion() ?? false;

  const own = useScrollReveal({ threshold });
  const isVisible = parentInView ?? own.isVisible;
  const containerRef = parentInView === undefined ? own.ref : undefined;

  if (prefersReduced) {
    const StaticTag = as as ElementType;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: itemHidden[direction],
    visible: {
      ...itemVisible[direction],
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  const animate = !triggerOnScroll || isVisible ? 'visible' : 'hidden';

  return (
    <MotionTag
      ref={containerRef as React.RefObject<HTMLDivElement> | undefined}
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate={animate}
    >
      {wrapChildren
        ? Children.map(children, (child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </MotionTag>
  );
}
