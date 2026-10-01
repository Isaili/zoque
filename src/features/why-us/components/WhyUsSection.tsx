import type { LucideIcon } from 'lucide-react';
import { Armchair, Clock3, HeartHandshake, MapPin, ShieldCheck, Wallet } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

const BENEFITS: Benefit[] = [
  { title: 'Seguridad', description: 'Conductores capacitados y unidades en óptimas condiciones.', icon: ShieldCheck },
  { title: 'Puntualidad', description: 'Salidas y llegadas siempre programadas.', icon: Clock3 },
  { title: 'Comodidad', description: 'Asientos confortables, aire acondicionado y limpieza.', icon: Armchair },
  { title: 'Cobertura', description: 'Rutas en diversos municipios de Chiapas.', icon: MapPin },
  { title: 'Pago sencillo', description: 'Diversas formas de pago para tu comodidad.', icon: Wallet },
  { title: 'Atención', description: 'Personal amable siempre dispuesto a ayudarte.', icon: HeartHandshake },
];

export const WhyUsSection = () => {
  return (
    <section id="servicios" aria-labelledby="por-que-titulo" className="w-full border-y border-gray-200 bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <h2
          id="por-que-titulo"
          className="text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#0D3B23] sm:text-3xl md:text-4xl"
        >
          ¿Por qué viajar
          <span className="block">con Zoque?</span>
        </h2>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {BENEFITS.map(({ title, description, icon: Icon }) => (
            <li
              key={title}
              className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-3 py-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-[#0D3B23]" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 text-xs md:text-sm font-bold text-gray-900">{title}</h3>
              <p className="mt-2 max-w-[10rem] text-[11px] md:text-xs leading-snug text-gray-500">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
