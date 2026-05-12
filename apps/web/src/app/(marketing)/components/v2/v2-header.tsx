'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2MobileNav } from './v2-mobile-nav';
import { handleAnchorClick } from './motion/scroll-to';

/**
 * V2Header — sticky full-width header with theme-adaptive glass.
 *
 * Behavior:
 * - Sticky at top, takes layout space (content does not slide under it).
 * - Transparent when over the hero / dark sections.
 * - Frosted glass background once scrolled, color-adapted to the current section
 *   via IntersectionObserver on [data-nav-theme].
 */
export function V2Header() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // ── Section theme observer (dark vs light) ───────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme]');
      if (sections.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (
                !best ||
                Math.abs(entry.boundingClientRect.top) <
                  Math.abs(best.boundingClientRect.top)
              ) {
                best = entry;
              }
            }
          }
          if (best) {
            const theme = (best.target as HTMLElement).dataset.navTheme;
            setIsDark(theme === 'dark');
          }
        },
        {
          rootMargin: '0px 0px -88% 0px',
          threshold: 0,
        },
      );

      sections.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // ── Scroll state: solid bg + border once past ~50px ──────────────────────
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isDark ? '#FFFFFF' : 'var(--color-charcoal)';

  // Background opacity: 0 when over hero (transparent), full when scrolled
  const bgColor = scrolled
    ? isDark
      ? 'rgba(10, 10, 10, 0.72)'
      : 'rgba(247, 245, 242, 0.78)'
    : 'transparent';

  const borderColor = scrolled
    ? isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)'
    : 'transparent';

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300 ease-out"
      style={{
        backgroundColor: bgColor,
        backdropFilter: scrolled ? 'blur(16px) saturate(1.5)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.5)' : 'none',
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: scrolled
          ? isDark
            ? '0 1px 12px rgba(0,0,0,0.25)'
            : '0 1px 12px rgba(0,0,0,0.04)'
          : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight transition-colors duration-300"
          style={{ color: textColor }}
        >
          utsavs
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm hover:opacity-70 transition-all duration-300"
            style={{ color: textColor }}
            onClick={(e) => handleAnchorClick(e, 'how-it-works')}
          >
            How It Works
          </a>
          <a
            href="#waitlist"
            className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            onClick={(e) => handleAnchorClick(e, 'waitlist')}
          >
            Get Early Access
          </a>
        </div>

        <V2MobileNav scrolled={!isDark} />
      </div>
    </header>
  );
}
