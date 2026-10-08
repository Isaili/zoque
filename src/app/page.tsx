import { MotionConfig } from 'framer-motion';
import {
  Navbar,
  HeroSection,
  FooterBanner,
  AboutSection,
  DestinationsSection,
  SchedulesSection,
  WhyUsSection,
  FleetSection,
  HowToBuySection,
  TestimonialsSection,
  CoverageSection,
  PromotionsSection,
  SiteFooter,
} from '@/features/home';

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main className="flex min-h-screen flex-col bg-slate-950">
        <HeroSection />
        <FooterBanner />
        <AboutSection />
        <DestinationsSection />
        <SchedulesSection />
        <WhyUsSection />
        <FleetSection />
        <HowToBuySection />
        <TestimonialsSection />
        <CoverageSection />
        <PromotionsSection />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}
