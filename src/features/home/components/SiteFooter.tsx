import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const WHATSAPP_URL = 'https://wa.me/9611077541';

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#destinos', label: 'Destinos' },
  { href: '#horarios', label: 'Horarios' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#cobertura', label: 'Cobertura' },
  { href: '#promociones', label: 'Promociones' },
  { href: '#preguntas', label: 'Preguntas' },
];

export function SiteFooter() {
  return (
    <footer id="contacto" aria-labelledby="contacto-titulo" className="relative w-full overflow-hidden bg-zoque-900 text-white">
      {/* Llamado a la acción con foto de fondo */}
      <div className="relative isolate overflow-hidden">
        <Image src="/images/inicio/hero-bg.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover object-[70%_center]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-zoque-900 via-zoque-900/85 to-zoque-900/40" />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 sm:px-10 sm:py-24 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">Contacto</p>
            <h2 id="contacto-titulo" className="mt-4 font-serif text-4xl italic leading-[1.02] tracking-[-0.03em] text-cream text-balance sm:text-6xl">
              ¿Listo para tu <span className="text-gold">próximo viaje?</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-emerald-50/70">
              Escríbenos por WhatsApp para reservar tu lugar o resolver cualquier duda.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-bold uppercase tracking-wider text-zoque-900 shadow-[0_12px_40px_-10px_rgba(200,157,85,0.7)] transition-all hover:-translate-y-0.5 hover:bg-amber-300 md:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Reservar por WhatsApp
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Pie */}
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl font-semibold uppercase tracking-widest text-white">Zoque</p>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">Auto Transportes</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-emerald-50/60">
              Conectamos destinos, acercamos historias. Orgullosamente Zoques, llevándote siempre a tu destino.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Navegación</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-emerald-50/75 transition-colors hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Contacto</p>
            <ul className="mt-4 space-y-3 text-sm text-emerald-50/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                Copainalá, Chiapas
              </li>
              <li>
                <Link
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors hover:text-gold"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  WhatsApp: 961 107 7541
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                Corridas desde las 4:00 AM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-4 py-6 text-xs text-white/45 sm:flex-row sm:px-10">
            <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
              <p>© {new Date().getFullYear()} Auto Transportes Zoque. Todos los derechos reservados.</p>
              <p>
                Desarrollado por{' '}
                <a
                  href="https://isaili.github.io/CODEX_SOFTVA/"
                  target="_blank"
                  rel="noopener noreferrer"
                  translate="no"
                  className="font-semibold text-gold underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                >
                  Softvana
                </a>
              </p>
            </div>
            <Link
              href="#inicio"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 uppercase tracking-widest text-white/70 transition-colors hover:border-gold hover:text-gold"
            >
              Volver arriba
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
