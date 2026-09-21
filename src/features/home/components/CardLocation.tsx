import { MapPin } from 'lucide-react';

export function CardLocation() {
  return (
<div 
className="hidden lg:flex items-start gap-3 bg-cover bg-center bg-no-repeat rounded-xl border border-[#C89D55] px-[1.625rem] py-12 w-[23.4rem] shadow-2xl text-white relative overflow-hidden"
style={{ backgroundImage: `url('/images/iglesia2.png')` }}
>
<div className="relative z-10 -mt-8 ml-1 flex items-center gap-3">
<MapPin className="w-9 h-9 text-[#C89D55] flex-shrink-0" />
<div>
<h3 className="font-bold text-amber-100 tracking-wider text-base uppercase leading-tight">
            COPAINALÁ
</h3>
<p className="text-sm text-amber-100/70 mt-1 leading-snug">
            Nuestro punto de partida,<br />tu próximo destino.
</p>
</div>
</div>
</div>
  );
}