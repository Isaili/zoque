'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Reveal, StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface Schedule {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  frequency: string;
  price: string;
  note?: string;
  reverse?: Partial<Pick<Schedule, 'departure' | 'arrival' | 'note'>>;
}

const runsNote = (first: string, last: string) => `Corridas desde las ${first} hasta las ${last}`;

const SCHEDULES: Schedule[] = [
  { id: '1', from: 'Copainalá', to: 'Tuxtla Gutiérrez', departure: '04:00 AM', arrival: '05:30 AM', frequency: 'Cada 30 min', price: '$90', note: runsNote('4:00 AM', '7:00 PM') },
  { id: '2', from: 'Coapilla', to: 'Tuxtla Gutiérrez', departure: '05:00 AM', arrival: '08:30 AM', frequency: '1 corrida diaria', price: '$160', note: 'Pasa por Copainalá a las 7:00 AM' },
  { id: '3', from: 'Ocotepec', to: 'Tuxtla Gutiérrez', departure: '05:00 AM', arrival: '09:00 AM', frequency: '1 corrida diaria', price: '$200', note: 'Escalas en Coapilla y Copainalá' },
  { id: '4', from: 'Tecpatán', to: 'Tuxtla Gutiérrez', departure: '04:00 AM', arrival: '07:00 AM', frequency: 'Cada 2 horas', price: '$120', note: 'Pasa por Copainalá a las 5:00 AM' },
  { id: '5', from: 'Raudales Malpaso', to: 'Tuxtla Gutiérrez', departure: '04:00 AM', arrival: '06:00 AM', frequency: 'Cada 30 min', price: '$120', note: runsNote('4:00 AM', '6:30 PM') },
  { id: '6', from: 'Ostuacán', to: 'Tuxtla Gutiérrez', departure: '04:00 AM', arrival: '07:00 AM', frequency: '3 al día', price: '$210', note: 'Corridas: 4:00 AM, 11:00 AM y 4:00 PM' },
];

// Reloj por segundo: en el servidor no hay hora (null) para evitar diferencias de hidratación
const subscribeClock = (onChange: () => void) => {
  const interval = setInterval(onChange, 1000);
  return () => clearInterval(interval);
};
const getSecondStamp = () => Math.floor(Date.now() / 1000);

const DynamicClockDecoration = () => {
  const stamp = useSyncExternalStore(subscribeClock, getSecondStamp, () => null);
  const time = stamp === null ? null : new Date(stamp * 1000);

  const minutes = time ? time.getMinutes() : 0;
  const hours = time ? time.getHours() % 12 : 0;

  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30 + minutes * 0.5;

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-14 w-14 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" />
      <path d="M60 10v8M60 102v8M10 60h8M102 60h8" />
      <line x1="60" y1="60" x2="60" y2="34" strokeWidth="3.5" transform={`rotate(${hourAngle} 60 60)`} />
      <line x1="60" y1="60" x2="60" y2="22" strokeWidth="2.5" transform={`rotate(${minuteAngle} 60 60)`} />
      <circle cx="60" cy="60" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
};

interface RowView {
  row: Schedule;
  clicks: number;
  reversed: boolean;
  from: string;
  to: string;
  data: Schedule;
}

const viewOf = (row: Schedule, clicks: number): RowView => {
  const reversed = clicks % 2 === 1;
  return {
    row,
    clicks,
    reversed,
    from: reversed ? row.to : row.from,
    to: reversed ? row.from : row.to,
    data: reversed ? { ...row, ...row.reverse } : row,
  };
};

