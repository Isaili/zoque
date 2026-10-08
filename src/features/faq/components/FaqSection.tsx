'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';
import { Reveal, StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const WHATSAPP_URL = 'https://wa.me/9611077541';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: '¿Puedo cambiar mi boleto?',
    answer:
      'Sí, puedes cambiar tu boleto. Acércate a taquilla o escríbenos por WhatsApp y te ayudamos con el cambio.',
  },
  {
    question: '¿Aceptan mascotas?',
    answer: 'No. Por el momento no se permite viajar con mascotas en nuestras unidades.',
  },
  {
    question: '¿Hay descuentos para estudiantes y maestros?',
    answer: 'Sí. Estudiantes y maestros tienen 20% de descuento presentando su credencial.',
  },
  {
    question: '¿Cuánto equipaje puedo llevar?',
    answer: 'Cada pasajero puede llevar 1 maleta de mano y 1 maleta grande.',
  },
  {
    question: '¿Puedo reservar por WhatsApp?',
    answer: 'Sí. Escríbenos al 961 107 7541 y te ayudamos a apartar tu lugar.',
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className="w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="flex flex-col">
          <SectionHeading
            id="preguntas-titulo"
            eyebrow="Ayuda"
            title={
              <>
                Preguntas <span className="text-gold-dark">frecuentes</span>
              </>
            }
            description="Lo que más nos preguntan nuestros pasajeros antes de viajar."
          />
          <Reveal delay={0.15} className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image
              src="/images/flota/image.png"
              alt="Autobús de Auto Transportes Zoque"
              fill
              sizes="(min-width: 1024px) 40vw, 0px"
              className="object-cover object-[70%_center]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zoque-900/80 via-transparent to-transparent" />
            <p className="absolute inset-x-6 bottom-6 font-serif text-2xl italic text-cream">¿Tienes otra duda?</p>
          </Reveal>
        </div>

        <div>
          <StaggerList className="divide-y divide-gray-200 border-y border-gray-200" stagger={0.07}>
            {FAQS.map(({ question, answer }, index) => {
              const isOpen = open === index;
              const buttonId = `${baseId}-q${index}`;
              const panelId = `${baseId}-a${index}`;
              return (
                <StaggerItem key={question}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                    >
                      <span
                        className={`font-serif text-lg italic transition-colors sm:text-xl ${
                          isOpen ? 'text-zoque-700' : 'text-gray-900 group-hover:text-zoque-700'
                        }`}
                      >
                        {question}
                      </span>
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? 'rotate-45 border-zoque-700 bg-zoque-700 text-gold'
                            : 'border-gray-300 text-gray-500 group-hover:border-zoque-700 group-hover:text-zoque-700'
                        }`}
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 pr-12 text-[0.95rem] leading-relaxed text-gray-600">{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              );
            })}
          </StaggerList>

          <Reveal delay={0.1} className="mt-8 flex flex-col gap-4 rounded-2xl bg-sand p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              ¿No encuentras tu respuesta? <span className="font-semibold text-zoque-700">Escríbenos y te ayudamos.</span>
            </p>
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-zoque-700 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-zoque-600"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Preguntar por WhatsApp
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
