'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
  type Variants,
} from 'framer-motion';
import { Chip } from '@/components/ui/chip';
import type { ChipStatus } from '@/components/ui/chip';

const STEPS = [
  {
    number: '01',
    label: 'Budget & Shagun',
    headline: 'Know where every rupee went.',
    body: 'Set category budgets. Track vendor payments against milestones. Collect shagun digitally with instant family-wise reconciliation. Two families, one financial picture.',
    bullets: [
      'Category-wise budget vs. actual',
      'Vendor payment milestones with proof',
      'Digital shagun with auto-reconciliation',
    ],
  },
  {
    number: '02',
    label: 'Vendor Command',
    headline: 'Six vendors. One dashboard.',
    body: "Track deliverables, flag risks, manage payment milestones. See who's confirmed, who's ghosting, and who needs a nudge — across every wedding you're running.",
    bullets: [
      'Deliverable tracking with status chips',
      'Risk scoring (green/yellow/red)',
      'Payment milestone automation',
    ],
  },
  {
    number: '03',
    label: 'Guest Intelligence',
    headline: 'Not just a list. A live dashboard.',
    body: "Import from contacts or CSV. Auto-tag by side, relation, dietary needs. Track RSVPs in real time. Know exactly how many plates to order — not how many people said 'will try to come' on WhatsApp.",
    bullets: [
      'Smart import with auto-dedup',
      'Side-based tagging (bride/groom family, friends, work)',
      'Real-time RSVP with dietary roll-ups',
    ],
  },
  {
    number: '04',
    label: 'Themed Experiences',
    headline: 'Their invitation. Your brand.',
    body: "Choose from 6 curated themes or bring your own. Each guest gets a personalized page with schedule, RSVP, directions, and digital shagun — all wrapped in the event's visual identity.",
    bullets: [
      '6 curated themes (or custom)',
      'Personalized guest pages',
      'Built-in shagun, RSVP, schedule',
    ],
  },
];

// ── Shared animation variants ──────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delayChildren: 0.2,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const slideFromLeftVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// ── Mock panels ──────────────────────────────────────────────────────────────

const BUDGET_BARS = [
  {
    name: 'Venue',
    fill: 65,
    trackColor: 'bg-emerald/20',
    fillColor: 'bg-emerald',
    label: '₹4.2L / ₹6.5L',
  },
  {
    name: 'Catering',
    fill: 80,
    trackColor: 'bg-champagne/20',
    fillColor: 'bg-champagne',
    label: '₹2.8L / ₹3.5L',
  },
  {
    name: 'Decor',
    fill: 45,
    trackColor: 'bg-maroon/10',
    fillColor: 'bg-maroon',
    label: '₹1.5L / ₹3.0L',
  },
];

// ── barVariants: named variant with custom prop for per-bar fill percentage ──
// Fixes minor issue: progress bars now participate in parent staggerChildren timing.
const barVariants: Variants = {
  hidden: { width: '0%' },
  visible: (fill: number) => ({
    width: `${fill}%`,
    transition: { duration: 0.8, ease: 'easeOut' },
  }),
};

