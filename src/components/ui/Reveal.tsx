'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const offset = (direction: Direction, distance: number) => {
  if (direction === 'up') return { y: distance };
  if (direction === 'down') return { y: -distance };
  if (direction === 'left') return { x: distance };
  if (direction === 'right') return { x: -distance };
  return {};
};

interface RevealProps extends HTMLMotionProps<'div'> {
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
}

/* Aparece suavemente cuando entra en pantalla (una sola vez) */
export function Reveal({ direction = 'up', distance = 32, delay = 0, duration = 0.8, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: EASE }}
      {...props}
    />
  );
}

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

interface StaggerProps extends HTMLMotionProps<'ul'> {
  stagger?: number;
  delay?: number;
}

/* Lista cuyos elementos (StaggerItem) aparecen uno tras otro */
export function StaggerList({ stagger = 0.1, delay = 0, ...props }: StaggerProps) {
  return (
    <motion.ul
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<'li'>) {
  return <motion.li variants={staggerItem} {...props} />;
}
