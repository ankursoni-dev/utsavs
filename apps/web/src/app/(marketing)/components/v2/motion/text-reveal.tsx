'use client';

import { type ElementType, useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useScrollReveal } from './use-scroll-reveal';
import { cn } from '@/lib/utils';

export interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  mode?: 'word' | 'character';
  stagger?: number;
  className?: string;
  /** Seconds before the animation starts. */
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'center';
  triggerOnVisible?: boolean;
  threshold?: number;
  /**
   * If provided, TextReveal skips its own IntersectionObserver and uses this
   * boolean as its visible signal. Use when an ancestor already tracks
   * in-view state to avoid stacking observers.
   */
  parentInView?: boolean;
}

const hiddenVariants: Record<string, { opacity: number; y?: number; x?: number }> = {
  up: { opacity: 0, y: 20 },
  left: { opacity: 0, x: -20 },
  right: { opacity: 0, x: 20 },
  center: { opacity: 0, y: 16 },
};

const visibleVariants: Record<string, { opacity: number; y?: number; x?: number }> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  center: { opacity: 1, y: 0 },
};

/**
 * Reveals text word-by-word or character-by-character using framer-motion
 * stagger animations.
 *
 * Respects `prefers-reduced-motion: reduce` — when active, renders the plain
 * text element with no animation.
 *
 * The `direction='center'` mode reveals characters outward from the middle.
 *
 * Word spacing: marginRight is used instead of appending a trailing space
 * inside the inline-block span, because browsers collapse trailing whitespace
 * at the right edge of inline-block elements, causing words to concatenate.
 *
 * When `parentInView` is provided, TextReveal skips its own
 * IntersectionObserver and uses the prop directly. Use this when an ancestor
 * already tracks in-view state to avoid stacking observers.
 */
export function TextReveal({
  text,
  as: Tag = 'div',
  mode = 'word',
  stagger = 0.12,
  className,
  delay = 0,
  direction = 'up',
  triggerOnVisible = true,
  threshold = 0.2,
  parentInView,
}: TextRevealProps) {
  // useReducedMotion() is SSR-safe: returns null on the server and syncs to the
  // actual preference after hydration. Defaulting to false means both server and
  // client initially render the motion branch (no hydration mismatch).
  const prefersReduced = useReducedMotion() ?? false;

  // Always call useScrollReveal unconditionally to satisfy the Rules of Hooks.
  // When parentInView is provided, we ignore its result and use parentInView instead.
  const own = useScrollReveal({ threshold });
  const isVisible = parentInView ?? own.isVisible;
  // Only attach the scroll ref when this component owns observation.
  const scrollRef = parentInView === undefined ? own.ref : undefined;

  const items = useMemo(() => {
    if (mode === 'character') {
      return text.split('');
    }
    return text.split(' ');
  }, [text, mode]);

  // Bail out to static render when reduced-motion is preferred.
  if (prefersReduced) {
    // Use type assertion to allow dynamic tag usage.
    const StaticTag = Tag as ElementType;
    return <StaticTag className={className}>{text}</StaticTag>;
  }

  // For 'center' direction, each item's custom delay is based on distance from
  // the middle index. We use the `custom` prop on each motion.span.
  const middle = Math.floor(items.length / 2);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: direction === 'center' ? 0 : stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants =
    direction === 'center'
      ? {
          hidden: hiddenVariants.center,
          visible: (distanceFromMiddle: number) => ({
            ...visibleVariants.center,
            transition: {
              delay: distanceFromMiddle * stagger,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            },
          }),
        }
      : {
          hidden: hiddenVariants[direction],
          visible: {
            ...visibleVariants[direction],
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          },
        };

  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      ref={scrollRef as React.RefObject<HTMLDivElement> | undefined}
      className={cn('whitespace-normal', className)}
      variants={containerVariants}
      initial="hidden"
      animate={!triggerOnVisible || isVisible ? 'visible' : 'hidden'}
    >
      {items.map((item, index) => (
        <motion.span
          key={`${item}-${index}`}
          className="inline-block"
          variants={itemVariants}
          custom={direction === 'center' ? Math.abs(index - middle) : undefined}
          style={{
            marginRight: mode === 'word' && index < items.length - 1 ? '0.3em' : undefined,
          }}
        >
          {item}
        </motion.span>
      ))}
    </MotionTag>
  );
}
