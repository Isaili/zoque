import Link from 'next/link';
import { MapPin, Bus, MessageCircle } from 'lucide-react';
import { ValueProps } from './ValueProps';
import { CardLocation } from './CardLocation';

export function HeroSection() {
  return (
    <section className="relative isolate w-full min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 lg:px-16 overflow-hidden">
      {/* Fondo con imagen y gradiente suave */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url('/images/image.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-950/20 to-transparent" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-xl space-y-6 text-white my-auto">
        {/* Título Principal con Merriweather Regular Italic */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal italic font-merriweather tracking-wide uppercase leading-[1.12]">
          <span className="block text-[#F5F2EB]">
            CONECTAMOS
          </span>
          <span className="block text-[#C89D55]">
            DESTINOS,
          </span>
          <span className="block text-[#F5F2EB]">
            ACERCAMOS
          </span>
          <span className="block text-[#C89D55]">
            HISTORIAS.
          </span>
        </h2>

        {/* Subtítulo con ubicación */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-semibold text-[0.9625rem] tracking-widest uppercase">
            <MapPin className="w-[1.1rem] h-[1.1rem]" />
            <span>COPAINALÁ, CHIAPAS</span>
          </div>
          <p className="text-white text-base italic font-sans font-normal">
            Orgullosamente Zoques, llevándote <br />
            siempre a tu destino.
          </p>
        </div>

        {/* Propuestas de Valor */}
        <ValueProps />

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href="#destinos"
            className="flex items-center gap-2 bg-[#C89D55] hover:bg-[#b08745] text-slate-950 font-bold px-6 py-3 rounded-full text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-amber-400/20"
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