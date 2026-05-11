'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';

// ── Constants ──────────────────────────────────────────────────────────────────

const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];
const EASE_SPRING_TRANSITION: Transition = { type: 'spring', stiffness: 300, damping: 20 };

// ── Data ───────────────────────────────────────────────────────────────────────

type VendorRisk = 'low' | 'medium' | 'high';
type LastContactKind = 'fresh' | 'aging' | 'stale';

interface Vendor {
  name: string;
  status: 'locked' | 'pending';
  payment: string;
  risk: VendorRisk;
  lastContact: string;
  lastContactKind: LastContactKind;
}

const VENDORS: readonly Vendor[] = [
  {
    name: 'Taj Catering',
    status: 'locked',
    payment: '₹3.2L/5L',
    risk: 'low',
    lastContact: '2 days ago',
    lastContactKind: 'fresh',
  },
  {
    name: 'Bloom Decor',
    status: 'locked',
    payment: '₹1.5L/4L',
    risk: 'medium',
    lastContact: '5 days ago',
    lastContactKind: 'aging',
  },
  {
    name: 'Lens Studio',
    status: 'pending',
    payment: '₹0/2L',
    risk: 'high',
    lastContact: '12 days ago',
    lastContactKind: 'stale',
  },
  {
    name: 'DJ Beats',
    status: 'locked',
    payment: '₹0.8L/1.2L',
    risk: 'low',
    lastContact: 'Yesterday',
    lastContactKind: 'fresh',
  },
  {
    name: 'Pandit Sharma',
    status: 'locked',
    payment: '₹0.2L/0.5L',
    risk: 'low',
    lastContact: '3 days ago',
    lastContactKind: 'fresh',
  },
  {
    name: 'Mehendi Artists',
    status: 'pending',
    payment: '₹0/0.8L',
    risk: 'medium',
    lastContact: '8 days ago',
    lastContactKind: 'stale',
  },
] as const;

const RISK_COLORS: Record<VendorRisk, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

const LAST_CONTACT_COLORS: Record<LastContactKind, string> = {
  fresh: '#22C55E',
  aging: '#F59E0B',
  stale: '#EF4444',
};

const CHIPS = ['Deliverable tracking', 'Risk scoring', 'Payment automation'];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: 'locked' | 'pending' }) {
  if (status === 'locked') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        ● Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
      ◐ Pending
    </span>
  );
}

function RiskDot({
  risk,
  inView,
  reduced,
}: {
  risk: VendorRisk;
  inView: boolean;
  reduced: boolean;
}) {
  const color = RISK_COLORS[risk];

  if (reduced) {
    return <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />;
  }

  // Continuous pulse parameters per severity
  const pulseConfig: Record<VendorRisk, { animate: Record<string, number[]>; duration: number }> = {
    low: {
      animate: { opacity: [1, 0.5, 1] },
      duration: 3,
    },
    medium: {
      animate: { opacity: [1, 0.4, 1] },
      duration: 2,
    },
    high: {
      animate: { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] },
      duration: 1.5,
    },
  };

  const { animate: pulseAnimate, duration } = pulseConfig[risk];

  return (
    <motion.span
      className="w-2 h-2 rounded-full block"
      style={{ backgroundColor: color }}
      animate={inView ? pulseAnimate : {}}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function OverdueAlertBar({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-t-[var(--radius-lg)] border-b border-red-500/20 text-xs text-red-400">
      <span className="relative w-1.5 h-1.5 shrink-0">
        <span className="absolute inset-0 rounded-full" style={{ backgroundColor: '#EF4444' }} />
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: '#EF4444' }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
      </span>
      <span>2 vendors require follow-up · 1 payment overdue</span>
    </div>
  );
}

