'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { useCountUp } from './motion/use-count-up';

// ── Types ─────────────────────────────────────────────────────────────────────

// Typed cubic-bezier tuples — framer-motion's Easing type requires a 4-tuple,
// but TypeScript widens `[0.16, 1, 0.3, 1]` to `number[]` without `as const`.
const EASE_SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];
const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];

// SVG circumference for the budget ring (radius 24)
const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
// 69% spend = ₹15.2L / ₹22L
const RING_FILL_RATIO = 15.2 / 22;
const RING_DASH_OFFSET = RING_CIRCUMFERENCE * (1 - RING_FILL_RATIO);

// ── Activity feed data ────────────────────────────────────────────────────────

type ActivityKind = 'success' | 'warning' | 'danger' | 'info';

interface ActivityEntry {
  id: string;
  label: string;
  time: string;
  kind: ActivityKind;
}

const INITIAL_ACTIVITIES: ActivityEntry[] = [
  { id: '1', label: "Sharma family RSVP'd +4", time: '2m', kind: 'success' },
  { id: '2', label: 'Venue payment ₹2L pending', time: '15m', kind: 'warning' },
  { id: '3', label: 'Lens Studio: no response 3d', time: '1h', kind: 'danger' },
  { id: '4', label: 'Mehendi decor confirmed', time: '3h', kind: 'success' },
  { id: '5', label: 'New shagun: ₹11,000', time: '5h', kind: 'info' },
];

const ACTIVITY_POOL: Array<{ label: string; kind: ActivityKind; time: string }> = [
  { label: 'Catering tasting scheduled', kind: 'info', time: 'just now' },
  { label: 'Gupta family RSVP +3', kind: 'success', time: 'just now' },
  { label: 'Decor invoice approved', kind: 'success', time: 'just now' },
  { label: 'Pandit ji: confirmed', kind: 'success', time: 'just now' },
  { label: 'Photographer: needs deposit', kind: 'warning', time: 'just now' },
  { label: 'New shagun: ₹21,000', kind: 'info', time: 'just now' },
  { label: 'Verma family RSVP +2', kind: 'success', time: 'just now' },
  { label: 'DJ playlist shared', kind: 'info', time: 'just now' },
];

const ACTIVITY_KIND_DOT: Record<ActivityKind, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated SVG ring showing budget utilisation. */
function BudgetRing({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  const finalOffset = RING_DASH_OFFSET;

  if (reduced) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" className="mt-3" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="4"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={finalOffset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
    );
  }

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="mt-3" aria-hidden="true">
      {/* Track */}
      <circle
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="4"
      />
      {/* Arc */}
      <motion.circle
        cx="32"
        cy="32"
        r={RING_RADIUS}
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="4"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={inView ? finalOffset : RING_CIRCUMFERENCE}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
        transition={{ duration: 1.2, ease: EASE_CINEMATIC, delay: 0.8 }}
      />
    </svg>
  );
}

