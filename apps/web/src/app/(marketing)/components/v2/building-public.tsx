'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';
import { TextReveal } from './motion/text-reveal';

// ── Data ───────────────────────────────────────────────────────────────────────

type MilestoneStatus = 'shipped' | 'in-progress' | 'coming-soon';

interface Milestone {
  label: string;
  status: MilestoneStatus;
}

const MILESTONES: Milestone[] = [
  { label: 'Auth & guest management', status: 'shipped' },
  { label: '6 curated themes', status: 'shipped' },
  { label: 'Budget & shagun tracking', status: 'in-progress' },
  { label: 'Vendor coordination', status: 'coming-soon' },
  { label: 'Multi-event dashboard', status: 'coming-soon' },
];

// The brand-color fill covers up to and including the in-progress node.
// Node index 2 (0-based) = 3rd of 5 = 60% of total spacing.
const IN_PROGRESS_NODE_INDEX = 2;
const LINE_FILL_PCT = (IN_PROGRESS_NODE_INDEX / (MILESTONES.length - 1)) * 100;

// ── Status helpers ──────────────────────────────────────────────────────────────

const STATUS_NODE_CLASSES: Record<MilestoneStatus, string> = {
  shipped: 'bg-emerald-500 border-emerald-500',
  'in-progress': 'bg-amber-500 border-amber-500',
  'coming-soon': 'border-2 border-border bg-transparent',
};

const STATUS_PILL: Record<MilestoneStatus, { text: string; className: string }> = {
  shipped: {
    text: 'SHIPPED',
    className: 'bg-emerald-500/15 text-emerald-700 border border-emerald-200',
  },
  'in-progress': {
    text: 'IN PROGRESS',
    className: 'bg-amber-500/15 text-amber-700 border border-amber-200',
  },
  'coming-soon': {
    text: 'COMING SOON',
    className: 'bg-border/50 text-text-muted border border-border',
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Tiny SVG checkmark drawn via stroke-dashoffset animation */
function CheckMark({ animated, inView }: { animated: boolean; inView: boolean }) {
  if (!animated) {
    return (
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="1.5,5 4,7.5 8.5,2.5" />
      </svg>
    );
  }
  return (
    <motion.svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.polyline
        points="1.5,5 4,7.5 8.5,2.5"
        strokeDasharray="12"
        strokeDashoffset={inView ? 0 : 12}
        transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.svg>
  );
}

interface MilestoneRowProps {
  milestone: Milestone;
  index: number;
  inView: boolean;
  reduced: boolean;
}

function MilestoneRow({ milestone, index, inView, reduced }: MilestoneRowProps) {
  const { status, label } = milestone;
  const pill = STATUS_PILL[status];
  const nodeClass = STATUS_NODE_CLASSES[status];
  const isComingSoon = status === 'coming-soon';

  const nodeDelay = 0.3 + index * 0.18;
  const labelDelay = nodeDelay + 0.2;

  if (reduced) {
    return (
      <div className="flex items-center gap-4 py-3">
        {/* Node */}
        <div
          className={`relative flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${nodeClass}`}
          style={{ opacity: isComingSoon ? 0.5 : 1 }}
        >
          {status === 'shipped' && <CheckMark animated={false} inView={true} />}
        </div>

        {/* Label + pill */}
        <div className="flex items-center gap-3 flex-1" style={{ opacity: isComingSoon ? 0.5 : 1 }}>
          <span className="text-sm text-text">{label}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pill.className}`}>
            {pill.text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 py-3">
      {/* Node */}
      <motion.div
        className={`relative flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${nodeClass}`}
        style={{ opacity: isComingSoon ? 0.4 : 1 }}
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : { scale: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20, delay: nodeDelay }}
      >
        {status === 'shipped' && <CheckMark animated={true} inView={inView} />}

        {/* Pulse ring for in-progress */}
        {status === 'in-progress' && (
          <span
            className="absolute inset-0 rounded-full bg-amber-500"
            style={{ animation: 'pulse-ring 2s ease-out infinite' }}
            aria-hidden="true"
          />
        )}
      </motion.div>

      {/* Label + pill */}
      <motion.div
        className="flex items-center gap-3 flex-1"
        style={{ opacity: isComingSoon ? 0.4 : 1 }}
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: isComingSoon ? 0.4 : 1, x: 0 } : { opacity: 0, x: 20 }}
        transition={{ duration: 0.35, delay: labelDelay, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-sm text-text">{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pill.className}`}>
          {pill.text}
        </span>
      </motion.div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * BuildingPublic section.
 *
 * Vertical roadmap timeline showing 5 milestones with animated line-draw.
 * Motion identity: vertical line draws from zero height to 60% (in-progress node),
 * then per-node scale-in + slide-in labels — unique among all sections.
 *
 * Reduced-motion: static branch, all nodes visible, line at 60% fill, no pulse.
 */
export function BuildingPublic() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref: sectionRef, isVisible: inView } = useScrollReveal({ threshold: 0.1 });

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section data-nav-theme="light" className="relative z-10 bg-bg py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="mb-12">
            <p className="text-text-subtle font-mono uppercase tracking-widest text-xs">
              Early Access
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-text mt-3">
              We&apos;re building in public.
            </h2>
            <p className="mt-4 text-text-muted text-base leading-relaxed">
              Working with wedding organizers in Jaipur and Delhi to ship features as they&apos;re
              ready.
            </p>
          </div>

          {/* Timeline — static */}
          <div className="relative pl-8">
            {/* Background line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
            {/* Brand-color fill up to in-progress node — static at final width */}
            <div
              className="absolute left-[7px] top-0 w-0.5 bg-[var(--brand-primary)]"
              style={{ height: `${LINE_FILL_PCT}%` }}
              aria-hidden="true"
            />

            {MILESTONES.map((milestone, i) => (
              <MilestoneRow
                key={milestone.label}
                milestone={milestone}
                index={i}
                inView={true}
                reduced={true}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <section data-nav-theme="light" ref={sectionRef} className="relative z-10 bg-bg py-12 md:py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="mb-12">
          <motion.p
            className="text-text-subtle font-mono uppercase tracking-widest text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          >
            Early Access
          </motion.p>

          <TextReveal
            text="We're building in public."
            as="h2"
            mode="word"
            stagger={0.1}
            direction="up"
            delay={0.15}
            triggerOnVisible={true}
            threshold={0.1}
            className="font-display text-3xl md:text-4xl tracking-[-0.02em] text-text mt-3"
          />

          <motion.p
            className="mt-4 text-text-muted text-base leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
          >
            Working with wedding organizers in Jaipur and Delhi to ship features as they&apos;re
            ready.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Background gray line — full height */}
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />

          {/* Brand-color fill — animates from 0 to LINE_FILL_PCT% */}
          <motion.div
            className="absolute left-[7px] top-0 w-0.5 bg-[var(--brand-primary)]"
            initial={{ height: '0%' }}
            animate={inView ? { height: `${LINE_FILL_PCT}%` } : { height: '0%' }}
            transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
            aria-hidden="true"
          />

          {/* Milestone rows */}
          {MILESTONES.map((milestone, i) => (
            <MilestoneRow
              key={milestone.label}
              milestone={milestone}
              index={i}
              inView={inView}
              reduced={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
