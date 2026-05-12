import { HeroCinematic } from './components/v2/hero-cinematic';
import { CommandDashboard } from './components/v2/command-dashboard';
import { SplitBudget } from './components/v2/split-budget';
import { SplitVendor } from './components/v2/split-vendor';
import { WhatsAppLayer } from './components/v2/whatsapp-layer';
import { GuestIntelligence } from './components/v2/guest-intelligence';
import { MemoriesGallery } from './components/v2/memories-gallery';
import { ThemeImmersive } from './components/v2/theme-immersive';
import { MetricsRibbon } from './components/v2/metrics-ribbon';
import { RelationshipLedger } from './components/v2/relationship-ledger';
import { BuildingPublic } from './components/v2/building-public';
import { CtaGravity } from './components/v2/cta-gravity';
import { AmbientLayer } from './components/v2/motion/ambient-layer';
import { SectionBridge } from './components/v2/motion/section-bridge';
export default function MarketingV2Page() {
  return (
    <>
      <AmbientLayer />
      <HeroCinematic />
      <SectionBridge fromColor="#0A0A0A" toColor="var(--color-bg)" height="220px" />
      <CommandDashboard />
      <SplitBudget />
      <SectionBridge fromColor="var(--color-bg)" toColor="#1A1A1A" height="200px" />
      <SplitVendor />
      <WhatsAppLayer />
      <SectionBridge fromColor="#1A1A1A" toColor="var(--color-bg-alt)" height="200px" />
      <GuestIntelligence />
      <MemoriesGallery />
      <ThemeImmersive />
      <MetricsRibbon />
      <RelationshipLedger />
      <SectionBridge fromColor="#0A0A0A" toColor="var(--color-bg)" height="200px" />
      <BuildingPublic />
      <SectionBridge fromColor="var(--color-bg)" toColor="#0A0A0A" height="200px" />
      <CtaGravity />
    </>
  );
}
