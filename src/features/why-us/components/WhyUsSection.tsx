import type { LucideIcon } from 'lucide-react';
import { AlarmClock, BusFront, HandCoins, Headset, MapPin, ShieldCheck } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

const BENEFITS: Benefit[] = [
  { title: 'Unidades', description: 'modernas y cómodas', icon: BusFront },
  { title: 'Seguridad', description: 'en cada kilómetro', icon: ShieldCheck },
  { title: 'Puntualidad', description: 'en todos nuestros viajes', icon: AlarmClock },
  { title: 'Atención', description: 'amable y personalizada', icon: Headset },
  { title: 'Precios', description: 'justos y accesibles', icon: HandCoins },
  { title: 'Cobertura', description: 'en toda la región', icon: MapPin },
];

export const WhyUsSection = () => {
  return (
    <section id="servicios" aria-labelledby="por-que-titulo" className="w-full bg-white px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-xl border border-gray-100 bg-gray-50/70 px-6 py-10 shadow-lg sm:px-10 sm:py-12">
        <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#2A4822]">
          ¿Por qué viajar con nosotros?
        </p>
        <h2
          id="por-que-titulo"
          className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#0D3B23] sm:text-3xl md:text-4xl"
        >
          Tu viaje,
          <span className="block">nuestra prioridad</span>
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {BENEFITS.map(({ title, description, icon: Icon }) => (
            <li key={title} className="group flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/70 text-[#0D3B23] transition-colors group-hover:bg-[#0D3B23] group-hover:text-white md:h-20 md:w-20">
                <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-xs md:text-sm font-bold text-gray-900">{title}</h3>
              <p className="mt-1 max-w-[9rem] text-[11px] md:text-xs leading-snug text-gray-500">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
