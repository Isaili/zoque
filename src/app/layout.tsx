import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

// Fuente para el texto general
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Fuente elegante/serif para los títulos de la marca
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Auto Transportes Zoque | Conectamos Destinos',
  description: 'Servicio de transporte de pasajeros en Copainalá, Chiapas. Viaja seguro, viaja con confianza.',
  keywords: ['Transporte', 'Copainalá', 'Chiapas', 'Autobuses', 'Zoque', 'Viajes'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}