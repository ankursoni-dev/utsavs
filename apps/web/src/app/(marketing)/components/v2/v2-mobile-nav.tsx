'use client';

/**
 * V2MobileNav — hamburger + full-screen overlay for mobile viewports.
 *
 * Accessibility note: focus trap is OUT OF SCOPE for this marketing milestone.
 * The overlay is dismiss-able via the close button and link clicks. Revisit
 * for production accessibility audit.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface V2MobileNavProps {
  /** Controls hamburger icon colour: white when not scrolled, charcoal when scrolled. */
  scrolled: boolean;
}

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Themes', href: '#themes' },
  { label: 'Get Early Access', href: '#waitlist' },
];

export function V2MobileNav({ scrolled }: V2MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  // useSyncExternalStore with a no-op subscribe is the lint-compliant way to detect
  // client vs server: getServerSnapshot returns false (SSR), getSnapshot returns true (client).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const prefersReducedMotion = useReducedMotion();

  // Body scroll lock when overlay is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hamburgerColor = scrolled ? 'var(--color-charcoal)' : '#ffffff';

  // Overlay slide animation — skipped when reduced motion is preferred.
  const overlayVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { x: '100%', opacity: 1 }, visible: { x: 0, opacity: 1 } };

  const overlayTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.4, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] };

  const linkVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0 } }),
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: 0.2 + i * 0.1,
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          },
        }),
      };

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-overlay"
          className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0A]"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={overlayTransition}
        >
          {/* Close button */}
          <div className="flex justify-end px-6 pt-5">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Centered nav links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-10">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setIsOpen(false)}
                className="text-white text-3xl font-display tracking-tight hover:opacity-70 transition-opacity duration-200 cursor-pointer"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      {/* Hamburger button — stays inline in the header */}
      <button
        type="button"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex flex-col justify-center items-center w-10 h-10 gap-[6px] cursor-pointer"
      >
        <span
          className="block w-6 h-0.5 transition-all duration-300 origin-center"
          style={{
            backgroundColor: hamburgerColor,
            transform: isOpen ? 'translateY(8px) rotate(45deg)' : 'none',
          }}
        />
        <span
          className="block w-6 h-0.5 transition-all duration-300"
          style={{
            backgroundColor: hamburgerColor,
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          className="block w-6 h-0.5 transition-all duration-300 origin-center"
          style={{
            backgroundColor: hamburgerColor,
            transform: isOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
          }}
        />
      </button>

      {/* Full-screen overlay — portaled to document.body to escape header stacking context */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
