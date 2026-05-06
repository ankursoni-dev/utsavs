import type { ReactNode } from 'react';
import { Display } from '@/components/ui/display';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="hidden bg-charcoal text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Display size="md" className="text-white">
          Utsavs
        </Display>
        <p className="max-w-sm text-sm text-white/60">
          Your wedding, orchestrated. Editorial · jewel-toned · end-to-end.
        </p>
      </aside>
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
