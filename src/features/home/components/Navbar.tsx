import Link from 'next/link';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-16 py-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        {/* Logo Geométrico SVG */}
        <svg 
          className="w-10 h-10 text-[#C89D55] transition-transform group-hover:scale-105" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Rombo exterior */}
          <path d="M50 8 L92 50 L50 92 L8 50 Z" />
          {/* Patrón geométrico interno */}
          <path d="M50 22 L78 50 L50 78 L22 50 Z" />
          <path d="M50 36 L64 50 L50 64 L36 50 Z" />
          {/* Cruz central entrelazada */}
          <line x1="50" y1="8" x2="50" y2="36" />
          <line x1="50" y1="64" x2="50" y2="92" />
          <line x1="8" y1="50" x2="36" y2="50" />
          <line x1="64" y1="50" x2="92" y2="50" />
        </svg>

        <div className="flex flex-col">
          <span className="text-2xl font-semibold tracking-widest text-white uppercase font-serif">
            ZOQUE
          </span>
          <span className="text-[0.625rem] tracking-[0.2em] text-[#C89D55] uppercase font-sans">
            AUTO TRANSPORTES
          </span>
        </div>
      </Link>

      {/* Navegación */}
      <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-white font-medium">
        <Link href="/" className="hover:text-[#C89D55] transition-colors">Inicio</Link>
        <Link href="#destinos" className="hover:text-[#C89D55] transition-colors">Destinos</Link>
        <Link href="#servicios" className="hover:text-[#C89D55] transition-colors">Servicios</Link>
        <Link href="#nosotros" className="hover:text-[#C89D55] transition-colors">Nosotros</Link>
        <Link href="#contacto" className="hover:text-[#C89D55] transition-colors">Contacto</Link>
      </nav>

      {/* Botón Reserva */}
      <Link 
        href="#reserva" 
        className="hidden sm:flex items-center gap-2 bg-[#C89D55] hover:bg-[#b08745] text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all"
      >
        Reserva tu viaje
      </Link>
    </header>
  );
}