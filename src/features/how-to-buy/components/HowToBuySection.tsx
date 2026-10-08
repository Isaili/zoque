'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Armchair, BusFront, CreditCard, History, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

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

const EASE = [0.22, 1, 0.36, 1] as const;

export const HowToBuySection = () => {
  const listRef = useRef<HTMLOListElement>(null);
  // La línea del recorrido se dibuja conforme la lista cruza la pantalla
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 85%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const lineScale = useTransform(progress, [0, 1], [0, 1]);

  return (
    <section id="como-comprar" aria-labelledby="como-comprar-titulo" className="w-full bg-sand py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeading
          id="como-comprar-titulo"
          eyebrow="Cómo comprar un boleto"
          title={
            <>
              Así de fácil <span className="text-gold-dark">es viajar con Zoque</span>
            </>
          }
          align="center"
        />

        <ol ref={listRef} className="relative mt-14 grid gap-8 lg:grid-cols-5 lg:gap-4">
          {/* Línea: vertical en celular, horizontal en escritorio */}
          <span aria-hidden className="absolute bottom-8 left-8 top-8 w-px bg-gray-300 md:left-10 lg:hidden" />
          <motion.span
            aria-hidden
            style={{ scaleY: lineScale }}
            className="absolute bottom-8 left-8 top-8 w-px origin-top bg-gold md:left-10 lg:hidden"
          />
          <span aria-hidden className="absolute left-[10%] right-[10%] top-10 hidden h-px bg-gray-300 lg:block" />
          <motion.span
            aria-hidden
            style={{ scaleX: lineScale }}
            className="absolute left-[10%] right-[10%] top-10 hidden h-px origin-left bg-gold lg:block"
          />

          {STEPS.map(({ label, icon: Icon }, index) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
              className="group relative flex items-center gap-5 lg:flex-col lg:gap-0 lg:text-center"
            >
              <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-zoque-700 shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:border-zoque-700 group-hover:bg-zoque-700 group-hover:text-gold group-hover:shadow-xl group-hover:shadow-zoque-900/20 md:h-20 md:w-20">
                <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} aria-hidden />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-zoque-900 ring-4 ring-sand">
                  {index + 1}
                </span>
              </span>
              <span className="font-serif text-xl italic text-gray-900 lg:mt-5 lg:max-w-[9rem] lg:text-lg">{label}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};
