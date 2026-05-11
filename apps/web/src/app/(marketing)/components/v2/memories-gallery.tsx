'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';
import { Eyebrow } from '@/components/ui/eyebrow';

// ── Data ───────────────────────────────────────────────────────────────────────

// Image placeholder data — 7 boxes with varied sizes, rotations, and tints.
// spanRows: 2 creates a featured tall box in the grid.
const PHOTOS = [
  { id: 'p1', tint: 'champagne', rotate: -2, spanRows: 1 },
  { id: 'p2', tint: 'rose', rotate: 1, spanRows: 2 }, // featured
  { id: 'p3', tint: 'beige', rotate: -1, spanRows: 1 },
  { id: 'p4', tint: 'champagne', rotate: 2, spanRows: 1 },
  { id: 'p5', tint: 'rose', rotate: -2, spanRows: 1 },
  { id: 'p6', tint: 'beige', rotate: 1, spanRows: 1 },
  { id: 'p7', tint: 'champagne', rotate: -1, spanRows: 1 },
] as const;

type Tint = 'champagne' | 'rose' | 'beige';

const TINT_GRADIENTS: Record<Tint, string> = {
  champagne: 'linear-gradient(135deg, #E8D5A3 0%, #C8A96B 100%)',
  rose: 'linear-gradient(135deg, #F5C8C2 0%, #D9847C 100%)',
  beige: 'linear-gradient(135deg, #E8DDD0 0%, #B8A99E 100%)',
};

// Stable entrance offsets — deterministic constants to avoid SSR/hydration mismatch.
// Math.random() is NOT used here (would diverge between server and client renders).
const STABLE_ENTRY: Array<{ x: number; y: number }> = [
  { x: -40, y: 30 },
  { x: 50, y: -20 },
  { x: -30, y: 40 },
  { x: 35, y: 25 },
  { x: -25, y: -35 },
  { x: 45, y: -10 },
  { x: -40, y: 20 },
];

const FEATURE_CHIPS = [
  'Guest uploads',
  'Couple gallery',
  'Live moments',
  'Collaborative albums',
  'Event highlights',
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-white/40"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

interface PhotoBoxProps {
  photo: (typeof PHOTOS)[number];
  index: number;
  inView: boolean;
  prefersReduced: boolean;
}

function PhotoBox({ photo, index, inView, prefersReduced }: PhotoBoxProps) {
  const gridRowStyle = photo.spanRows === 2 ? 'span 2' : undefined;
  const background = TINT_GRADIENTS[photo.tint];

  if (prefersReduced) {
    return (
      <div
        className="rounded-lg overflow-hidden shadow-md flex items-center justify-center"
        style={{ background, gridRow: gridRowStyle }}
      >
        <CameraIcon />
      </div>
    );
  }

  const entry = STABLE_ENTRY[index % STABLE_ENTRY.length];

  return (
    <motion.div
      className="rounded-lg overflow-hidden shadow-md flex items-center justify-center relative float-element"
      style={{
        background,
        gridRow: gridRowStyle,
        rotate: `${photo.rotate}deg`,
        ['--float-amplitude' as string]: `${2 + (index % 3)}px`,
        ['--float-duration' as string]: `${4 + (index % 3)}s`,
        // Delay float start until after spring entrance settles (~0.6s base + stagger).
        ['--float-delay' as string]: `${(index * 0.3) % 2.5}s`,
      }}
      initial={{ opacity: 0, x: entry.x, y: entry.y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 80, damping: 16, delay: 0.1 + index * 0.08 }}
    >
      <CameraIcon />
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * MemoriesGallery section.
 *
 * Displays a warm-toned placeholder photo grid to convey the guest-upload /
 * collaborative album feature. 7 boxes in a 3/4-column responsive grid; one
 * box spans 2 rows as a featured slot.
 *
 * Motion identity: spring scatter entrance (same family as GuestIntelligence
 * tag cloud), per-photo CSS float via .float-element.
 *
 * Reduced-motion: plain divs at final opacity, no entrance animation, no float
 * (the `.float-element` CSS class is suppressed by globals.css media query).
 *
 * No Math.random — all entrance offsets are deterministic constants in STABLE_ENTRY.
 */
export function MemoriesGallery() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref, isVisible: inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section data-nav-theme="light" ref={ref} className="relative z-10 py-12 md:py-20 px-6 bg-bg-alt">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <Eyebrow>Beyond Planning</Eyebrow>
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight text-text mt-3">
            {prefersReduced ? (
              'Every moment becomes a memory.'
            ) : (
              <TextReveal
                text="Every moment becomes a memory."
                mode="word"
                direction="up"
                as="span"
              />
            )}
          </h2>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[180px]">
          {PHOTOS.map((photo, i) => (
            <PhotoBox
              key={photo.id}
              photo={photo}
              index={i}
              inView={inView}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {FEATURE_CHIPS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-white text-text-muted border border-border"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