function VendorTable({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  const chipContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2, delayChildren: 0.5 } satisfies Transition,
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: 0.2 + i * 0.12,
        ease: EASE_CINEMATIC,
      } satisfies Transition,
    }),
  };

  return (
    <div className="bg-white/5 rounded-[var(--radius-lg)] border border-white/10 overflow-x-auto">
      {/* Overdue alert bar — rounded top corners on the wrapper */}
      <OverdueAlertBar reduced={reduced} />

      {/* Header — hidden on mobile, visible on md+ */}
      <div className="hidden md:grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,0.8fr)_minmax(90px,1fr)_56px_minmax(110px,1fr)] gap-4 px-4 py-3 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Vendor</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Status</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Payment</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono text-center">
          Risk
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
          <span className="hidden md:inline">Last Contact</span>
          <span className="md:hidden">Last</span>
        </span>
      </div>

      {/* Rows */}
      {reduced ? (
        <div>
          {VENDORS.map((v) => (
            <div
              key={v.name}
              className="border-b border-white/5 last:border-b-0"
            >
              {/* Desktop: full grid row */}
              <div className="hidden md:grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,0.8fr)_minmax(90px,1fr)_56px_minmax(110px,1fr)] gap-4 items-center px-4 py-3 text-sm text-white/80">
                <span className="min-w-0 truncate">{v.name}</span>
                <StatusChip status={v.status} />
                <span className="font-mono text-xs whitespace-nowrap">{v.payment}</span>
                <div className="flex justify-center">
                  <RiskDot risk={v.risk} inView={true} reduced={true} />
                </div>
                <span
                  className="text-xs font-mono whitespace-nowrap"
                  style={{ color: LAST_CONTACT_COLORS[v.lastContactKind] }}
                >
                  {v.lastContact}
                </span>
              </div>
              {/* Mobile: compact card layout */}
              <div className="md:hidden flex items-center justify-between gap-3 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center gap-2 min-w-0">
                  <RiskDot risk={v.risk} inView={true} reduced={true} />
                  <span className="truncate">{v.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusChip status={v.status} />
                  <span className="font-mono text-xs">{v.payment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={chipContainerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {VENDORS.map((v, i) => {
            const rowDelay = 0.2 + i * 0.12;
            return (
              <motion.div
                key={v.name}
                className="border-b border-white/5 last:border-b-0"
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                {/* Desktop: full grid row */}
                <div className="hidden md:grid grid-cols-[minmax(120px,1.2fr)_minmax(90px,0.8fr)_minmax(90px,1fr)_56px_minmax(110px,1fr)] gap-4 items-center px-4 py-3 text-sm text-white/80">
                  <span className="min-w-0 truncate">{v.name}</span>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{
                      delay: rowDelay + 0.2,
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <StatusChip status={v.status} />
                  </motion.div>
                  <span className="font-mono text-xs whitespace-nowrap">{v.payment}</span>
                  <div className="flex justify-center">
                    <RiskDot risk={v.risk} inView={inView} reduced={false} />
                  </div>
                  <motion.span
                    className="text-xs font-mono whitespace-nowrap"
                    style={{ color: LAST_CONTACT_COLORS[v.lastContactKind] }}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: rowDelay + 0.3, duration: 0.3, ease: EASE_CINEMATIC }}
                  >
                    {v.lastContact}
                  </motion.span>
                </div>
                {/* Mobile: compact card layout */}
                <div className="md:hidden flex items-center justify-between gap-3 px-4 py-3 text-sm text-white/80">
                  <div className="flex items-center gap-2 min-w-0">
                    <RiskDot risk={v.risk} inView={inView} reduced={false} />
                    <span className="truncate">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{
                        delay: rowDelay + 0.2,
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <StatusChip status={v.status} />
                    </motion.div>
                    <span className="font-mono text-xs">{v.payment}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Vendor pipeline split section.
 *
 * Dark background (#1A1A1A). Layout is FLIPPED on desktop: table LEFT, text RIGHT.
 * DOM order is text-first (mobile reading order), then md:order classes flip for desktop.
 *
 * Additions:
 * - Overdue alert bar at top of vendor card (pulsing red dot, static in reduced-motion).
 * - "Last Contact" 5th column with urgency colour coding (fresh/aging/stale).
 * - Risk dots pulse continuously (low: slow opacity, medium: medium opacity, high: fast scale+opacity).
 *
 * Reduced-motion: static branch — no pulses, no animations.
 */
export function SplitVendor() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({
    threshold: 0.1,
    triggerOnce: false,
  });

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
      <section data-nav-theme="dark" className="relative z-10 bg-[#1A1A1A] text-white py-12 md:py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Text — first in DOM (mobile), md:order-2 (desktop right) */}
          <div className="md:order-2">
            <span className="text-[#C8A96B]/60 font-mono uppercase tracking-widest text-xs">
              Vendor Management
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight text-white mt-3">
              Six vendors. One dashboard.
            </h2>
            <p className="mt-4 text-white/60 text-base leading-relaxed">
              Track deliverables, flag risks, manage payment milestones. See who&apos;s
              <br />
              confirmed, who&apos;s ghosting, and who needs a nudge.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {CHIPS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/80 border border-white/20"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Table — second in DOM (mobile), md:order-1 (desktop left) */}
          <div className="md:order-1">
            <VendorTable inView={true} reduced={true} />
          </div>
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section data-nav-theme="dark" className="bg-[#1A1A1A] text-white py-12 md:py-20 px-6">
      <div
        ref={sectionRef}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center"
      >
        {/* ── Text (DOM first, desktop right via md:order-2) ── */}
        <div className="md:order-2">
          {/* Eyebrow slides from RIGHT — mirrored direction vs split-budget */}
          <motion.span
            className="text-[#C8A96B]/60 font-mono uppercase tracking-widest text-xs"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          >
            Vendor Management
          </motion.span>

          {/* Headline — direction=right (words slide from right) */}
          <TextReveal
            text="Six vendors. One dashboard."
            as="h2"
            mode="word"
            stagger={0.1}
            direction="right"
            delay={0.2}
            triggerOnVisible={true}
            threshold={0.1}
            className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight text-white mt-3"
          />

          {/* Body */}
          <motion.p
            className="mt-4 text-white/60 text-base leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.8, ease: EASE_CINEMATIC }}
          >
            Track deliverables, flag risks, manage payment milestones. See who&apos;s
            <br />
            confirmed, who&apos;s ghosting, and who needs a nudge.
          </motion.p>

          {/* Chips — dark variant */}
          <motion.div
            className="flex flex-wrap gap-2 mt-5"
            variants={chipContainerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {CHIPS.map((label) => (
              <motion.span
                key={label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/80 border border-white/20"
                variants={chipVariants}
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* ── Table (DOM second, desktop left via md:order-1) ── */}
        <motion.div
          className="md:order-1"
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
        >
          <VendorTable inView={inView} reduced={false} />
        </motion.div>
      </div>
    </section>
  );
}