const FlipButton = ({ view, onFlip }: { view: RowView; onFlip: () => void }) => (
  <button
    type="button"
    onClick={onFlip}
    title="Invertir dirección"
    aria-label={`Invertir dirección: ${view.to} a ${view.from}`}
    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
      view.reversed ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'text-gray-400 hover:bg-gray-100 hover:text-zoque-700'
    }`}
  >
    <ArrowRight
      className="h-3.5 w-3.5 transition-transform duration-500"
      style={{ transform: `rotate(${view.clicks * 180}deg)` }}
    />
  </button>
);

const Price = ({ value }: { value: string }) => (
  <>
    {value}
    <abbr title="Pesos mexicanos" className="ml-0.5 text-[10px] font-medium text-gray-400 no-underline">
      MXN
    </abbr>
  </>
);

export const SchedulesSection = () => {
  const [flips, setFlips] = useState<Record<string, number>>({});

  const flipRoute = (id: string) => setFlips((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const views = SCHEDULES.map((row) => viewOf(row, flips[row.id] ?? 0));

  return (
    <section id="horarios" aria-labelledby="horarios-titulo" className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="horarios-titulo"
            eyebrow="Horarios"
            title={
              <>
                Horario <span className="text-gold-dark">de salidas</span>
              </>
            }
            description="Consulta nuestras corridas diarias. Toca la flecha para ver el viaje de regreso."
          />
          <Reveal delay={0.1} className="flex items-center gap-4 self-start rounded-2xl bg-gradient-to-br from-zoque-700 to-zoque-900 p-4 pr-6 text-white shadow-xl shadow-zoque-900/20 md:self-auto">
            <DynamicClockDecoration />
            <p className="text-sm leading-tight">
              <span className="block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Primera salida</span>
              <span className="font-serif text-3xl italic">4:00 AM</span>
            </p>
          </Reveal>
        </div>

        {/* Celular: tarjetas */}
        <StaggerList className="mt-10 grid gap-3 md:hidden" stagger={0.06}>
          {views.map((view) => (
            <StaggerItem key={view.row.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(6,24,15,0.2)]">
              <div className="flex items-center justify-between gap-2">
                <p className="flex min-w-0 flex-wrap items-center gap-x-1 text-sm font-semibold text-gray-900">
                  <span>{view.from}</span>
                  <FlipButton view={view} onFlip={() => flipRoute(view.row.id)} />
                  <span>{view.to}</span>
                </p>
                <p className="shrink-0 text-base font-bold text-gray-900">
                  <Price value={view.row.price} />
                </p>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-sand p-3 text-center text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-500">Salida</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{view.data.departure}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-500">Llegada</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{view.data.arrival}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-gray-500">Frecuencia</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{view.row.frequency}</dd>
                </div>
              </dl>
              {view.data.note && (
                <p className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-zoque-500">
                  <Clock className="mt-0.5 h-3 w-3 shrink-0" />
                  {view.data.note}
                </p>
              )}
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Tableta y escritorio: tabla */}
        <Reveal delay={0.1} className="mt-12 hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_-20px_rgba(6,24,15,0.25)] md:block">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-zoque-700 text-white">
              <tr className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                <th scope="col" className="px-6 py-4 font-semibold">Ruta</th>
                <th scope="col" className="px-3 py-4 text-center font-semibold">Salida</th>
                <th scope="col" className="px-3 py-4 text-center font-semibold">Llegada</th>
                <th scope="col" className="px-3 py-4 text-center font-semibold">Frecuencia</th>
                <th scope="col" className="px-6 py-4 text-center font-semibold">Precio desde</th>
              </tr>
            </thead>
            <tbody>
              {views.map((view) => (
                <tr key={view.row.id} className="border-t border-gray-100 text-gray-700 transition-colors hover:bg-sand">
                  <th scope="row" className="px-6 py-4 font-normal">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-gray-900">
                      {view.from}
                      <FlipButton view={view} onFlip={() => flipRoute(view.row.id)} />
                      {view.to}
                    </span>
                    {view.data.note && (
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-zoque-500">
                        <Clock className="h-3 w-3" />
                        {view.data.note}
                      </span>
                    )}
                  </th>
                  <td className="whitespace-nowrap px-3 py-4 text-center">{view.data.departure}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">{view.data.arrival}</td>
                  <td className="px-3 py-4 text-center text-gray-500">{view.row.frequency}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center font-bold text-gray-900">
                    <Price value={view.row.price} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <Link
            href="/horarios"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-zoque-700 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-zoque-600 hover:shadow-lg hover:shadow-zoque-900/20 sm:w-auto"
          >
            Ver todos los horarios
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};
