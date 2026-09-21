import type { Metadata } from 'next';
import { Roboto, Cinzel_Decorative, Merriweather } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['100', '300', '400', '500', '700', '900'],
});

// Fuente Cinzel Decorative para títulos principales y logos
const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700', '900'],
});

// Fuente Merriweather para el título del hero
const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
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
        className={`${roboto.variable} ${cinzelDecorative.variable} ${merriweather.variable} font-sans bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}