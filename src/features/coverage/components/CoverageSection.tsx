'use client';

import { useState, useSyncExternalStore, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MoveRight } from 'lucide-react';
import { CHIAPAS_INSET, MUNICIPALITIES, STATE_OUTLINE, project, projectInset } from './chiapasGeo';
import { formatTime12 } from '../../schedules/components/schedulesData';
import {
  COVERAGE_STATS,
  MAP_PATHS,
  TOWNS,
  pointAlong,
  runsFrom,
  runsOn,
  tripsInProgress,
  type MapPath,
  type Town,
  type Trip,
} from './coverageData';

const SLAB_DEPTH = 18;
const BASE_TILT = 16;

const subscribeQuery = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

// Respeta "reducir movimiento" del sistema: sin animaciones ni inclinación con el mouse
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeMotion = subscribeQuery(REDUCED_MOTION);
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

// En pantallas chicas se acerca el mapa a la zona de las rutas para que los nombres se lean
const COMPACT = '(max-width: 639px)';
const subscribeCompact = subscribeQuery(COMPACT);
const getCompact = () => window.matchMedia(COMPACT).matches;

// Reloj por segundo con la hora de Chiapas, sin importar desde dónde se vea la página.
// En el servidor no hay hora (null) para evitar diferencias de hidratación.
const subscribeClock = (onChange: () => void) => {
  const interval = setInterval(onChange, 1000);
  return () => clearInterval(interval);
};
const getSecondStamp = () => Math.floor(Date.now() / 1000);
const chiapasClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Mexico_City',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});
const chiapasMinutes = (secondStamp: number) => {
  const parts = Object.fromEntries(
    chiapasClock.formatToParts(new Date(secondStamp * 1000)).map(({ type, value }) => [type, Number(value)]),
  );
  return parts.hour * 60 + parts.minute + parts.second / 60;
};

// Recuadro de la zona del mapa principal dentro de la miniatura de Chiapas
const [insetX1, insetY1] = projectInset(-93.82, 17.54);
const [insetX2, insetY2] = projectInset(-92.88, 16.6);

// Caminos ordenados por número de corridas, para la lista
const PATHS_BY_RUNS = [...MAP_PATHS].sort((a, b) => runsOn(b) - runsOn(a));

const endpoints = (path: MapPath) => {
  const [first, last] = [path.stops[0], path.stops[path.stops.length - 1]];
  // Solo de ida: en el sentido de la corrida. Ida y vuelta: Tuxtla siempre al final
  if (!path.forward) return [last, first];
  if (path.backward && first === 'Tuxtla Gutiérrez') return [last, first];
  return [first, last];
};

