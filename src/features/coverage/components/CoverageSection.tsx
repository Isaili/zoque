'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MoveRight } from 'lucide-react';
import { formatTime12 } from '../../schedules/components/schedulesData';
import { CoverageMap } from './CoverageMap';
import { COVERAGE_STATS, MAP_PATHS, TOWNS, runsFrom, runsOn, tripsInProgress, type MapPath } from './coverageData';

const subscribeQuery = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

// Respeta "reducir movimiento" del sistema: sin animación de las líneas
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeMotion = subscribeQuery(REDUCED_MOTION);
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

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
  const [activeTown, setActiveTown] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const secondStamp = useSyncExternalStore(subscribeClock, getSecondStamp, () => null);
  const nowMin = secondStamp === null ? null : chiapasMinutes(secondStamp);
  const trips = nowMin === null ? [] : tripsInProgress(nowMin);

  const selectedPath = MAP_PATHS.find((p) => p.key === activePath);
  const highlightedPaths = selectedPath
    ? [selectedPath.key]
    : activeTown
      ? MAP_PATHS.filter((p) => p.stops.includes(activeTown)).map((p) => p.key)
      : null;
  const highlightedTowns = selectedPath ? selectedPath.stops : activeTown ? [activeTown] : null;

  const active = TOWNS.find((town) => town.name === activeTown);
  const hoveredTrip = trips.find((trip) => trip.key === activeTrip);

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-12">
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

        {/* Mapa interactivo con calles, rutas y urbans en vivo */}
        <div className="relative">
          <CoverageMap
            trips={trips}
            highlightedPaths={highlightedPaths}
            highlightedTowns={highlightedTowns}
            activeTrip={activeTrip}
            reducedMotion={reducedMotion}
            onTownHover={setActiveTown}
            onTripHover={setActiveTrip}
          />

          {/* En vivo: hora de Chiapas y urbans en camino */}
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#04140B]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50/80 shadow-xl backdrop-blur-md">
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

          {/* Información de la urban o localidad seleccionada */}
          <div
            aria-live="polite"
            className={`pointer-events-none absolute bottom-3 left-3 min-w-48 rounded-2xl border border-white/10 bg-[#04140B]/85 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
              active || hoveredTrip ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
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
            ) : (
              active && (
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
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
