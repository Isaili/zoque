'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { buildDepartures, formatTime, formatTime12, type Departure, type RouteItem } from './schedulesData';

const INITIAL_VISIBLE = 10;
const BOARDING_WINDOW_MIN = 15;

type Status = 'abordando' | 'a-tiempo' | 'programada';

const STATUS_STYLES: Record<Status, { label: string; className: string; dot: string }> = {
  abordando: { label: 'Abordando', className: 'text-amber-600 dark:text-amber-300', dot: 'bg-amber-500 animate-pulse' },
  'a-tiempo': { label: 'A tiempo', className: 'text-gray-500', dot: 'bg-emerald-600' },
  programada: { label: 'Programada', className: 'text-gray-500', dot: 'bg-gray-400' },
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
    <section aria-labelledby="salidas-titulo" className="overflow-hidden rounded-xl border border-gray-100 bg-surface shadow-lg">
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

      {/* Tabla de corridas: misma tipografía que la tabla de horarios de la portada */}
      {visible.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-xs md:text-sm">
            <thead>
              <tr className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-gray-800">
                <th scope="col" className="px-5 pt-5 pb-3 font-semibold">Ruta</th>
                <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Salida</th>
                <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Llegada</th>
                <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Estado</th>
                <th scope="col" className="px-5 pt-5 pb-3 text-center font-semibold">Precio desde</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((departure) => {
                const { route } = departure;
                const status = STATUS_STYLES[statusOf(departure)];
                const minutesLeft = departure.time - nowMin;

                return (
                  <tr key={departure.key} className="border-t border-gray-100 text-gray-700 transition-colors hover:bg-gray-50/70">
                    <th scope="row" className="px-5 py-3.5 font-normal">
                      <span translate="no" className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {route.from}
                        <span className="inline-flex h-6 w-6 items-center justify-center text-gray-400">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                        {route.to}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#2A4822]">
                        <Clock className="h-3 w-3" />
                        {route.note}
                      </span>
                    </th>
                    <td className="whitespace-nowrap px-3 py-3.5 text-center">{formatTime12(departure.time)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-center">
                      {formatTime12(departure.time + route.durationMin)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 ${status.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      {isToday && minutesLeft < 60 && (
                        <span className="block text-[11px] font-medium text-[#2A4822]">
                          {minutesLeft <= 0 ? 'Saliendo' : `Sale en ${minutesLeft} min`}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-center font-bold text-gray-900">
                      ${route.price}
                      <abbr title="Pesos mexicanos" className="ml-0.5 text-[10px] font-medium text-gray-400 no-underline">
                        MXN
                      </abbr>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-12 px-4 text-xs md:text-sm text-gray-500">
          {allDepartures.length > 0
            ? `Ya no hay corridas por hoy. La primera salida de mañana es a las ${formatTime12(allDepartures[0].time)}.`
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
