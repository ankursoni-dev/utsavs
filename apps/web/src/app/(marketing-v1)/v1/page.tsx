import { Display } from '@/components/ui/display';
import { Eyebrow } from '@/components/ui/eyebrow';
import { WaitlistForm } from './components/waitlist-form';
import { StepTimeline } from './components/step-timeline';
import { ThemeCarousel } from './components/theme-carousel';
import { TickerStrip } from './components/ticker-strip';
import { CountUpStat } from './components/count-up-stat';
import { GoldenParticles } from './components/golden-particles';
import { FadeInSection } from './components/fade-in-section';

export default function MarketingHome() {
  return (
    <>
      {/* ── Section 1: Hero ──────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--brand-primary) 6%, transparent) 0%, transparent 60%)',
        }}
      >
        <Eyebrow>For wedding organizers &amp; host families</Eyebrow>
        <Display size="2xl" as="h1" className="mt-4 max-w-4xl mx-auto">
          From chaos to command.
        </Display>
        <p className="mt-6 text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
          One command center for guests, budgets, vendors, and shagun.{' '}
          <strong className="text-text font-medium">
            Built for the families and organizers
          </strong>{' '}
          who actually run Indian weddings.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#waitlist"
            className="inline-flex items-center px-8 py-3 text-white font-medium rounded-[var(--radius-md)] text-base shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            Get Early Access
          </a>
          <a
            href="#how-it-works"
            className="btn-outline-hover inline-flex items-center px-8 py-3 border font-medium rounded-[var(--radius-md)] text-base text-charcoal hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            style={{
              borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
            }}
          >
            See How It Works →
          </a>
        </div>
        <div className="mt-16 w-full">
          <TickerStrip />
        </div>
      </section>

      {/* ── Section 2: How It Works ───────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-6">
          <FadeInSection className="text-center mb-16">
            <Eyebrow>How It Works</Eyebrow>
            <Display size="lg" as="h2" className="mt-4 max-w-2xl mx-auto">
              Four things every wedding needs. One place to run them.
            </Display>
          </FadeInSection>
          <StepTimeline />
        </div>
      </section>

      {/* ── Section 3: Organizer Advantage ───────────────────────── */}
      <section className="relative py-20 md:py-32 bg-charcoal text-white overflow-hidden">
        <GoldenParticles />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeInSection>
            <Eyebrow className="text-champagne/60">Built for professionals</Eyebrow>
            <Display size="lg" as="h2" className="mt-4 max-w-3xl mx-auto text-white">
              One platform. Every wedding.
            </Display>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="mt-6 text-champagne/80 max-w-2xl mx-auto text-lg">
              Wedding organizers run 20-50 events a year. Utsavs gives you a command center that
              carries over — templates, vendor history, budget benchmarks — so each wedding starts
              ahead, not from scratch.
            </p>
          </FadeInSection>
          <FadeInSection delay={400}>
            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0 md:divide-x md:divide-white/20">
              <div className="px-8 md:px-12">
                <CountUpStat
                  value="20-50"
                  label="weddings/year for a typical organizer"
                  className="text-champagne"
                />
              </div>
              <div className="px-8 md:px-12">
                <CountUpStat
                  value="6-15"
                  label="vendors per wedding to coordinate"
                  className="text-champagne"
                />
              </div>
              <div className="px-8 md:px-12">
                <CountUpStat
                  value="₹15-80L"
                  label="average budget range to track"
                  className="text-champagne"
                />
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Section 4: Theme Showcase ─────────────────────────────── */}
      <section id="themes" className="py-20 md:py-32 bg-bg-alt">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInSection className="text-center mb-12">
            <Eyebrow>6 Curated Themes</Eyebrow>
            <Display size="lg" as="h2" className="mt-4 max-w-2xl mx-auto">
              Every wedding has its own look.
            </Display>
          </FadeInSection>
          <ThemeCarousel />
        </div>
      </section>

      {/* ── Section 5: Building in Public ────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <FadeInSection>
            <Eyebrow>Early Access</Eyebrow>
            <Display size="lg" as="h2" className="mt-4 max-w-2xl mx-auto">
              We&apos;re building in public.
            </Display>
          </FadeInSection>
          <div
            className="mt-6 max-w-md mx-auto text-left space-y-4 border-l-2 pl-6"
            style={{
              borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)',
            }}
          >
            <p className="text-text-muted">
              Utsavs is in active development. We&apos;re working with a{' '}
              <strong className="text-text font-medium">
                small group of wedding organizers in Jaipur and Delhi
              </strong>{' '}
              to build exactly what they need. No fake metrics. No vaporware. Just a product shaped
              by real feedback.
            </p>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald flex items-center justify-center text-white text-xs">
                &#10003;
              </span>
              <span className="text-sm text-text">Auth &amp; guest management — shipped</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald flex items-center justify-center text-white text-xs">
                &#10003;
              </span>
              <span className="text-sm text-text">6 curated themes — shipped</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-champagne flex items-center justify-center text-white text-xs">
                &#9680;
              </span>
              <span className="text-sm text-text">Budget &amp; shagun tracking — in progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border-2 border-border" />
              <span className="text-sm text-text-muted">Vendor coordination — coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Waitlist CTA ───────────────────────────────── */}
      <section id="waitlist" className="py-16 md:py-24 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInSection>
            <Eyebrow>Get Early Access</Eyebrow>
            <Display size="xl" as="h2" className="mt-4 max-w-2xl mx-auto">
              Join the organizers who plan ahead.
            </Display>
          </FadeInSection>
          <p className="mt-4 text-text-muted max-w-lg mx-auto">
            Leave your number. We&apos;ll reach out when your dashboard is ready.
          </p>
          <WaitlistForm />
          <p className="mt-4 text-sm text-text-subtle">
            No spam. No newsletters. Just your invite.
          </p>
        </div>
      </section>
    </>
  );
}
