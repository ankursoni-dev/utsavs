'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useScrollReveal } from './motion/use-scroll-reveal';

// ── Data ───────────────────────────────────────────────────────────────────────

type MessageKind = 'sent' | 'received';

interface Message {
  text: string;
  kind: MessageKind;
}

const MESSAGES: Message[] = [
  { text: 'Hi Sharma ji, your RSVP is confirmed for the Sangeet! 🎉', kind: 'sent' },
  { text: 'Reminder: Wedding ceremony at 11 AM, Jai Mahal Palace', kind: 'sent' },
  { text: 'Coming +2', kind: 'received' },
];

const QUICK_REPLIES = ['Coming +2', "Can't make it", 'Send Shagun'];

// ── Sub-components ─────────────────────────────────────────────────────────────

/** WhatsApp icon — same path used in GuestIntelligence indicator. */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * WhatsAppLayer section.
 *
 * Dark charcoal strip showing the WhatsApp coordination feature: sent/received
 * chat bubbles sliding in, a typing indicator, and quick-reply chips.
 *
 * Motion identity: directional fade-slide per bubble (sent from left, received
 * from right), typing dots bounce loop, quick-reply chips rise on scroll.
 *
 * Single render path with conditional `Wrapper` and `motionProps` keeps reduced
 * and animated branches in one JSX tree (no duplicate markup).
 *
 * Reduced-motion: static divs/spans at final opacity, no entrance animation,
 * no typing dots animation (the element is omitted entirely to avoid
 * infinite-loop animation running under reduced-motion).
 *
 * Cleanup: no intervals or timers — all animations are driven by framer-motion.
 */
export function WhatsAppLayer() {
  const prefersReduced = useReducedMotion() ?? false;
  const { ref, isVisible: inView } = useScrollReveal({
    threshold: 0.25,
    rootMargin: '0px 0px -5% 0px',
  });

  return (
    <section
      data-nav-theme="dark"
      ref={ref}
      className="relative z-10 py-10 md:py-14 px-6 bg-[#1A1A1A] text-white overflow-hidden"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header label */}
        <div className="flex items-center gap-2 mb-6">
          <WhatsAppIcon size={18} />
          <span className="text-xs uppercase tracking-widest text-white/40 font-mono">
            WhatsApp Integration
          </span>
        </div>

        {/* Chat bubbles */}
        <div className="flex flex-col gap-2 max-w-md mb-6">
          {MESSAGES.map((msg, i) => {
            const fromBot = msg.kind === 'sent';
            const bubbleClass = `rounded-2xl px-4 py-2 text-sm max-w-[80%] ${
              fromBot ? 'self-start bg-white/10' : 'self-end bg-emerald-500/20'
            }`;

            if (prefersReduced) {
              return (
                <div key={i} className={bubbleClass}>
                  {msg.text}
                </div>
              );
            }

            // Explicit hidden state mirrors initial — eliminates framer-motion
            // "fallback to initial" jitter when toggling rapidly during scroll.
            return (
              <motion.div
                key={i}
                className={bubbleClass}
                initial={{ opacity: 0, x: fromBot ? -20 : 20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: fromBot ? -20 : 20 }}
                transition={{ delay: 0.2 + i * 0.2, duration: 0.4 }}
              >
                {msg.text}
              </motion.div>
            );
          })}

          {/* Typing dots — animated branch only; omitted under reduced-motion to
              avoid an infinite-loop animation running for users with that preference */}
          {!prefersReduced && (
            <motion.div
              className="self-start flex items-center gap-1 px-4 py-3 bg-white/10 rounded-2xl mt-1"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 + MESSAGES.length * 0.2 + 0.3, duration: 0.3 }}
              aria-hidden="true"
            >
              {([0, 1, 2] as const).map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-white/60"
                  animate={inView ? { y: [0, -3, 0] } : false}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: d * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Quick reply chips */}
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map((reply, i) => {
            const chipClass =
              'inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-white/10 text-white border border-white/20';

            if (prefersReduced) {
              return (
                <span key={reply} className={chipClass}>
                  {reply}
                </span>
              );
            }

            // Explicit hidden state mirrors initial to avoid jitter on replay.
            return (
              <motion.span
                key={reply}
                className={chipClass}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
              >
                {reply}
              </motion.span>
            );
          })}
        </div>

        {/* Tagline */}
        <p className="text-xs text-white/50 mt-6">342 guests coordinated. Zero missed messages.</p>
      </div>
    </section>
  );
}
