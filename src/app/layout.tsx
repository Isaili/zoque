import type { Metadata } from 'next';
import { Inter, Cinzel_Decorative } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Fuente Cinzel Decorative para títulos principales y logos
const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Auto Transportes Zoque',
  description: 'Conectamos destinos, acercamos historias.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${cinzelDecorative.variable} font-sans bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}