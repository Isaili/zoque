import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, MessageCircle } from 'lucide-react';
import { WaveGridBackground } from '@/components/ui/wave-grid-background';

export const metadata: Metadata = {
  title: 'Página no encontrada | Auto Transportes Zoque',
};

const WHATSAPP_URL = 'https://wa.me/9611077541';

export default function NotFound() {
  return (
    <main className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-zoque-900">
      {/* Cubos verdes con ondas doradas que siguen al cursor */}
      <WaveGridBackground colorBase="#0D3B23" colorHigh="#C89D55" className="absolute inset-0">
        {/* Oscurece el centro para que el texto se lea sobre el movimiento */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,24,15,0.82)_0%,rgba(6,24,15,0.45)_45%,transparent_75%)]"
        />

        <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <Link
            href="/"
            translate="no"
            className="pointer-events-auto mb-10 flex items-center gap-3"
            aria-label="Auto Transportes Zoque, ir al inicio"
          >
            <svg className="h-10 w-10 text-gold" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" aria-hidden>
              <path d="M50 8 L92 50 L50 92 L8 50 Z" />
              <path d="M50 22 L78 50 L50 78 L22 50 Z" />
              <path d="M50 36 L64 50 L50 64 L36 50 Z" />
            </svg>
            <span className="flex flex-col text-left">
              <span className="font-serif text-2xl font-semibold uppercase tracking-widest text-white">Zoque</span>
              <span className="text-[0.625rem] uppercase tracking-[0.2em] text-gold">Auto Transportes</span>
            </span>
          </Link>

          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">Error 404</p>
          <h1 className="mt-4 font-serif text-[5.5rem] italic leading-none tracking-[-0.04em] text-cream sm:text-[8rem]">404</h1>
          <p className="mt-4 max-w-xl font-serif text-2xl italic leading-snug text-cream sm:text-3xl">
            Esta parada no está en <span className="text-gold">nuestra ruta</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-50/75 sm:text-base">
            La página que buscas no existe o cambió de lugar. Te llevamos de regreso a tu destino.
          </p>

          <div className="pointer-events-auto mt-10 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zoque-900 shadow-[0_12px_40px_-10px_rgba(200,157,85,0.7)] transition-all hover:-translate-y-0.5 hover:bg-amber-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
              Volver al inicio
            </Link>
            <Link
              href="/horarios"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-zoque-900/60 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:border-gold hover:text-gold"
            >
              <Clock className="h-4 w-4" aria-hidden />
              Ver horarios
            </Link>
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-zoque-900/60 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Escríbenos
            </Link>
          </div>
        </div>
      </WaveGridBackground>
    </main>
  );
}
