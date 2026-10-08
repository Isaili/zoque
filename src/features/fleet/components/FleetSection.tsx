import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Armchair, Cctv, MapPin, MonitorPlay, Snowflake, Wifi } from 'lucide-react';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal, StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
    <section id="flota" aria-labelledby="flota-titulo" className="w-full overflow-hidden bg-white">
      <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Texto */}
        <div className="flex flex-col justify-center px-4 py-16 sm:px-10 sm:py-20 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          <SectionHeading
            id="flota-titulo"
            eyebrow="Nuestra flotilla"
            title={
              <>
                Flota moderna, <span className="text-gold-dark">viaje placentero</span>
              </>
            }
            description="Contamos con unidades equipadas para brindarte la máxima comodidad en cada trayecto."
          />
          <Reveal delay={0.15} className="mt-8">
            <Link
              href="#cobertura"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-zoque-700 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-zoque-600 hover:shadow-lg hover:shadow-zoque-900/20 sm:w-fit"
            >
              Ver nuestras rutas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>

        {/* Imagen con amenidades encima */}
        <div className="relative flex flex-col sm:min-h-[30rem] sm:justify-end lg:min-h-[36rem]">
          <ParallaxImage
            src="/images/flota/image.png"
            alt="Autobús de Auto Transportes Zoque en carretera"
            sizes="(min-width: 1024px) 65vw, 100vw"
            className="object-cover object-[70%_center]"
            wrapperClassName="h-60 sm:absolute sm:inset-0 sm:h-auto"
          />
          {/* Degradado para fundir la foto con el panel de texto */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-white to-transparent lg:block" />

          <StaggerList
            stagger={0.07}
            className="relative z-10 mx-4 -mt-10 mb-8 grid grid-cols-2 gap-x-2 gap-y-5 rounded-2xl bg-white px-3 py-6 shadow-xl shadow-zoque-900/10 min-[420px]:grid-cols-3 sm:m-5 sm:grid-cols-6 sm:bg-white/95 sm:px-4 sm:py-5 sm:backdrop-blur"
          >
            {AMENITIES.map(({ label, note, icon: Icon }) => (
              <StaggerItem key={label} className="group flex flex-col items-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-zoque-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-zoque-700 group-hover:text-gold">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="mt-2 text-[11px] font-medium leading-snug text-gray-800 md:text-xs">{label}</span>
                {note && <span className="text-[10px] leading-snug text-gray-500">{note}</span>}
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </div>
    </section>
  );
};
