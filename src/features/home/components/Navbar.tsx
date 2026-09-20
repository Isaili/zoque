import Link from 'next/link';
import { Ticket, Bus } from 'lucide-react';

export function Navbar() {
  return (
    <header className="w-full absolute top-0 left-0 z-20 px-6 lg:px-16 py-6 flex items-center justify-between text-white">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="border border-amber-400/50 p-2 rounded-lg bg-black/20 backdrop-blur-xs">
          <Bus className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-widest leading-none font-serif text-amber-100">
            ZOQUE
          </h1>
          <span className="text-[10px] tracking-widest text-amber-200/80 uppercase block">
            Auto Transportes
          </span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider text-amber-100/90">
        <Link href="#inicio" className="hover:text-amber-400 transition-colors border-b-2 border-amber-400 pb-1">
          INICIO
        </Link>
        <Link href="#destinos" className="hover:text-amber-400 transition-colors">
          DESTINOS
        </Link>
        <Link href="#servicios" className="hover:text-amber-400 transition-colors">
          SERVICIOS
        </Link>
        <Link href="#nosotros" className="hover:text-amber-400 transition-colors">
          NOSOTROS
        </Link>
        <Link href="#contacto" className="hover:text-amber-400 transition-colors">
          CONTACTO
        </Link>
      </nav>

      {/* Botón Reserva */}
      <Link
        href="#reserva"
        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-amber-400/20"
      >
        <Ticket className="w-4 h-4" />
        Reserva tu viaje
      </Link>
    </header>
  );
}