'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Calendar,
  Search,
  Clock,
  ShieldCheck,
  CreditCard,
  Luggage,
} from 'lucide-react';
import { DeparturesBoard } from './DeparturesBoard';
import { ALL_ROUTES, departureTimes, formatDuration, formatTime12, type FrequencyType } from './schedulesData';

// 3 colores de frecuencia: Diaria (verde), Lunes a Viernes (índigo), Lunes a Sábado (azul)
const FREQUENCY_DOTS: Record<FrequencyType, string> = {
  diaria: 'bg-emerald-600',
  habiles: 'bg-violet-500',
  sabado: 'bg-sky-500',
};

export function HorariosSection() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Listas únicas para los select
  const origins = useMemo(() => Array.from(new Set(ALL_ROUTES.map((r) => r.from))), []);
  const destinations = useMemo(() => Array.from(new Set(ALL_ROUTES.map((r) => r.to))), []);

  // Filtrado dinámico
  const filteredRoutes = useMemo(() => {
    return ALL_ROUTES.filter((route) => {
      const matchesOrigin = selectedOrigin === 'all' || route.from === selectedOrigin;
      const matchesDestination = selectedDestination === 'all' || route.to === selectedDestination;
      return matchesOrigin && matchesDestination;
    });
  }, [selectedOrigin, selectedDestination]);

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans pb-16">
      
      {/* HERO SECTION CON IMAGEN DE FONDO */}
      <div className="relative w-full h-[280px] md:h-[340px] bg-[#0A2E1D] overflow-hidden flex items-center">
        {/* Imagen de fondo del hero */}
        <Image
          src="/images/hero-bg2.png"
          alt="Autobús en carretera"
          fill
          priority
          className="object-cover object-center opacity-85"
        />

        {/* Gradiente de superposición para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061e13]/90 via-[#0a2e1d]/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <div className="p-2 bg-emerald-500/20 backdrop-blur-md rounded-lg border border-emerald-500/30">
              <BusIcon className="w-7 h-7 text-emerald-400" />
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-300">
              EGRESA TRANSPORTISTA
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Horarios de Salidas
          </h1>
          <p className="text-sm md:text-base text-emerald-100/90 mt-2 font-medium max-w-xl">
            Conectamos tu destino, con seguridad y confianza.
          </p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL CON MARGEN SUPERIOR TRASLAPADO */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20 space-y-6">

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-xl border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Origen */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" /> Origen
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">Todos los orígenes</option>
                {origins.map((orig) => (
                  <option key={orig} value={orig}>{orig}</option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" /> Destino
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">Todos los destinos</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" /> Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Botón Buscar */}
            <div className="md:col-span-3">
              <button
                type="button"
                className="w-full bg-[#0D3B23] hover:bg-[#155433] text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>

          </div>
        </div>

        {/* TABLERO DE PRÓXIMAS SALIDAS (CORRIDA POR CORRIDA) */}
        <DeparturesBoard routes={filteredRoutes} selectedDate={selectedDate} />

        {/* TABLA DE RUTAS: misma tipografía que la lista de próximas salidas */}
        <section aria-labelledby="rutas-titulo" className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="bg-[#0D3B23] px-5 py-4 md:px-6">
            <h2 id="rutas-titulo" className="text-white font-extrabold text-lg md:text-xl tracking-tight">
              Todas las rutas
            </h2>
            <p className="text-emerald-200/80 text-xs font-medium">
              {filteredRoutes.length} {filteredRoutes.length === 1 ? 'ruta' : 'rutas'} · horario completo del día
            </p>
          </div>

          {filteredRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-left text-xs md:text-sm">
                <thead>
                  <tr className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-gray-800">
                    <th scope="col" className="px-5 pt-5 pb-3 font-semibold">Ruta</th>
                    <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Primera salida</th>
                    <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Última salida</th>
                    <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Frecuencia</th>
                    <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Duración</th>
                    <th scope="col" className="px-3 pt-5 pb-3 text-center font-semibold">Disponibilidad</th>
                    <th scope="col" className="px-5 pt-5 pb-3 text-center font-semibold">Precio desde</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((route) => {
                    const times = departureTimes(route.schedule);

                    return (
                      <tr key={route.id} className="border-t border-gray-100 text-gray-700 transition-colors hover:bg-gray-50/70">
                        <th scope="row" className="px-5 py-3.5 font-normal">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
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
                        <td className="whitespace-nowrap px-3 py-3.5 text-center">{formatTime12(times[0])}</td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center">{formatTime12(times[times.length - 1])}</td>
                        <td className="px-3 py-3.5 text-center text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${FREQUENCY_DOTS[route.frequencyType]}`} />
                            {route.frequency}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-500">{formatDuration(route.durationMin)}</td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${route.available ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                            {route.available ? 'Disponible' : 'Sin servicio'}
                          </span>
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
              No se encontraron rutas con los filtros seleccionados.
            </p>
          )}
        </section>

        {/* PIE DE PÁGINA INFORMATIVO (FOOTER INFERIOR DE LA IMAGEN) */}
        <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-sm">
          
          {/* Viaja Seguro */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Viaja seguro</h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Nuestros autobuses cuentan con seguro de pasajeros y unidades en excelente estado.
              </p>
            </div>
          </div>

          {/* Formas de Pago */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Formas de pago</h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Efectivo, tarjeta y transferencias bancarias directas.
              </p>
            </div>
          </div>

          {/* Equipaje Permitido */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Equipaje permitido</h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                1 maleta de mano + 1 maleta grande por pasajero.
              </p>
            </div>
          </div>

          {/* Logo / Slogan Ilustrativo */}
          <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0">
            <span className="italic font-serif text-lg text-emerald-900 font-bold">
              Tu destino está más cerca
            </span>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 to-transparent rounded-full mt-1" />
          </div>

        </div>

      </div>
    </div>
  );
}

/* Icono Auxiliar para Bus */
function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l2-2m4 0l2 2m-6-6h6m-8 10h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
    </svg>
  );
}