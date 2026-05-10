import type { ReactNode } from "react";
import { MobileNav } from "./components/mobile-nav";
import { BrandProvider } from "./components/brand-provider";
import { BrandSwitcher } from "./components/brand-switcher";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <div className="min-h-screen bg-bg text-text scroll-smooth">
        <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              className="font-display text-2xl tracking-tight text-charcoal"
            >
              utsavs
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
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
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <a
                href="#waitlist"
                className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                Get Early Access
              </a>
            </div>

            {/* Mobile nav */}
            <MobileNav />
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-border bg-bg py-12">
          <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-display text-xl text-charcoal">utsavs</span>
              <span className="text-text-muted text-sm">
                The command center for Indian weddings.
              </span>
            </div>
            <p className="text-sm text-text-subtle">
              © 2026 Utsavs · Built in India
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </footer>
        <BrandSwitcher />
      </div>
    </BrandProvider>
  );
}
