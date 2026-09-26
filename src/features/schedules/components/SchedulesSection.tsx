'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

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

const DynamicClockDecoration = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = time ? time.getMinutes() : 0;
  const hours = time ? time.getHours() % 12 : 0;

  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30 + minutes * 0.5;

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-24 w-24 md:h-28 md:w-28 text-white/20"
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

export const SchedulesSection = () => {
  const [flips, setFlips] = useState<Record<string, number>>({});

  const flipRoute = (id: string) => setFlips((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  return (
    <section className="w-full bg-white">
      <h2 className="sr-only">Horarios</h2>

      <div className="flex">
        <div className="hidden sm:flex shrink-0 w-36 md:w-52 flex-col items-center gap-5 pt-24 md:pt-32 pr-8 bg-gradient-to-b from-[#0D3B23] to-[#0A2C1A]">
          <p className="px-2 text-center text-lg md:text-xl font-bold leading-tight text-white">
            Horario de salidas
          </p>
          <DynamicClockDecoration />
        </div>

        <div className="relative z-10 min-w-0 flex-1 px-4 py-10 sm:-ml-8 sm:py-14 sm:pl-0 sm:pr-8 lg:pr-12">
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-lg">
            <table className="w-full min-w-[36rem] text-left text-xs md:text-sm">
              <thead>
                <tr className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-gray-800">
                  <th scope="col" className="px-5 pt-5 pb-3 font-semibold">Ruta</th>
                  <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Salida</th>
                  <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Llegada</th>
                  <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Frecuencia</th>
                  <th scope="col" className="px-5 pt-5 pb-3 text-center font-semibold">Precio desde</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULES.map((row) => {
                  const clicks = flips[row.id] ?? 0;
                  const reversed = clicks % 2 === 1;
                  const from = reversed ? row.to : row.from;
                  const to = reversed ? row.from : row.to;
                  const data = reversed ? { ...row, ...row.reverse } : row;

                  return (
                    <tr key={row.id} className="border-t border-gray-100 text-gray-700 transition-colors hover:bg-gray-50/70">
                      <th scope="row" className="px-5 py-3.5 font-normal">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          {from}
                          <button
                            type="button"
                            onClick={() => flipRoute(row.id)}
                            title="Invertir dirección"
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                              reversed ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:bg-gray-100 hover:text-[#0D3B23]'
                            }`}
                          >
                            <ArrowRight
                              className={`h-3.5 w-3.5 transition-transform duration-500 ${reversed ? 'text-amber-500' : ''}`}
                              style={{ transform: `rotate(${clicks * 180}deg)` }}
                            />
                          </button>
                          {to}
                        </span>
                        {data.note && (
                          <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#2A4822]">
                            <Clock className="h-3 w-3" />
                            {data.note}
                          </span>
                        )}
                      </th>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center">{data.departure}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center">{data.arrival}</td>
                      <td className="px-3 py-3.5 text-center text-gray-500">{row.frequency}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-center font-bold text-gray-900">
                        {row.price}
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

          <div className="mt-8 flex justify-center">
            <Link
              href="/horarios"
              className="inline-flex items-center justify-center rounded-md bg-[#0D3B23] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#164A2F]"
            >
              Ver todos los horarios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};