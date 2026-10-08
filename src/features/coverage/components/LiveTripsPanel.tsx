'use client';

import { useState } from 'react';
import { AlertTriangle, BusFront, CheckCircle2, Construction, Crosshair, OctagonX, Pause, Play, Radio, TrafficCone, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatTime12 } from '../../schedules/components/schedulesData';
import { SIM_END, SIM_START, type Clock } from './clock';
import { nextDeparture, upcomingStops, type Trip } from './coverageData';
import { incidentTitle, isSevere, type IncidentKind, type TrafficIncident } from './traffic';
import { incidentsAhead } from './useTraffic';

const minutesLeft = (trip: Trip, nowMin: number) => Math.max(0, Math.ceil(trip.arrival - nowMin));

const formatLeft = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;

/* Etiqueta superior del mapa: en vivo o simulación, hora y urbans en camino */
export function MapStatusPill({ clock, nowMin, count, incidents }: { clock: Clock; nowMin: number | null; count: number; incidents: number }) {
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
      {incidents > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-red-300">
          <AlertTriangle className="h-3 w-3" aria-hidden />
          {incidents}
        </span>
      )}
    </div>
  );
}

const KIND_ICON: Record<IncidentKind, LucideIcon> = {
  accident: AlertTriangle,
  hazard: AlertTriangle,
  breakdown: AlertTriangle,
  closure: OctagonX,
  lane: OctagonX,
  jam: TrafficCone,
  works: Construction,
  other: AlertTriangle,
};

const where = (incident: TrafficIncident) =>
  incident.from && incident.to ? `${incident.from} → ${incident.to}` : (incident.from ?? incident.to ?? '');

interface TripCardProps {
  trip: Trip;
  incidents: TrafficIncident[];
  nowMin: number;
  selected: boolean;
  follow: boolean;
  onFollow: () => void;
  onClose: () => void;
}

