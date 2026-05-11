'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';
import { useCountUp } from './motion/use-count-up';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';

// ── Constants ──────────────────────────────────────────────────────────────────

const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];

// Pre-computed stable offsets for the tag cloud entrance animation.
// Using deterministic values instead of Math.random() avoids SSR/hydration mismatch —
// server and client produce identical markup from these constants.
const STABLE_TAG_OFFSETS: Array<{
  x: number;
  y: number;
  floatDuration: number;
  floatDelay: number;
}> = [
  { x: -25, y: 12, floatDuration: 3.2, floatDelay: 0.0 },
  { x: 18, y: -22, floatDuration: 4.1, floatDelay: 0.4 },
  { x: -8, y: 28, floatDuration: 3.7, floatDelay: 0.8 },
  { x: 30, y: 5, floatDuration: 4.5, floatDelay: 0.2 },
  { x: -22, y: -15, floatDuration: 3.0, floatDelay: 1.1 },
  { x: 15, y: 20, floatDuration: 4.8, floatDelay: 0.6 },
  { x: -30, y: -8, floatDuration: 3.5, floatDelay: 1.4 },
  { x: 24, y: -25, floatDuration: 4.2, floatDelay: 0.3 },
  { x: -12, y: 18, floatDuration: 3.9, floatDelay: 0.9 },
  { x: 28, y: 10, floatDuration: 4.6, floatDelay: 0.5 },
  { x: -20, y: -20, floatDuration: 3.3, floatDelay: 1.2 },
];

// SVG donut constants (r=60, center=70,70)
const DONUT_RADIUS = 60;
const DONUT_CX = 70;
const DONUT_CY = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

// ── Data ───────────────────────────────────────────────────────────────────────

const SUMMARY_STATS = [
  { value: '500', label: 'Invited' },
  { value: '342', label: 'Confirmed' },
  { value: '89', label: 'Pending' },
  { value: '69', label: 'Declined' },
];

type TagKind = 'category' | 'dietary' | 'location';

const TAGS: Array<{ label: string; kind: TagKind }> = [
  { label: 'Bride family', kind: 'category' },
  { label: 'Groom family', kind: 'category' },
  { label: 'Friends', kind: 'category' },
  { label: 'Work colleagues', kind: 'category' },
  { label: 'VIP', kind: 'category' },
  { label: 'Vegetarian', kind: 'dietary' },
  { label: 'Jain', kind: 'dietary' },
  { label: 'Kids table', kind: 'category' },
  { label: 'Delhi', kind: 'location' },
  { label: 'Jaipur', kind: 'location' },
  { label: 'NRI', kind: 'location' },
];

const TAG_STYLES: Record<TagKind, string> = {
  category:
    'text-[var(--brand-primary)] border border-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)]',
  dietary: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  location: 'bg-amber-50 text-amber-700 border border-amber-200',
};

// Donut segments: confirmed 68%, pending 18%, declined 14%
const DONUT_SEGMENTS = [
  { label: 'Confirmed', pct: 68, color: 'var(--brand-primary)', startPct: 0 },
  { label: 'Pending', pct: 18, color: '#C8A96B', startPct: 68 },
  { label: 'Declined', pct: 14, color: '#E5E7EB', startPct: 86 },
];

// RSVP feed data
type RSVPKind = 'confirmed' | 'declined' | 'pending';

interface RSVPEntry {
  id: number;
  status: string;
  name: string;
  plus: number;
  kind: RSVPKind;
}

const INITIAL_RSVPS: RSVPEntry[] = [
  { id: 1, status: '✓', name: 'Amit Sharma', plus: 4, kind: 'confirmed' },
  { id: 2, status: '✓', name: 'Neha Gupta', plus: 2, kind: 'confirmed' },
  { id: 3, status: '✗', name: 'Raj Verma', plus: 0, kind: 'declined' },
  { id: 4, status: '◐', name: 'Priya Singh', plus: 3, kind: 'pending' },
  { id: 5, status: '✓', name: 'Vikram Mehta', plus: 1, kind: 'confirmed' },
];

const NAME_POOL = [
  'Aarti Iyer',
  'Karan Malhotra',
  'Sonia Kapoor',
  'Rohit Bhalla',
  'Ananya Reddy',
  'Deepak Joshi',
  'Meera Nair',
  'Arjun Bose',
  'Kavya Patel',
  'Suresh Rao',
];

