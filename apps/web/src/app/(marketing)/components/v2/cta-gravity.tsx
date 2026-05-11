'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ParticleField } from './motion/particle-field';
import { TextReveal } from './motion/text-reveal';
import { useCountUp } from './motion/use-count-up';

// ── Stat strip ─────────────────────────────────────────────────────────────────

// Each stat in its own component so useCountUp is the sole hook per render —
// the same pattern used in metrics-ribbon.tsx to satisfy react-hooks/refs.

function StatNumber({ value, ariaLabel, duration }: { value: string; ariaLabel: string; duration: number }) {
  const { displayValue, ref } = useCountUp<HTMLSpanElement>(value, {
    startOnVisible: true,
    duration,
  });
  return (
    <span ref={ref} className="font-mono text-xl text-[#C8A96B]" aria-label={ariaLabel}>
      {displayValue}
    </span>
  );
}

function StatStrip({ animate }: { animate: boolean }) {
  if (!animate) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl text-[#C8A96B]" aria-label="342 guests tracked">
            342
          </span>
          <span className="text-xs text-white/40 uppercase tracking-widest">guests tracked</span>
        </div>
        <span className="text-white/20">·</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl text-[#C8A96B]" aria-label="22L managed">
            ₹22L
          </span>
          <span className="text-xs text-white/40 uppercase tracking-widest">lakhs managed</span>
        </div>
        <span className="text-white/20">·</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl text-[#C8A96B]" aria-label="12 vendors coordinated">
            12
          </span>
          <span className="text-xs text-white/40 uppercase tracking-widest">vendors coordinated</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 mb-2">
      <div className="flex items-baseline gap-2">
        <StatNumber value="342" ariaLabel="342 guests tracked" duration={1600} />
        <span className="text-xs text-white/40 uppercase tracking-widest">guests tracked</span>
      </div>
      <span className="text-white/20">·</span>
      <div className="flex items-baseline gap-2">
        <StatNumber value="₹22L" ariaLabel="22L managed" duration={1400} />
        <span className="text-xs text-white/40 uppercase tracking-widest">lakhs managed</span>
      </div>
      <span className="text-white/20">·</span>
      <div className="flex items-baseline gap-2">
        <StatNumber value="12" ariaLabel="12 vendors coordinated" duration={1200} />
        <span className="text-xs text-white/40 uppercase tracking-widest">vendors coordinated</span>
      </div>
    </div>
  );
}

// ── Dashboard silhouette ───────────────────────────────────────────────────────

function DashboardSilhouette() {
  return (
    <div
      className="absolute inset-x-0 top-1/4 bottom-1/4 pointer-events-none opacity-[0.06] flex items-center justify-center"
      style={{ filter: 'blur(4px)' }}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-3 w-full max-w-2xl">
        <div className="flex gap-3">
          <div className="flex-1 h-16 bg-white/40 rounded-lg" />
          <div className="flex-1 h-16 bg-white/40 rounded-lg" />
          <div className="flex-1 h-16 bg-white/40 rounded-lg" />
        </div>
        <div className="h-12 bg-white/40 rounded-lg" />
        <div className="flex gap-3">
          <div className="flex-1 h-20 bg-white/40 rounded-lg" />
          <div className="flex-1 h-20 bg-white/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * CtaGravity section.
 *
 * Full-viewport-height dark CTA with pulsing radial gradient background.
 * Form collects a phone number (UI-only, no API call) and shows a success
 * state with confetti on submit.
 *
 * Motion identity: center-outward TextReveal ("gravity pull") + pulsing
 * background radial — completely distinct from all other sections.
 *
 * Reduced-motion: static headline, static gradient, no confetti, no pulse.
 */
export function CtaGravity() {
  const prefersReduced = useReducedMotion() ?? false;
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitted(true);
  }

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section
        data-nav-theme="dark"
        id="waitlist"
        className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col items-center justify-center px-6"
      >
        {/* Static radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 5%, transparent) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Dashboard silhouette — decorative, static */}
        <DashboardSilhouette />

        <div className="relative z-10 max-w-md w-full text-center">
          {submitted ? (
            <div>
              <h2 className="text-white text-2xl font-display tracking-[-0.02em]">
                You&apos;re on the list.
              </h2>
              <p className="text-white/40 text-xs mt-4">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <>
              <p className="text-[#C8A96B]/60 text-xs uppercase tracking-[0.2em] font-mono mb-4">
                Get Early Access
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em] text-white leading-tight">
                Indian weddings were never meant to run on spreadsheets and chaos.
              </h2>
              <p className="text-white/60 mt-4 text-sm leading-relaxed">
                Leave your number. Your command center is almost ready.
              </p>

              <StatStrip animate={false} />

              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center"
              >
                <input
                  type="tel"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="flex-1 rounded-md px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  className="shimmer-hover rounded-md px-6 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Get Early Access
                </button>
              </form>

              <p className="text-white/30 text-xs mt-4">No spam. No newsletters. Just your invite.</p>
            </>
          )}
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section
      data-nav-theme="dark"
      id="waitlist"
      className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden flex flex-col items-center justify-center px-6"
    >
      {/* Pulsing radial gradient background — stronger 6%→12% range */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: inputFocused
            ? [
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%, transparent 70%)',
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%, transparent 70%)',
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%, transparent 70%)',
              ]
            : [
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 6%, transparent) 0%, transparent 70%)',
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 70%)',
                'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 6%, transparent) 0%, transparent 70%)',
              ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Dashboard silhouette — decorative, faint */}
      <DashboardSilhouette />

      {/* Confetti burst on submit */}
      {submitted && <ParticleField type="confetti" count={30} speed="fast" />}

      <div className="relative z-10 max-w-md w-full text-center">
        {submitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-white text-2xl font-display tracking-[-0.02em]">
              You&apos;re on the list.
            </h2>
            <p className="text-white/40 text-xs mt-4">We&apos;ll be in touch soon.</p>
          </motion.div>
        ) : (
          <>
            {/* Eyebrow */}
            <motion.p
              className="text-[#C8A96B]/60 text-xs uppercase tracking-[0.2em] font-mono mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Get Early Access
            </motion.p>

            {/* Headline — word-mode TextReveal for gravity-pull feel */}
            <TextReveal
              text="Indian weddings were never meant to run on spreadsheets and chaos."
              as="h2"
              mode="word"
              stagger={0.08}
              direction="center"
              delay={0.4}
              triggerOnVisible={false}
              className="font-display text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em] text-white leading-tight"
            />

            {/* Subtext + stat strip + form slide up */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white/60 mt-4 text-sm leading-relaxed">
                Leave your number. Your command center is almost ready.
              </p>

              {/* Stat counter strip */}
              <StatStrip animate={true} />

              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center"
              >
                <input
                  type="tel"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Your phone number"
                  className="flex-1 rounded-md px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="shimmer-hover rounded-md px-6 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Get Early Access
                </button>
              </form>

              <p className="text-white/30 text-xs mt-4">No spam. No newsletters. Just your invite.</p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
