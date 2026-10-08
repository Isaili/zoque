'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Bus, ChevronDown, MapPin } from 'lucide-react';
import { ValueProps } from './ValueProps';
import { CardLocation } from './CardLocation';

const headlineLines = [
  { text: 'CONECTAMOS', color: 'text-[#F5F2EB]' },
  { text: 'DESTINOS,', color: 'text-[#C89D55]' },
  { text: 'ACERCAMOS', color: 'text-[#F5F2EB]' },
  { text: 'HISTORIAS.', color: 'text-[#C89D55]' },
];

const revealWords = 'Viaja seguro, viaja con confianza.'.split(' ');

const easeOut = [0.22, 1, 0.36, 1] as const;

/* Palabra que se ilumina conforme avanza el scroll */
function RevealWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [18, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  // Suaviza el scroll para que el movimiento se sienta "con peso"
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Fondo: zoom lento y oscurecimiento
  const bgScale = useTransform(progress, [0, 1], [1.05, 1.3]);
  const bgY = useTransform(progress, [0, 1], ['0%', '-6%']);
  const overlayOpacity = useTransform(progress, [0, 0.45, 1], [0, 0.6, 0.78]);

  // Fase 1: contenido principal se despide hacia arriba
  const introOpacity = useTransform(progress, [0, 0.3], [1, 0]);
  const introY = useTransform(progress, [0, 0.3], [0, -90]);
  const cardOpacity = useTransform(progress, [0, 0.22], [1, 0]);
  const cardX = useTransform(progress, [0, 0.22], [0, 80]);
  const cueOpacity = useTransform(progress, [0, 0.06], [1, 0]);

  // Fase 2: frase central palabra por palabra
  const taglineOpacity = useTransform(progress, [0.32, 0.42], [0, 1]);
  const ctaOpacity = useTransform(progress, [0.78, 0.9], [0, 1]);
  const ctaY = useTransform(progress, [0.78, 0.9], [24, 0]);

  // Barra de recorrido inferior con la urban avanzando
  const roadScale = useTransform(progress, [0, 1], [0, 1]);
  const busLeft = useTransform(progress, [0, 1], ['0%', '100%']);

  const animated = !reduceMotion;
  const wordSpan = (0.8 - 0.42) / revealWords.length;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="inicio"
        aria-label="Inicio"
        className={`relative w-full ${animated ? 'h-[250vh]' : ''}`}
      >
        <div className="sticky top-0 isolate h-[100svh] min-h-[560px] w-full overflow-hidden">
          {/* Fondo */}
          <motion.div
            className="absolute inset-0 -z-20 will-change-transform"
            style={animated ? { scale: bgScale, y: bgY } : { scale: 1.05 }}
          >
            <Image
              src="/images/inicio/hero-bg.jpg"
              alt="Autobús de Auto Transportes Zoque recorriendo la carretera al atardecer"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[72%_center] md:object-center"
            />
          </motion.div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-slate-950/70 to-transparent" />
          {animated && (
            <motion.div
              aria-hidden
              className="absolute inset-0 -z-10 bg-slate-950"
              style={{ opacity: overlayOpacity }}
            />
          )}

          {/* Fase 1: mensaje principal */}
          <motion.div
            style={animated ? { opacity: introOpacity, y: introY } : undefined}
            className="relative flex h-full flex-col justify-center px-4 pt-20 pb-12 sm:pt-24 sm:pb-16 sm:px-6 md:px-10 lg:px-16"
          >
            <div className="max-w-full space-y-5 text-white sm:max-w-xl sm:space-y-6">
              <h1 className="font-merriweather text-[2.25rem] uppercase italic leading-[0.95] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
                {headlineLines.map((line, i) => (
                  <motion.span
                    key={line.text}
                    className={`block ${line.color}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: easeOut }}
                  >
                    {line.text}
                  </motion.span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: easeOut }}
                className="space-y-5 sm:space-y-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-widest text-white sm:text-[0.9rem]">
                    <MapPin className="h-[1rem] w-[1rem] text-[#C89D55] sm:h-[1.1rem] sm:w-[1.1rem]" aria-hidden />
                    <span>COPAINALÁ, CHIAPAS</span>
                  </div>
                  <p className="font-sans text-sm font-normal italic text-white sm:text-base">
                    Orgullosamente Zoques, llevándote <br className="hidden sm:block" />
                    siempre a tu destino.
                  </p>
                </div>

                {/* En pantallas muy bajas (teléfonos chicos o acostados) se omite para que todo quepa */}
                <div className="[@media(max-height:700px)]:hidden">
                  <ValueProps />
                </div>

                <div className="flex flex-col flex-wrap items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4 sm:pt-4">
                  <Link
                    href="#destinos"
                    className="flex items-center justify-center gap-2 rounded-full bg-[#C89D55] px-5 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-slate-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#b08745] hover:shadow-amber-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89D55] sm:text-xs"
                  >
                    <Bus className="h-4 w-4" aria-hidden />
                    Ver Destinos
                  </Link>

                  <Link
                    href="https://wa.me/9611077541"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-amber-200/30 bg-slate-900/70 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89D55] sm:text-xs"
                  >
                    <svg className="h-4 w-4 fill-emerald-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.887-9.885 9.887m0-18.178c-5.385 0-9.766 4.382-9.769 9.768a9.71 9.71 0 001.372 5.011l.135.215-.591 2.159 2.209-.58.208.123a9.74 9.74 0 004.819 1.272h.004c5.385 0 9.768-4.382 9.77-9.769 0-2.607-1.016-5.059-2.862-6.906A9.704 9.704 0 0012.051 3.607" />
                    </svg>
                    Escríbenos
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tarjeta de ubicación */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: easeOut }}
            className="absolute bottom-16 right-4 z-10 sm:right-6 lg:right-16"
          >
            <motion.div style={animated ? { opacity: cardOpacity, x: cardX } : undefined}>
              <CardLocation />
            </motion.div>
          </motion.div>

          {animated && (
            <>
              {/* Fase 2: frase central revelada con el scroll */}
              <motion.div
                style={{ opacity: taglineOpacity }}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              >
                <span className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#C89D55] sm:text-xs">
                  Auto Transportes Zoque
                </span>
                <p className="max-w-4xl font-merriweather text-4xl italic leading-[1.05] tracking-[-0.03em] text-[#F5F2EB] sm:text-6xl lg:text-7xl">
                  {revealWords.map((word, i) => (
                    <RevealWord
                      key={`${word}-${i}`}
                      word={word}
                      progress={progress}
                      range={[0.42 + i * wordSpan, 0.42 + (i + 1) * wordSpan]}
                    />
                  ))}
                </p>
                <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="pointer-events-auto mt-10">
                  <Link
                    href="#nosotros"
                    className="inline-flex items-center gap-2 rounded-full border border-[#C89D55]/60 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-amber-100 backdrop-blur-sm transition-colors hover:bg-[#C89D55] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89D55]"
                  >
                    Conoce nuestra historia
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Indicador de scroll */}
              <motion.div
                style={{ opacity: cueOpacity }}
                className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 md:flex"
                aria-hidden
              >
                Desliza
                <span className="relative h-10 w-6 rounded-full border border-white/40">
                  <motion.span
                    className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-[#C89D55]"
                    animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </span>
              </motion.div>

              {/* Recorrido: la urban avanza con el scroll */}
              <div aria-hidden className="pointer-events-none absolute inset-x-4 bottom-5 sm:inset-x-6 lg:inset-x-16">
                <div className="relative h-px w-full bg-white/15">
                  <motion.div
                    className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-[#C89D55]/40 to-[#C89D55]"
                    style={{ scaleX: roadScale }}
                  />
                  <motion.div
                    className="absolute -top-[9px] -translate-x-1/2 rounded-full bg-[#C89D55] p-1 shadow-lg shadow-amber-500/30"
                    style={{ left: busLeft }}
                  >
                    <Bus className="h-2.5 w-2.5 text-slate-950" />
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}
