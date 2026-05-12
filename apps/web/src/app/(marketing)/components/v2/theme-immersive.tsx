'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion';
import { THEMES, THEME_NAMES, type ThemeName } from '@/lib/themes';
import { FloatingElement } from './motion/floating-element';
import { TextReveal } from './motion/text-reveal';
import { useScrollReveal } from './motion/use-scroll-reveal';

// ── Constants ──────────────────────────────────────────────────────────────────

const EASE_SPRING: Transition = { type: 'spring', stiffness: 400, damping: 25 };

// Themes whose gradients are perceptually light — need dark text for contrast.
const LIGHT_THEME_NAMES: ReadonlySet<ThemeName> = new Set<ThemeName>([
  'royal-ivory',
  'minimal-luxury',
  'floral-sunset',
]);

function isLightTheme(name: ThemeName): boolean {
  return LIGHT_THEME_NAMES.has(name);
}

function getGradTextColor(name: ThemeName): string {
  return isLightTheme(name) ? '#171717' : '#FFFFFF';
}

// Each theme gets a distinct card entrance animation to avoid the monotonous spin.
const CARD_TRANSITIONS: Record<ThemeName, {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
  transition: Transition;
}> = {
  'royal-ivory': {
    initial: { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(6px)' },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  'modern-emerald': {
    initial: { opacity: 0, y: 40, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.97 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  'midnight-sangeet': {
    initial: { opacity: 0, scale: 0.85, rotate: -3 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.9, rotate: 3 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  'minimal-luxury': {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
    transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] },
  },
  'floral-sunset': {
    initial: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  'temple-classic': {
    initial: { opacity: 0, y: -40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.95 },
    transition: { duration: 0.45, ease: [0.65, 0, 0.35, 1] },
  },
};

// Human-readable theme labels
const THEME_LABELS: Record<ThemeName, string> = {
  'royal-ivory': 'Royal Ivory',
  'modern-emerald': 'Modern Emerald',
  'midnight-sangeet': 'Midnight Sangeet',
  'minimal-luxury': 'Minimal Luxury',
  'floral-sunset': 'Floral Sunset',
  'temple-classic': 'Temple Classic',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Decorative accent row. */
function CardAccent({ color }: { color: string }) {
  return (
    <div className="flex justify-center gap-2 mb-6" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{ width: 6, height: 6, backgroundColor: color, opacity: i === 1 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

/** Invitation card content — uses per-theme entrance animation. */
function CardContent({
  selected,
  gradText,
  light,
}: {
  selected: ThemeName;
  gradText: string;
  light: boolean;
}) {
  const anim = CARD_TRANSITIONS[selected];
  // Button styling adapts: light themes get subtle dark borders, dark themes get glowing glass.
  const btnStyle = light
    ? {
        backgroundColor: 'rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.12)',
        color: gradText,
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: gradText,
      };

  return (
    <motion.div
      key={selected}
      style={{ color: gradText }}
      initial={anim.initial}
      animate={anim.animate}
      exit={anim.exit}
      transition={anim.transition}
      className="w-full text-center"
    >
      <CardAccent color={gradText} />

      <p
        className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight"
        style={{ color: gradText }}
      >
        Priya &amp; Arjun
      </p>
      <p className="mt-2 text-sm" style={{ color: gradText, opacity: 0.65 }}>
        Dec 14 · Jaipur
      </p>

      <div className="grid grid-cols-2 gap-2 mt-8">
        {['RSVP', 'Schedule', 'Directions', 'Shagun'].map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-md px-4 py-2 text-xs uppercase tracking-wider cursor-pointer transition-colors duration-200"
            style={btnStyle}
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/** Static (reduced-motion) card — no AnimatePresence. */
function StaticCardContent({ gradText, light }: { gradText: string; light: boolean }) {
  const btnStyle = light
    ? { backgroundColor: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.12)', color: gradText }
    : { backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: gradText };

  return (
    <div className="w-full text-center" style={{ color: gradText }}>
      <CardAccent color={gradText} />
      <p className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight">
        Priya &amp; Arjun
      </p>
      <p className="mt-2 text-sm" style={{ opacity: 0.65 }}>
        Dec 14 · Jaipur
      </p>
      <div className="grid grid-cols-2 gap-2 mt-8">
        {['RSVP', 'Schedule', 'Directions', 'Shagun'].map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-md px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
            style={btnStyle}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Theme swatch — pill with gradient, label, and selection ring. */
function ThemeSwatch({
  name,
  isSelected,
  gradText,
  onClick,
  reduced,
}: {
  name: ThemeName;
  isSelected: boolean;
  gradText: string;
  onClick: () => void;
  reduced: boolean;
}) {
  const theme = THEMES[name];

  if (reduced) {
    return (
      <button
        aria-label={`Select ${THEME_LABELS[name]} theme`}
        onClick={onClick}
        className="flex flex-col items-center gap-2 cursor-pointer group"
      >
        <span
          className="block rounded-full"
          style={{
            width: 48,
            height: 48,
            background: theme.grad,
            outline: isSelected ? `2px solid ${gradText}` : 'none',
            outlineOffset: 3,
          }}
        />
        <span
          className="text-[10px] uppercase tracking-wider transition-opacity duration-200"
          style={{ color: gradText, opacity: isSelected ? 0.9 : 0.4 }}
        >
          {THEME_LABELS[name].split(' ')[0]}
        </span>
      </button>
    );
  }

  return (
    <motion.button
      aria-label={`Select ${THEME_LABELS[name]} theme`}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer group"
      animate={{ scale: isSelected ? 1.1 : 1 }}
      whileHover={{ scale: isSelected ? 1.1 : 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={EASE_SPRING}
    >
      <span
        className="block rounded-full transition-shadow duration-300"
        style={{
          width: 48,
          height: 48,
          background: theme.grad,
          boxShadow: isSelected
            ? `0 0 0 2px ${gradText}, 0 4px 20px rgba(0,0,0,0.3)`
            : '0 2px 8px rgba(0,0,0,0.15)',
        }}
      />
      <motion.span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: gradText }}
        animate={{ opacity: isSelected ? 0.9 : 0.4 }}
        transition={{ duration: 0.3 }}
      >
        {THEME_LABELS[name].split(' ')[0]}
      </motion.span>
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * ThemeImmersive section.
 *
 * Full-bleed gradient background that crossfades when user picks a theme.
 * Each theme has a UNIQUE card entrance animation (blur morph, slide, scale+rotate,
 * etc.) — dramatically different from the old monotonous rotateY spin.
 *
 * Card button styling adapts to light/dark themes for proper contrast.
 * Swatches are circular pills with labels.
 *
 * Motion identity: full-bleed gradient crossfade + per-theme card morphs.
 * Reduced-motion: static gradient, instant swap.
 */
export function ThemeImmersive() {
  const prefersReduced = useReducedMotion() ?? false;
  const [selected, setSelected] = useState<ThemeName>(THEME_NAMES[0]);
  const [prevSelected, setPrevSelected] = useState<ThemeName | null>(null);

  const { ref: sectionRef, isVisible: inView } = useScrollReveal({ threshold: 0.05 });

  function handleSelect(name: ThemeName) {
    if (name === selected) return;
    setPrevSelected(selected);
    setSelected(name);
  }

  const theme = THEMES[selected];
  const prevTheme = prevSelected ? THEMES[prevSelected] : null;
  const gradText = getGradTextColor(selected);
  const light = isLightTheme(selected);

  // Card glass bg adapts to light/dark themes
  const cardGlassBg = light ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.12)';
  const cardBorder = light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)';

  // ── Reduced-motion static branch ───────────────────────────────────────────
  if (prefersReduced) {
    return (
      <section
        data-nav-theme="dark"
        id="themes"
        className="relative z-10 overflow-hidden py-12 md:py-20 px-6"
        style={{ background: theme.grad }}
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] font-mono mb-4" style={{ color: gradText, opacity: 0.7 }}>
              6 Curated Themes
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-[-0.02em]" style={{ color: gradText }}>
              Every wedding has its own look.
            </h2>
          </div>

          {/* Phone-frame card */}
          <div
            className="max-w-[320px] min-h-[400px] w-full mx-auto rounded-[28px] overflow-hidden p-8 text-center flex items-center"
            style={{
              backgroundColor: cardGlassBg,
              backdropFilter: 'blur(8px)',
              border: cardBorder,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <StaticCardContent gradText={gradText} light={light} />
          </div>

          <div className="flex justify-center gap-5 mt-12">
            {THEME_NAMES.map((name) => (
              <ThemeSwatch
                key={name}
                name={name}
                isSelected={selected === name}
                gradText={gradText}
                onClick={() => handleSelect(name)}
                reduced={true}
              />
            ))}
          </div>

          <p className="text-sm opacity-70 mt-8 text-center" style={{ color: gradText }}>
            Their invitation. Your brand.
          </p>
        </div>
      </section>
    );
  }

  // ── Animated branch ────────────────────────────────────────────────────────
  return (
    <motion.section
      data-nav-theme="dark"
      id="themes"
      ref={sectionRef}
      className="relative z-10 overflow-hidden py-12 md:py-20 px-6"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Background layers — crossfade between prev and current gradient */}
      {prevTheme && (
        <motion.div
          key={`bg-prev-${prevSelected}`}
          className="absolute inset-0 pointer-events-none"
          style={{ background: prevTheme.grad, zIndex: 0 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: theme.grad, zIndex: -1 }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.p
            className="text-xs uppercase tracking-[0.2em] font-mono mb-4"
            style={{ color: gradText, opacity: 0.7 }}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 0.7, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            6 Curated Themes
          </motion.p>

          <TextReveal
            text="Every wedding has its own look."
            as="h2"
            mode="word"
            stagger={0.12}
            direction="up"
            delay={0.2}
            triggerOnVisible={true}
            threshold={0.05}
            className="font-display text-3xl md:text-5xl tracking-[-0.02em]"
          />
          <style>{`#themes h2 { color: ${gradText}; transition: color 0.5s ease; }`}</style>
        </div>

        {/* Invitation preview card — in a phone-like frame */}
        <FloatingElement amplitude={3} duration={5}>
          <div
            className="max-w-[320px] min-h-[400px] w-full mx-auto rounded-[28px] overflow-hidden p-8 text-center flex items-center transition-all duration-500"
            style={{
              backgroundColor: cardGlassBg,
              backdropFilter: 'blur(8px)',
              border: cardBorder,
              boxShadow: light
                ? '0 20px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)'
                : '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <CardContent key={selected} selected={selected} gradText={gradText} light={light} />
            </AnimatePresence>
          </div>
        </FloatingElement>

        {/* Swatch row */}
        <div className="flex justify-center gap-5 mt-12">
          {THEME_NAMES.map((name) => (
            <ThemeSwatch
              key={name}
              name={name}
              isSelected={selected === name}
              gradText={gradText}
              onClick={() => handleSelect(name)}
              reduced={false}
            />
          ))}
        </div>

        {/* Active theme name */}
        <AnimatePresence mode="wait">
          <motion.p
            key={selected}
            className="text-sm mt-4 text-center font-medium"
            style={{ color: gradText, opacity: 0.8 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
          >
            {THEME_LABELS[selected]}
          </motion.p>
        </AnimatePresence>

        {/* Tagline */}
        <motion.p
          className="text-sm opacity-70 mt-8 text-center"
          style={{ color: gradText }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.7 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Their invitation. Your brand.
        </motion.p>
      </div>
    </motion.section>
  );
}
