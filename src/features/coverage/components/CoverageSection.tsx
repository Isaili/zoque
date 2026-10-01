'use client';

import { useState, useSyncExternalStore, type PointerEvent } from 'react';
import Link from 'next/link';
import { CHIAPAS_INSET, MUNICIPALITIES, STATE_OUTLINE, project, projectInset } from './chiapasGeo';
import { COVERAGE_STATS, MAP_ROUTES, TOWNS, runsFrom } from './coverageData';

const SLAB_DEPTH = 16;
const BASE_TILT = 14;

// Respeta "reducir movimiento" del sistema: sin animaciones ni inclinación con el mouse
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerReducedMotion = () => true;

// En pantallas chicas se acerca el mapa a la zona de las rutas para que los nombres se lean
const subscribeCompact = (onChange: () => void) => {
  const query = window.matchMedia('(max-width: 639px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getCompact = () => window.matchMedia('(max-width: 639px)').matches;
const getServerCompact = () => false;

// Recuadro de la zona del mapa principal dentro de la miniatura de Chiapas
const [insetX1, insetY1] = projectInset(-93.82, 17.54);
const [insetX2, insetY2] = projectInset(-92.88, 16.6);

export const CoverageSection = () => {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerReducedMotion);
  const compact = useSyncExternalStore(subscribeCompact, getCompact, getServerCompact);
  const [activeTown, setActiveTown] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 10, y: -py * 8 });
  };

  const isRouteActive = (stops: string[]) => activeTown === null || stops.includes(activeTown);
  const active = TOWNS.find((town) => town.name === activeTown);

  return (
    <section
      id="cobertura"
      aria-labelledby="cobertura-titulo"
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#0A2C1A] via-[#0D3B23] to-[#0A2C1A] text-white"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-10">
        {/* Texto */}
        <div>
          <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
            Mapa de cobertura
          </p>
          <h2
            id="cobertura-titulo"
            className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl"
          >
            Conectamos
            <span className="block">Chiapas</span>
          </h2>
          <p className="mt-4 max-w-sm text-xs md:text-sm leading-relaxed text-emerald-100/80">
            Rutas que conectan comunidades y acercan oportunidades.
          </p>

          <dl className="mt-8 grid max-w-sm grid-cols-3 gap-3">
            {[
              { value: COVERAGE_STATS.towns, label: 'Localidades' },
              { value: COVERAGE_STATS.routes, label: 'Rutas' },
              { value: COVERAGE_STATS.dailyRuns, label: 'Corridas diarias' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <dt className="text-[10px] md:text-[11px] font-medium leading-tight text-emerald-100/70">{label}</dt>
                <dd className="mt-1 text-xl font-extrabold text-amber-300">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <Link
              href="/horarios"
              className="inline-flex items-center justify-center rounded-md bg-[#5B7F2E] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6C9437]"
            >
              Ver rutas
            </Link>
          </div>
        </div>

        {/* Mapa 3D */}
        <div className="relative" onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
          <div
            className="transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `perspective(1400px) rotateX(${BASE_TILT + tilt.y}deg) rotateY(${tilt.x}deg)`,
              transformOrigin: '50% 60%',
            }}
          >
            <svg
              viewBox={compact ? '70 20 400 330' : '-40 -40 620 440'}
              className="h-auto w-full overflow-visible"
              role="img"
              aria-labelledby="mapa-titulo mapa-desc"
            >
              <title id="mapa-titulo">Mapa de rutas de Auto Transportes Zoque en el noroeste de Chiapas</title>
              <desc id="mapa-desc">
                {MAP_ROUTES.map(({ route }) => `${route.from} a ${route.to}`).join('; ')}
              </desc>

              <defs>
                <linearGradient id="slab-top" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2F7A4E" />
                  <stop offset="55%" stopColor="#1C5A37" />
                  <stop offset="100%" stopColor="#123F27" />
                </linearGradient>
                <linearGradient id="slab-side" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B2A19" />
                  <stop offset="100%" stopColor="#051509" />
                </linearGradient>
                <radialGradient id="pin-glow">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                </radialGradient>
                <filter id="slab-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="14" />
                </filter>
                <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>

              {/* Sombra y grosor de la pieza */}
              <path d={STATE_OUTLINE} fill="#000" opacity="0.45" transform={`translate(10 ${SLAB_DEPTH + 18})`} filter="url(#slab-shadow)" />
              {Array.from({ length: SLAB_DEPTH }, (_, i) => (
                <path key={i} d={STATE_OUTLINE} fill="url(#slab-side)" transform={`translate(0 ${SLAB_DEPTH - i})`} />
              ))}

              {/* Superficie con municipios */}
              <path d={STATE_OUTLINE} fill="url(#slab-top)" />
              {MUNICIPALITIES.map(({ name, d }, i) => (
                <path
                  key={name}
                  d={d}
                  fill="#ffffff"
                  fillOpacity={0.015 + (i % 4) * 0.018}
                  stroke="#A7F3D0"
                  strokeOpacity="0.22"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                >
                  <title>{name}</title>
                </path>
              ))}
              <path d={STATE_OUTLINE} fill="none" stroke="#A7F3D0" strokeOpacity="0.35" strokeWidth="1.2" />

              {/* Rutas */}
              {MAP_ROUTES.map(({ route, stops, d }) => {
                const on = isRouteActive(stops);
                return (
                  <g key={route.id} opacity={on ? 1 : 0.15} className="transition-opacity duration-300">
                    <path d={d} fill="none" stroke="#FCD34D" strokeWidth="5" strokeOpacity="0.35" filter="url(#route-glow)" />
                    <path d={d} fill="none" stroke="#FDE68A" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round" />
                    <path
                      d={d}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeDasharray="2 14"
                    >
                      {!reducedMotion && (
                        <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.6s" repeatCount="indefinite" />
                      )}
                    </path>
                  </g>
                );
              })}

              {/* Pines y nombres */}
              {TOWNS.map((town) => {
                const [x, y] = project(town.lon, town.lat);
                const on = activeTown === null || activeTown === town.name;
                const stalk = town.hub ? 28 : 16;
                return (
                  <g
                    key={town.name}
                    tabIndex={0}
                    role="button"
                    aria-label={`${town.name}: ${runsFrom(town.name)} corridas diarias de salida`}
                    onPointerEnter={() => setActiveTown(town.name)}
                    onPointerLeave={() => setActiveTown(null)}
                    onFocus={() => setActiveTown(town.name)}
                    onBlur={() => setActiveTown(null)}
                    opacity={on ? 1 : 0.45}
                    className="cursor-pointer outline-none transition-opacity duration-300"
                  >
                    <ellipse cx={x} cy={y} rx={town.hub ? 22 : 12} ry={town.hub ? 9 : 5} fill="url(#pin-glow)" />
                    {town.hub && !reducedMotion && (
                      <ellipse cx={x} cy={y} rx="8" ry="3.3" fill="none" stroke="#FCD34D" strokeWidth="1.2">
                        <animate attributeName="rx" values="8;30" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="ry" values="3.3;12" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite" />
                      </ellipse>
                    )}
                    <line x1={x} y1={y} x2={x} y2={y - stalk} stroke="#FDE68A" strokeWidth={town.hub ? 1.6 : 1.2} />
                    {town.hub ? (
                      <path
                        d={`M${x},${y - stalk + 4} c-7,-8 -11,-12 -11,-18 a11,11 0 1 1 22,0 c0,6 -4,10 -11,18z`}
                        fill="#FBBF24"
                        stroke="#FEF3C7"
                        strokeWidth="1.2"
                      />
                    ) : (
                      <circle cx={x} cy={y - stalk} r="4.5" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.5" />
                    )}
                    {town.hub && <circle cx={x} cy={y - stalk - 14} r="4" fill="#0D3B23" />}
                    <text
                      x={x + town.label.dx}
                      y={y + town.label.dy - (town.label.dy < 20 ? stalk : 0)}
                      textAnchor={town.label.anchor}
                      fill="#FFFFFF"
                      stroke="#06200F"
                      strokeWidth="3"
                      paintOrder="stroke"
                      fontSize={town.hub ? (compact ? 24 : 22) : compact ? 16 : 13}
                      fontWeight={town.hub ? 800 : 600}
                    >
                      {town.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Información de la localidad seleccionada */}
          <div
            aria-live="polite"
            className={`pointer-events-none absolute left-2 top-2 rounded-xl border border-white/15 bg-[#06200F]/85 px-4 py-3 text-xs shadow-lg backdrop-blur transition-opacity duration-200 sm:left-4 sm:top-4 ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {active && (
              <>
                <p className="font-bold text-white">{active.name}</p>
                <p className="mt-0.5 text-emerald-100/80">
                  {runsFrom(active.name) > 0
                    ? `${runsFrom(active.name)} corridas diarias de salida`
                    : `Destino de ${MAP_ROUTES.filter((r) => r.route.to === active.name).length} rutas`}
                </p>
              </>
            )}
          </div>

          {/* Miniatura: ubicación de la zona dentro de Chiapas */}
          <figure className="absolute bottom-0 right-0 hidden w-24 rounded-lg border border-white/10 bg-[#06200F]/70 p-2 backdrop-blur sm:block md:w-28">
            <svg viewBox="0 0 84 82" className="h-auto w-full" aria-hidden>
              <path d={CHIAPAS_INSET} fill="#1C5A37" stroke="#A7F3D0" strokeOpacity="0.5" strokeWidth="0.8" />
              <rect
                x={insetX1}
                y={insetY1}
                width={insetX2 - insetX1}
                height={insetY2 - insetY1}
                fill="#FCD34D"
                fillOpacity="0.3"
                stroke="#FCD34D"
                strokeWidth="1"
              />
            </svg>
            <figcaption className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-emerald-100/80">
              Chiapas
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
