'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import { buildDepartures, formatTime, type Departure, type RouteItem } from './schedulesData';

const INITIAL_VISIBLE = 10;
const BOARDING_WINDOW_MIN = 15;

type Status = 'abordando' | 'a-tiempo' | 'programada';

const STATUS_STYLES: Record<Status, { label: string; className: string; dot: string }> = {
  abordando: { label: 'Abordando', className: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500 animate-pulse' },
  'a-tiempo': { label: 'A tiempo', className: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' },
  programada: { label: 'Programada', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

// Reloj por minuto: en el servidor no hay hora (null) para evitar diferencias de hidratación
const subscribeClock = (onChange: () => void) => {
  const interval = setInterval(onChange, 15_000);
  return () => clearInterval(interval);
};
const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerMinuteSnapshot = () => null;

const todayISO = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

interface DeparturesBoardProps {
  routes: RouteItem[];
  selectedDate: string;
}

export function DeparturesBoard({ routes, selectedDate }: DeparturesBoardProps) {
  const minuteStamp = useSyncExternalStore(subscribeClock, getMinuteSnapshot, getServerMinuteSnapshot);
  const now = useMemo(() => (minuteStamp === null ? null : new Date(minuteStamp * 60_000)), [minuteStamp]);
  const [expanded, setExpanded] = useState(false);

  const isToday = now !== null && (selectedDate === '' || selectedDate === todayISO(now));
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;

  const allDepartures = useMemo(() => buildDepartures(routes), [routes]);
  const departures = useMemo(
    () => (isToday ? allDepartures.filter((d) => d.time >= nowMin) : allDepartures),
    [allDepartures, isToday, nowMin],
  );

  const visible = expanded ? departures : departures.slice(0, INITIAL_VISIBLE);
  const hiddenCount = departures.length - visible.length;

  const statusOf = (departure: Departure): Status => {
    if (!isToday) return 'programada';
    return departure.time - nowMin <= BOARDING_WINDOW_MIN ? 'abordando' : 'a-tiempo';
  };

  const dayLabel = selectedDate && (!now || selectedDate !== todayISO(now)) ? formatDateLabel(selectedDate) : 'Hoy';

  return (
    <section aria-labelledby="salidas-titulo" className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Encabezado del tablero */}
      <div className="bg-[#0D3B23] px-5 py-4 md:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="salidas-titulo" className="text-white font-extrabold text-lg md:text-xl tracking-tight">
            Próximas salidas
          </h2>
          <p className="text-emerald-200/80 text-xs font-medium">
            <span className="capitalize">{dayLabel}</span> · {departures.length} corridas {isToday ? 'restantes' : 'programadas'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-black/25 border border-emerald-500/30 px-3.5 py-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-lg font-bold text-emerald-300 tabular-nums">
            {now ? formatTime(nowMin) : '--:--'}
          </span>
        </div>
      </div>

      {/* Encabezado de columnas (escritorio) */}
      <div className="hidden md:grid grid-cols-[90px_minmax(0,2fr)_minmax(0,1.6fr)_90px_90px_130px] gap-4 px-6 pt-5 pb-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-gray-800">
        <span>Salida</span>
        <span>Ruta</span>
        <span>Origen</span>
        <span>Llegada</span>
        <span>Precio</span>
        <span className="text-center">Estado</span>
      </div>

      {/* Lista de corridas */}
      {visible.length > 0 ? (
        <ol className="text-xs md:text-sm text-gray-700">
          {visible.map((departure) => {
            const { route } = departure;
            const status = STATUS_STYLES[statusOf(departure)];
            const minutesLeft = departure.time - nowMin;

            return (
              <li
                key={departure.key}
                className="grid grid-cols-[72px_minmax(0,1fr)_auto] md:grid-cols-[90px_minmax(0,2fr)_minmax(0,1.6fr)_90px_90px_130px] gap-x-4 gap-y-1 items-center border-t border-gray-100 px-5 md:px-6 py-3.5 hover:bg-gray-50/70 transition-colors"
              >
                {/* Hora de salida */}
                <div className="row-span-2 md:row-span-1">
                  <span className="block whitespace-nowrap tabular-nums">
                    {formatTime(departure.time)}
                  </span>
                  {isToday && minutesLeft < 60 && (
                    <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#2A4822]">
                      <Clock className="h-3 w-3" />
                      {minutesLeft <= 0 ? 'Saliendo' : `en ${minutesLeft} min`}
                    </span>
                  )}
                </div>

                {/* Ruta */}
                <div className="min-w-0 font-normal">
                  <span className="inline-flex flex-wrap items-center gap-x-1.5">
                    {route.from}
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {route.to}
                  </span>
                </div>

                {/* Estado (móvil a la derecha, escritorio en su columna) */}
                <div className="md:order-last md:text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${status.className}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Origen */}
                <div className="col-start-2 col-span-2 md:col-span-1 md:col-start-auto min-w-0 flex flex-wrap items-start gap-x-1.5 text-[11px] font-medium text-[#2A4822] md:text-sm md:font-normal md:text-gray-500">
                  <MapPin className="h-3 w-3 shrink-0 mt-0.5 md:h-3.5 md:w-3.5" />
                  <span className="leading-snug min-w-0 flex-1">{route.originStation}</span>
                  <span className="md:hidden basis-full pl-[18px] text-gray-500 font-normal">
                    Llega {formatTime(departure.time + route.durationMin)} · ${route.price}
                  </span>
                </div>

                {/* Llegada y precio (escritorio) */}
                <span className="hidden md:block whitespace-nowrap tabular-nums">
                  {formatTime(departure.time + route.durationMin)}
                </span>
                <span className="hidden md:block whitespace-nowrap font-bold text-gray-900">
                  ${route.price}
                  <abbr title="Pesos mexicanos" className="ml-0.5 text-[10px] font-medium text-gray-400 no-underline">
                    MXN
                  </abbr>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-center py-12 px-4 text-xs md:text-sm text-gray-500">
          {allDepartures.length > 0
            ? `Ya no hay corridas por hoy. La primera salida de mañana es a las ${formatTime(allDepartures[0].time)}.`
            : 'No se encontraron corridas con los filtros seleccionados.'}
        </p>
      )}

      {/* Ver más / menos */}
      {departures.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-gray-100 text-xs font-semibold uppercase tracking-wider text-[#0D3B23] hover:bg-gray-50 transition-colors"
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Ver {hiddenCount} corridas más <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </section>
  );
}