const STATUS_POOL: Array<{ status: string; kind: RSVPKind }> = [
  { status: '✓', kind: 'confirmed' },
  { status: '✓', kind: 'confirmed' },
  { status: '✓', kind: 'confirmed' },
  { status: '✗', kind: 'declined' },
  { status: '◐', kind: 'pending' },
];

const RSVP_KIND_STYLES: Record<RSVPKind, string> = {
  confirmed: 'text-emerald-400',
  declined: 'text-red-400',
  pending: 'text-amber-400',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Single stat card in the summary strip. */
function StatCard({
  value,
  label,
  index,
  isVisible,
  reduced,
}: {
  value: string;
  label: string;
  index: number;
  isVisible: boolean;
  reduced: boolean;
}) {
  const { displayValue, ref } = useCountUp<HTMLDivElement>(value, {
    duration: 1600,
    startOnVisible: true,
    threshold: 0.3,
  });

  return (
    <div
      ref={reduced ? undefined : ref}
      className="bg-white rounded-[var(--radius-md)] border border-border p-5 text-center"
      style={
        reduced
          ? undefined
          : {
              // Note: clipPath 'inset(0 100% 0 0)' hides content during SSR until the scroll observer fires.
              // Acceptable trade-off — the marketing page requires JS for full UX.
              clipPath: isVisible ? undefined : 'inset(0 100% 0 0)',
              animation: isVisible ? `clip-reveal-ltr 800ms ease-out forwards` : undefined,
              animationDelay: isVisible ? `${index * 100}ms` : undefined,
            }
      }
    >
      <Display size="md" as="h3">
        {reduced ? value : displayValue}
      </Display>
      <Eyebrow className="mt-1">{label}</Eyebrow>
    </div>
  );
}

/** Small indicator row showing WhatsApp RSVP stats. Purely presentational — no motion. */
function WhatsAppIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 mt-4 mb-8 md:mb-12 text-xs text-text-muted">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      <span>142 RSVPs via WhatsApp · 89 via invite link</span>
    </div>
  );
}

