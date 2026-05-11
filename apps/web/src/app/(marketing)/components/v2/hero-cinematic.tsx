'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ParticleField } from './motion/particle-field';
import { TextReveal } from './motion/text-reveal';

// ── Types ────────────────────────────────────────────────────────────────────

export interface HeroCinematicProps {
  /** Override the primary CTA href. Defaults to "#waitlist". */
  ctaHref?: string;
  /** Override the secondary CTA href. Defaults to "#dashboard". */
  secondaryHref?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Full-viewport-height dark hero section with cinematic entrance choreography.
 *
 * Choreography timeline (from mount):
 *   T+0.3s  Radial gradient fades in
 *   T+0.6s  Eyebrow slides up
 *   T+0.9s  Headline word-by-word reveal (via TextReveal)
 *   T+2.0s  Subtext blur-to-sharp
 *   T+2.4s  Primary CTA
 *   T+2.6s  Secondary CTA
 *   T+3.2s  Chevron fade-in → perpetual bounce
 *
 * Post-entrance ambient motion (animated branch only):
 *   - Headline typography breathing (scale ±0.3%)
 *   - Primary CTA glow pulse
 *   - Drifting radial fog layer
 *
 * Respects prefers-reduced-motion: when active, all content is rendered
 * statically with final values — no motion components, no particles.
 */
export function HeroCinematic({ ctaHref = '#waitlist', secondaryHref = '#how-it-works' }: HeroCinematicProps) {
  const prefersReduced = useReducedMotion() ?? false;

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section data-nav-theme="dark" className="text-white relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6">
        {/* Layer 1 — base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0A0A0A 0%, #0F0E0D 40%, #121010 70%, #0A0A0A 100%)',
          }}
          aria-hidden="true"
        />

        {/* Layer 3 — noise texture (CSS-only) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
          aria-hidden="true"
        />

        {/* Radial gradient overlay — static */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 4%, transparent) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
          {/* Eyebrow */}
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-mono mb-6">
            For wedding organizers &amp; host families
          </p>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-[clamp(3rem,6vw,5rem)] leading-tight mb-6 text-white">
            From chaos to command.
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            The command center behind India&apos;s biggest celebrations.
            <br />
            Guests. Budgets. Vendors. Shagun. Themes. One platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-row gap-4 items-center justify-center flex-wrap">
            <a
              href={ctaHref}
              className="relative shimmer-hover shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-[0.97] transition-all duration-200 cursor-pointer rounded-[var(--radius-md)] px-8 py-3 text-base font-medium text-white"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Get Early Access
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center px-8 py-3 text-base font-medium rounded-[var(--radius-md)] border border-white/20 hover:border-white/50 hover:bg-white/5 active:scale-[0.97] transition-all duration-200 cursor-pointer text-white"
            >
              Watch It Work ↓
            </a>
          </div>

          {/* Scroll chevron — static, no bounce */}
          <div className="mt-12 text-white/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section data-nav-theme="dark" className="text-white relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6">
      {/* Layer 1 — base gradient (replaces flat bg-[#0A0A0A]) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0A0A0A 0%, #0F0E0D 40%, #121010 70%, #0A0A0A 100%)',
        }}
        aria-hidden="true"
      />

      {/* Layer 2 — drifting radial fog (animated) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 30% 40%, rgba(124,45,110,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(200,169,107,0.03) 0%, transparent 50%)',
            'radial-gradient(ellipse at 40% 50%, rgba(124,45,110,0.06) 0%, transparent 60%), radial-gradient(ellipse at 60% 40%, rgba(200,169,107,0.04) 0%, transparent 50%)',
            'radial-gradient(ellipse at 30% 40%, rgba(124,45,110,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(200,169,107,0.03) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Layer 3 — noise texture (CSS-only) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      {/* Particle layer — positioned absolute, behind everything */}
      <ParticleField type="leaves" count={18} speed="slow" />

      {/* Radial gradient overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-primary) 4%, transparent) 0%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
        aria-hidden="true"
      />

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
        {/* Eyebrow — T+0.6s */}
        <motion.p
          className="text-white/50 text-xs uppercase tracking-[0.2em] font-mono mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          For wedding organizers &amp; host families
        </motion.p>

        {/* Headline — TextReveal fires on mount (hero is at y=0, IO triggers immediately) */}
        {/* T+0.9s: stagger begins after the delay prop is consumed */}
        {/* Breathing wrapper: scale 0.3% oscillation — almost imperceptible, keeps type alive */}
        <motion.div
          animate={{ scale: [1, 1.003, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TextReveal
            text="From chaos to command."
            as="h1"
            mode="word"
            stagger={0.12}
            delay={0.9}
            direction="up"
            triggerOnVisible={true}
            threshold={0.01}
            className="font-display text-4xl md:text-[clamp(3rem,6vw,5rem)] leading-tight mb-6 text-white"
          />
        </motion.div>

        {/* Subtext — T+2.0s blur-to-sharp */}
        <motion.p
          className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed mb-8"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 2.0, duration: 0.5 }}
        >
          The command center behind India&apos;s biggest celebrations.
          <br />
          Guests. Budgets. Vendors. Shagun. Themes. One platform.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-row gap-4 items-center justify-center flex-wrap">
          {/* Primary CTA — T+2.4s, with ambient glow pulse */}
          <motion.a
            href={ctaHref}
            className="relative shimmer-hover shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-[0.97] transition-all duration-200 cursor-pointer rounded-[var(--radius-md)] px-8 py-3 text-base font-medium text-white"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.4 }}
          >
            {/* Ambient glow pulse — sits behind the button via -z-10 */}
            <motion.div
              className="absolute -inset-2 rounded-[var(--radius-md)] -z-10"
              style={{ background: 'var(--brand-primary)', filter: 'blur(20px)' }}
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
            Get Early Access
          </motion.a>

          {/* Secondary CTA — T+2.6s */}
          <motion.a
            href={secondaryHref}
            className="inline-flex items-center px-8 py-3 text-base font-medium rounded-[var(--radius-md)] border border-white/20 hover:border-white/50 hover:bg-white/5 active:scale-[0.97] transition-all duration-200 cursor-pointer text-white"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.4 }}
          >
            Watch It Work ↓
          </motion.a>
        </div>

        {/* Scroll chevron — outer: T+3.2s fade-in; inner: perpetual bounce */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.4 }}
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/40"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
