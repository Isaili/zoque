import { Quote, Star } from 'lucide-react';
import { StaggerItem, StaggerList } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface Testimonial {
  name: string;
  quote: string;
  rating: number;
}

// Textos de ejemplo del diseño: reemplazar por opiniones reales de pasajeros
const TESTIMONIALS: Testimonial[] = [
  { name: 'María González', quote: 'Siempre viajo con Zoque porque llegan puntuales y el servicio es excelente.', rating: 5 },
  { name: 'Juan Pérez', quote: 'Los autobuses están muy limpios y los choferes son muy amables.', rating: 5 },
  { name: 'Ana López', quote: 'La mejor opción para viajar cómodo y seguro dentro de Chiapas.', rating: 5 },
];

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export const TestimonialsSection = () => {
  return (
    <section id="testimonios" aria-labelledby="testimonios-titulo" className="w-full bg-surface py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <SectionHeading
          id="testimonios-titulo"
          eyebrow="Testimonios"
          title={
            <>
              Lo que dicen <span className="text-gold-dark">nuestros pasajeros</span>
            </>
          }
        />

        <StaggerList className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" stagger={0.12}>
          {TESTIMONIALS.map(({ name, quote, rating }, index) => (
            <StaggerItem key={name} className={index === 1 ? 'md:translate-y-8' : ''}>
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-sand p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(6,24,15,0.35)] sm:p-8">
                <Quote
                  aria-hidden
                  className="absolute -right-2 -top-2 h-24 w-24 rotate-180 text-gold/10 transition-colors duration-500 group-hover:text-gold/20"
                />
                <div className="flex gap-1" role="img" aria-label={`${rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`}
                      aria-hidden
                    />
                  ))}
                </div>
                <blockquote className="relative mt-5 flex-1 font-serif text-lg italic leading-relaxed text-gray-800 sm:text-xl">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-gray-200/70 pt-5">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zoque-700 text-xs font-bold text-gold"
                  >
                    {initials(name)}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
};
