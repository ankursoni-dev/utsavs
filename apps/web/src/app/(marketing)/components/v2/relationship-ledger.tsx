'use client';

import { motion, useReducedMotion, AnimatePresence, type Transition } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextReveal } from './motion/text-reveal';

// ── Constants ─────────────────────────────────────────────────────────────────

const EASE_CINEMATIC = [0.65, 0, 0.35, 1] as [number, number, number, number];

// ── Data ──────────────────────────────────────────────────────────────────────

interface LedgerEntry {
  family: string;
  relation: string;
  events: string;
  given: string;
  received: string;
  emoji: string;
}

const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    family: 'Sharma Family',
    relation: "Groom's Maternal Uncle",
    events: '4 events together',
    given: '₹1,51,000',
    received: '₹1,21,000',
    emoji: '🪙',
  },
  {
    family: 'Gupta Family',
    relation: "Bride's College Friends",
    events: '2 events together',
    given: '₹51,000',
    received: '₹31,000',
    emoji: '🎁',
  },
  {
    family: 'Mehta Family',
    relation: 'Business Associates',
    events: '6 events together',
    given: '₹2,11,000',
    received: '₹1,75,000',
    emoji: '💎',
  },
  {
    family: 'Iyer Family',
    relation: "Groom's Neighbor",
    events: '3 events together',
    given: '₹75,000',
    received: '₹51,000',
    emoji: '🏡',
  },
];

