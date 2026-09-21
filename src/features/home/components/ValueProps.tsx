import React from 'react';

interface Feature {
  imageSrc: string;
  title: string;
  description: React.ReactNode; 
}

const features: Feature[] = [
  {
    imageSrc: '/icons/segure.png',
    title: 'SEGURIDAD',
    description: (
      <>
        Tu viaje, nuestra <br /> prioridad.
      </>
    ),
  },
  {
    imageSrc: '/icons/seat.png',
    title: 'CONFORT',
    description: 'Un viaje placentero de principio a fin.',
  },
  {
    imageSrc: '/icons/time.png',
    title: 'PUNTUALIDAD',
    description: 'Llegamos a tiempo, siempre.',
  },
];

export function ValueProps() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-amber-200/20">
        {features.map((item, index) => {
          return (
            <div key={index} className="flex flex-col items-center gap-1 text-white text-center">
              <img 
                src={item.imageSrc} 
                alt={item.title} 
                className="w-7 h-7 object-contain mb-2" 
              />
              <h4 className="text-[0.8625rem] font-bold tracking-widest text-white uppercase">
                {item.title}
              </h4>
              <p className="text-[0.8625rem] text-white leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}