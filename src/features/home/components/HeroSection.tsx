import Link from 'next/link';
import { MapPin, Bus, MessageCircle } from 'lucide-react';
import { ValueProps } from './ValueProps';
import { CardLocation } from './CardLocation';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 lg:px-16 overflow-hidden">
      {/* Fondo con imagen y gradiente oscuro superpuesto */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-xl space-y-6 text-white my-auto">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight uppercase leading-[1.1] text-amber-50">
          Conectamos destinos, <br />
          <span className="text-amber-100">acercamos historias.</span>
        </h2>

        {/* Subtítulo con ubicación */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm tracking-wider uppercase">
            <MapPin className="w-4 h-4" />
            <span>COPAINALÁ, CHIAPAS</span>
          </div>
          <p className="text-amber-100/80 text-sm italic">
            Orgullosamente Zoques, llevándote siempre a tu destino.
          </p>
        </div>

        {/* Propuestas de Valor (Seguridad, Confort, Puntualidad) */}
        <ValueProps />

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href="#destinos"
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-amber-400/20"
          >
            <Bus className="w-4 h-4" />
            Ver Destinos
          </Link>

          <Link
            href="https://wa.me/1234567890"
            target="_blank"
            className="flex items-center gap-2 bg-slate-900/70 hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-full text-xs tracking-wider uppercase border border-amber-200/30 backdrop-blur-xs transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            Escríbenos
          </Link>
        </div>
      </div>

      {/* Tarjeta inferior derecha */}
      <div className="absolute bottom-16 right-6 lg:right-16 z-10">
        <CardLocation />
      </div>
    </section>
  );
}