import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Armchair, Cctv, MapPin, MonitorPlay, Snowflake, Wifi } from 'lucide-react';

interface Amenity {
  label: string;
  note?: string;
  icon: LucideIcon;
}

const AMENITIES: Amenity[] = [
  { label: 'Aire acondicionado', icon: Snowflake },
  { label: 'Asientos reclinables', icon: Armchair },
  { label: 'WiFi', note: '(en unidades seleccionadas)', icon: Wifi },
  { label: 'Pantallas individuales', icon: MonitorPlay },
  { label: 'GPS', icon: MapPin },
  { label: 'Cámaras de seguridad', icon: Cctv },
];

export const FleetSection = () => {
  return (
    <section id="flota" aria-labelledby="flota-titulo" className="w-full bg-white">
      <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Texto */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#2A4822]">
            Nuestra flotilla
          </p>
          <h2
            id="flota-titulo"
            className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#0D3B23] sm:text-3xl lg:text-[2rem] xl:text-4xl"
          >
            Flota moderna,
            <span className="block">viaje placentero</span>
          </h2>
          <p className="mt-4 max-w-sm text-xs md:text-sm leading-relaxed text-gray-600">
            Contamos con unidades equipadas para brindarte la máxima comodidad en cada trayecto.
          </p>
          <div className="mt-8">
            <Link
              href="#flota"
              className="inline-flex items-center justify-center rounded-md bg-[#0D3B23] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#164A2F]"
            >
              Conoce nuestra flota
            </Link>
          </div>
        </div>

        {/* Imagen con amenidades encima */}
        <div className="relative flex flex-col sm:min-h-[28rem] sm:justify-end lg:min-h-[32rem]">
          {/* En móvil la foto va arriba y las amenidades debajo; desde sm se encima la tarjeta */}
          <div className="relative h-56 sm:absolute sm:inset-0 sm:h-auto">
            <Image
              src="/images/image.png"
              alt="Autobús de Auto Transportes Zoque en carretera"
              fill
              sizes="(min-width: 1024px) 65vw, 100vw"
              className="object-cover object-[70%_center]"
            />
          </div>
          {/* Degradado para fundir la foto con el panel de texto */}
          <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />

          <ul className="relative z-10 grid grid-cols-3 gap-x-2 gap-y-5 bg-white px-3 py-6 sm:m-5 sm:grid-cols-6 sm:rounded-xl sm:bg-white/95 sm:px-4 sm:py-5 sm:shadow-lg sm:backdrop-blur">
            {AMENITIES.map(({ label, note, icon: Icon }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <Icon className="h-6 w-6 text-[#0D3B23]" strokeWidth={1.75} aria-hidden />
                <span className="mt-2 text-[11px] md:text-xs font-medium leading-snug text-gray-800">{label}</span>
                {note && <span className="text-[10px] leading-snug text-gray-500">{note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
