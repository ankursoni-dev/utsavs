'use client';

import { useRef, type RefObject } from 'react';
import { useScroll, useTransform, type MotionValue, type UseScrollOptions } from 'framer-motion';

export interface UseParallaxOptions {
  /**
   * Scroll speed multiplier. Default 0.5 (element moves at half scroll speed).
   * Positive values move upward as page scrolls down.
   */
  speed?: number;
  /**
   * Framer-motion scroll offset. Default: ['start end', 'end start'].
   * Defines when the scroll progress goes from 0 to 1.
   * Accepts any value that framer-motion's UseScrollOptions.offset allows,
   * e.g. ['start center', 'end end'] or [0, 1].
   */
  offset?: UseScrollOptions['offset'];
}

export interface UseParallaxResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T | null>;
  /** translateY MotionValue in pixels. Use as `style={{ y }}` on a motion element. */
  y: MotionValue<number>;
}

/**
 * Provides a parallax translateY MotionValue driven by the element's scroll
 * position within the viewport.
 *
 * NOTE: This hook does NOT enforce `prefers-reduced-motion` itself.
 * Consumers must decide whether to apply the `y` value based on user preference.
 * The hook unconditionally returns a live MotionValue so hook call order is stable.
 *
 * Typical usage with reduced-motion guard:
 * ```tsx
 * const { ref, y } = useParallax({ speed: 0.4 });
 * const prefersReduced = useReducedMotion();
 * return <motion.div ref={ref} style={prefersReduced ? undefined : { y }} />;
 * ```
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>({
  speed = 0.5,
  offset = ['start end', 'end start'],
}: UseParallaxOptions = {}): UseParallaxResult<T> {
  const ref = useRef<T>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  // Translate from 0px (element enters viewport bottom) to -(speed*100)px
  // (element exits viewport top), creating a slower-than-scroll effect.
  const y = useTransform(scrollYProgress, [0, 1], [0, -(speed * 100)]);

  return { ref, y };
}
