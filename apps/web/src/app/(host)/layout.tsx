import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

/**
 * Host shell — simplified, emotional. Different from the organizer command center.
 */
export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-6 py-4">
        <Eyebrow>Host · your wedding</Eyebrow>
      </header>
      <div className="px-6 py-10">{children}</div>
    </div>
  );
}
