import Image from 'next/image';
import { Clock, Landmark, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Destination } from './destinationsData';

interface DestinationCardProps {
  destination: Destination & { copy: number; key: string };
  cardRef: (element: HTMLDivElement | null) => void;
}

const getBorderClass = (tag: Destination['tag']) => {
  if (tag === 'origin') return 'border-2 border-[#2A4822]';
  if (tag === 'next') return 'border-2 border-dashed border-amber-400';
  return 'border border-gray-200/80';
};

const linkClass = 'font-medium underline underline-offset-2 text-[#2A4822] hover:text-[#1E3518]';

const renderDefaultInfo = (tabIndex: number): ReactNode => (
  <>
    Copainalá es un{' '}
    <a href="https://visitchiapas.com/v1/Pueblo-magico-de-copainala" target="_blank" rel="noopener noreferrer" tabIndex={tabIndex} className={linkClass}>
      Pueblo Mágico
    </a>{' '}
    ubicado en el noroeste montañoso del estado de{' '}
    <a href="https://es.wikipedia.org/wiki/Copainal%C3%A1" target="_blank" rel="noopener noreferrer" tabIndex={tabIndex} className={linkClass}>
      Chiapas
    </a>
    , famoso por ser el corazón de la cultura zoque.
  </>
);

const DestinationBadge = ({ tag }: Pick<Destination, 'tag'>) => {
  if (tag === 'origin') {
    return (
      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#0D3B23] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
        <MapPin className="h-3 w-3" aria-hidden />
        Ciudad de origen
      </span>
    );
  }

  if (tag === 'capital') {
    return (
      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-sky-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
        <Landmark className="h-3 w-3" aria-hidden />
        Capital del estado
      </span>
    );
  }

  if (tag === 'next') {
    return (
      <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-amber-950 shadow">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-900/60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-900" />
        </span>
        Próxima corrida
      </span>
    );
  }

  return null;
};

const DestinationFront = ({ destination }: Pick<DestinationCardProps, 'destination'>) => (
  <div className={`absolute inset-0 bg-white rounded-xl shadow-sm group-hover:shadow-md overflow-hidden flex flex-col justify-between [backface-visibility:hidden] ${getBorderClass(destination.tag)}`}>
    <div className="relative w-full h-48 bg-gray-200">
      <Image src={destination.image} alt={destination.name} fill draggable={false} className="object-cover pointer-events-none" />
      <DestinationBadge tag={destination.tag} />
    </div>
    <div className="p-3.5 flex flex-col justify-between flex-grow">
      <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-1">{destination.name}</h3>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{destination.duration}</span>
        </div>
        <div className="font-medium text-gray-700">
          <span className="text-[10px] text-gray-400 mr-1">Desde</span>
          <span className="font-bold text-gray-900">{destination.price}</span>
          <abbr title="Pesos mexicanos" className="ml-0.5 text-[10px] font-medium text-gray-400 no-underline">MXN</abbr>
        </div>
      </div>
    </div>
  </div>
);

const DestinationBack = ({ destination }: Pick<DestinationCardProps, 'destination'>) => (
  <div className={`absolute inset-0 rounded-xl bg-white p-5 flex flex-col overflow-hidden shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] ${getBorderClass(destination.tag)}`}>
    <h3 className="font-bold text-gray-800 text-base leading-tight">{destination.name}</h3>
    <div className="my-3 h-px w-full bg-gray-100" />
    <p className="text-sm leading-relaxed text-gray-600">{destination.info ?? renderDefaultInfo(destination.copy === 1 ? 0 : -1)}</p>
  </div>
);

export const DestinationCard = ({ destination, cardRef }: DestinationCardProps) => (
  <div ref={cardRef} aria-hidden={destination.copy !== 1} className="group w-52 h-72 flex-shrink-0 [perspective:1000px]">
    <div className="relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] motion-reduce:transition-none">
      <DestinationFront destination={destination} />
      <DestinationBack destination={destination} />
    </div>
  </div>
);