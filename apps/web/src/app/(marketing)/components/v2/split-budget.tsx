'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';

// ── Constants ──────────────────────────────────────────────────────────────────

const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];
const EASE_SPRING_TRANSITION: Transition = { type: 'spring', stiffness: 300, damping: 20 };

// ── Data ───────────────────────────────────────────────────────────────────────

const BUDGET_BARS = [
  { name: 'Venue', spent: '₹8.5L', total: '₹10L', pct: 85 },
  { name: 'Catering', spent: '₹5.2L', total: '₹8L', pct: 65 },
  { name: 'Decor', spent: '₹2.8L', total: '₹4L', pct: 70 },
  { name: 'Photography', spent: '₹1.8L', total: '₹2L', pct: 90 },
  { name: 'Shagun In', spent: '₹4.2L', total: 'received', pct: 100 },
];

const GIFT_ITEMS = [
  { name: 'Honeymoon Fund', pct: 78, contributors: 12, raised: '3.9L', goal: '5L' },
  { name: 'Home Appliances', pct: 45, contributors: 8, raised: '1.8L', goal: '4L' },
  { name: 'Gold Jewellery', pct: 92, contributors: 15, raised: '4.6L', goal: '5L' },
  { name: 'Furniture Set', pct: 33, contributors: 5, raised: '1L', goal: '3L' },
];

const CHIPS = ['Category-wise budgets', 'Payment milestones', 'Digital shagun'];

// ── Gift row ───────────────────────────────────────────────────────────────────

const GIFT_RADIUS = 12;
const GIFT_CIRCUMFERENCE = 2 * Math.PI * GIFT_RADIUS; // ~75.4

type GiftItem = (typeof GIFT_ITEMS)[number];

