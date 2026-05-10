import type { ReactNode } from 'react';
import { BrandProvider } from './components/brand-provider';
import { BrandSwitcher } from './components/brand-switcher';
import { MarketingHeader } from './components/marketing-header';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <div className="min-h-screen bg-bg text-text scroll-smooth">
        <MarketingHeader />

        <main>{children}</main>

        <footer className="border-t border-border bg-bg py-12">
          <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-display text-xl text-charcoal">utsavs</span>
              <span className="text-text-muted text-sm">
                The command center for Indian weddings.
              </span>
            </div>
            <p className="text-sm text-text-subtle">© 2026 Utsavs · Built in India</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text transition-colors">
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
