import { Button } from '@/components/ui/button';
import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestEventPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Eyebrow>Guest event · {slug}</Eyebrow>
      <Display size="2xl">An invitation awaits</Display>
      <p className="max-w-xl text-base" style={{ color: 'var(--theme-text)', opacity: 0.7 }}>
        This is the public guest page placeholder. The active theme renders via
        CSS variables on the <code className="font-mono text-sm">ThemeProvider</code>{' '}
        wrapper.
      </p>
      <Button variant="serif" size="lg">
        RSVP
      </Button>
    </main>
  );
}