/* Detalle de la urban elegida (o la que está bajo el cursor) */
export function TripCard({ trip, incidents, nowMin, selected, follow, onFollow, onClose }: TripCardProps) {
  const next = upcomingStops(trip)[0];
  const ahead = incidentsAhead(trip, incidents);
  const holding = ahead.find(({ incident }) => incident.id === trip.heldBy)?.incident;
  const nextIncident = ahead.find(({ incident }) => incident.id !== trip.heldBy)?.incident;
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
          <span className={trip.delayMin > 0 ? 'text-red-200' : ''}>
            Llega {formatTime12(Math.round(trip.arrival))}
            {trip.delayMin > 0 && <span className="text-emerald-50/40 line-through"> {formatTime12(trip.scheduledArrival)}</span>}
          </span>
        </div>
      </div>

      {/* Avisos de tráfico: posición estimada, no GPS */}
      {holding ? (
        <div role="status" className="mt-3 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-xs text-red-100">
          <p className="flex items-center gap-1.5 font-bold text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            {incidentTitle(holding)} en este tramo
          </p>
          <p className="mt-0.5 leading-snug">
            La unidad probablemente está detenida o avanza muy lento
            {holding.delayMin ? ` (retraso reportado ~${holding.delayMin} min)` : ''}.
          </p>
        </div>
      ) : (
        nextIncident && (
          <div
            role="status"
            className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
              isSevere(nextIncident) ? 'border-red-400/30 bg-red-500/10 text-red-100' : 'border-orange-300/30 bg-orange-400/10 text-orange-100'
            }`}
          >
            <p className="font-semibold">
              Más adelante: {incidentTitle(nextIncident).toLowerCase()}
              {nextIncident.delayMin ? ` (~${nextIncident.delayMin} min)` : ''}
            </p>
            {where(nextIncident) && <p className="mt-0.5 text-[11px] opacity-80">{where(nextIncident)}</p>}
          </div>
        )
      )}

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
          <dd className="mt-0.5 font-semibold tabular-nums text-amber-200">
            {formatLeft(left)}
            {trip.delayMin > 0 && <span className="ml-1 text-[10px] font-bold text-red-300">+{trip.delayMin} min</span>}
          </dd>
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
                {trip.heldBy ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    Detenida · +{trip.delayMin} min
                  </span>
                ) : (
                  trip.delayMin > 0 && (
                    <span className="mt-1.5 inline-flex rounded-full bg-orange-400/15 px-2 py-0.5 text-[10px] font-bold text-orange-200">
                      Retraso estimado +{trip.delayMin} min
                    </span>
                  )
                )}
                <span className="mt-1.5 flex justify-between text-[10px] tabular-nums text-emerald-50/60">
                  <span>Llega {formatTime12(Math.round(trip.arrival))}</span>
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

/* Detalle de un incidente elegido en el mapa o en la lista */
export function IncidentCard({ incident, onClose }: { incident: TrafficIncident; onClose: () => void }) {
  const Icon = KIND_ICON[incident.kind];
  const severe = isSevere(incident);
  return (
    <div
      aria-live="polite"
      className={`pointer-events-auto absolute bottom-3 left-3 right-3 z-20 rounded-2xl border bg-[#04140B]/95 p-4 shadow-2xl backdrop-blur-md sm:right-auto sm:w-80 ${
        severe ? 'border-red-400/40' : 'border-orange-300/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`flex items-center gap-2 text-sm font-bold ${severe ? 'text-red-300' : 'text-orange-200'}`}>
          <Icon className="h-4 w-4" aria-hidden />
          {incidentTitle(incident)}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-50/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {incident.description && <p className="mt-1 text-sm text-white">{incident.description}</p>}
      {where(incident) && <p className="mt-1 text-xs text-emerald-50/60">{where(incident)}</p>}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-emerald-50/50">Retraso</dt>
          <dd className="mt-0.5 font-semibold text-amber-200">{incident.delayMin ? `~${incident.delayMin} min` : 'Sin dato'}</dd>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-emerald-50/50">Tramo</dt>
          <dd className="mt-0.5 font-semibold text-white">
            {incident.lengthM ? (incident.lengthM >= 1000 ? `${(incident.lengthM / 1000).toFixed(1)} km` : `${incident.lengthM} m`) : 'Sin dato'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface RoadStatusProps {
  incidents: TrafficIncident[];
  updatedAt: string;
  demo: boolean;
  selectedIncident: string | null;
  onSelect: (incident: TrafficIncident) => void;
  layers: { flow: boolean; incidents: boolean; map: boolean };
  options: MapOptions;
  onOptionsChange: (options: MapOptions) => void;
}

export interface MapOptions {
  flow: boolean;
  incidentTiles: boolean;
  baseMap: 'zoque' | 'tomtom';
}

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle} className="flex items-center gap-2.5 text-xs font-semibold text-white">
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-400' : 'bg-white/20'}`}>
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </span>
      {label}
    </button>
  );
}

// Colores de los mosaicos de TomTom (estilo oscuro), de libre a detenido
const FLOW_LEGEND = ['#22c55e', '#facc15', '#f97316', '#dc2626', '#7f1d1d'];

/* Estado de las vías: incidentes reportados sobre nuestras rutas */
const VISIBLE_INCIDENTS = 4;

export function RoadStatus({ incidents, updatedAt, demo, selectedIncident, onSelect, layers, options, onOptionsChange }: RoadStatusProps) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...incidents].sort((a, b) => Number(isSevere(b)) - Number(isSevere(a)) || (b.delayMin ?? 0) - (a.delayMin ?? 0));
  const updated = new Date(updatedAt).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-50/50">Estado de las vías</p>
        <p className="text-[10px] text-emerald-50/40">
          {demo && <span className="mr-2 rounded-full bg-amber-300/20 px-2 py-0.5 font-bold text-amber-200">Datos de demostración</span>}
          Actualizado {updated} · Tráfico © TomTom
        </p>
      </div>

      {(layers.flow || layers.incidents || layers.map) && (
        <div className="mt-2 flex flex-col gap-3 rounded-xl bg-black/20 px-3 py-3">
          {layers.map && (
            <div role="radiogroup" aria-label="Mapa base" className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-white">Mapa</span>
              <span className="flex rounded-full bg-black/30 p-0.5">
                {(
                  [
                    ['zoque', 'Zoque'],
                    ['tomtom', 'TomTom'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={options.baseMap === value}
                    onClick={() => onOptionsChange({ ...options, baseMap: value })}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      options.baseMap === value ? 'bg-amber-300 text-[#0A2C1A]' : 'text-emerald-50/70 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </span>
            </div>
          )}
          {layers.flow && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Switch on={options.flow} label="Tráfico en todas las calles" onToggle={() => onOptionsChange({ ...options, flow: !options.flow })} />
              <span className="flex items-center gap-2 text-[10px] text-emerald-50/60" aria-hidden>
                Libre
                <span className="flex h-1.5 w-20 overflow-hidden rounded-full">
                  {FLOW_LEGEND.map((color) => (
                    <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </span>
                Detenido
              </span>
            </div>
          )}
          {layers.incidents && (
            <Switch
              on={options.incidentTiles}
              label="Incidentes en todas las calles"
              onToggle={() => onOptionsChange({ ...options, incidentTiles: !options.incidentTiles })}
            />
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 px-1 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Sin incidentes reportados en nuestras rutas.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {(showAll ? sorted : sorted.slice(0, VISIBLE_INCIDENTS)).map((incident) => {
            const Icon = KIND_ICON[incident.kind];
            const severe = isSevere(incident);
            const on = selectedIncident === incident.id;
            return (
              <li key={incident.id}>
                <button
                  type="button"
                  onClick={() => onSelect(incident)}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                    on ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      severe ? 'bg-red-600 text-white' : incident.kind === 'works' ? 'bg-yellow-500 text-stone-900' : 'bg-orange-600 text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs font-semibold text-white">
                      {incidentTitle(incident)}
                      {incident.delayMin ? <span className="text-[11px] font-bold text-amber-200">~{incident.delayMin} min</span> : null}
                    </span>
                    <span className="block truncate text-[11px] text-emerald-50/60">
                      {[incident.description, where(incident)].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {sorted.length > VISIBLE_INCIDENTS && (
        <button
          type="button"
          onClick={() => setShowAll((all) => !all)}
          className="mt-1 w-full rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wider text-amber-200 transition-colors hover:bg-white/5"
        >
          {showAll ? 'Ver menos' : `Ver los ${sorted.length} incidentes`}
        </button>
      )}
    </div>
  );
}