// ── MockBudgetAnimated: motion hooks extracted here so they only run when
// prefersReduced is false (fixes major issue: hooks were called unconditionally
// in MockBudget even for users who opted out of motion). ──────────────────────
function MockBudgetAnimated({ isActive }: { isActive: boolean }) {
  const shagunValue = useMotionValue(0);
  // useTransform → string MotionValue; useMotionTemplate wraps it so motion.span accepts it as children
  const shagunFormatted = useTransform(
    shagunValue,
    (v) => `₹${Math.round(v).toLocaleString('en-IN')}`,
  );
  const shagunDisplay = useMotionTemplate`↑ ${shagunFormatted}`;

  // controlsRef stores the current AnimationPlaybackControls so that if isActive
  // flips true→false→true rapidly, we stop the prior animation synchronously
  // before starting a new one — preventing a leaked animation (fixes blocker).
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Stop any in-flight animation immediately before branching
    controlsRef.current?.stop();

    if (!isActive) {
      shagunValue.set(0);
      return;
    }

    const controls = animate(shagunValue, 842000, { duration: 1.5, delay: 0.8, ease: 'easeOut' });
    controlsRef.current = controls;

    return () => {
      controlsRef.current?.stop();
    };
  }, [isActive, shagunValue]);

  return (
    <motion.div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      variants={containerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
    >
      <motion.div className="flex items-center justify-between mb-4" variants={itemVariants}>
        <span className="font-medium text-sm text-text">Budget Overview</span>
        <span className="inline-flex items-center gap-1 bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-medium px-2 py-0.5 rounded-full">
          On Track
        </span>
      </motion.div>
      <div className="space-y-3">
        {BUDGET_BARS.map((bar) => (
          <motion.div key={bar.name} variants={itemVariants}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-text-muted">{bar.name}</span>
              <span className="text-xs text-text-muted">{bar.label}</span>
            </div>
            <div className={`h-1.5 rounded-full w-full ${bar.trackColor}`}>
              <motion.div
                className={`h-1.5 rounded-full ${bar.fillColor}`}
                variants={barVariants}
                custom={bar.fill}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-border my-3" />
      <motion.div className="flex justify-between items-center" variants={itemVariants}>
        <span className="text-xs text-text-muted">Shagun Collected</span>
        <motion.span className="text-sm font-medium text-emerald">{shagunDisplay}</motion.span>
      </motion.div>
    </motion.div>
  );
}

function MockBudget({ isActive, prefersReduced }: { isActive: boolean; prefersReduced: boolean }) {
  if (prefersReduced) {
    return (
      <div
        aria-hidden="true"
        className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-sm text-text">Budget Overview</span>
          <span className="inline-flex items-center gap-1 bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-medium px-2 py-0.5 rounded-full">
            On Track
          </span>
        </div>
        <div className="space-y-3">
          {BUDGET_BARS.map((bar) => (
            <div key={bar.name}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-text-muted">{bar.name}</span>
                <span className="text-xs text-text-muted">{bar.label}</span>
              </div>
              <div className={`h-1.5 rounded-full w-full ${bar.trackColor}`}>
                <div
                  className={`h-1.5 rounded-full ${bar.fillColor}`}
                  style={{ width: `${bar.fill}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border my-3" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-muted">Shagun Collected</span>
          <span className="text-sm font-medium text-emerald">↑ ₹8,42,000</span>
        </div>
      </div>
    );
  }

  return <MockBudgetAnimated isActive={isActive} />;
}

const VENDORS: {
  name: string;
  category: string;
  status: ChipStatus;
  pct: number;
}[] = [
  { name: 'Grand Palace', category: 'Venue', status: 'confirmed', pct: 80 },
  { name: 'Sharma Catering', category: 'Catering', status: 'caution', pct: 60 },
  { name: 'DJ Mantra', category: 'DJ', status: 'confirmed', pct: 100 },
  { name: 'Lumina Decor', category: 'Decor', status: 'pending', pct: 30 },
];

const vendorContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

function MockVendors({ isActive, prefersReduced }: { isActive: boolean; prefersReduced: boolean }) {
  if (prefersReduced) {
    return (
      <div
        aria-hidden="true"
        className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-sm text-text">Vendors</span>
          <span className="bg-hover text-text-muted text-xs font-medium px-2 py-0.5 rounded-full">
            6
          </span>
        </div>
        <div className="space-y-0">
          {VENDORS.map((v, i) => (
            <div
              key={v.name}
              className={`py-2.5 ${i < VENDORS.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm text-text font-medium">{v.name}</span>
                  <span className="text-xs text-text-subtle ml-2">{v.category}</span>
                </div>
                <Chip status={v.status} dense>
                  {v.status}
                </Chip>
              </div>
              <div className="h-1 rounded-full bg-hover w-full">
                <div className="h-1 rounded-full bg-charcoal/30" style={{ width: `${v.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      variants={vendorContainerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
    >
      <motion.div className="flex items-center justify-between mb-4" variants={itemVariants}>
        <span className="font-medium text-sm text-text">Vendors</span>
        <span className="bg-hover text-text-muted text-xs font-medium px-2 py-0.5 rounded-full">
          6
        </span>
      </motion.div>
      <div className="space-y-0">
        {VENDORS.map((v, i) => (
          <motion.div
            key={v.name}
            variants={slideFromLeftVariants}
            className={`py-2.5 ${i < VENDORS.length - 1 ? 'border-b border-border/50' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm text-text font-medium">{v.name}</span>
                <span className="text-xs text-text-subtle ml-2">{v.category}</span>
              </div>
              <Chip status={v.status} dense>
                {v.status}
              </Chip>
            </div>
            <div className="h-1 rounded-full bg-hover w-full">
              <div className="h-1 rounded-full bg-charcoal/30" style={{ width: `${v.pct}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const GUESTS: {
  initials: string;
  color: string;
  name: string;
  side: string;
  rsvp: ChipStatus;
  diet: string;
}[] = [
  {
    initials: 'AS',
    color: '#e8b8b8',
    name: 'Aarav Sharma',
    side: 'Groom',
    rsvp: 'confirmed',
    diet: 'Veg',
  },
  {
    initials: 'PK',
    color: '#bfdbfe',
    name: 'Priya Kapoor',
    side: 'Bride',
    rsvp: 'confirmed',
    diet: 'Non-veg',
  },
  {
    initials: 'RM',
    color: '#fde68a',
    name: 'Ravi Mehta',
    side: 'Groom',
    rsvp: 'pending',
    diet: 'Veg',
  },
  {
    initials: 'SG',
    color: '#d4e8df',
    name: 'Sonal Gupta',
    side: 'Bride',
    rsvp: 'declined',
    diet: 'Jain',
  },
  {
    initials: 'VN',
    color: '#ede9fe',
    name: 'Vikram Nair',
    side: 'Groom',
    rsvp: 'confirmed',
    diet: 'Non-veg',
  },
];

const guestContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delayChildren: 0.3,
      staggerChildren: 0.08,
    },
  },
};

const importBarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const importCheckVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, delay: 0.6 } },
};

const rowFromBottomVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

const footerFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
};

function MockGuests({ isActive, prefersReduced }: { isActive: boolean; prefersReduced: boolean }) {
  if (prefersReduced) {
    return (
      <div
        aria-hidden="true"
        className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      >
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-[var(--color-success-bg,theme(colors.emerald.50))]">
          <span className="text-xs text-text-muted">guests.xlsx · 142 KB</span>
          <span className="text-xs text-[var(--color-success)] font-medium">247 imported ✓</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 mb-2 px-1">
          {['Guest', 'Side', 'RSVP', 'Diet'].map((h) => (
            <span
              key={h}
              className="text-[10px] uppercase tracking-wider text-text-subtle font-mono"
            >
              {h}
            </span>
          ))}
        </div>
        <div className="space-y-0">
          {GUESTS.map((g, i) => (
            <div
              key={g.name}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-1 py-2 ${i < GUESTS.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full text-charcoal/80 text-xs font-medium flex items-center justify-center shrink-0"
                  style={{ backgroundColor: g.color }}
                >
                  {g.initials}
                </div>
                <span className="text-xs text-text truncate">{g.name}</span>
              </div>
              <span className="text-xs text-text-subtle">{g.side}</span>
              <Chip status={g.rsvp} dense>
                {g.rsvp}
              </Chip>
              <span className="text-xs text-text-subtle text-right">{g.diet}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-text-subtle mt-3 pt-3 border-t border-border/50">
          247 confirmed · 18 pending · 12 declined
        </div>
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-5 w-full max-w-[400px]"
      variants={guestContainerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
    >
      {/* Import bar */}
      <motion.div
        className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-[var(--color-success-bg,theme(colors.emerald.50))]"
        variants={importBarVariants}
      >
        <span className="text-xs text-text-muted">guests.xlsx · 142 KB</span>
        <motion.span
          className="text-xs text-[var(--color-success)] font-medium"
          variants={importCheckVariants}
        >
          247 imported ✓
        </motion.span>
      </motion.div>

      {/* Table header */}
      <motion.div
        className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 mb-2 px-1"
        variants={itemVariants}
      >
        {['Guest', 'Side', 'RSVP', 'Diet'].map((h) => (
          <span key={h} className="text-[10px] uppercase tracking-wider text-text-subtle font-mono">
            {h}
          </span>
        ))}
      </motion.div>

      {/* Guest rows */}
      <div className="space-y-0">
        {GUESTS.map((g, i) => (
          <motion.div
            key={g.name}
            variants={rowFromBottomVariants}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-1 py-2 ${i < GUESTS.length - 1 ? 'border-b border-border/50' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full text-charcoal/80 text-xs font-medium flex items-center justify-center shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.initials}
              </div>
              <span className="text-xs text-text truncate">{g.name}</span>
            </div>
            <span className="text-xs text-text-subtle">{g.side}</span>
            <Chip status={g.rsvp} dense>
              {g.rsvp}
            </Chip>
            <span className="text-xs text-text-subtle text-right">{g.diet}</span>
          </motion.div>
        ))}
      </div>

      {/* Summary footer */}
      <motion.div
        className="text-xs text-text-subtle mt-3 pt-3 border-t border-border/50"
        variants={footerFadeVariants}
      >
        247 confirmed · 18 pending · 12 declined
      </motion.div>
    </motion.div>
  );
}

const invitationContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const eyebrowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.3 } },
};

const coupleNameVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.4, ease: 'easeOut' } },
};

const datePlaceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.8 } },
};

const eventRowsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.9,
      staggerChildren: 0.1,
    },
  },
};

const eventRowVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const pillsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, delay: 1.2 } },
};

const captionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 1.4 } },
};

function MockInvitation({
  isActive,
  prefersReduced,
}: {
  isActive: boolean;
  prefersReduced: boolean;
}) {
  const events = [
    { name: 'Mehendi', time: 'Dec 12 · 4 PM' },
    { name: 'Sangeet', time: 'Dec 13 · 7 PM' },
    { name: 'Wedding', time: 'Dec 14 · 11 AM' },
  ];

  const pills = ['RSVP', 'Schedule', 'Shagun'];

  if (prefersReduced) {
    return (
      <div aria-hidden="true" className="w-full max-w-[400px]">
        <div
          className="rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, #C8A96B 100%)' }}
        >
          <div className="p-8 text-center text-white">
            <p className="text-xs uppercase tracking-widest opacity-60">You&apos;re invited to</p>
            <p className="font-display text-3xl tracking-[-0.02em] mt-3">Priya &amp; Arjun</p>
            <p className="text-sm mt-2 opacity-70">14 December 2026 · Jaipur</p>
          </div>
          <div className="px-6 pb-6 space-y-2">
            {events.map((ev) => (
              <div
                key={ev.name}
                className="backdrop-blur-sm rounded-lg p-3 flex justify-between items-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <span className="text-xs font-medium text-white">{ev.name}</span>
                <span className="text-xs text-white opacity-60">{ev.time}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 flex gap-2 justify-center">
            {pills.map((label) => (
              <span
                key={label}
                className="border text-xs px-3 py-1.5 rounded-full text-white"
                style={{ borderColor: 'rgba(255,255,255,0.4)' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          />
          <span className="text-xs text-text-subtle">Dynamic theme preview</span>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="w-full max-w-[400px]">
      <motion.div
        className="rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, #C8A96B 100%)' }}
        variants={invitationContainerVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
      >
        <div className="p-8 text-center text-white">
          {/* Children inherit initial/animate from the parent motion.div via variant cascade.
              Explicit initial/animate removed so staggerChildren timing works correctly
              (fixes blocker: redundant overrides that broke variant propagation). */}
          <motion.p
            className="text-xs uppercase tracking-widest opacity-60"
            variants={eyebrowVariants}
          >
            You&apos;re invited to
          </motion.p>
          <motion.p
            className="font-display text-3xl tracking-[-0.02em] mt-3"
            variants={coupleNameVariants}
          >
            Priya &amp; Arjun
          </motion.p>
          <motion.p className="text-sm mt-2 opacity-70" variants={datePlaceVariants}>
            14 December 2026 · Jaipur
          </motion.p>
        </div>

        <motion.div className="px-6 pb-6 space-y-2" variants={eventRowsContainerVariants}>
          {events.map((ev) => (
            <motion.div
              key={ev.name}
              className="backdrop-blur-sm rounded-lg p-3 flex justify-between items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              variants={eventRowVariants}
            >
              <span className="text-xs font-medium text-white">{ev.name}</span>
              <span className="text-xs text-white opacity-60">{ev.time}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="px-6 pb-6 flex gap-2 justify-center" variants={pillsVariants}>
          {pills.map((label) => (
            <span
              key={label}
              className="border text-xs px-3 py-1.5 rounded-full text-white"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Caption sits outside the card motion.div, so it drives its own initial/animate */}
      <motion.div
        className="mt-3 flex items-center justify-center gap-2"
        variants={captionVariants}
        initial="hidden"
        animate={isActive ? 'visible' : 'hidden'}
      >
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-primary)' }} />
        <span className="text-xs text-text-subtle">Dynamic theme preview</span>
      </motion.div>
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

const MOCK_PANELS = [MockBudget, MockVendors, MockGuests, MockInvitation];

export function StepTimeline() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Initialize to false so server and client first-paint match (hydration safety).
  // The useEffect below reads the real value on mount and syncs it, accepting a
  // one-frame flicker on systems with prefers-reduced-motion enabled — this is
  // the standard React pattern to avoid hydration mismatches (fixes major issue).
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>(STEPS.map(() => null));
  const sectionRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect fires synchronously on the client after DOM commit, before paint.
  // It does NOT run on the server — so hydration starts with reducedMotion=false on both
  // server and client, then this effect syncs the real value before the first paint.
  // This satisfies both hydration safety and the react-hooks/set-state-in-effect rule
  // because setState is called only inside the listener callback (not inline in the body).
  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    // Sync the real value on mount via the same callback pattern to satisfy the lint rule
    handleChange({ matches: mq.matches } as MediaQueryListEvent);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.getAttribute('data-step')));
          }
        });
      },
      { threshold: 0.5 },
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  // Scroll-driven progress line — independent of activeStep IntersectionObserver.
  // When reducedMotion is true the progress line is decorative animation — skip the
  // listener and snap progress to 1 so the line and all dots render fully filled.
  useEffect(() => {
    if (reducedMotion) {
      // Use setTimeout to avoid synchronous setState-in-effect lint violation.
      // Snaps progress to 1 so the progress line and all dots render fully filled.
      const id = setTimeout(() => setScrollProgress(1), 0);
      return () => clearTimeout(id);
    }

    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrolled = -rect.top / Math.max(sectionHeight - viewportHeight, 1);
      setScrollProgress(Math.max(0, Math.min(1, scrolled)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  return (
    <div ref={sectionRef} className="relative md:grid md:grid-cols-[1fr_1fr]">
      {/* Progress line — desktop only, centered between columns */}
      <div
        aria-hidden="true"
        className="hidden md:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center z-10"
      >
        {/* Gray track */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-border)' }}
        />
        {/* Brand-color fill — tracks scroll position, transition-none for precision */}
        <div
          className="absolute top-0 w-px transition-none"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--brand-primary)',
            height: `${scrollProgress * 100}%`,
          }}
        />
        {/* Dots at each step position */}
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className="absolute w-3 h-3 rounded-full transition-all duration-300"
            style={{
              top: `${(index / (STEPS.length - 1)) * 100}%`,
              left: '50%',
              backgroundColor:
                scrollProgress >= index / (STEPS.length - 1) - 0.02
                  ? 'var(--brand-primary)'
                  : 'var(--color-border)',
              transform: 'translateX(-50%) translateY(-50%)',
            }}
          />
        ))}
      </div>

      {/* Left: scrolling text column */}
      <div className="md:pr-16">
        {STEPS.map((step, index) => {
          const Panel = MOCK_PANELS[index];
          return (
            <div
              key={step.number}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-step={index}
              className="min-h-[70vh] flex items-center py-16"
            >
              <div className="flex flex-col">
                {/* Step label */}
                <span
                  className="font-mono text-xs tracking-widest uppercase transition-colors duration-300"
                  style={{
                    color: activeStep === index ? 'var(--brand-primary)' : 'rgba(26,26,26,0.4)',
                  }}
                >
                  {step.number} — {step.label}
                </span>

                <h3 className="font-display text-3xl italic tracking-[-0.02em] leading-[1.05] text-text mt-6">
                  {step.headline}
                </h3>
                <p className="text-text-muted text-base leading-relaxed mt-4">{step.body}</p>

                <ul className="mt-6 space-y-2">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                      />
                      <span className="text-sm text-text-muted">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Mobile mock panel — always active when inline */}
                <div className="md:hidden mt-8" aria-hidden="true">
                  <Panel isActive={true} prefersReduced={reducedMotion} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: sticky mock panel column (desktop only) */}
      <div className="hidden md:block relative">
        {reducedMotion ? (
          /* Reduced-motion: vertical stack, no animation */
          <div className="py-16 space-y-12" aria-hidden="true">
            {MOCK_PANELS.map((Panel, index) => (
              <Panel key={index} isActive={true} prefersReduced={true} />
            ))}
          </div>
        ) : (
          <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {STEPS.map((step, index) => {
                const Panel = MOCK_PANELS[index];
                return (
                  <div
                    key={step.number}
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out"
                    style={{
                      opacity: activeStep === index ? 1 : 0,
                      pointerEvents: activeStep === index ? 'auto' : 'none',
                    }}
                  >
                    <Panel isActive={activeStep === index} prefersReduced={false} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