export const CoverageSection = () => {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true);
  const compact = useSyncExternalStore(subscribeCompact, getCompact, () => false);
  const [activeTown, setActiveTown] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const secondStamp = useSyncExternalStore(subscribeClock, getSecondStamp, () => null);
  const nowMin = secondStamp === null ? null : chiapasMinutes(secondStamp);
  const trips = nowMin === null ? [] : tripsInProgress(nowMin);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 8, y: -py * 6 });
  };

  const isPathActive = (path: MapPath) =>
    activePath ? path.key === activePath : activeTown === null || path.stops.includes(activeTown);
  const isTownActive = (town: string) => {
    if (activePath) return MAP_PATHS.find((p) => p.key === activePath)?.stops.includes(town) ?? true;
    return activeTown === null || activeTown === town;
  };

  const active = TOWNS.find((town) => town.name === activeTown);
  const hoveredTrip = trips.find((trip) => trip.key === activeTrip);
  const fontSize = compact ? 15 : 12;

  return (
    <section
      id="cobertura"
      aria-labelledby="cobertura-titulo"
      className="relative w-full overflow-hidden bg-[#061A10] text-white"
    >
      {/* Fondo: brillo radial y retícula sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(31,107,66,0.55)_0%,rgba(10,44,26,0.6)_40%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-12">
        {/* Texto */}
        <div>
          <p className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-200/80">
            <span className="h-px w-8 bg-gradient-to-r from-amber-300 to-transparent" />
            Mapa de cobertura
          </p>
          <h2
            id="cobertura-titulo"
            className="mt-4 text-3xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-4xl md:text-5xl"
          >
            Conectamos
            <span className="block bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Chiapas
            </span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-emerald-50/70">
            Rutas que conectan comunidades y acercan oportunidades.
          </p>

          <dl className="mt-8 flex max-w-sm divide-x divide-white/10">
            {[
              { value: COVERAGE_STATS.towns, label: 'Localidades' },
              { value: COVERAGE_STATS.routes, label: 'Rutas' },
              { value: COVERAGE_STATS.dailyRuns, label: 'Corridas al día' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-1 flex-col-reverse px-4 first:pl-0">
                <dt className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-50/50">{label}</dt>
                <dd className="text-3xl font-light tabular-nums text-amber-200">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Lista de rutas: al pasar el mouse se resalta en el mapa */}
          <ul className="mt-8 max-w-sm divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-sm">
            {PATHS_BY_RUNS.map((path) => {
              const [from, to] = endpoints(path);
              const both = path.forward && path.backward;
              const on = activePath === path.key;
              return (
                <li key={path.key}>
                  <button
                    type="button"
                    onPointerEnter={() => setActivePath(path.key)}
                    onPointerLeave={() => setActivePath(null)}
                    onFocus={() => setActivePath(path.key)}
                    onBlur={() => setActivePath(null)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      on ? 'bg-amber-300/10 text-white' : 'text-emerald-50/80 hover:bg-white/5'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${on ? 'bg-amber-300' : 'bg-amber-300/50'}`} />
                    <span className="min-w-0 flex-1 truncate">
                      {from}
                      {both ? (
                        <ArrowLeftRight className="mx-1.5 inline h-3 w-3 text-amber-300/80" aria-label="ida y vuelta" />
                      ) : (
                        <MoveRight className="mx-1.5 inline h-3 w-3 text-amber-300/80" aria-label="a" />
                      )}
                      {to}
                    </span>
                    <span className="shrink-0 tabular-nums text-[11px] text-emerald-50/50">{runsOn(path)}/día</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <Link
              href="/horarios"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#0A2C1A] shadow-[0_8px_30px_-8px_rgba(252,211,77,0.6)] transition-shadow hover:shadow-[0_10px_40px_-6px_rgba(252,211,77,0.8)]"
            >
              Ver rutas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Mapa 3D */}
        <div className="relative" onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
          <div
            className="transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `perspective(1400px) rotateX(${BASE_TILT + tilt.y}deg) rotateY(${tilt.x}deg)`,
              transformOrigin: '50% 60%',
            }}
          >
            <svg
              viewBox={compact ? '50 0 440 360' : '-40 -50 620 450'}
              className="h-auto w-full overflow-visible"
              role="img"
              aria-labelledby="mapa-titulo mapa-desc"
            >
              <title id="mapa-titulo">Mapa de rutas de Auto Transportes Zoque en el noroeste de Chiapas</title>
              <desc id="mapa-desc">
                {MAP_PATHS.map((path) => endpoints(path).join(' y ')).join('; ')}
              </desc>

              <defs>
                <linearGradient id="slab-top" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2E8255" />
                  <stop offset="50%" stopColor="#1B5C39" />
                  <stop offset="100%" stopColor="#0E3A23" />
                </linearGradient>
                <radialGradient id="slab-light" cx="0.3" cy="0.15" r="0.8">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="slab-side" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0C301D" />
                  <stop offset="100%" stopColor="#03100A" />
                </linearGradient>
                <linearGradient id="route-core" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="50%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="hub-chip" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="55%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <radialGradient id="pin-glow">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                </radialGradient>
                <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="160%">
                  <feGaussianBlur stdDeviation="16" />
                </filter>
                <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" />
                </filter>
                <filter id="particle-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="chip-shadow" x="-20%" y="-40%" width="140%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Sombra, grosor y borde dorado de la pieza */}
              <path d={STATE_OUTLINE} fill="#000" opacity="0.55" transform={`translate(14 ${SLAB_DEPTH + 26})`} filter="url(#soft-shadow)" />
              {Array.from({ length: SLAB_DEPTH }, (_, i) => (
                <path key={i} d={STATE_OUTLINE} fill="url(#slab-side)" transform={`translate(0 ${SLAB_DEPTH - i})`} />
              ))}
              <path d={STATE_OUTLINE} fill="none" stroke="#FCD34D" strokeOpacity="0.18" strokeWidth="1" transform={`translate(0 ${SLAB_DEPTH})`} />

              {/* Superficie con municipios e iluminación */}
              <path d={STATE_OUTLINE} fill="url(#slab-top)" />
              {MUNICIPALITIES.map(({ name, d }, i) => (
                <path
                  key={name}
                  d={d}
                  fill="#ffffff"
                  fillOpacity={0.01 + (i % 5) * 0.012}
                  stroke="#D1FAE5"
                  strokeOpacity="0.16"
                  strokeWidth="0.6"
                  strokeLinejoin="round"
                >
                  <title>{name}</title>
                </path>
              ))}
              <path d={STATE_OUTLINE} fill="url(#slab-light)" />
              <path d={STATE_OUTLINE} fill="none" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="1.2" />

              {/* Rutas con luces que viajan en el sentido de las corridas */}
              {MAP_PATHS.map((path) => {
                const on = isPathActive(path);
                const directions = [
                  ...(path.forward ? ['0;1', '0;1'] : []),
                  ...(path.backward ? ['1;0', '1;0'] : []),
                ];
                return (
                  <g key={path.key} opacity={on ? 1 : 0.1} className="transition-opacity duration-300">
                    <path d={path.d} fill="none" stroke="#FCD34D" strokeWidth="6" strokeOpacity="0.28" filter="url(#route-glow)" />
                    <path d={path.d} fill="none" stroke="url(#route-core)" strokeWidth="1.8" strokeLinecap="round" />
                    {!reducedMotion &&
                      directions.map((keyPoints, i) => (
                        <circle key={i} r="2.6" fill="#FFFBEB" filter="url(#particle-glow)">
                          <animateMotion
                            path={path.d}
                            dur="4.5s"
                            begin={`-${(i * 4.5) / directions.length}s`}
                            repeatCount="indefinite"
                            keyPoints={keyPoints}
                            keyTimes="0;1"
                            calcMode="linear"
                          />
                        </circle>
                      ))}
                  </g>
                );
              })}

              {/* Urbans en camino, ubicados según su hora de salida y llegada */}
              {trips.map((trip) => (
                <Van
                  key={trip.key}
                  trip={trip}
                  on={isPathActive(trip.path) && (activeTrip === null || activeTrip === trip.key)}
                  scale={compact ? 1.25 : 1}
                  onActivate={setActiveTrip}
                />
              ))}

              {/* Pines */}
              {TOWNS.map((town) => (
                <TownPin
                  key={town.name}
                  town={town}
                  on={isTownActive(town.name)}
                  reducedMotion={reducedMotion}
                  fontSize={fontSize}
                  onActivate={setActiveTown}
                />
              ))}
            </svg>
          </div>

          {/* Información de la localidad seleccionada */}
          <div
            aria-live="polite"
            className={`pointer-events-none absolute left-0 top-0 min-w-48 rounded-2xl border border-white/10 bg-[#04140B]/80 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 sm:left-2 sm:top-2 ${
              active || hoveredTrip ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
            }`}
          >
            {hoveredTrip ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">En camino</p>
                <p className="mt-0.5 text-sm font-bold text-white">
                  {hoveredTrip.route.from} <span className="text-amber-300">→</span> {hoveredTrip.route.to}
                </p>
                <p className="mt-2 text-xs text-emerald-50/70">
                  Salió {formatTime12(hoveredTrip.departure)} · Llega {formatTime12(hoveredTrip.arrival)}
                </p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400"
                    style={{ width: `${Math.round(hoveredTrip.progress * 100)}%` }}
                  />
                </div>
              </>
            ) : active && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                  {active.hub ? 'Terminal' : 'Localidad'}
                </p>
                <p className="mt-0.5 text-sm font-bold text-white">{active.name}</p>
                <p className="mt-2 flex items-baseline gap-1.5 text-xs text-emerald-50/70">
                  <span className="text-lg font-light tabular-nums text-amber-200">{runsFrom(active.name)}</span>
                  salidas diarias
                </p>
              </>
            )}
          </div>

          {/* En vivo: hora de Chiapas y urbans en camino */}
          <div className="absolute -bottom-2 left-0 flex items-center gap-2 rounded-full sm:bottom-auto sm:left-auto sm:right-2 sm:top-2 border border-white/10 bg-[#04140B]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50/80 shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {!reducedMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            En vivo
            <span className="tabular-nums text-amber-200">{nowMin === null ? '--:--' : formatTime12(Math.floor(nowMin))}</span>
            <span className="hidden text-emerald-50/50 sm:inline">
              · {trips.length} {trips.length === 1 ? 'urban' : 'urbans'} en camino
            </span>
          </div>

          {/* Miniatura: ubicación de la zona dentro de Chiapas */}
          <figure className="absolute bottom-0 right-0 hidden w-28 rounded-2xl border border-white/10 bg-[#04140B]/70 p-3 shadow-2xl backdrop-blur-md sm:block">
            <svg viewBox="0 0 84 82" className="h-auto w-full" aria-hidden>
              <path d={CHIAPAS_INSET} fill="#1B5C39" stroke="#FDE68A" strokeOpacity="0.45" strokeWidth="0.7" />
              <rect
                x={insetX1}
                y={insetY1}
                width={insetX2 - insetX1}
                height={insetY2 - insetY1}
                rx="1.5"
                fill="#FCD34D"
                fillOpacity="0.25"
                stroke="#FCD34D"
                strokeWidth="0.9"
              />
            </svg>
            <figcaption className="mt-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-200/70">
              Chiapas
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};

interface TownPinProps {
  town: Town;
  on: boolean;
  reducedMotion: boolean;
  fontSize: number;
  onActivate: (town: string | null) => void;
}

// Pin con poste y etiqueta tipo "píldora"; el de la terminal es dorado y más grande
function TownPin({ town, on, reducedMotion, fontSize, onActivate }: TownPinProps) {
  const [x, y] = project(town.lon, town.lat);
  const stalk = town.hub ? 30 : 16;
  const headY = y - stalk;

  const chipFont = town.hub ? fontSize + 3 : fontSize;
  const chipW = town.name.length * chipFont * 0.58 + (town.hub ? 26 : 18);
  const chipH = town.hub ? chipFont + 20 : chipFont + 11;
  const { anchor, dx } = town.label;
  // Píldora a un lado de la cabeza del pin, o debajo del punto en el suelo
  const chipX = anchor === 'start' ? x + dx : anchor === 'end' ? x + dx - chipW : x - chipW / 2;
  const chipY = anchor === 'middle' ? y + (town.hub ? 12 : 10) : headY - chipH / 2;

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${town.name}: ${runsFrom(town.name)} salidas diarias`}
      onPointerEnter={() => onActivate(town.name)}
      onPointerLeave={() => onActivate(null)}
      onFocus={() => onActivate(town.name)}
      onBlur={() => onActivate(null)}
      opacity={on ? 1 : 0.35}
      className="cursor-pointer outline-none transition-opacity duration-300"
    >
      <ellipse cx={x} cy={y} rx={town.hub ? 24 : 12} ry={town.hub ? 9 : 4.5} fill="url(#pin-glow)" />
      {town.hub && !reducedMotion && (
        <ellipse cx={x} cy={y} rx="8" ry="3" fill="none" stroke="#FCD34D" strokeWidth="1.2">
          <animate attributeName="rx" values="8;34" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="ry" values="3;12.5" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite" />
        </ellipse>
      )}
      <line x1={x} y1={y} x2={x} y2={headY} stroke="#FDE68A" strokeOpacity="0.8" strokeWidth={town.hub ? 1.6 : 1.1} />
      {town.hub ? (
        <>
          <path
            d={`M${x},${headY + 4} c-7,-8 -11,-12 -11,-18 a11,11 0 1 1 22,0 c0,6 -4,10 -11,18z`}
            fill="url(#hub-chip)"
            stroke="#FFFBEB"
            strokeWidth="1.2"
          />
          <circle cx={x} cy={headY - 14} r="4" fill="#0A2C1A" />
        </>
      ) : (
        <>
          <circle cx={x} cy={headY} r="6.5" fill="#FCD34D" fillOpacity="0.25" />
          <circle cx={x} cy={headY} r="3.6" fill="#FCD34D" stroke="#FFFBEB" strokeWidth="1.3" />
        </>
      )}

      <g filter="url(#chip-shadow)">
        <rect
          x={chipX}
          y={chipY}
          width={chipW}
          height={chipH}
          rx={chipH / 2}
          fill={town.hub ? 'url(#hub-chip)' : '#04140B'}
          fillOpacity={town.hub ? 1 : 0.82}
          stroke={town.hub ? '#FFFBEB' : '#FDE68A'}
          strokeOpacity={town.hub ? 0.8 : 0.3}
          strokeWidth="0.8"
        />
      </g>
      {town.hub && (
        <text
          x={chipX + chipW / 2}
          y={chipY + 11}
          textAnchor="middle"
          fill="#0A2C1A"
          fillOpacity="0.7"
          fontSize={fontSize - 4}
          fontWeight={700}
          letterSpacing="2"
        >
          TERMINAL
        </text>
      )}
      <text
        x={chipX + chipW / 2}
        y={town.hub ? chipY + chipH - 7 : chipY + chipH / 2 + chipFont * 0.35}
        textAnchor="middle"
        fill={town.hub ? '#0A2C1A' : '#FFFFFF'}
        fontSize={chipFont}
        fontWeight={town.hub ? 800 : 600}
      >
        {town.name}
      </text>
    </g>
  );
}

interface VanProps {
  trip: Trip;
  on: boolean;
  scale: number;
  onActivate: (trip: string | null) => void;
}

// Urban vista de lado, sobre su línea, mirando hacia donde avanza
function Van({ trip, on, scale, onActivate }: VanProps) {
  const { x, y, facingRight } = pointAlong(trip.path, trip.progress, trip.forward);
  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${facingRight ? scale : -scale} ${scale})`}
      opacity={on ? 1 : 0.2}
      onPointerEnter={() => onActivate(trip.key)}
      onPointerLeave={() => onActivate(null)}
      className="cursor-pointer transition-opacity duration-300"
    >
      <title>{`${trip.route.from} → ${trip.route.to}: salió ${formatTime12(trip.departure)}, llega ${formatTime12(trip.arrival)}`}</title>
      <ellipse cx="0" cy="1" rx="11" ry="2.6" fill="#000" opacity="0.4" />
      <path
        d="M-10,-1.5 L-10,-10 Q-10,-12 -8,-12 L4,-12 Q6,-12 7.6,-9.6 L10.2,-5.6 Q11,-4.6 11,-3.4 L11,-1.5 Z"
        fill="#FFFFFF"
        stroke="#0A2C1A"
        strokeWidth="0.7"
      />
      <rect x="-8" y="-10.4" width="4.4" height="3.6" rx="0.6" fill="#0F3A23" />
      <rect x="-2.6" y="-10.4" width="4.4" height="3.6" rx="0.6" fill="#0F3A23" />
      <path d="M3,-10.4 L6,-10.4 L8.6,-6.8 L3,-6.8 Z" fill="#0F3A23" />
      <rect x="-10" y="-5.6" width="21" height="1.5" fill="#1F7A4A" />
      <circle cx="10" cy="-3.2" r="0.9" fill="#FEF08A" />
      <circle cx="-5.6" cy="-1.4" r="2" fill="#111827" stroke="#9CA3AF" strokeWidth="0.6" />
      <circle cx="6" cy="-1.4" r="2" fill="#111827" stroke="#9CA3AF" strokeWidth="0.6" />
    </g>
  );
}