/** Donut chart with 3 SVG arc segments. */
function DonutChart({ inView, reduced }: { inView: boolean; reduced: boolean }) {
  // useCountUp requires HTMLElement — use a hidden span as the intersection target;
  // displayValue drives the SVG text child directly.
  const { displayValue: pctDisplay, ref: pctRef } = useCountUp<HTMLSpanElement>('68%', {
    duration: 1500,
    startOnVisible: true,
    threshold: 0.3,
  });

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-border p-8 flex flex-col items-center">
      {/* Hidden span anchors IntersectionObserver for useCountUp (requires HTMLElement) */}
      <span ref={pctRef} aria-hidden="true" className="sr-only" />
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        aria-label="RSVP breakdown donut chart"
        role="img"
      >
        {/* Track */}
        <circle
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={DONUT_RADIUS}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="12"
        />

        {/* Segments — each wrapped in motion.g for hover scale (reduced: plain g) */}
        {DONUT_SEGMENTS.map((seg, i) => {
          const dashArray = (seg.pct / 100) * DONUT_CIRCUMFERENCE;
          // rotation: start position in degrees = (startPct / 100) * 360 - 90
          const rotation = (seg.startPct / 100) * 360 - 90;

          if (reduced) {
            return (
              <g key={seg.label} aria-label={`${seg.label}: ${seg.pct}%`}>
                <circle
                  cx={DONUT_CX}
                  cy={DONUT_CY}
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${dashArray} ${DONUT_CIRCUMFERENCE}`}
                  strokeDashoffset={0}
                  strokeLinecap="butt"
                  transform={`rotate(${rotation} ${DONUT_CX} ${DONUT_CY})`}
                />
              </g>
            );
          }

          return (
            <motion.g
              key={seg.label}
              whileHover={{ scale: 1.04 }}
              style={{ transformOrigin: 'center center' }}
              aria-label={`${seg.label}: ${seg.pct}%`}
            >
              <motion.circle
                cx={DONUT_CX}
                cy={DONUT_CY}
                r={DONUT_RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dashArray} ${DONUT_CIRCUMFERENCE}`}
                strokeDashoffset={inView ? 0 : DONUT_CIRCUMFERENCE}
                strokeLinecap="butt"
                transform={`rotate(${rotation} ${DONUT_CX} ${DONUT_CY})`}
                transition={{
                  duration: 1.5,
                  delay: 0.2 + i * 0.15,
                  ease: EASE_CINEMATIC,
                }}
              />
            </motion.g>
          );
        })}

        {/* Center label — pctRef is a hidden span (useCountUp requires HTMLElement, not SVGElement).
            The displayValue string drives the SVG <text> child directly. */}
        <text
          x={DONUT_CX}
          y={DONUT_CY - 4}
          textAnchor="middle"
          className="font-display"
          style={{
            fontSize: '22px',
            fontFamily: 'var(--font-display)',
            fill: 'var(--color-text)',
            fontWeight: 400,
          }}
        >
          {reduced ? '68%' : pctDisplay}
        </text>
        <text
          x={DONUT_CX}
          y={DONUT_CY + 16}
          textAnchor="middle"
          style={{
            fontSize: '11px',
            fill: 'var(--color-text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          confirmed
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4 w-full max-w-[160px]">
        {DONUT_SEGMENTS.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-text-muted">{seg.label}</span>
            <span className="text-xs font-mono text-text ml-auto">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Live RSVP feed with rotating entries every 3s. */
function RSVPFeed({ reduced }: { reduced: boolean }) {
  const counterRef = useRef(100);
  const [entries, setEntries] = useState<RSVPEntry[]>(INITIAL_RSVPS);

  useEffect(() => {
    if (reduced) return;

    const interval = setInterval(() => {
      const nameIndex = Math.floor(Math.random() * NAME_POOL.length);
      const statusIndex = Math.floor(Math.random() * STATUS_POOL.length);
      const statusEntry = STATUS_POOL[statusIndex];
      const plusOnes = Math.floor(Math.random() * 5);

      const newEntry: RSVPEntry = {
        id: counterRef.current++,
        status: statusEntry.status,
        name: NAME_POOL[nameIndex],
        plus: plusOnes,
        kind: statusEntry.kind,
      };

      setEntries((prev) => {
        const next = [...prev.slice(1), newEntry];
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [reduced]);

  if (reduced) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] border border-border p-6 max-h-80 overflow-hidden">
        <p className="text-[10px] uppercase tracking-wider font-mono text-text-subtle mb-3">
          Recent RSVPs
        </p>
        <div className="flex flex-col gap-2">
          {INITIAL_RSVPS.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 py-1.5 border-b border-border last:border-b-0"
            >
              <span className={`text-sm font-medium w-5 ${RSVP_KIND_STYLES[entry.kind]}`}>
                {entry.status}
              </span>
              <span className="text-sm text-text flex-1">
                {entry.name}
                {entry.plus > 0 && (
                  <span className="text-text-muted ml-1 text-xs">+{entry.plus}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-border p-6 max-h-80 overflow-hidden">
      <p className="text-[10px] uppercase tracking-wider font-mono text-text-subtle mb-3">
        Recent RSVPs
      </p>
      <div className="flex flex-col gap-0">
        <AnimatePresence initial={false} mode="sync">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              className="flex items-center gap-3 py-1.5 border-b border-border last:border-b-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.35,
                delay: i * 0.2,
                ease: EASE_CINEMATIC,
              }}
            >
              <span
                className={`text-sm font-medium w-5 flex-shrink-0 ${RSVP_KIND_STYLES[entry.kind]}`}
              >
                {entry.status}
              </span>
              <span className="text-sm text-text flex-1">
                {entry.name}
                {entry.plus > 0 && (
                  <span className="text-text-muted ml-1 text-xs">+{entry.plus}</span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Individual tag with spring entrance + ambient float. */
function TagItem({
  label,
  kind,
  index,
  isVisible,
  reduced,
  offsetX,
  offsetY,
  floatDuration,
  floatDelay,
}: {
  label: string;
  kind: TagKind;
  index: number;
  isVisible: boolean;
  reduced: boolean;
  offsetX: number;
  offsetY: number;
  floatDuration: number;
  floatDelay: number;
}) {
  const kindStyle = TAG_STYLES[kind];
  // category uses CSS variable color, needs separate bg
  const bgStyle = kind === 'category' ? { backgroundColor: 'var(--brand-lighter)' } : undefined;

  if (reduced) {
    return (
      <span
        className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] cursor-pointer ${kindStyle}`}
        style={bgStyle}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] cursor-pointer float-element hover:shadow-md ${kindStyle}`}
      style={{
        ...(bgStyle ?? {}),
        ['--float-amplitude' as string]: '4px',
        ['--float-duration' as string]: `${floatDuration}s`,
        // Offset float start by spring delay + settle buffer so floating begins after
        // the entrance spring has finished (not while the tag is still mid-flight).
        ['--float-delay' as string]: `${index * 0.08 + 0.6 + floatDelay}s`,
      }}
      initial={{ opacity: 0, x: offsetX, y: offsetY }}
      animate={isVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offsetX, y: offsetY }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 18,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -3,
        transition: { type: 'spring', stiffness: 400, damping: 25 } as Transition,
      }}
    >
      {label}
    </motion.span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Guest Intelligence section.
 *
 * Single-column layout with: heading, summary strip (4 stat cards), tag cloud,
 * and a 2-col donut + RSVP feed grid.
 *
 * Motion identity: clip-reveal-ltr for stats, spring scatter for tags (distinct
 * from horizontal slides in split-budget/vendor), SVG arc draw for donut.
 *
 * Memory cleanup: setInterval in RSVPFeed is cleared on unmount.
 * Tag float offsets use STABLE_TAG_OFFSETS (deterministic constants) to avoid SSR/hydration mismatch.
 *
 * Reduced-motion: static branch throughout.
 */
export function GuestIntelligence() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Tag float parameters — use STABLE_TAG_OFFSETS (deterministic, pre-computed) so that
  // server and client render identical markup. Math.random() in a lazy useState initializer
  // runs on BOTH server (SSR) and client (hydration), producing different values each time
  // and causing a hydration mismatch error.

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section data-nav-theme="light" className="relative z-10 bg-bg-alt py-12 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <span className="text-text-subtle font-mono uppercase tracking-widest text-xs">
              Guest Intelligence
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-text mt-3">
              Not just a list. A live dashboard.
            </h2>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-12">
            {SUMMARY_STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                index={i}
                isVisible={true}
                reduced={true}
              />
            ))}
          </div>

          {/* Tag cloud */}
          <div className="flex flex-wrap gap-2 justify-center mb-4 max-w-3xl mx-auto">
            {TAGS.map((tag) => (
              <TagItem
                key={tag.label}
                label={tag.label}
                kind={tag.kind}
                index={0}
                isVisible={true}
                reduced={true}
                offsetX={0}
                offsetY={0}
                floatDuration={4}
                floatDelay={0}
              />
            ))}
          </div>

          {/* WhatsApp connection indicator */}
          <WhatsAppIndicator />

          {/* Donut + RSVP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 md:mt-12">
            <DonutChart inView={true} reduced={true} />
            <RSVPFeed reduced={true} />
          </div>
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section data-nav-theme="light" className="bg-bg-alt py-12 md:py-20 px-6">
      <div ref={sectionRef} className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <motion.span
            className="text-text-subtle font-mono uppercase tracking-widest text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
          >
            Guest Intelligence
          </motion.span>

          <TextReveal
            text="Not just a list. A live dashboard."
            as="h2"
            mode="word"
            stagger={0.1}
            direction="up"
            delay={0.2}
            triggerOnVisible={true}
            threshold={0.1}
            className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-text mt-3"
          />
        </div>

        {/* Summary strip — clip-reveal-ltr per box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-12">
          {SUMMARY_STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              index={i}
              isVisible={inView}
              reduced={false}
            />
          ))}
        </div>

        {/* Tag cloud — spring entrance from stable offsets, then float */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 max-w-3xl mx-auto mt-12">
          {TAGS.map((tag, i) => {
            const offsets = STABLE_TAG_OFFSETS[i] ?? {
              x: 0,
              y: 0,
              floatDuration: 4,
              floatDelay: 0,
            };
            return (
              <TagItem
                key={tag.label}
                label={tag.label}
                kind={tag.kind}
                index={i}
                isVisible={inView}
                reduced={false}
                offsetX={offsets.x}
                offsetY={offsets.y}
                floatDuration={offsets.floatDuration}
                floatDelay={offsets.floatDelay}
              />
            );
          })}
        </div>

        {/* WhatsApp connection indicator */}
        <WhatsAppIndicator />

        {/* Donut + RSVP feed grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE_CINEMATIC } satisfies Transition}
          >
            <DonutChart inView={inView} reduced={false} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE_CINEMATIC } satisfies Transition}
          >
            <RSVPFeed reduced={false} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
