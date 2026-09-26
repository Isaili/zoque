'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Calendar, 
  Search, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  Luggage,
  Route
} from 'lucide-react';

interface RouteItem {
  id: string;
  from: string;
  to: string;
  state: string;
  originStation: string;
  departures: string[];
  frequency: string;
  frequencyType: 'diaria' | 'habiles' | 'sabado'; // diaria=verde, habiles(L-V)=índigo, sabado(L-S)=azul
  duration: string;
  price: number;
  available: boolean;
}

const ALL_ROUTES: RouteItem[] = [
  {
    id: '1',
    from: 'Copainalá',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Copainalá',
    departures: ['04:00', '04:30', '05:00', '...cada 30 min hasta 19:00'],
    frequency: 'Diaria',
    frequencyType: 'diaria',
    duration: '1 h 30 min',
    price: 90,
    available: true,
  },
  {
    id: '2',
    from: 'Coapilla',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Coapilla (Pasa 7:00 AM en Copainalá)',
    departures: ['05:00'],
    frequency: 'Diaria (1 corrida)',
    frequencyType: 'diaria',
    duration: '3 h 30 min',
    price: 160,
    available: true,
  },
  {
    id: '3',
    from: 'Ocotepec',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Ocotepec (Pasa Coapilla y Copainalá)',
    departures: ['05:00'],
    frequency: 'Diaria (Regreso 14:00)',
    frequencyType: 'diaria',
    duration: '4 h 00 min',
    price: 200,
    available: true,
  },
  {
    id: '4',
    from: 'Tecpatán',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Tecpatán (Pasa 5:00 AM Copainalá)',
    departures: ['04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    frequency: 'Diaria (Cada 2h)',
    frequencyType: 'diaria',
    duration: '3 h 00 min',
    price: 120,
    available: true,
  },
  {
    id: '5',
    from: 'Raudales Malpaso',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Raudales Malpaso',
    departures: ['04:00', '04:30', '...cada 30 min hasta 18:30'],
    frequency: 'Diaria',
    frequencyType: 'diaria',
    duration: '2 h 00 min',
    price: 120,
    available: true,
  },
  {
    id: '6',
    from: 'Ostuacán',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Ostuacán',
    departures: ['04:00', '11:00', '16:00'],
    frequency: 'Diaria (3 corridas)',
    frequencyType: 'diaria',
    duration: '3 h 00 min',
    price: 210,
    available: true,
  },
  {
    id: '7',
    from: 'Tecpatán',
    to: 'Raudales Malpaso',
    state: 'Chiapas, México',
    originStation: 'Tecpatán',
    departures: ['05:00', '06:00', '...cada 1h hasta 16:00'],
    frequency: 'Diaria (Cada 1h)',
    frequencyType: 'diaria',
    duration: '1 h 00 min',
    price: 60,
    available: true,
  },
];

// 3 colores de frecuencia, igual que en el diseño: Diaria (verde), Lunes a Viernes (índigo), Lunes a Sábado (azul)
const FREQUENCY_STYLES: Record<RouteItem['frequencyType'], string> = {
  diaria: 'bg-emerald-100 text-emerald-800',
  habiles: 'bg-violet-100 text-violet-700',
  sabado: 'bg-sky-100 text-sky-700',
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

        {/* TABLA DE HORARIOS Y RUTAS */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              {/* Encabezado Verde Oscuro */}
              <thead>
                <tr className="bg-[#0D3B23] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-5"><div className="flex items-center gap-1.5"><Route className="w-4 h-4 text-emerald-400" /> Ruta</div></th>
                  <th className="py-4 px-4"><div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-400" /> Origen</div></th>
                  <th className="py-4 px-4"><div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" /> Salida</div></th>
                  <th className="py-4 px-4"><div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-400" /> Frecuencia</div></th>
                  <th className="py-4 px-4"><div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" /> Duración viaje</div></th>
                  <th className="py-4 px-4"><div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-400" /> Precio</div></th>
                  <th className="py-4 px-5 text-center"><div className="flex items-center justify-center gap-1.5"><BusIcon className="w-4 h-4 text-emerald-400" /> Disponibilidad</div></th>
                </tr>
              </thead>

              {/* Filas */}
              <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      {/* Ruta */}
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-full bg-slate-100 text-emerald-800 shrink-0">
                            <Route className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="leading-snug">{route.from} <span className="text-emerald-700 font-extrabold mx-1">→</span> {route.to}</div>
                            <span className="text-[11px] font-normal text-slate-400 block mt-0.5">{route.state}</span>
                          </div>
                        </div>
                      </td>

                      {/* Origen */}
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{route.originStation}</span>
                        </div>
                      </td>

                      {/* Salida: texto compacto separado por "·" en vez de pills que se envuelven */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <span className="leading-relaxed block max-w-[190px]">
                          {route.departures.join(' · ')}
                        </span>
                      </td>

                      {/* Frecuencia */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${FREQUENCY_STYLES[route.frequencyType]}`}>
                          {route.frequency}
                        </span>
                      </td>

                      {/* Duración */}
                      <td className="py-4 px-4 font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {route.duration}
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-4 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                        ${route.price} <span className="text-[10px] font-normal text-slate-400">MXN</span>
                      </td>

                      {/* Disponibilidad */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          Disponible
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No se encontraron rutas con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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