import { Fragment } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Armchair, ArrowRight, BusFront, CreditCard, History, MapPin } from 'lucide-react';

interface Step {
  label: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { label: 'Consulta horarios', icon: History },
  { label: 'Elige tu destino', icon: MapPin },
  { label: 'Reserva tu asiento', icon: Armchair },
  { label: 'Realiza tu pago', icon: CreditCard },
  { label: '¡Disfruta tu viaje!', icon: BusFront },
];

export const HowToBuySection = () => {
  return (
    <section id="como-comprar" aria-labelledby="como-comprar-titulo" className="w-full border-y border-gray-200 bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#2A4822]">
          Cómo comprar un boleto
        </p>
        <h2
          id="como-comprar-titulo"
          className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#0D3B23] sm:text-3xl md:text-4xl"
        >
          Así de fácil
          <span className="block">es viajar con Zoque</span>
        </h2>

        <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-0">
          {STEPS.map(({ label, icon: Icon }, index) => (
            <Fragment key={label}>
              {index > 0 && (
                <li aria-hidden className="hidden lg:flex lg:h-24 lg:items-center lg:px-2">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </li>
              )}
              <li className="group flex flex-col items-center text-center last:col-span-2 sm:last:col-span-1 lg:w-36">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-white text-[#0D3B23] shadow-sm transition-colors group-hover:border-[#0D3B23] group-hover:bg-[#0D3B23] group-hover:text-white md:h-24 md:w-24">
                  <Icon className="h-8 w-8 md:h-9 md:w-9" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#0D3B23] text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="mt-2 max-w-[7rem] text-xs md:text-sm font-medium leading-snug text-gray-800">{label}</span>
              </li>
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
};
