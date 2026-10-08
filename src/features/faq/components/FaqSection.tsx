'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const WHATSAPP_URL = 'https://wa.me/9611077541';

const FAQS: FaqItem[] = [
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

export function FaqSection() {
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className="w-full overflow-hidden bg-surface py-16 sm:py-20 lg:py-24">
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
          <Reveal delay={0.1}>
            <FaqAccordion items={FAQS} defaultOpenIndex={0} className="border-y border-gray-200" />
          </Reveal>

          <Reveal delay={0.1} className="mt-8 flex flex-col gap-4 rounded-2xl bg-sand p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              ¿No encuentras tu respuesta? <span className="font-semibold text-brand">Escríbenos y te ayudamos.</span>
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
