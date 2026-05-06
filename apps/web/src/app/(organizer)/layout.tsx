import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

/**
 * Organizer shell — sidebar + topbar will land in Prompt 4.
 * For now, a placeholder frame so route-group token wiring is verifiable.
 */
export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-alt text-text">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 px-6 py-4 backdrop-blur">
        <Eyebrow>Organizer · command center</Eyebrow>
      </header>
      <div className="px-6 py-10">{children}</div>
    </div>
  );
}
