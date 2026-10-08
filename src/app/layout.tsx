import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const THEME_SCRIPT = `try{if(localStorage.getItem('zoque-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export const metadata: Metadata = {
  title: 'Auto Transportes Zoque',
  description: 'Conectamos destinos, acercamos historias.',
};

export const viewport: Viewport = {
  themeColor: '#06180F',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Aplica el modo oscuro guardado antes de pintar, para que la página no parpadee en claro */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
