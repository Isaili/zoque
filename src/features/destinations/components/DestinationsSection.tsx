'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { CalendarClock, Clock, Landmark, MapPin } from 'lucide-react';

type DestinationTag = 'origin' | 'next' | 'capital';

interface Destination {
  id: string;
  name: string;
  duration: string;
  price: string;
  image: string;
  tag?: DestinationTag;
}

const DESTINATIONS: Destination[] = [
  { id: '1', name: 'Copainala', duration: '1h 15m', price: '$90', image: '/images/copainala.png', tag: 'origin' },
  { id: '2', name: 'Tuxtla Gutiérrez', duration: '1h 50 min', price: '$90', image: '/images/tuxtla.png', tag: 'capital' },
  { id: '3', name: 'Tecpatán', duration: '45 min', price: '$60', image: '/images/tecpatan.png' },
  { id: '4', name: 'Coapilla', duration: '1h', price: '$70', image: '/images/coapilla.png' },
  { id: '5', name: 'San Fernando', duration: '1h 20m', price: '$110', image: '/images/piramides.png' },
  { id: '6', name: 'Quechula', duration: '2h', price: '$150', image: '/images/quechulaundida.png' },
  { id: '7', name: 'Ocotepec', duration: '50 min', price: '$60', image: '/images/ocotepec.png' },
  { id: '8', name: 'Raudales Malpaso', duration: '1h 30m', price: '$120', image: '/images/raudales.png' },
  { id: '9', name: 'Ostuacan', duration: '1h 30m', price: '$120', image: '/images/ostuacan.png' },
  { id: '10', name: 'PH CFE chicoasen', duration: '1h 10m', price: '$90', image: '/images/cfe.png' },
  { id: '11', name: 'San Cristóbal', duration: '2h', price: '$150', image: '/images/sdc.png', tag: 'next' },
];

const COUNT = DESTINATIONS.length;
const WHEEL_SPEED = 1.2; // multiplicador del scroll del mouse (más alto = avanza más rápido)
const AUTOPLAY_MS = 3000; // cada cuánto avanza una tarjeta solo (0 para desactivar)
const IDLE_MS = 2500; // tiempo sin tocar el carrusel antes de que retome el avance automático

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* Tres copias de la lista: al terminar San Cristóbal vuelve a empezar Copainala (y al revés) */
const LOOP_ITEMS = [0, 1, 2].flatMap((copy) =>
  DESTINATIONS.map((destination) => ({ ...destination, copy, key: `${copy}-${destination.id}` })),
);

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

          {/* Leyenda de los distintivos */}
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0D3B23] text-white">
                <MapPin className="h-3 w-3" aria-hidden />
              </span>
              Ciudad de origen: de aquí salimos
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-white">
                <Landmark className="h-3 w-3" aria-hidden />
              </span>
              Capital del estado
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950">
                <CalendarClock className="h-3 w-3" aria-hidden />
              </span>
              Próxima corrida programada
            </li>
          </ul>
          <p className="text-xs text-gray-500">Precios en pesos mexicanos (MXN).</p>
        </div>

        {/* Columna Derecha: Contenedor con Scroll Horizontal infinito */}
        <div
          ref={scrollerRef}
          className="w-full lg:w-3/4 overflow-x-auto pb-4 cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* `relative` es clave: hace que offsetLeft de las tarjetas se mida desde el inicio del carrusel */}
          <div className="relative flex gap-4 min-w-max">
            {LOOP_ITEMS.map((destination, index) => {
              const isOrigin = destination.tag === 'origin';
              const isNext = destination.tag === 'next';
              const isCapital = destination.tag === 'capital';

              return (
                <div
                  key={destination.key}
                  aria-hidden={destination.copy !== 1}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  /* Ancho de 52 Tailwind units (13rem) y tarjetas con mayor presencia general */
                  className={`w-52 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0 ${
                    isOrigin
                      ? 'border-2 border-[#2A4822]'
                      : isNext
                      ? 'border-2 border-dashed border-amber-400'
                      : 'border border-gray-200/80'
                  }`}
                >
                  {/* Imagen más alta (h-48) */}
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      draggable={false}
                      className="object-cover pointer-events-none"
                    />

                    {isOrigin && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#0D3B23] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                        <MapPin className="h-3 w-3" aria-hidden />
                        Ciudad de origen
                      </span>
                    )}

                    {isCapital && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-sky-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                        <Landmark className="h-3 w-3" aria-hidden />
                        Capital del estado
                      </span>
                    )}

                    {isNext && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-amber-950 shadow">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-900/60 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-900" />
                        </span>
                        Próxima corrida
                      </span>
                    )}
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-3.5 flex flex-col justify-between flex-grow">
                    <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-1">
                      {destination.name}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{destination.duration}</span>
                      </div>
                      <div className="font-medium text-gray-700">
                        <span className="text-[10px] text-gray-400 mr-1">Desde</span>
                        <span className="font-bold text-gray-900">{destination.price}</span>
                        <abbr
                          title="Pesos mexicanos"
                          className="ml-0.5 text-[10px] font-medium text-gray-400 no-underline"
                        >
                          MXN
                        </abbr>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};