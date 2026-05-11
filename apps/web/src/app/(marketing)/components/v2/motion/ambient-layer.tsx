'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * AmbientLayer — fixed full-viewport layer with two slowly drifting radial-gradient
 * orbs that parallax with scroll. Renders below all section content (z-0).
 *
 * Motion gated behind useReducedMotion: returns null when prefers-reduced-motion is set.
 *
 * Note: useScroll + useTransform must be called unconditionally (Rules of Hooks),
 * so they run before the early-return for prefersReduced.
 */
export function AmbientLayer() {
  const prefersReduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();

  const orb1Y = useTransform(scrollYProgress, [0, 1], ['0vh', '-30vh']);
  const orb1X = useTransform(scrollYProgress, [0, 0.5, 1], ['10vw', '60vw', '20vw']);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ['20vh', '-50vh']);
  const orb2X = useTransform(scrollYProgress, [0, 0.5, 1], ['70vw', '30vw', '80vw']);

  if (prefersReduced) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 3%, transparent) 0%, transparent 70%)',
          y: orb1Y,
          x: orb1X,
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-champagne) 2%, transparent) 0%, transparent 70%)',
          y: orb2Y,
          x: orb2X,
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}
