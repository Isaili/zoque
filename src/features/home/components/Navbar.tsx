'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/9611077541';

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#destinos', label: 'Destinos' },
  { href: '#horarios', label: 'Horarios' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#contacto', label: 'Contacto' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function Logo() {
  return (
    <Link href="#inicio" className="group flex items-center gap-3" aria-label="Auto Transportes Zoque, ir al inicio">
      <svg
        className="h-9 w-9 text-gold transition-transform duration-500 group-hover:rotate-45 sm:h-10 sm:w-10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M50 8 L92 50 L50 92 L8 50 Z" />
        <path d="M50 22 L78 50 L50 78 L22 50 Z" />
        <path d="M50 36 L64 50 L50 64 L36 50 Z" />
        <line x1="50" y1="8" x2="50" y2="36" />
        <line x1="50" y1="64" x2="50" y2="92" />
        <line x1="8" y1="50" x2="36" y2="50" />
        <line x1="64" y1="50" x2="92" y2="50" />
      </svg>
      <div className="flex flex-col">
        <span className="font-serif text-xl font-semibold uppercase tracking-widest text-white sm:text-2xl">ZOQUE</span>
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-gold sm:text-[0.625rem]">
          Auto Transportes
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resalta el link de la sección que está a la vista
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    // Se observan todas las secciones para que una sin link (p. ej. Flota) no deje marcado el anterior
    document.querySelectorAll('section[id], footer[id]').forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  // Bloquea el scroll del fondo y permite cerrar con Escape mientras el menú está abierto
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const solid = isScrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        solid
          ? 'border-white/10 bg-zoque-900/85 py-3 shadow-lg shadow-black/20 backdrop-blur-md'
          : 'border-transparent bg-transparent py-4 sm:py-6'
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-16">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-1 xl:flex">
          {LINKS.map(({ href, label }) => {
            const active = activeId === href.slice(1);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'true' : undefined}
                className={`relative rounded-full px-3.5 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                  active ? 'text-gold' : 'text-white/85 hover:text-white'
                }`}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-lg hover:shadow-amber-500/20 sm:flex"
          >
            Reserva tu viaje
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-sm transition-colors hover:bg-white/10 xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="menu-movil"
            aria-label="Menú móvil"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100svh - 4.25rem)' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden xl:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-6 sm:px-6">
              {LINKS.map(({ href, label }, i) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between border-b border-white/10 py-4 font-serif text-3xl italic ${
                      activeId === href.slice(1) ? 'text-gold' : 'text-cream'
                    }`}
                  >
                    {label}
                    <span className="font-sans text-xs not-italic tracking-widest text-white/40">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
              className="px-4 pt-8 sm:px-6"
            >
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-gold px-5 py-4 text-sm font-bold uppercase tracking-wider text-slate-950"
              >
                Reserva tu viaje por WhatsApp
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