function GiftRow({
  gift,
  index,
  inView,
  reduced,
}: {
  gift: GiftItem;
  index: number;
  inView: boolean;
  reduced: boolean;
}) {
  const targetOffset = GIFT_CIRCUMFERENCE * (1 - gift.pct / 100);

  return (
    <div className="flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {/* Track circle */}
        <circle
          cx="16"
          cy="16"
          r={GIFT_RADIUS}
          fill="none"
          stroke="var(--color-border, #E5E7EB)"
          strokeWidth="2.5"
        />
        {reduced ? (
          /* Static at final offset — no framer-motion dependency */
          <circle
            cx="16"
            cy="16"
            r={GIFT_RADIUS}
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="2.5"
            strokeDasharray={GIFT_CIRCUMFERENCE}
            strokeDashoffset={targetOffset}
            strokeLinecap="round"
            transform="rotate(-90 16 16)"
          />
        ) : (
          <motion.circle
            cx="16"
            cy="16"
            r={GIFT_RADIUS}
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="2.5"
            strokeDasharray={GIFT_CIRCUMFERENCE}
            strokeLinecap="round"
            transform="rotate(-90 16 16)"
            initial={{ strokeDashoffset: GIFT_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: inView ? targetOffset : GIFT_CIRCUMFERENCE }}
            transition={{ duration: 1, delay: 0.5 + index * 0.15, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </svg>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-text truncate">{gift.name}</span>
          <span className="text-text-muted font-mono">{gift.pct}%</span>
        </div>
        <div className="text-[10px] text-text-subtle mt-0.5">
          {gift.contributors} contributors · ₹{gift.raised} of ₹{gift.goal}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BudgetBarChart({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Main budget card */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-border shadow-sm p-6 md:p-8 flex flex-col gap-5">
        {/* Eyebrow + dual-family split indicator */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-text-subtle font-mono">
            Budget Breakdown
          </span>
          {/* Dual-family split indicator */}
          {reduced ? (
            <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                  color: 'var(--brand-primary)',
                }}
              >
                Bride family: ₹12.4L
              </span>
              <span className="text-text-subtle">·</span>
              <span className="px-2 py-0.5 bg-[color-mix(in_srgb,#C8A96B_15%,transparent)] text-charcoal rounded text-[10px] font-medium">
                Groom family: ₹9.8L
              </span>
            </div>
          ) : (
            <motion.div
              className="flex items-center gap-2 mt-2 text-xs flex-wrap"
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
            >
              <span
                className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                  color: 'var(--brand-primary)',
                }}
              >
                Bride family: ₹12.4L
              </span>
              <span className="text-text-subtle">·</span>
              <span className="px-2 py-0.5 bg-[color-mix(in_srgb,#C8A96B_15%,transparent)] text-charcoal rounded text-[10px] font-medium">
                Groom family: ₹9.8L
              </span>
            </motion.div>
          )}
        </div>

        {/* Bar chart rows */}
        {BUDGET_BARS.map((bar, i) => (
          <div key={bar.name} className="flex flex-col gap-1.5">
            {/* Label + amount row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">{bar.name}</span>
              <span className="text-xs font-mono text-text-muted">
                {bar.total === 'received'
                  ? `${bar.spent} ${bar.total}`
                  : `${bar.spent} / ${bar.total}`}
              </span>
            </div>
            {/* Bar track */}
            <div className="h-2 rounded-full bg-border w-full overflow-hidden">
              {reduced ? (
                <div
                  className="h-full rounded-full"
                  style={{ width: `${bar.pct}%`, backgroundColor: 'var(--brand-primary)' }}
                />
              ) : (
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                  initial={{ width: '0%' }}
                  animate={inView ? { width: `${bar.pct}%` } : { width: '0%' }}
                  transition={{
                    duration: 1.0,
                    delay: 0.3 + i * 0.2,
                    ease: EASE_CINEMATIC,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gift Registry card */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-border shadow-sm p-4">
        <span className="text-[10px] uppercase tracking-widest text-text-subtle font-mono mb-3 block">
          Gift Registry
        </span>
        <div className="flex flex-col gap-3">
          {GIFT_ITEMS.map((gift, i) => (
            <GiftRow key={gift.name} gift={gift} index={i} inView={inView} reduced={reduced} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Budget & Shagun split section.
 *
 * Layout: text LEFT, animated bar chart + gift registry RIGHT (2-col on md+, stacked on mobile).
 *
 * Right column: [Budget Breakdown card (bar chart + dual-family split)] [Gift Registry card].
 *
 * Motion identity: horizontal enter (text from left, chart from right) +
 * bar-fill cinematic easing + arc fill for gift items. Distinct from other sections.
 *
 * Reduced-motion: static branch with all final values.
 */
export function SplitBudget() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({ threshold: 0.15 });

  // ── Chip variants ──────────────────────────────────────────────────────────
  const chipContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 1.0 } satisfies Transition,
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: EASE_SPRING_TRANSITION satisfies Transition,
    },
  };

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section data-nav-theme="light" className="relative z-10 bg-bg py-12 md:py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Text */}
          <div>
            <span className="text-text-subtle font-mono uppercase tracking-widest text-xs">
              Budget &amp; Shagun
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight text-text mt-3">
              Know where every rupee went.
            </h2>
            <p className="mt-4 text-text-muted text-base leading-relaxed">
              Set category budgets. Track vendor payments against milestones.
              <br />
              Collect shagun digitally with instant family-wise reconciliation.
              <br />
              Two families, one financial picture.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {CHIPS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    backgroundColor: 'var(--brand-lighter)',
                    color: 'var(--brand-primary)',
                    border: '1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          {/* Chart + Gift Registry */}
          <BudgetBarChart inView={true} reduced={true} />
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section data-nav-theme="light" className="bg-bg py-12 md:py-20 px-6">
      {/* sectionRef drives all entrance triggers */}
      <div
        ref={sectionRef}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start"
      >
        {/* ── Left: text ── */}
        <div>
          {/* Eyebrow slides from left */}
          <motion.span
            className="text-text-subtle font-mono uppercase tracking-widest text-xs"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          >
            Budget &amp; Shagun
          </motion.span>

          {/* Headline — TextReveal direction=left */}
          <TextReveal
            text="Know where every rupee went."
            as="h2"
            mode="word"
            stagger={0.12}
            direction="left"
            delay={0.2}
            triggerOnVisible={true}
            threshold={0.15}
            className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight text-text mt-3"
          />

          {/* Body fades in at delay 0.8s */}
          <motion.p
            className="mt-4 text-text-muted text-base leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.8, ease: EASE_CINEMATIC }}
          >
            Set category budgets. Track vendor payments against milestones.
            <br />
            Collect shagun digitally with instant family-wise reconciliation.
            <br />
            Two families, one financial picture.
          </motion.p>

          {/* Chips spring pop-in with stagger */}
          <motion.div
            className="flex flex-wrap gap-2 mt-5"
            variants={chipContainerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {CHIPS.map((label) => (
              <motion.span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--brand-lighter)',
                  color: 'var(--brand-primary)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                }}
                variants={chipVariants}
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: chart + gift registry slides in from right ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
        >
          <BudgetBarChart inView={inView} reduced={false} />
        </motion.div>
      </div>
    </section>
  );
}
