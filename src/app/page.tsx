import { Navbar, HeroSection, FooterBanner } from '@/features/home';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-slate-950">
      <Navbar />
      <HeroSection />
      <FooterBanner />
    </main>
  );
}