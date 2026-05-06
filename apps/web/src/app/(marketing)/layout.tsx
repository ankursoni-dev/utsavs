import type { ReactNode } from 'react';

/**
 * Marketing shell — landing, waitlist, pricing.
 * No nav chrome yet (real header lands in Prompt 4).
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-bg text-text">{children}</div>;
}