// Timeline events that scroll horizontally
const TIMELINE_EVENTS = [
  { year: '2018', event: "Cousin's Wedding", amount: '₹51,000' },
  { year: '2020', event: 'Housewarming', amount: '₹21,000' },
  { year: '2022', event: 'Baby Shower', amount: '₹11,000' },
  { year: '2024', event: "Brother's Wedding", amount: '₹1,01,000' },
  { year: '2026', event: 'Your Wedding', amount: '?' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function LedgerCard({
  entry,
  index,
  inView,
  reduced,
}: {
  entry: LedgerEntry;
  index: number;
  inView: boolean;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <div className="rounded-xl p-5 bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white/90">{entry.family}</p>
            <p className="text-[11px] text-[#C8A96B]/60 mt-0.5">{entry.relation}</p>
          </div>
          <span className="text-lg">{entry.emoji}</span>
        </div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">{entry.events}</p>
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Given</p>
            <p className="text-sm font-mono text-[#C8A96B]/80">{entry.given}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Received</p>
            <p className="text-sm font-mono text-white/60">{entry.received}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-xl p-5 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors duration-300"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.95 }
      }
      transition={{
        duration: 0.6,
        delay: 0.3 + index * 0.12,
        ease: EASE_CINEMATIC,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white/90">{entry.family}</p>
          <p className="text-[11px] text-[#C8A96B]/60 mt-0.5">{entry.relation}</p>
        </div>
        <motion.span
          className="text-lg"
          animate={inView ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.8 + index * 0.12 }}
        >
          {entry.emoji}
        </motion.span>
      </div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">{entry.events}</p>
      <div className="flex gap-4">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Given</p>
          <p className="text-sm font-mono text-[#C8A96B]/80">{entry.given}</p>
        </div>
        <div className="relative">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Received</p>
          <p className="text-sm font-mono text-white/60">{entry.received}</p>
        </div>
      </div>
      {/* Subtle pulse line at bottom */}
      <motion.div
        className="mt-4 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,107,0.3), transparent)' }}
        animate={inView ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
      />
    </motion.div>
  );
}

function TimelineDot({
  event,
  index,
  inView,
  reduced,
}: {
  event: (typeof TIMELINE_EVENTS)[0];
  index: number;
  inView: boolean;
  reduced: boolean;
}) {
  const isLast = index === TIMELINE_EVENTS.length - 1;

  if (reduced) {
    return (
      <div className="flex flex-col items-center min-w-[100px]">
        <span className="text-[10px] text-white/30 font-mono">{event.year}</span>
        <span
          className="my-2 w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: isLast ? 'var(--brand-primary)' : 'rgba(200,169,107,0.4)',
          }}
        />
        <span className="text-[11px] text-white/60 text-center">{event.event}</span>
        <span className="text-[10px] text-[#C8A96B]/60 font-mono mt-0.5">{event.amount}</span>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center min-w-[100px]"
      initial={{ opacity: 0, y: 15 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.1, ease: EASE_CINEMATIC }}
    >
      <span className="text-[10px] text-white/30 font-mono">{event.year}</span>
      <motion.span
        className="my-2 w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: isLast ? 'var(--brand-primary)' : 'rgba(200,169,107,0.4)',
        }}
        animate={
          isLast && inView
            ? { scale: [1, 1.4, 1], boxShadow: ['0 0 0 0 rgba(124,45,110,0)', '0 0 0 8px rgba(124,45,110,0.3)', '0 0 0 0 rgba(124,45,110,0)'] }
            : {}
        }
        transition={isLast ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
      />
      <span className="text-[11px] text-white/60 text-center">{event.event}</span>
      <span className="text-[10px] text-[#C8A96B]/60 font-mono mt-0.5">{event.amount}</span>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * RelationshipLedger section.
 *
 * Shows a meaningful preview of the "relationship ledger" feature:
 * - 4 family cards showing gift history (given/received amounts, event count)
 * - A horizontal timeline showing gift exchange history across events
 * - Each card has staggered entrance + persistent pulse animation
 * - Timeline dots animate in sequence with the "current" event pulsing
 *
 * Motion identity: staggered card reveals + timeline sequence + pulse connectors.
 * Reduced-motion: static layout, no animations.
 */
export function RelationshipLedger() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref, isVisible: inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      data-nav-theme="dark"
      ref={ref}
      className="relative z-10 py-16 md:py-24 px-6 bg-[#0A0A0A] text-white overflow-hidden"
    >
      {/* Subtle radial glow behind content */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(200,169,107,0.04) 0%, transparent 60%)',
          }}
          animate={inView ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}

      <div className="mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {prefersReduced ? (
            <>
              <Eyebrow className="text-[#C8A96B]/40">Coming Soon</Eyebrow>
              <h2 className="font-display text-2xl md:text-3xl text-white/90 mt-4 max-w-2xl mx-auto leading-relaxed">
                Every shagun tells a story.
              </h2>
              <p className="text-white/40 text-sm mt-3 max-w-lg mx-auto">
                Track who gave what, when, and why — across every family event. Never forget a
                reciprocal gift.
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
              >
                <Eyebrow className="text-[#C8A96B]/40">Coming Soon</Eyebrow>
              </motion.div>

              <TextReveal
                text="Every shagun tells a story."
                as="h2"
                mode="word"
                stagger={0.1}
                direction="up"
                delay={0.2}
                triggerOnVisible={true}
                threshold={0.15}
                className="font-display text-2xl md:text-3xl text-white/90 mt-4 max-w-2xl mx-auto leading-relaxed"
              />

              <motion.p
                className="text-white/40 text-sm mt-3 max-w-lg mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.4, ease: EASE_CINEMATIC }}
              >
                Track who gave what, when, and why — across every family event. Never forget a
                reciprocal gift.
              </motion.p>
            </>
          )}
        </div>

        {/* Ledger cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
          {LEDGER_ENTRIES.map((entry, i) => (
            <LedgerCard
              key={entry.family}
              entry={entry}
              index={i}
              inView={inView}
              reduced={prefersReduced}
            />
          ))}
        </div>

        {/* Timeline — horizontal event history */}
        <div className="relative">
          {/* Connecting line */}
          {prefersReduced ? (
            <div
              className="absolute top-[28px] left-[50px] right-[50px] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,107,0.2), transparent)' }}
            />
          ) : (
            <motion.div
              className="absolute top-[28px] left-[50px] right-[50px] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,107,0.2), transparent)' }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE_CINEMATIC }}
            />
          )}

          <div className="flex justify-between items-start overflow-x-auto pb-4 hide-scrollbar">
            {TIMELINE_EVENTS.map((event, i) => (
              <TimelineDot
                key={event.year}
                event={event}
                index={i}
                inView={inView}
                reduced={prefersReduced}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        {prefersReduced ? (
          <p className="text-xs text-white/20 mt-8 text-center">
            The relationship ledger. Coming 2026.
          </p>
        ) : (
          <motion.p
            className="text-xs text-white/20 mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            The relationship ledger. Coming 2026.
          </motion.p>
        )}
      </div>
    </section>
  );
}
