'use client';

import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';

// ── Constants ──────────────────────────────────────────────────────────────────

const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];
const EASE_SPRING_TRANSITION: Transition = { type: 'spring', stiffness: 300, damping: 20 };

// ── Data ───────────────────────────────────────────────────────────────────────

type ContactKind = 'fresh' | 'aging' | 'stale';

interface Vendor {
  name: string;
  status: 'locked' | 'pending';
  paid: string;
  contact: string;
  contactKind: ContactKind;
}

const VENDORS: readonly Vendor[] = [
  { name: 'Taj Catering', status: 'locked', paid: '₹3.2L/5L', contact: '2d ago', contactKind: 'fresh' },
  { name: 'Bloom Decor', status: 'locked', paid: '₹1.5L/4L', contact: '5d ago', contactKind: 'aging' },
  { name: 'Lens Studio', status: 'pending', paid: '₹0/2L', contact: '12d ago', contactKind: 'stale' },
  { name: 'DJ Beats', status: 'locked', paid: '₹0.8L/1.2L', contact: 'Yesterday', contactKind: 'fresh' },
  { name: 'Pandit Sharma', status: 'locked', paid: '₹0.2L/0.5L', contact: '3d ago', contactKind: 'fresh' },
  { name: 'Mehendi Artists', status: 'pending', paid: '₹0/0.8L', contact: '8d ago', contactKind: 'aging' },
] as const;

const CONTACT_COLORS: Record<ContactKind, string> = {
  fresh: 'text-emerald-400',
  aging: 'text-amber-400',
  stale: 'text-red-400',
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

// VendorRow for the reduced-motion (static) branch — plain <tr>
function VendorRowStatic({ vendor }: { vendor: Vendor }) {
  return (
    <tr className="border-b border-white/5 last:border-b-0">
      <td className="px-4 py-3 text-sm text-white/85">{vendor.name}</td>
      <td className="px-3 py-3 text-center">
        <StatusChip status={vendor.status} />
      </td>
      <td className="px-3 py-3 text-right text-xs font-mono text-white/70">{vendor.paid}</td>
      <td
        className={`px-4 py-3 text-right text-xs font-mono whitespace-nowrap ${CONTACT_COLORS[vendor.contactKind]}`}
      >
        {vendor.contact}
      </td>
    </tr>
  );
}

// VendorRow for the animated branch — motion.tr with staggered entrance
function VendorRowAnimated({ vendor, index, inView }: { vendor: Vendor; index: number; inView: boolean }) {
  const rowDelay = 0.2 + index * 0.12;

  return (
    <motion.tr
      className="border-b border-white/5 last:border-b-0"
      initial={{ opacity: 0, y: -12 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.45, delay: rowDelay, ease: EASE_CINEMATIC }}
    >
      <td className="px-4 py-3 text-sm text-white/85">{vendor.name}</td>
      <td className="px-3 py-3 text-center">
        <motion.div
          className="inline-flex"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: rowDelay + 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <StatusChip status={vendor.status} />
        </motion.div>
      </td>
      <td className="px-3 py-3 text-right text-xs font-mono text-white/70">{vendor.paid}</td>
      <motion.td
        className={`px-4 py-3 text-right text-xs font-mono whitespace-nowrap ${CONTACT_COLORS[vendor.contactKind]}`}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: rowDelay + 0.3, duration: 0.3, ease: EASE_CINEMATIC }}
      >
        {vendor.contact}
      </motion.td>
    </motion.tr>
  );
}

function VendorCard({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  return (
    <div className="bg-white/5 rounded-[var(--radius-lg)] border border-white/10 overflow-hidden">
      <OverdueAlertBar reduced={reduced} />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Vendor
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Status
            </th>
            <th className="px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Paid
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              Contact
            </th>
          </tr>
        </thead>
        <tbody>
          {VENDORS.map((vendor, index) =>
            reduced ? (
              <VendorRowStatic key={vendor.name} vendor={vendor} />
            ) : (
              <VendorRowAnimated key={vendor.name} vendor={vendor} index={index} inView={inView} />
            ),
          )}
        </tbody>
      </table>
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
 * Vendor table uses a semantic <table> for column alignment, uniform row heights,
 * and reliable text distribution across all viewport widths.
 *
 * Contact cell color-coded by contactKind: fresh=emerald, aging=amber, stale=red.
 *
 * Reduced-motion: static branch — no animations, plain <tr> rows.
 */
export function SplitVendor() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({ threshold: 0.1 });

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
      <section
        data-nav-theme="dark"
        className="relative z-10 bg-[#1A1A1A] text-white py-12 md:py-20 px-6"
      >
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
            <VendorCard inView={true} reduced={true} />
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
          <VendorCard inView={inView} reduced={false} />
        </motion.div>
      </div>
    </section>
  );
}
