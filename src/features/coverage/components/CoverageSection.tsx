'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MoveRight } from 'lucide-react';
import { CoverageMap } from './CoverageMap';
import {
  COVERAGE_STATS,
  MAP_PATHS,
  TOWNS,
  runsFrom,
  runsOn,
  tripsInProgress,
  withRoad,
  type MapPath,
} from './coverageData';
import { loadMissingRoads } from './roadLoader';
import { SIM_END, SIM_START, clockMinutes, simClock, type Clock } from './clock';
import { EmptyState, MapStatusPill, TimeControls, TripCard, TripsStrip } from './LiveTripsPanel';
import { CountUp } from '@/components/ui/CountUp';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const subscribeQuery = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

// Respeta "reducir movimiento" del sistema: sin animación de las líneas
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeMotion = subscribeQuery(REDUCED_MOTION);
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

// Reloj de la interfaz (4 veces por segundo). En el servidor no hay hora (null) para evitar diferencias de hidratación.
const TICK_MS = 250;
const subscribeTick = (onChange: () => void) => {
  const interval = setInterval(onChange, TICK_MS);
  return () => clearInterval(interval);
};
const getTick = () => Math.floor(Date.now() / TICK_MS);

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
  const [hoveredTripKey, setHoveredTripKey] = useState<string | null>(null);
  const [selectedTripKey, setSelectedTripKey] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const [clock, setClock] = useState<Clock>({ mode: 'live' });
  const [viewResetKey, setViewResetKey] = useState(0);
  const [paths, setPaths] = useState(MAP_PATHS);

  // Cambiar las curvas aproximadas por el trazado real de las carreteras
  useEffect(() => {
    const controller = new AbortController();
    loadMissingRoads(MAP_PATHS, controller.signal).then((roads) => {
      if (controller.signal.aborted || roads.size === 0) return;
      setPaths(MAP_PATHS.map((path) => (roads.has(path.key) ? withRoad(path, roads.get(path.key)!) : path)));
    });
    return () => controller.abort();
  }, []);
  const tick = useSyncExternalStore(subscribeTick, getTick, () => null);
  const nowMin = tick === null ? null : clockMinutes(clock, tick * TICK_MS);
  const trips = nowMin === null ? [] : tripsInProgress(nowMin, paths);

  const selectedTrip = trips.find((trip) => trip.key === selectedTripKey);
  const hoveredTrip = trips.find((trip) => trip.key === hoveredTripKey);
  const cardTrip = selectedTrip ?? hoveredTrip;

  const selectTrip = (key: string | null) => {
    setSelectedTripKey(key);
    if (key) setFollow(true);
  };
  const goLive = () => {
    setClock({ mode: 'live' });
    setSelectedTripKey(null);
    setViewResetKey((k) => k + 1);
  };
  // Empieza en la hora actual si hay corridas; si no, a las 6:00 AM
  const simulate = () => {
    if (clock.mode === 'sim') return;
    const start = trips.length > 0 && nowMin !== null ? Math.max(SIM_START, Math.min(SIM_END, nowMin)) : 6 * 60;
    setClock(simClock(start, true, Date.now()));
    setSelectedTripKey(null);
    setViewResetKey((k) => k + 1);
  };
  const togglePlay = () => {
    if (clock.mode !== 'sim') return;
    const now = Date.now();
    setClock(simClock(clockMinutes(clock, now), clock.startedAt === null, now));
  };
  const seek = (minutes: number) => {
    if (clock.mode !== 'sim') return;
    setClock(simClock(minutes, clock.startedAt !== null, Date.now()));
  };

  const selectedPath = paths.find((p) => p.key === activePath) ?? selectedTrip?.path;
  const highlightedPaths = selectedPath
    ? [selectedPath.key]
    : activeTown
      ? paths.filter((p) => p.stops.includes(activeTown)).map((p) => p.key)
      : null;
  const highlightedTowns = selectedPath ? selectedPath.stops : activeTown ? [activeTown] : null;

  const active = TOWNS.find((town) => town.name === activeTown);

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-10 sm:py-20 lg:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-12">
        {/* Texto */}
        <div>
          <SectionHeading
            id="cobertura-titulo"
            tone="dark"
            eyebrow="Mapa de cobertura"
            title={
              <>
                Conectamos{' '}
                <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-gold bg-clip-text pr-2 text-transparent">
                  Chiapas
                </span>
              </>
            }
            description="Rutas que conectan comunidades y acercan oportunidades."
          />

          <Reveal delay={0.1}>
          <dl className="mt-8 flex max-w-sm divide-x divide-white/10">
            {[
              { value: COVERAGE_STATS.towns, label: 'Localidades' },
              { value: COVERAGE_STATS.routes, label: 'Rutas' },
              { value: COVERAGE_STATS.dailyRuns, label: 'Corridas al día' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-1 flex-col-reverse px-4 first:pl-0">
                <dt className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-50/50">{label}</dt>
                <dd className="font-serif text-4xl italic tabular-nums text-amber-200">
                  <CountUp value={value} />
                </dd>
              </div>
            ))}
          </dl>
          </Reveal>

          {/* Lista de rutas: al pasar el mouse se resalta en el mapa */}
          <Reveal delay={0.15}>
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
          </Reveal>

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
        <Reveal direction="none" duration={1.2} className="min-w-0">
          <div className="relative">
            <CoverageMap
              paths={paths}
              clock={clock}
              highlightedPaths={highlightedPaths}
              highlightedTowns={highlightedTowns}
              hoveredTrip={hoveredTripKey}
              selectedTrip={selectedTrip ? selectedTrip.key : null}
              follow={follow}
              reducedMotion={reducedMotion}
              viewResetKey={viewResetKey}
              onTownHover={setActiveTown}
              onTripHover={setHoveredTripKey}
              onTripSelect={selectTrip}
              onFollowChange={setFollow}
            />

            <MapStatusPill clock={clock} nowMin={nowMin} count={trips.length} />

            {nowMin !== null && cardTrip ? (
              <TripCard
                trip={cardTrip}
                nowMin={nowMin}
                selected={cardTrip === selectedTrip}
                follow={follow}
                onFollow={() => setFollow((on) => !on)}
                onClose={() => setSelectedTripKey(null)}
              />
            ) : nowMin !== null && trips.length === 0 && clock.mode === 'live' ? (
              <EmptyState nowMin={nowMin} onSimulate={simulate} />
            ) : (
              active && (
                <div
                  aria-live="polite"
                  className="pointer-events-none absolute bottom-3 left-3 min-w-48 rounded-2xl border border-white/10 bg-[#04140B]/85 px-4 py-3 shadow-2xl backdrop-blur-md"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                    {active.hub ? 'Terminal' : 'Localidad'}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">{active.name}</p>
                  <p className="mt-2 flex items-baseline gap-1.5 text-xs text-emerald-50/70">
                    <span className="text-lg font-light tabular-nums text-amber-200">{runsFrom(active.name)}</span>
                    salidas diarias
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mt-4 space-y-4">
            <TimeControls
              clock={clock}
              nowMin={nowMin}
              onLive={goLive}
              onSimulate={simulate}
              onTogglePlay={togglePlay}
              onSeek={seek}
            />
            {nowMin !== null && (
              <TripsStrip
                trips={trips}
                nowMin={nowMin}
                selectedTrip={selectedTrip ? selectedTrip.key : null}
                onSelect={selectTrip}
                onHover={setHoveredTripKey}
              />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
