'use client';

import { BusFront, Crosshair, Pause, Play, Radio, X } from 'lucide-react';
import { formatTime12 } from '../../schedules/components/schedulesData';
import { SIM_END, SIM_START, type Clock } from './clock';
import { nextDeparture, upcomingStops, type Trip } from './coverageData';

const minutesLeft = (trip: Trip, nowMin: number) => Math.max(0, Math.ceil(trip.arrival - nowMin));

const formatLeft = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;

/* Etiqueta superior del mapa: en vivo o simulación, hora y urbans en camino */
export function MapStatusPill({ clock, nowMin, count }: { clock: Clock; nowMin: number | null; count: number }) {
  const live = clock.mode === 'live';
  return (
    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#04140B]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50/80 shadow-xl backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden ${live ? 'bg-red-400' : 'bg-amber-300'}`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-red-500' : 'bg-amber-400'}`} />
      </span>
      {live ? 'En vivo' : 'Simulación'}
      <span className="tabular-nums text-amber-200">{nowMin === null ? '--:--' : formatTime12(Math.floor(nowMin))}</span>
      <span className="hidden text-emerald-50/50 sm:inline">
        · {count} {count === 1 ? 'urban' : 'urbans'} en camino
      </span>
    </div>
  );
}

interface TripCardProps {
  trip: Trip;
  nowMin: number;
  selected: boolean;
  follow: boolean;
  onFollow: () => void;
  onClose: () => void;
}

