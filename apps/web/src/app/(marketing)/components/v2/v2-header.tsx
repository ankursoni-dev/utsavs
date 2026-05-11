'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { V2MobileNav } from './v2-mobile-nav';

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  e.preventDefault();
  const target = document.getElementById(hash);
  if (!target) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = target.getBoundingClientRect();
  const NAVBAR_OFFSET = 64; // matches h-16 on the navbar container
  const targetTop = window.scrollY + rect.top - NAVBAR_OFFSET;
  window.scrollTo({ top: targetTop, behavior: prefersReduced ? 'auto' : 'smooth' });
  window.history.replaceState(null, '', `#${hash}`);
}

/**
 * V2Header — Dynamic Island–style floating pill navbar with scroll-expand.
 *
 * Behavior:
 * - Starts as a compact centered pill over the hero
 * - Once the user scrolls past the hero heading (~500px), the pill expands
 *   horizontally toward the edges so logo/buttons don't cover section content
 * - Detects dark/light sections via IntersectionObserver on [data-nav-theme]
 * - Smoothly transitions bg + text color to match current section
 * - "Themes" nav link removed; only "How It Works" remains (shorter)
 */
export function V2Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [isDark, setIsDark] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // ── Section theme observer ────────────────────────────────────────────────
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

  // ── Scroll-expand: expand when past hero heading ──────────────────────────
  useEffect(() => {
    function handleScroll() {
      // Expand once scrolled past ~400px (roughly past the hero heading)
      setExpanded(window.scrollY > 400);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isDark ? '#FFFFFF' : 'var(--color-charcoal)';

  return (
    <header
      ref={headerRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out"
      style={{
        width: expanded ? 'calc(100% - 2rem)' : 'min(calc(100% - 2rem), 600px)',
        maxWidth: expanded ? '72rem' : '38rem',
        borderRadius: '9999px',
        backgroundColor: isDark
          ? 'rgba(10, 10, 10, 0.72)'
          : 'rgba(247, 245, 242, 0.68)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDark
          ? '0 4px 30px rgba(0,0,0,0.25)'
          : '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div className="h-12 flex items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-tight transition-colors duration-700"
          style={{ color: textColor }}
        >
          utsavs
        </Link>

        <div className="hidden md:flex items-center gap-6">
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
            className="inline-flex items-center px-4 py-1.5 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 cursor-pointer"
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
