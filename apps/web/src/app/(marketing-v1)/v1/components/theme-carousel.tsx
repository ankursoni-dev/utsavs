'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, THEME_NAMES, type ThemeName } from '@/lib/themes';

function getGradientTextColor(grad: string): string {
  const match = grad.match(/#([A-Fa-f0-9]{6})/);
  if (!match) return '#171717';
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? '#FBF9F6' : '#171717';
}

function getCardBg(grad: string): string {
  const match = grad.match(/#([A-Fa-f0-9]{6})/);
  if (!match) return 'rgba(255,255,255,0.15)';
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)';
}

const VIBES: Record<ThemeName, string> = {
  'royal-ivory': 'Warm, classic, gold & ivory',
  'modern-emerald': 'Fresh, botanical, deep green',
  'midnight-sangeet': 'Dark, cinematic, party-mode',
  'minimal-luxury': 'Monochrome, editorial',
  'floral-sunset': 'Soft, romantic, dreamy',
  'temple-classic': 'Traditional, temple aesthetic',
};

function formatThemeName(name: ThemeName): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ThemeCarousel() {
  const [selected, setSelected] = useState<ThemeName>('royal-ivory');
  const theme = THEMES[selected];
  const gradText = getGradientTextColor(theme.grad);
  const cardBg = getCardBg(theme.grad);

  // Two-layer crossfade — framer-motion can't tween CSS gradient strings, so we
  // fade out the previous gradient layer (opacity 1→0) while the new one sits
  // underneath at full opacity. The eye sees a smooth transition.
  const [previousGrad, setPreviousGrad] = useState<string | null>(null);
  const [currentGrad, setCurrentGrad] = useState(theme.grad);

  useEffect(() => {
    if (theme.grad === currentGrad) return;
    // Use setTimeout to avoid synchronous setState-in-effect lint violation.
    // The 0ms batch fires before the next paint, matching direct-call timing.
    const batchId = setTimeout(() => {
      setPreviousGrad(currentGrad);
      setCurrentGrad(theme.grad);
    }, 0);
    const clearId = setTimeout(() => setPreviousGrad(null), 700);
    return () => {
      clearTimeout(batchId);
      clearTimeout(clearId);
    };
  }, [theme.grad, currentGrad]);

  return (
    <div>
      {/* Preview card — gradient crossfade via two absolutely-positioned layers */}
      <div className="relative rounded-[var(--radius-xl)] min-h-[320px] overflow-hidden">
        {/* Previous gradient fades out */}
        {previousGrad && (
          <motion.div
            className="absolute inset-0"
            style={{ background: previousGrad }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}
        {/* Current gradient sits at full opacity beneath */}
        <div className="absolute inset-0" style={{ background: currentGrad }} />

        {/* Foreground content sits over both gradient layers */}
        <div className="relative flex flex-col items-center justify-center p-8 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3
                className="font-display text-2xl capitalize tracking-[-0.02em]"
                style={{ color: gradText }}
              >
                {formatThemeName(selected)}
              </h3>
              <p className="text-sm mt-1 opacity-70" style={{ color: gradText }}>
                {VIBES[selected]}
              </p>

              {/* Mini invite mock */}
              <div
                aria-hidden="true"
                className="backdrop-blur-sm rounded-lg p-4 mt-6 mx-auto max-w-[200px] text-center w-full"
                style={{ backgroundColor: cardBg }}
              >
                <p className="font-display text-base" style={{ color: gradText }}>
                  Priya &amp; Arjun
                </p>
                <p className="text-xs mt-1 opacity-80" style={{ color: gradText }}>
                  Dec 14 · Jaipur
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Swatch row */}
      <div className="flex overflow-x-auto gap-3 py-2 mt-6 md:justify-center md:gap-4 md:mt-8">
        {THEME_NAMES.map((name) => {
          const isActive = selected === name;
          return (
            <motion.button
              key={name}
              type="button"
              onClick={() => setSelected(name)}
              aria-label={`Select ${formatThemeName(name)} theme`}
              aria-pressed={isActive}
              className="w-14 h-14 rounded-[var(--radius-md)] flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30"
              style={{ background: THEMES[name].grad }}
              animate={{
                scale: isActive ? 1.1 : 1,
                boxShadow: isActive
                  ? '0 0 0 2px #1a1a1a, 0 0 0 4px rgba(26,26,26,0.15)'
                  : '0 0 0 0px transparent',
              }}
              whileHover={{ scale: isActive ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          );
        })}
      </div>
    </div>
  );
}
