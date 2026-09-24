import Image from 'next/image';
import { Clock } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  duration: string;
  price: string;
  image: string;
}

const DESTINATIONS: Destination[] = [
  { id: '1', name: 'Copainala', duration: '1h 15m', price: '$90', image: '/images/copainala.png' },
  { id: '2', name: 'Tuxtla Gutiérrez', duration: '1h 50 min', price: '$90', image: '/images/tuxtla.png' },
  { id: '3', name: 'Tecpatán', duration: '45 min', price: '$60', image: '/images/tecpatan.png' },
  { id: '4', name: 'Coapilla', duration: '1h', price: '$70', image: '/images/coapilla.png' },
  { id: '5', name: 'San Fernando', duration: '1h 20m', price: '$110', image: '/images/piramides.png' },
  { id: '6', name: 'Quechula', duration: '2h', price: '$150', image: '/images/quechulaundida.png' },
  { id: '7', name: 'Ocotepec', duration: '50 min', price: '$60', image: '/images/ocotepec.png' },
  { id: '8', name: 'Raudales Malpaso', duration: '1h 30m', price: '$120', image: '/images/raudales.png' },
  { id: '9', name: 'Ostuacan', duration: '1h 30m', price: '$120', image: '/images/ostuacan.png' },
  { id: '10', name: 'PH CFE chicoasen', duration: '1h 10m', price: '$90', image: '/images/cfe.png' },
  { id: '11', name: 'San Cristóbal', duration: '2h', price: '$150', image: '/images/sdc.png' },
];

export const DestinationsSection = () => {
  return (
    <section className="w-full bg-gray-100/90 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-center">
        
        {/* Columna Izquierda: Título y Botón */}
        <div className="w-full lg:w-1/4 flex flex-col justify-between space-y-6 flex-shrink-0">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D3B23] tracking-tight uppercase leading-tight mb-4">
              DESTINOS<br />QUE NOS UNEN
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Viaja a las principales ciudades y comunidades de Chiapas.
            </p>
          </div>

          <div>
            <button className="w-full sm:w-auto px-6 py-3 bg-[#2A4822] hover:bg-[#1E3518] text-white font-semibold text-xs sm:text-sm rounded-md transition-colors uppercase tracking-wider">
              VER TODOS LOS DESTINOS
            </button>
          </div>
        </div>

        {/* Columna Derecha: Contenedor con Scroll Horizontal */}
        <div className="w-full lg:w-3/4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex gap-4 min-w-max">
            {DESTINATIONS.map((destination) => (
              <div
                key={destination.id}
                /* Ancho de 52 Tailwind units (13rem) y tarjetas con mayor presencia general */
                className="w-52 bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between flex-shrink-0"
              >
                {/* Imagen más alta (h-48) */}
                <div className="relative w-full h-48 bg-gray-200">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-3.5 flex flex-col justify-between flex-grow">
                  <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-1">
                    {destination.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{destination.duration}</span>
                    </div>
                    <div className="font-medium text-gray-700">
                      <span className="text-[10px] text-gray-400 mr-1">Desde</span>
                      <span className="font-bold text-gray-900">{destination.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};