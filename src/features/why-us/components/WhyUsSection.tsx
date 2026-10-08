import type { LucideIcon } from 'lucide-react';
import { Armchair, Clock3, HeartHandshake, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import { StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
    <section
      id="servicios"
      aria-labelledby="por-que-titulo"
      className="relative w-full overflow-hidden bg-zoque-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(200,157,85,0.18)_0%,transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(31,107,66,0.45)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeading
          id="por-que-titulo"
          tone="dark"
          eyebrow="Servicios"
          title={
            <>
              ¿Por qué viajar <span className="text-gold">con Zoque?</span>
            </>
          }
          description="Más que un viaje: un servicio pensado para que llegues tranquilo a tu destino."
        />

        <StaggerList className="mt-12 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {BENEFITS.map(({ title, description, icon: Icon }, index) => (
            <StaggerItem
              key={title}
              className="group relative flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.07] sm:p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/30 transition-all duration-500 group-hover:bg-gold group-hover:text-zoque-900">
                <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
              </span>
              <div>
                <h3 className="font-serif text-xl italic text-cream">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-50/65">{description}</p>
              </div>
              <span
                aria-hidden
                className="absolute right-4 top-3 font-serif text-4xl italic text-white/[0.06] transition-colors duration-500 group-hover:text-gold/20"
              >
                0{index + 1}
              </span>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
};
