import { CalendarClock, Landmark, MapPin } from 'lucide-react';

export const DestinationLegend = () => (
  <>
    <ul className="space-y-2 text-xs text-gray-600">
      <li className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0D3B23] text-white">
          <MapPin className="h-3 w-3" aria-hidden />
        </span>
        Ciudad de origen: de aquí salimos
      </li>
      <li className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-white">
          <Landmark className="h-3 w-3" aria-hidden />
        </span>
        Capital del estado
      </li>
      <li className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950">
          <CalendarClock className="h-3 w-3" aria-hidden />
        </span>
        Próxima corrida programada
      </li>
    </ul>
    <p className="text-xs text-gray-500">Precios en pesos mexicanos (MXN).</p>
  </>
);