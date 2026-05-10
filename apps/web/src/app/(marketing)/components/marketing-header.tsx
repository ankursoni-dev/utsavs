'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MobileNav } from './mobile-nav';

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(247, 245, 242, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <div
        className="mx-auto h-16 flex items-center justify-between transition-all duration-500"
        style={{
          maxWidth: scrolled ? '100%' : '72rem',
          paddingLeft: scrolled ? '2rem' : '1.5rem',
          paddingRight: scrolled ? '2rem' : '1.5rem',
        }}
      >
        <Link href="/" className="font-display text-2xl tracking-tight text-charcoal">
          utsavs
        </Link>

        {/* Right group: nav links + CTA together */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            How It Works
          </a>
          <a
            href="#themes"
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            Themes
          </a>
          <a
            href="#waitlist"
            className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-[var(--radius-md)] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Get Early Access
          </a>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
