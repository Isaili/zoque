import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Une clases de Tailwind resolviendo conflictos (la misma función que usan los componentes de shadcn)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