/** Guest segmented bar. */
function GuestBar({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  const segments: Array<{ pct: number; color: string; label: string }> = [
    { pct: 68, color: 'var(--brand-primary)', label: 'Confirmed' },
    { pct: 18, color: 'var(--color-champagne)', label: 'Pending' },
    { pct: 14, color: 'var(--color-border-strong)', label: 'Declined' },
  ];

  return (
    <div
      className="flex gap-0.5 mt-3 h-2 rounded-full overflow-hidden bg-border"
      aria-label="Guest RSVP breakdown"
    >
      {segments.map((seg, i) =>
        reduced ? (
          <div
            key={seg.label}
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            aria-label={`${seg.label}: ${seg.pct}%`}
          />
        ) : (
          <motion.div
            key={seg.label}
            style={{ backgroundColor: seg.color }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${seg.pct}%` } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: EASE_SPRING }}
            aria-label={`${seg.label}: ${seg.pct}%`}
          />
        ),
      )}
    </div>
  );
}

/** 12-cell vendor status grid. */
function VendorDots() {
  // 8 green, 2 yellow, 2 red
  const dots: Array<{ color: string; label: string }> = [
    ...Array(8).fill({ color: 'var(--color-success)', label: 'locked' }),
    ...Array(2).fill({ color: 'var(--color-caution)', label: 'pending' }),
    ...Array(2).fill({ color: 'var(--color-danger)', label: 'at-risk' }),
  ];

  return (
    <div className="flex flex-wrap gap-1 mt-3" aria-label="Vendor status">
      {dots.map((dot, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full block"
          style={{ backgroundColor: dot.color }}
          aria-label={dot.label}
        />
      ))}
    </div>
  );
}

/** Pulsing status dot — radiates a ring to simulate live activity. */
function PulsingDot({ color, reduced }: { color: string; reduced: boolean }) {
  return (
    <span
      className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {!reduced && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </span>
  );
}

/** A single metric card inside the dashboard. */
function MetricCard({
  eyebrow,
  value,
  sub,
  extra,
  inView,
  reduced,
  staticValue = false,
  pulseColor,
  pulsing = false,
}: {
  eyebrow: string;
  value: string;
  sub: string;
  extra: 'ring' | 'bar' | 'dots';
  inView: boolean;
  reduced: boolean;
  /** When true, the numeric value is rendered as static text (no count-up animation).
   *  Use for formatted Rupee strings like "₹15.2L" that the parser cannot animate correctly. */
  staticValue?: boolean;
  /** If set, a pulsing dot is shown in the top-right of the card. */
  pulseColor?: string;
  /** Flash the display value to indicate a live update. */
  pulsing?: boolean;
}) {
  // Hook is always called (Rules of Hooks). `displayValue` is only used when staticValue=false.
  const { displayValue, ref } = useCountUp<HTMLSpanElement>(value, {
    duration: 1400,
    startOnVisible: true,
    threshold: 0.3,
  });

  const numericDisplay = reduced || staticValue ? value : displayValue;

  return (
    <div className="relative bg-white rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] p-4">
      {pulseColor && <PulsingDot color={pulseColor} reduced={reduced} />}
      <p
        className="uppercase font-mono text-[var(--color-text-subtle)]"
        style={{ fontSize: '10px', letterSpacing: '0.1em' }}
      >
        {eyebrow}
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        {pulsing && !reduced ? (
          <motion.span
            ref={ref}
            className="font-display text-3xl tracking-[-0.02em] leading-none text-[var(--color-text)]"
            animate={{ opacity: pulsing ? [1, 0.5, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {numericDisplay}
          </motion.span>
        ) : (
          <span
            ref={ref}
            className="font-display text-3xl tracking-[-0.02em] leading-none text-[var(--color-text)]"
          >
            {numericDisplay}
          </span>
        )}
        <span className="text-sm text-[var(--color-text-muted)]">{sub}</span>
      </div>
      {extra === 'ring' && <BudgetRing inView={inView} reduced={reduced} />}
      {extra === 'bar' && <GuestBar inView={inView} reduced={reduced} />}
      {extra === 'dots' && <VendorDots />}
    </div>
  );
}

/** Live activity sidebar. Fixed height prevents layout shift when entries rotate. */
function ActivityFeed({ activities, reduced }: { activities: ActivityEntry[]; reduced: boolean }) {
  return (
    <aside className="border border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 rounded-[var(--radius-lg)] p-4 flex flex-col gap-2 min-h-0 overflow-hidden">
      <span
        className="text-[10px] uppercase tracking-widest text-[var(--color-text-subtle)] font-mono mb-1 shrink-0"
        style={{ letterSpacing: '0.15em' }}
      >
        Live Activity
      </span>

      {/* Fixed-height container prevents layout shift when entries animate in/out */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {reduced ? (
          // Static rendering for reduced-motion
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVITY_KIND_DOT[activity.kind]}`}
              />
              <span className="truncate">{activity.label}</span>
              <span className="text-[var(--color-text-subtle)] ml-auto text-[10px] shrink-0">
                {activity.time}
              </span>
            </div>
          ))
        ) : (
          // Animated rendering — popLayout prevents exit animations from affecting layout
          <AnimatePresence initial={false} mode="popLayout">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                layout
                className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_SPRING }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVITY_KIND_DOT[activity.kind]} ${
                    i === 0 ? 'animate-pulse' : ''
                  }`}
                />
                <span className="truncate">{activity.label}</span>
                <span className="text-[var(--color-text-subtle)] ml-auto text-[10px] shrink-0">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}

/** Browser chrome top bar. Hidden on mobile, visible on desktop. */
function BrowserChrome() {
  return (
    <div className="hidden md:flex bg-[#2A2A28] px-4 py-3 items-center gap-3" aria-hidden="true">
      {/* Traffic lights */}
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: '#FF5F57' }} />
        <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: '#FEBC2E' }} />
        <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: '#28C840' }} />
      </div>
      {/* URL bar */}
      <div className="flex-1 bg-white/8 rounded-md px-3 py-1">
        <span className="text-white/50 font-mono text-xs">utsavs.app/dashboard</span>
      </div>
      {/* Notification bell */}
      <div className="flex items-center gap-2 ml-auto mr-2">
        <div className="relative" aria-label="3 notifications">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/60"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center font-bold leading-none">
            3
          </span>
        </div>
      </div>
    </div>
  );
}

/** Timeline strip — 3 events with animated connectors. */
function TimelineStrip({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  const events = [
    { name: 'Mehendi', date: 'Dec 12' },
    { name: 'Sangeet', date: 'Dec 13' },
    { name: 'Wedding', date: 'Dec 14' },
  ];

  return (
    <div className="bg-[var(--color-bg-alt)] rounded-[var(--radius-lg)] p-6 mt-4">
      <p
        className="uppercase font-mono text-[var(--color-text-subtle)] mb-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em' }}
      >
        Event Timeline
      </p>
      <div className="flex items-start">
        {events.map((ev, i) => (
          <div key={ev.name} className="flex items-start flex-1 last:flex-none">
            {/* Node + label */}
            <div className="flex flex-col items-center">
              {/* Middle node (index 1) gets pulse ring for "current event" */}
              {i === 1 ? (
                <div className="relative w-3 h-3">
                  {reduced ? (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    />
                  ) : (
                    <>
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + i * 0.3, ease: EASE_SPRING }}
                      />
                      {/* Pulse ring overlay */}
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: 'var(--brand-primary)',
                          animation: 'pulse-ring 2s ease-out infinite',
                        }}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </div>
              ) : reduced ? (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                />
              ) : (
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.3, ease: EASE_SPRING }}
                />
              )}
              <span className="text-xs font-medium text-[var(--color-text)] mt-1 whitespace-nowrap">
                {ev.name}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
                {ev.date}
              </span>
            </div>

            {/* Connector — between nodes only */}
            {i < events.length - 1 && (
              <div className="flex-1 relative mx-2 mt-1.5">
                {/* Gray track */}
                <div className="h-0.5 w-full bg-[var(--color-border)]" />
                {/* Animated fill */}
                {reduced ? (
                  <div
                    className="absolute inset-0 h-0.5"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                ) : (
                  <motion.div
                    className="absolute inset-0 h-0.5 origin-left"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 1.0, delay: 0.8 + i * 0.3, ease: EASE_SPRING }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shagun collected card. */
function ShagunCard({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  // ₹4,21,800 is a formatted Rupee value that useCountUp cannot animate correctly
  // (parser captures prefix "₹", number "4", suffix ",21,800" → animates "₹0,21,800").
  // Rendered as static text; the card's motion.div entrance still provides visual dynamism.
  const rows = [
    { name: 'Sharma Family', amount: '₹51,000' },
    { name: 'Gupta Family', amount: '₹31,000' },
    { name: 'Verma Family', amount: '₹21,000' },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
      <p
        className="uppercase font-mono text-[var(--color-text-subtle)]"
        style={{ fontSize: '10px', letterSpacing: '0.1em' }}
      >
        Shagun Collected
      </p>
      <div className="mt-1">
        <span className="font-display text-3xl tracking-[-0.02em] leading-none text-[var(--color-text)]">
          ₹4,21,800
        </span>
      </div>

      <div className="border-t border-[var(--color-border)] my-4" />

      <div className="flex flex-col gap-1">
        {rows.map((row, i) =>
          reduced ? (
            <div key={row.name} className="flex items-center gap-2 py-1">
              <span
                className="w-2 h-2 rounded-full block shrink-0"
                style={{ backgroundColor: '#10B981' }}
              />
              <span className="text-sm text-[var(--color-text)]">{row.name}</span>
              <span className="flex-1" />
              <span className="font-mono text-sm text-[var(--color-text)]">{row.amount}</span>
            </div>
          ) : (
            <motion.div
              key={row.name}
              className="flex items-center gap-2 py-1"
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.15, ease: EASE_SPRING }}
            >
              <span
                className="w-2 h-2 rounded-full block shrink-0"
                style={{ backgroundColor: '#10B981' }}
              />
              <span className="text-sm text-[var(--color-text)]">{row.name}</span>
              <span className="flex-1" />
              <span className="font-mono text-sm text-[var(--color-text)]">{row.amount}</span>
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}

/** Invite preview card with gradient background. */
function InviteCard() {
  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden p-6 text-center flex flex-col items-center justify-center gap-3 min-h-[180px]"
      // TODO: animated gradient rotation (8s loop via @keyframes or framer-motion backgroundImage)
      style={{
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--color-champagne) 100%)',
      }}
    >
      <p
        className="text-white/60 text-xs uppercase tracking-widest"
        style={{ letterSpacing: '0.2em' }}
      >
        Invitation
      </p>
      <p className="font-display text-2xl text-white leading-tight">Priya &amp; Arjun</p>
      <p className="text-sm text-white/70">Dec 14 · Jaipur</p>
      {/* QR placeholder */}
      <div
        className="w-12 h-12 rounded-sm bg-white/15 mt-1"
        aria-label="QR code placeholder"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,0.15) 4px 5px)',
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Product reveal — mock dashboard inside a browser chrome, scroll-driven entrance.
 *
 * On mobile (<md), the browser chrome is hidden and cards stack in a single column.
 * On desktop, the full browser frame is shown with a 3-col metric grid + activity sidebar.
 *
 * Respects prefers-reduced-motion: all entrance animations skipped, numbers
 * render final values immediately, connectors render fully filled, no intervals.
 */
export function CommandDashboard() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({ threshold: 0.1 });

  // ── Activity feed state ────────────────────────────────────────────────────
  const [activities, setActivities] = useState<ActivityEntry[]>(INITIAL_ACTIVITIES);
  const idCounterRef = useRef(100);

  // ── Guest count flash state ────────────────────────────────────────────────
  const [guestPulsing, setGuestPulsing] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function generateNextActivity(): ActivityEntry {
    const next = ACTIVITY_POOL[idCounterRef.current % ACTIVITY_POOL.length];
    idCounterRef.current += 1;
    return { ...next, id: `activity-${idCounterRef.current}` };
  }

  // Rotate activity feed every 4 seconds
  useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setActivities((prev) => {
        const next = generateNextActivity();
        return [...prev.slice(1), next];
      });
    }, 4000);
    return () => clearInterval(interval);
    // generateNextActivity reads idCounterRef (stable ref) — no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  // Flash guest count every ~10 seconds to simulate live updates
  useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setGuestPulsing(true);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setGuestPulsing(false), 300);
    }, 10000);
    return () => {
      clearInterval(interval);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [prefersReduced]);

  // ── Frame entrance variants ────────────────────────────────────────────────
  // Transitions typed explicitly so framer-motion's Variants inference is satisfied.
  const frameVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE_SPRING } satisfies Transition,
    },
  };

  const cardContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2, delayChildren: 0.6 } satisfies Transition,
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_SPRING } satisfies Transition,
    },
  };

  const bottomCardVariants = {
    shagun: {
      hidden: { opacity: 0, x: -30 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, delay: 1.0, ease: EASE_SPRING } satisfies Transition,
      },
    },
    invite: {
      hidden: { opacity: 0, x: 30 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, delay: 1.1, ease: EASE_SPRING } satisfies Transition,
      },
    },
  };

  // Metric cards config — extracted to avoid repetition across reduced/animated branches
  const metricCards = [
    {
      eyebrow: 'Total Spend',
      value: '₹15.2L',
      sub: '/₹22L',
      extra: 'ring' as const,
      staticValue: true,
      pulseColor: '#F59E0B', // amber — budget at 69%, close to threshold
    },
    {
      eyebrow: 'Confirmed',
      value: '342',
      sub: '/500',
      extra: 'bar' as const,
      pulseColor: '#22C55E', // green — RSVPs flowing in
      withGuestPulse: true,
    },
    {
      eyebrow: 'Locked In',
      value: '8',
      sub: '/12',
      extra: 'dots' as const,
      pulseColor: '#EF4444', // red — 2 unconfirmed vendors
    },
  ];

  return (
    <section
      data-nav-theme="light"
      id="how-it-works"
      className="relative z-10 overflow-hidden py-12 md:py-20 px-6"
      style={{
        background: 'linear-gradient(to bottom, #0A0A0A 0%, var(--color-bg) 100%)',
      }}
    >
      {/* Minor 2 fix: assign ref directly — useScrollReveal returns RefObject<T | null>
          which is assignment-compatible with div's ref prop; no cast needed. */}
      <div ref={sectionRef} className="max-w-5xl mx-auto">
        {/* Section headline */}
        {prefersReduced ? (
          <div className="text-center mb-12">
            <p
              className="uppercase font-mono text-[var(--color-text-subtle)] mb-3"
              style={{ fontSize: '11px', letterSpacing: '0.15em' }}
            >
              The Platform
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-white">
              Everything in one place.
            </h2>
          </div>
        ) : (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: EASE_SPRING }}
          >
            <p
              className="uppercase font-mono text-[var(--color-text-subtle)] mb-3"
              style={{ fontSize: '11px', letterSpacing: '0.15em' }}
            >
              The Platform
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-white">
              Everything in one place.
            </h2>
          </motion.div>
        )}

        {/* Dashboard frame — rendered ONCE.
            On mobile: no chrome bar, no rounded/shadow outer frame (just stacked content).
            On desktop: BrowserChrome visible, frame gets rounded corners + shadow.
            Single render branch eliminates the double-mount of hooks. */}
        {prefersReduced ? (
          <div className="md:bg-[#2A2A28] md:rounded-[12px] md:overflow-hidden md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]">
            <BrowserChrome />
            <div className="bg-[var(--color-bg)] p-6 md:p-8">
              {/* Metric cards + activity sidebar */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_240px] gap-3">
                {metricCards.map((card) => (
                  <MetricCard
                    key={card.eyebrow}
                    eyebrow={card.eyebrow}
                    value={card.value}
                    sub={card.sub}
                    extra={card.extra}
                    inView={true}
                    reduced={true}
                    staticValue={card.staticValue}
                    pulseColor={card.pulseColor}
                  />
                ))}
                <ActivityFeed activities={activities} reduced={true} />
              </div>
              {/* Timeline strip */}
              <TimelineStrip inView={true} reduced={true} />
              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ShagunCard inView={true} reduced={true} />
                <InviteCard />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            className="md:bg-[#2A2A28] md:rounded-[12px] md:overflow-hidden md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
            variants={frameVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <BrowserChrome />
            <div className="bg-[var(--color-bg)] p-6 md:p-8">
              {/* Metric cards + activity sidebar */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_240px] gap-3"
                variants={cardContainerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                {metricCards.map((card) => (
                  <motion.div key={card.eyebrow} variants={cardVariants}>
                    <MetricCard
                      eyebrow={card.eyebrow}
                      value={card.value}
                      sub={card.sub}
                      extra={card.extra}
                      inView={inView}
                      reduced={false}
                      staticValue={card.staticValue}
                      pulseColor={card.pulseColor}
                      pulsing={card.withGuestPulse ? guestPulsing : false}
                    />
                  </motion.div>
                ))}
                <motion.div variants={cardVariants}>
                  <ActivityFeed activities={activities} reduced={false} />
                </motion.div>
              </motion.div>
              {/* Timeline strip */}
              <TimelineStrip inView={inView} reduced={false} />
              {/* Bottom row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <motion.div
                  variants={bottomCardVariants.shagun}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  <ShagunCard inView={inView} reduced={false} />
                </motion.div>
                <motion.div
                  variants={bottomCardVariants.invite}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                >
                  <InviteCard />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
