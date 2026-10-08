import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
}

/* Encabezado común: etiqueta dorada + título serif + descripción opcional */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const dark = tone === 'dark';
  const centered = align === 'center';

  return (
    <Reveal className={`${centered ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      <p
        className={`flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${
          centered ? 'justify-center' : ''
        } ${dark ? 'text-gold' : 'text-gold-dark'}`}
      >
        <span aria-hidden className="h-px w-8 bg-gradient-to-r from-gold to-transparent" />
        {eyebrow}
        {centered && <span aria-hidden className="h-px w-8 bg-gradient-to-l from-gold to-transparent" />}
      </p>
      <h2
        id={id}
        className={`mt-4 font-serif text-[2.1rem] italic leading-[1.02] tracking-[-0.03em] text-balance sm:text-5xl lg:text-[3.4rem] ${
          dark ? 'text-cream' : 'text-zoque-700'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 text-[0.95rem] leading-relaxed sm:text-base ${centered ? 'mx-auto' : ''} max-w-xl ${
            dark ? 'text-emerald-50/70' : 'text-gray-600'
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
