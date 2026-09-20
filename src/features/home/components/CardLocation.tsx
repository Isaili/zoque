import { MapPin, Church } from 'lucide-react';

export function CardLocation() {
  return (
    <div className="hidden lg:flex items-center justify-between bg-slate-900/80 backdrop-blur-md border border-amber-400/30 rounded-2xl p-5 max-w-xs shadow-2xl text-white">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-400/10 rounded-xl border border-amber-400/30 text-amber-400">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-amber-100 tracking-wider text-sm uppercase">
            COPAINALÁ
          </h3>
          <p className="text-xs text-amber-100/70 mt-1 leading-snug">
            Nuestro punto de partida, tu próximo destino.
          </p>
        </div>
      </div>
      <Church className="w-10 h-10 text-amber-400/30 shrink-0 ml-2" />
    </div>
  );
}