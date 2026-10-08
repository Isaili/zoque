import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Repeat, Sparkles } from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';
import { StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const WHATSAPP_PROMOS = `https://wa.me/9611077541?text=${encodeURIComponent('Hola, quiero información sobre las promociones vigentes.')}`;

const cardBase =
  'group relative isolate flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(6,24,15,0.55)] sm:p-8';

/* Foto de fondo con acercamiento suave al pasar el mouse */
function CardPhoto({ src, alt, position = 'center' }: { src: string; alt: string; position?: string }) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="-z-20 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        style={{ objectPosition: position }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-zoque-900 via-zoque-900/60 to-zoque-900/10" />
    </>
  );
}

export function PromotionsSection() {
  return (
    <section id="promociones" aria-labelledby="promociones-titulo" className="w-full bg-sand py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeading
          id="promociones-titulo"
          eyebrow="Promociones"
          title={
            <>
              Viaja más, <span className="text-gold-dark">paga menos</span>
            </>
          }
          description="Descuentos pensados para quienes viajan con nosotros todos los días."
        />

        <StaggerList className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-5" stagger={0.12}>
          {/* Estudiantes y maestros */}
          <StaggerItem className="md:col-span-2 lg:col-span-1">
            <article className={`${cardBase} bg-zoque-700 text-white`}>
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(200,157,85,0.35)_0%,transparent_45%),radial-gradient(circle_at_0%_100%,rgba(31,107,66,0.8)_0%,transparent_55%)]"
              />
              <GraduationCap
                aria-hidden
                strokeWidth={1}
                className="absolute -bottom-8 -right-6 -z-10 h-56 w-56 text-white/[0.07] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105"
              />
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/30">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                Estudiantes y maestros
              </span>
              <p className="mt-auto pt-10 font-serif italic leading-none text-cream">
                <span className="text-[6.5rem] sm:text-[8rem]">
                  <CountUp value={20} />
                </span>
                <span className="text-6xl text-gold sm:text-7xl">%</span>
              </p>
              <p className="mt-1 text-lg font-semibold uppercase tracking-widest text-gold">de descuento</p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-emerald-50/75">
                Presenta tu credencial y obtén el descuento.
              </p>
            </article>
          </StaggerItem>

          {/* Viajes redondos */}
          <StaggerItem>
            <article className={`${cardBase} text-white`}>
              <CardPhoto src="/images/promociones/image.jpg" alt="Autobús de Auto Transportes Zoque en carretera" position="65% center" />
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                <Repeat className="h-3.5 w-3.5" aria-hidden />
                Viajes redondos
              </span>
              <div className="mt-auto pt-24">
                <p className="font-serif italic leading-none text-cream">
                  <span className="text-7xl sm:text-8xl">
                    <CountUp value={15} />
                  </span>
                  <span className="text-5xl text-gold">%</span>
                </p>
                <p className="mt-1 font-semibold uppercase tracking-widest text-gold">de descuento</p>
                <p className="mt-3 text-sm text-emerald-50/80">Aplica en rutas seleccionadas.</p>
              </div>
            </article>
          </StaggerItem>

          {/* Temporada */}
          <StaggerItem>
            <article className={`${cardBase} text-white`}>
              <CardPhoto src="/images/promociones/cop1.png" alt="Vista de Copainalá, Chiapas" />
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                De temporada
              </span>
              <div className="mt-auto pt-24">
                <h3 className="font-serif text-4xl italic leading-[1.05] text-cream">Promociones de temporada</h3>
                <p className="mt-3 text-sm text-emerald-50/80">¡Aprovecha nuestras promociones!</p>
                <Link
                  href={WHATSAPP_PROMOS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-zoque-900 transition-all hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/20"
                >
                  Ver promociones
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </article>
          </StaggerItem>
        </StaggerList>
      </div>
    </section>
  );
}
