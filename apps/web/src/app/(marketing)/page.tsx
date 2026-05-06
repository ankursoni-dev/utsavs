import { Button } from '@/components/ui/button';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

export default function MarketingHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6 py-24">
      <Eyebrow>Marketing · placeholder</Eyebrow>
      <Display size="2xl">Your Wedding, Orchestrated.</Display>
      <p className="max-w-xl text-base text-text-muted">
        A luxury event operating system. Editorial, jewel-toned, end-to-end. From
        the first save-the-date to the last shagun reconciliation.
      </p>
      <div className="flex gap-3 pt-2">
        <Button variant="primary" size="lg">
          Join the waitlist
        </Button>
        <Button variant="outline" size="lg">
          See a demo
        </Button>
      </div>
    </main>
  );
}