/* Detalle de la urban elegida (o la que está bajo el cursor) */
export function TripCard({ trip, nowMin, selected, follow, onFollow, onClose }: TripCardProps) {
  const next = upcomingStops(trip)[0];
  const isFinal = next?.name === trip.route.to;
  const left = minutesLeft(trip, nowMin);

  return (
    <div
      aria-live="polite"
      className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-emerald-300/20 bg-[#04140B]/95 p-3 shadow-2xl backdrop-blur-md sm:right-auto sm:w-80 sm:p-4 ${
        selected ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <BusFront className="h-3 w-3" aria-hidden />
            Urban en camino
          </p>
          <p className="mt-1 truncate text-base font-bold text-white">
            {trip.route.from} <span className="text-amber-300">→</span> {trip.route.to}
          </p>
        </div>
        {selected && (
          <div className="flex shrink-0 items-center gap-1">
          {/* En celular el botón de seguir va arriba para que la tarjeta ocupe menos */}
          <button
            type="button"
            onClick={onFollow}
            aria-pressed={follow}
            aria-label={follow ? 'Dejar de seguir la urban' : 'Seguir la urban'}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:hidden ${
              follow ? 'bg-emerald-300 text-[#04140B]' : 'border border-emerald-300/40 text-emerald-200'
            }`}
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-50/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
            style={{ width: `${Math.round(trip.progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-emerald-50/60">
          <span>Salió {formatTime12(trip.departure)}</span>
          <span>Llega {formatTime12(trip.arrival)}</span>
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:mt-3">
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-emerald-50/50">{isFinal ? 'Destino' : 'Próxima parada'}</dt>
          <dd className="mt-0.5 truncate font-semibold text-white">
            {next ? next.name : trip.route.to}
            {next && !isFinal && <span className="ml-1 font-normal text-amber-200">~{formatTime12(Math.round(next.at))}</span>}
          </dd>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-emerald-50/50">Llega en</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-amber-200">{formatLeft(left)}</dd>
        </div>
      </dl>

      {selected && (
        <button
          type="button"
          onClick={onFollow}
          aria-pressed={follow}
          className={`mt-3 hidden w-full items-center justify-center gap-2 rounded-full px-4 py-2 sm:flex text-[11px] font-bold uppercase tracking-wider transition-colors ${
            follow ? 'bg-emerald-300 text-[#04140B]' : 'border border-emerald-300/40 text-emerald-200 hover:bg-emerald-300/10'
          }`}
        >
          <Crosshair className="h-3.5 w-3.5" aria-hidden />
          {follow ? 'Siguiendo la urban' : 'Seguir la urban'}
        </button>
      )}
    </div>
  );
}

/* Cuando no hay urbans en camino: próxima salida y acceso a la simulación */
export function EmptyState({ nowMin, onSimulate }: { nowMin: number; onSimulate: () => void }) {
  const next = nextDeparture(nowMin);
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/10 bg-[#04140B]/95 p-4 text-center shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:w-96 sm:-translate-x-1/2">
      <p className="text-sm font-semibold text-white">No hay urbans en camino en este momento</p>
      {next && (
        <p className="mt-1 text-xs text-emerald-50/70">
          Próxima salida <span className="font-semibold text-amber-200">{formatTime12(next.time)}</span> · {next.route.from} →{' '}
          {next.route.to}
        </p>
      )}
      <button
        type="button"
        onClick={onSimulate}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0A2C1A]"
      >
        <Play className="h-3.5 w-3.5" aria-hidden />
        Ver simulación del día
      </button>
    </div>
  );
}

interface TimeControlsProps {
  clock: Clock;
  nowMin: number | null;
  onLive: () => void;
  onSimulate: () => void;
  onTogglePlay: () => void;
  onSeek: (minutes: number) => void;
}

/* Cambiar entre en vivo y simulación; en simulación, reproducir y mover la hora */
export function TimeControls({ clock, nowMin, onLive, onSimulate, onTogglePlay, onSeek }: TimeControlsProps) {
  const sim = clock.mode === 'sim';
  const playing = sim && clock.startedAt !== null;
  const value = nowMin === null ? SIM_START : Math.min(SIM_END, Math.max(SIM_START, Math.floor(nowMin)));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm sm:flex-row sm:items-center">
      <div role="radiogroup" aria-label="Modo del mapa" className="flex shrink-0 rounded-full bg-black/30 p-1">
        {[
          { on: !sim, label: 'En vivo', icon: Radio, action: onLive },
          { on: sim, label: 'Simulación', icon: Play, action: onSimulate },
        ].map(({ on, label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={action}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              on ? 'bg-amber-300 text-[#0A2C1A]' : 'text-emerald-50/70 hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {sim ? (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={playing ? 'Pausar simulación' : 'Reproducir simulación'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300/40 text-amber-200 transition-colors hover:bg-amber-300/10"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={SIM_START}
            max={SIM_END}
            step={1}
            value={value}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Hora de la simulación"
            aria-valuetext={formatTime12(value)}
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-amber-300"
          />
          <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums text-amber-200">{formatTime12(value)}</span>
        </div>
      ) : (
        <p className="flex-1 text-xs text-emerald-50/60">
          Posición estimada según el horario de cada corrida. Toca una urban para ver su recorrido.
        </p>
      )}
    </div>
  );
}

interface TripsStripProps {
  trips: Trip[];
  nowMin: number;
  selectedTrip: string | null;
  onSelect: (key: string) => void;
  onHover: (key: string | null) => void;
}

/* Lista de urbans en camino: tocar una la selecciona en el mapa */
export function TripsStrip({ trips, nowMin, selectedTrip, onSelect, onHover }: TripsStripProps) {
  if (trips.length === 0) return null;
  const sorted = [...trips].sort((a, b) => a.arrival - b.arrival);

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-50/50">
        En camino ahora · {trips.length}
      </p>
      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {sorted.map((trip) => {
          const on = selectedTrip === trip.key;
          return (
            <li key={trip.key} className="snap-start">
              <button
                type="button"
                onClick={() => onSelect(trip.key)}
                onPointerEnter={() => onHover(trip.key)}
                onPointerLeave={() => onHover(null)}
                aria-pressed={on}
                className={`w-48 rounded-xl border p-3 text-left transition-colors ${
                  on ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <span className="block truncate text-xs font-semibold text-white">
                  {trip.route.from} <span className="text-amber-300">→</span> {trip.route.to}
                </span>
                <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
                    style={{ width: `${Math.round(trip.progress * 100)}%` }}
                  />
                </span>
                <span className="mt-1.5 flex justify-between text-[10px] tabular-nums text-emerald-50/60">
                  <span>Llega {formatTime12(trip.arrival)}</span>
                  <span className="text-amber-200">{formatLeft(minutesLeft(trip, nowMin))}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
