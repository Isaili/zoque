import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-sans bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}