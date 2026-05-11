import type { ReactNode } from 'react';
import { BrandProvider } from '@/components/providers/brand-provider';
import { BrandSwitcher } from '@/components/providers/brand-switcher';
import { V2Header } from './components/v2/v2-header';
import { V2Footer } from './components/v2/v2-footer';

export default function MarketingV2Layout({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <div className="min-h-screen bg-bg text-text">
        <V2Header />
        <main>{children}</main>
        <V2Footer />
      </div>
      <BrandSwitcher />
    </BrandProvider>
  );
}
