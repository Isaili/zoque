'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
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
    <section className="w-full bg-gray-100/90 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Columna Izquierda: Título y Botón */}
        <div className="w-full lg:w-1/4 flex flex-col justify-between space-y-6 flex-shrink-0">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D3B23] tracking-tight uppercase leading-tight mb-4">
              DESTINOS<br />QUE NOS UNEN
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Viaja a las principales ciudades y comunidades de Chiapas.
            </p>
          </div>

          <div>
            <button className="w-full sm:w-auto px-6 py-3 bg-[#2A4822] hover:bg-[#1E3518] text-white font-semibold text-xs sm:text-sm rounded-md transition-colors uppercase tracking-wider">
              VER TODOS LOS DESTINOS
            </button>
          </div>

          <DestinationLegend />
        </div>

        {/* Columna Derecha: Contenedor con Scroll Horizontal infinito */}
        <div
          ref={scrollerRef}
          className="w-full lg:w-3/4 overflow-x-auto pb-4 cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      </div>
    </section>
  );
};