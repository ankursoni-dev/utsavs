import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Card, CardBody } from '@/components/ui/card';
import { THEMES, THEME_NAMES } from '@/lib/themes';
import { WaitlistForm } from './components/waitlist-form';
import { ScrollIndicator } from './components/scroll-indicator';

function getThemeVibe(name: string): string {
  const vibes: Record<string, string> = {
    'royal-ivory': 'Warm, classic, gold & ivory',
    'modern-emerald': 'Fresh, botanical, deep green',
    'midnight-sangeet': 'Dark, cinematic, party-mode',
    'minimal-luxury': 'Monochrome, editorial',
    'floral-sunset': 'Soft, romantic, dreamy',
    'temple-classic': 'Traditional, temple aesthetic',
  };
  return vibes[name] ?? '';
}

const PROBLEM_CARDS = [
  {
    emoji: '📱',
    title: 'Communication Chaos',
    description: 'Guest lists in WhatsApp, RSVPs on paper, diet preferences lost in DMs.',
  },
  {
    emoji: '📊',
    title: 'Budget Blindspots',
    description: 'Vendor payments tracked in notes apps. No one knows the real number.',
  },
  {
    emoji: '🤝',
    title: 'Vendor Anxiety',
    description: 'Six vendors, six WhatsApp threads, zero visibility on who confirmed what.',
  },
];

const FEATURE_CARDS = [
  {
    accent: 'var(--color-emerald)',
    title: 'Guest Management',
    description:
      'Smart guest lists with RSVP tracking, dietary filters, and side management. Import from contacts or CSV.',
  },
  {
    accent: 'var(--color-champagne)',
    title: 'Budget & Shagun',
    description:
      'Real-time budget tracking with category breakdowns. Razorpay-powered shagun collection with instant settlement.',
  },
  {
    accent: 'var(--color-charcoal)',
    title: 'Vendor Coordination',
    description:
      "Deliverable tracking, risk scoring, and payment milestones. Know who's confirmed and who's at risk.",
  },
  {
    accent: 'var(--color-maroon)',
    title: 'Event Timeline',
    description:
      'Live day coordination with a shareable timeline. Three states: planning → live → post-wedding.',
  },
  {
    accent: 'var(--color-emerald)',
    title: 'Multi-Host Collaboration',
    description: 'Organizer and host roles with granular permissions. Both families, one platform.',
  },
  {
    accent: 'var(--color-champagne)',
    title: 'Digital Invitations',
    description:
      'Themed guest pages with RSVP, schedule, gallery, and shagun — all from a shareable link.',
  },
];

export default function MarketingHome() {
  return (
    <>
      {/* ── Section 1: Hero ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Eyebrow>India's first event operating system</Eyebrow>
        <Display size="2xl" as="h1" className="mt-4 max-w-3xl mx-auto">
          Your Wedding, Orchestrated.
        </Display>
        <p className="mt-6 text-lg text-text-muted max-w-xl mx-auto">
          From save-the-date to shagun reconciliation — Utsavs is the command center for modern
          Indian weddings.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#waitlist"
            className="inline-flex items-center px-8 py-3 bg-charcoal text-white font-medium rounded-[var(--radius-md)] hover:bg-charcoal/90 transition-colors text-base"
          >
            Join the Waitlist
          </a>
          <a
            href="#features"
            className="inline-flex items-center px-8 py-3 border border-charcoal text-charcoal font-medium rounded-[var(--radius-md)] hover:bg-hover transition-colors text-base"
          >
            See How It Works
          </a>
        </div>
        <ScrollIndicator />
      </section>

      {/* ── Section 2: Problem Statement ─────────────────────────── */}
      <section id="problem" className="py-20 md:py-32 bg-bg-alt">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow>The Problem</Eyebrow>
          <Display size="lg" as="h2" className="mt-4 max-w-2xl">
            Indian weddings are run on WhatsApp groups and spreadsheets.
          </Display>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {PROBLEM_CARDS.map((card) => (
              <Card key={card.title} hover>
                <CardBody>
                  <p className="text-4xl mb-4">{card.emoji}</p>
                  <Display size="sm" as="h3" className="mb-3">
                    {card.title}
                  </Display>
                  <p className="text-text-muted text-sm leading-relaxed">{card.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Solution / Features ───────────────────────── */}
      <section id="features" className="py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow>The Platform</Eyebrow>
          <Display size="lg" as="h2" className="mt-4 max-w-2xl">
            One platform for every moving part.
          </Display>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {FEATURE_CARDS.map((card) => (
              <Card key={card.title} accent={card.accent}>
                <CardBody>
                  <Display size="sm" as="h3" className="mb-3">
                    {card.title}
                  </Display>
                  <p className="text-text-muted text-sm leading-relaxed">{card.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Theme Showcase ─────────────────────────────── */}
      <section id="themes" className="py-20 md:py-32 bg-bg-alt overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow>6 Curated Themes</Eyebrow>
          <Display size="lg" as="h2" className="mt-4 max-w-2xl">
            Every wedding has its own aesthetic.
          </Display>
          <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible mt-12">
            {THEME_NAMES.map((name) => {
              const tokens = THEMES[name];
              return (
                <div
                  key={name}
                  className="flex-shrink-0 w-64 md:w-auto h-48 md:h-56 rounded-[var(--radius-xl)] relative overflow-hidden"
                  style={{ background: tokens.grad }}
                >
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-white font-display text-lg capitalize">
                      {name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-white/70 text-sm mt-1">{getThemeVibe(name)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Stats Row ──────────────────────────────────── */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 text-center">
            <div>
              <Display size="lg">500+</Display>
              <Eyebrow className="mt-2">Waitlist Signups</Eyebrow>
            </div>
            <div>
              <Display size="lg">6</Display>
              <Eyebrow className="mt-2">Curated Themes</Eyebrow>
            </div>
            <div>
              <Display size="lg">∞</Display>
              <Eyebrow className="mt-2">Memories Made</Eyebrow>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Waitlist CTA ───────────────────────────────── */}
      <section id="waitlist" className="py-20 md:py-32 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow>Early Access</Eyebrow>
          <Display size="xl" as="h2" className="mt-4 max-w-2xl mx-auto">
            Be the first to experience Utsavs.
          </Display>
          <WaitlistForm />
          <p className="mt-4 text-sm text-text-subtle">
            We'll notify you when we launch. No spam, ever.
          </p>
        </div>
      </section>
    </>
  );
}
