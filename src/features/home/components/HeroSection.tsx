import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { ValueProps } from './ValueProps';
import { CardLocation } from './CardLocation';

export function HeroSection() {
  return (
    <section className="relative isolate w-full min-h-screen flex flex-col justify-between pt-24 pb-10 px-4 sm:px-6 md:px-10 lg:px-16 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-950/20 to-transparent" />
      </div>

      <div className="max-w-full sm:max-w-xl space-y-5 sm:space-y-6 text-white my-auto pt-10 sm:pt-12 lg:pt-0">
        <h2 className="text-[2.25rem] sm:text-4xl md:text-5xl lg:text-6xl font-normal italic font-merriweather tracking-wide uppercase leading-[1.08] sm:leading-[1.12]">
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

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-semibold text-[0.75rem] sm:text-[0.9rem] tracking-widest uppercase">
            <MapPin className="w-[1rem] h-[1rem] sm:w-[1.1rem] sm:h-[1.1rem] text-[#C89D55]" />
            <span>COPAINALÁ, CHIAPAS</span>
          </div>
          <p className="text-white text-sm sm:text-base italic font-sans font-normal">
            Orgullosamente Zoques, llevándote <br className="hidden sm:block" />
            siempre a tu destino.
          </p>
        </div>

        <ValueProps />

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
          <Link
            href="#destinos"
            className="flex items-center justify-center gap-2 bg-[#C89D55] hover:bg-[#b08745] text-slate-950 font-bold px-5 py-3 rounded-full text-[0.7rem] sm:text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-amber-400/20"
          >
            <svg 
              className="w-4 h-4 fill-slate-950" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            Ver Destinos
          </Link>

          <Link
            href="https://wa.me/9611077541"
            target="_blank"
            className="flex items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900 text-white font-semibold px-5 py-3 rounded-full text-[0.7rem] sm:text-xs tracking-wider uppercase border border-amber-200/30 backdrop-blur-xs transition-all"
          >
            <svg 
              className="w-4 h-4 fill-emerald-400" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.887-9.885 9.887m0-18.178c-5.385 0-9.766 4.382-9.769 9.768a9.71 9.71 0 001.372 5.011l.135.215-.591 2.159 2.209-.58.208.123a9.74 9.74 0 004.819 1.272h.004c5.385 0 9.768-4.382 9.77-9.769 0-2.607-1.016-5.059-2.862-6.906A9.704 9.704 0 0012.051 3.607" />
            </svg>
            Escríbenos
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 right-4 sm:bottom-16 sm:right-6 lg:right-16 z-10">
        <CardLocation />
      </div>
    </section>
  );
}