import { ShieldCheck, Armchair, Clock } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'SEGURIDAD',
    description: 'Tu viaje, nuestra prioridad.',
  },
  {
    icon: Armchair,
    title: 'CONFORT',
    description: 'Un viaje placentero de principio a fin.',
  },
  {
    icon: Clock,
    title: 'PUNTUALIDAD',
    description: 'Llegamos a tiempo, siempre.',
  },
];

export function ValueProps() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-amber-200/20 max-w-2xl">
      {features.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex flex-col gap-1 text-white">
            <Icon className="w-6 h-6 text-amber-400 mb-1" />
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">
              {item.title}
            </h4>
            <p className="text-xs text-white leading-relaxed">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}