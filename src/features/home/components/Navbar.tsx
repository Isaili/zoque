'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [isAboutSectionActive, setIsAboutSectionActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById('nosotros');
      if (!aboutSection) {
        setIsAboutSectionActive(false);
        return;
      }

      const rect = aboutSection.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2;
      setIsAboutSectionActive(isVisible);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const navTextClass = isAboutSectionActive ? 'text-[#0d3b2d]' : 'text-white';
  const hoverClass = isAboutSectionActive ? 'hover:text-[#0d3b2d]' : 'hover:text-[#C89D55]';

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-16 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group">
        <svg 
          className="w-10 h-10 text-[#C89D55] transition-transform group-hover:scale-105" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
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
          <span className={`text-2xl font-semibold tracking-widest uppercase font-serif ${navTextClass}`}>
            ZOQUE
          </span>
          <span className="text-[0.625rem] tracking-[0.2em] text-[#C89D55] uppercase font-sans">
            AUTO TRANSPORTES
          </span>
        </div>
      </Link>

      <nav className={`hidden md:flex items-center gap-8 text-xs tracking-widest uppercase font-medium ${navTextClass}`}>
        <Link href="/" className={`transition-colors ${hoverClass}`}>Inicio</Link>
        <Link href="#destinos" className={`transition-colors ${hoverClass}`}>Destinos</Link>
        <Link href="#servicios" className={`transition-colors ${hoverClass}`}>Servicios</Link>
        <Link href="#nosotros" className={`transition-colors ${hoverClass}`}>Nosotros</Link>
        <Link href="#contacto" className={`transition-colors ${hoverClass}`}>Contacto</Link>
      </nav>

      <Link 
        href="#reserva" 
        className="hidden sm:flex items-center gap-2 bg-[#C89D55] hover:bg-[#b08745] text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all"
      >
        Reserva tu viaje
      </Link>
    </header>
  );
}