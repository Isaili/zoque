import { Navbar, HeroSection, FooterBanner, AboutSection, DestinationsSection } from '@/features/home';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-slate-950">
      <Navbar />
      <HeroSection />
      <FooterBanner />
      <AboutSection />
      <DestinationsSection />

    </main>
  );
}