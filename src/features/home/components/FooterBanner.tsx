import { DESTINATIONS } from '../../destinations/components/destinationsData';

const NAMES = DESTINATIONS.map((d) => d.name);

/* Cinta dorada con los destinos desplazándose sin fin */
export function FooterBanner() {
  return (
    <div className="relative w-full overflow-hidden border-y border-gold/30 bg-zoque-900 py-4 sm:py-5">
      <p className="sr-only">Destinos: {NAMES.join(', ')}</p>
      <div aria-hidden translate="no" className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {NAMES.map((name) => (
              <li key={`${copy}-${name}`} className="flex items-center">
                <span className="px-6 font-serif text-lg italic text-cream sm:px-8 sm:text-2xl">{name}</span>
                <svg viewBox="0 0 10 10" className="h-2 w-2 text-gold" fill="currentColor">
                  <path d="M5 0 10 5 5 10 0 5Z" />
                </svg>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zoque-900 to-transparent sm:w-32" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zoque-900 to-transparent sm:w-32" />
    </div>
  );
}
