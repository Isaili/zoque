'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DestinationCard } from './DestinationCard';
import { DestinationLegend } from './DestinationLegend';
import { DESTINATIONS, LOOP_ITEMS } from './destinationsData';

const COUNT = DESTINATIONS.length;
const WHEEL_SPEED = 1.2; // multiplicador del scroll del mouse (más alto = avanza más rápido)
const AUTOPLAY_MS = 3000; // cada cuánto avanza una tarjeta solo (0 para desactivar)
const IDLE_MS = 2500; // tiempo sin tocar el carrusel antes de que retome el avance automático

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* Tres copias de la lista: al terminar San Cristóbal vuelve a empezar Copainala (y al revés) */
export const DestinationsSection = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useIsoLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let targetLeft = 0;
    let raf: number | null = null;
    let last = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let hovered = false;
    let lastInteraction = 0; // 0 = el usuario aún no ha tocado el carrusel

    /* Ancho de una copia completa (tarjetas + separaciones) */
    const setWidth = () => {
      const first = cardRefs.current[0];
      const nextSet = cardRefs.current[COUNT];
      return first && nextSet ? nextSet.offsetLeft - first.offsetLeft : 0;
    };

    /* Mueve el scroll exactamente una copia: las copias son idénticas, así que no se nota */
    const shift = (delta: number) => {
      scroller.scrollLeft += delta;
      targetLeft += delta;
      dragStartScroll += delta;
    };

    /* Mantiene siempre la vista dentro de la copia del medio */
    const wrap = () => {
      const w = setWidth();
      if (!w) return;
      if (scroller.scrollLeft < w * 0.5) shift(w);
      else if (scroller.scrollLeft > w * 1.5) shift(-w);
    };

    /* Posición inicial: siempre Copainala al inicio, en la copia del medio */
    const resetToStart = () => {
      const start = cardRefs.current[COUNT];
      if (!start) return;
      scroller.scrollLeft = start.offsetLeft;
      targetLeft = scroller.scrollLeft;
    };
    resetToStart();

    // Si la página se restaura desde caché (botón atrás/adelante) o termina de cargar sin que el usuario haya tocado nada
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) resetToStart();
    };
    const onLoad = () => {
      if (lastInteraction === 0 && raf === null) resetToStart();
    };
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('load', onLoad);

    /* Scroll suave con la rueda del mouse */
    const tick = (time: number) => {
      if (dragging) {
        raf = null;
        return;
      }
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      const diff = targetLeft - scroller.scrollLeft;

      if (Math.abs(diff) < 0.5) {
        scroller.scrollLeft = targetLeft;
        wrap();
        raf = null;
        return;
      }
      scroller.scrollLeft += diff * (1 - Math.exp(-dt * 12));
      wrap();
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      lastInteraction = Date.now();

      if (raf === null) targetLeft = scroller.scrollLeft;
      targetLeft += delta * WHEEL_SPEED;

      if (raf === null) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    /* Arrastre con mouse (en pantallas táctiles se usa el scroll nativo) */
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      lastInteraction = Date.now();
      dragStartX = e.clientX;
      dragStartScroll = scroller.scrollLeft;
      scroller.style.cursor = 'grabbing';
      scroller.style.scrollSnapType = 'none';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      scroller.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
      targetLeft = scroller.scrollLeft;
      wrap();
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      scroller.style.cursor = '';
    };

    /* Scroll táctil / nativo */
    const onScroll = () => {
      if (raf === null && !dragging) {
        lastInteraction = Date.now(); // scroll táctil del usuario
        targetLeft = scroller.scrollLeft;
        wrap();
      }
    };

    /* Avance automático: una tarjeta cada AUTOPLAY_MS, con la misma animación suave */
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    scroller.addEventListener('mouseenter', onEnter);
    scroller.addEventListener('mouseleave', onLeave);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const autoplay =
      AUTOPLAY_MS && !reduceMotion
        ? setInterval(() => {
            if (hovered || dragging || document.hidden) return;
            if (lastInteraction && Date.now() - lastInteraction < IDLE_MS) return;

            const a = cardRefs.current[0];
            const b = cardRefs.current[1];
            if (!a || !b) return;
            const stepPx = b.offsetLeft - a.offsetLeft;

            // Avanza hasta el borde de la siguiente tarjeta
            if (raf === null) targetLeft = scroller.scrollLeft;
            targetLeft = (Math.floor((targetLeft - a.offsetLeft) / stepPx + 0.001) + 1) * stepPx + a.offsetLeft;

            if (raf === null) {
              last = performance.now();
              raf = requestAnimationFrame(tick);
            }
          }, AUTOPLAY_MS)
        : null;

    scroller.addEventListener('wheel', onWheel, { passive: false });
    scroller.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    scroller.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (autoplay) clearInterval(autoplay);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('load', onLoad);
      scroller.removeEventListener('mouseenter', onEnter);
      scroller.removeEventListener('mouseleave', onLeave);
      scroller.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      scroller.removeEventListener('scroll', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="destinos" aria-labelledby="destinos-titulo" className="w-full overflow-hidden bg-sand py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-8 items-center">

        {/* Columna Izquierda: Título y Botón */}
        <div className="w-full lg:w-1/4 flex flex-col justify-between gap-8 flex-shrink-0">
          <SectionHeading
            id="destinos-titulo"
            eyebrow="Destinos"
            title={
              <>
                Destinos <span className="block text-gold-dark">que nos unen</span>
              </>
            }
            description="Viaja a las principales ciudades y comunidades de Chiapas."
          />

          <Reveal delay={0.15} className="flex flex-col gap-6">
            <Link
              href="/horarios"
              className="group inline-flex w-full sm:w-fit items-center justify-center gap-2 rounded-full bg-zoque-700 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-zoque-600 hover:shadow-lg hover:shadow-zoque-900/20"
            >
              Ver todos los destinos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <DestinationLegend />
          </Reveal>
        </div>

        {/* Columna Derecha: Contenedor con Scroll Horizontal infinito */}
        <Reveal direction="left" distance={60} className="w-full lg:w-3/4 min-w-0">
        <div
          ref={scrollerRef}
          className="w-full overflow-x-auto py-4 cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          {/* `relative` es clave: hace que offsetLeft de las tarjetas se mida desde el inicio del carrusel */}
          <div className="relative flex gap-4 min-w-max">
            {LOOP_ITEMS.map((destination, index) => {
              return (
                <DestinationCard
                  key={destination.key}
                  destination={destination}
                  cardRef={(el) => {
                    cardRefs.current[index] = el;
                  }}
                />
              );
            })}
          </div>
        </div>
        </Reveal>

      </div>
    </section>
  );
};