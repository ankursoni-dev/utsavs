'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCountUp } from './motion/use-count-up';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { ParticleField } from './motion/particle-field';

// ── Data ───────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '20-50', label: 'weddings/year' },
  { value: '6-15', label: 'vendors/wedding' },
  { value: '₹15-80L', label: 'budget range' },
] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBlockAnimated({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const { displayValue, ref } = useCountUp<HTMLSpanElement>(value, {
    duration: 1600,
    delay,
    startOnVisible: true,
    threshold: 0.3,
  });

  return (
    <div className="flex flex-col items-center text-center px-8 py-4">
      <span
        ref={ref}
        className="font-display text-4xl md:text-5xl tracking-[-0.02em] text-[#C8A96B]"
      >
        {displayValue}
      </span>
      <span className="eyebrow mt-2 text-[#C8A96B]/60 uppercase text-xs tracking-widest">
        {label}
      </span>
    </div>
  );
}

function StatBlock({
  value,
  label,
  delay,
  reduced,
}: {
  value: string;
  label: string;
  delay: number;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <div className="flex flex-col items-center text-center px-8 py-4">
        <span className="font-display text-4xl md:text-5xl tracking-[-0.02em] text-[#C8A96B]">
          {value}
        </span>
        <span className="eyebrow mt-2 text-[#C8A96B]/60 uppercase text-xs tracking-widest">
          {label}
        </span>
      </div>
    );
  }

  return <StatBlockAnimated value={value} label={label} delay={delay} />;
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * MetricsRibbon section.
 *
 * Full-width dark ribbon with 3 animated stat counters.
 * Motion identity: clip-reveal-ltr (left-to-right wipe) on entrance —
 * distinct from all vertical reveals and circle-reveal used elsewhere.
 *
 * Dividers animate from zero height/width when the section enters view.
 * Reduced-motion: static branch with final values, no particles.
 */
export function MetricsRibbon() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({
    threshold: 0.25,
    rootMargin: '0px 0px -5% 0px',
  });

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section
        data-nav-theme="dark"
        className="relative z-10 bg-[#1A1A1A] text-white py-8 md:py-12 px-6 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.value}
              className="flex flex-col md:flex-row items-center w-full md:w-auto"
            >
              <StatBlock value={stat.value} label={stat.label} delay={0} reduced={true} />
              {/* Divider between items */}
              {i < STATS.length - 1 && (
                <>
                  {/* Mobile: horizontal */}
                  <div className="h-px w-32 bg-white/20 md:hidden" />
                  {/* Desktop: vertical */}
                  <div className="hidden md:block w-px h-16 bg-white/20" />
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  // Note: clip-reveal-ltr entrance replaced with opacity+scale to avoid a permanent
  // visibility bug if the IntersectionObserver fires before the ref is attached.
  return (
    <motion.section
      data-nav-theme="dark"
      ref={sectionRef}
      className="relative z-10 bg-[#1A1A1A] text-white py-8 md:py-12 px-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Subtle ambient particles */}
      <ParticleField type="leaves" count={8} speed="slow" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">
        {STATS.map((stat, i) => (
          <div key={stat.value} className="flex flex-col md:flex-row items-center w-full md:w-auto">
            <StatBlock value={stat.value} label={stat.label} delay={i * 300} reduced={false} />

            {/* Divider — grows from zero when section enters view */}
            {i < STATS.length - 1 && (
              <>
                {/* Mobile: horizontal line */}
                <motion.div
                  className="h-px bg-white/20 md:hidden"
                  initial={{ width: 0 }}
                  animate={inView ? { width: 128 } : { width: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.65, 0, 0.35, 1] }}
                />
                {/* Desktop: vertical line */}
                <motion.div
                  className="hidden md:block w-px bg-white/20"
                  initial={{ height: 0 }}
                  animate={inView ? { height: 64 } : { height: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: [0.65, 0, 0.35, 1] }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
