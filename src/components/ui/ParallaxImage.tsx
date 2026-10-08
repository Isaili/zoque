'use client';

import Image, { type ImageProps } from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps extends Omit<ImageProps, 'fill'> {
  /* Cuánto se desplaza la foto (en %) mientras la sección cruza la pantalla */
  strength?: number;
  wrapperClassName?: string;
}

/* Foto que se mueve más lento que el scroll y se descubre con una cortina al entrar */
export function ParallaxImage({ strength = 8, wrapperClassName = '', className = '', alt, ...props }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    // El recorte va en un hijo: si estuviera en el mismo elemento, el navegador lo daría por invisible y nunca se revelaría
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${wrapperClassName}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        className="absolute inset-0"
        variants={{ hidden: { clipPath: 'inset(0 0 100% 0)' }, show: { clipPath: 'inset(0 0 0% 0)' } }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
      >
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { y, scale: 1 + (strength * 2.2) / 100 }}
        >
          <Image fill alt={alt} className={className} {...props} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
