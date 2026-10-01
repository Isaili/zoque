import { Star } from 'lucide-react';

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
    <section id="testimonios" aria-labelledby="testimonios-titulo" className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#2A4822]">
          Testimonios
        </p>
        <h2
          id="testimonios-titulo"
          className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#0D3B23] sm:text-3xl md:text-4xl"
        >
          Lo que dicen
          <span className="block">nuestros pasajeros</span>
        </h2>

        <ul className="mt-10 grid gap-4 sm:gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, quote, rating }) => (
            <li key={name}>
              <figure className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
                <div className="flex gap-1" role="img" aria-label={`${rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                      aria-hidden
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-xs md:text-sm leading-relaxed text-gray-700">
                  {quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-[#0D3B23]"
                  >
                    {initials(name)}
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{name}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
