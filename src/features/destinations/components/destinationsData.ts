export type DestinationTag = 'origin' | 'next' | 'capital';

export interface Destination {
  id: string;
  name: string;
  duration: string;
  price: string;
  image: string;
  tag?: DestinationTag;
  info?: string;
}

export const DESTINATIONS: Destination[] = [
  { id: '1', name: 'Copainala', duration: '1h 15m', price: '$90', image: '/images/destinos/copainala.png', tag: 'origin' },
  { id: '2', name: 'Tuxtla Gutiérrez', duration: '1h 50 min', price: '$90', image: '/images/destinos/tuxtla.png', tag: 'capital' },
  { id: '3', name: 'Tecpatán', duration: '45 min', price: '$60', image: '/images/destinos/tecpatan.png' },
  { id: '4', name: 'Coapilla', duration: '1h', price: '$70', image: '/images/destinos/coapilla.png' },
  { id: '5', name: 'San Fernando', duration: '1h 20m', price: '$110', image: '/images/destinos/piramides.png' },
  { id: '6', name: 'Quechula', duration: '2h', price: '$150', image: '/images/destinos/quechulaundida.png' },
  { id: '7', name: 'Ocotepec', duration: '50 min', price: '$60', image: '/images/destinos/ocotepec.png' },
  { id: '8', name: 'Raudales Malpaso', duration: '1h 30m', price: '$120', image: '/images/destinos/raudales.png' },
  { id: '9', name: 'Ostuacan', duration: '1h 30m', price: '$120', image: '/images/destinos/ostuacan.png' },
  { id: '10', name: 'PH CFE chicoasen', duration: '1h 10m', price: '$90', image: '/images/destinos/cfe.png' },
  { id: '11', name: 'San Cristóbal', duration: '2h', price: '$150', image: '/images/destinos/sdc.png', tag: 'next' },
];

export const LOOP_ITEMS = [0, 1, 2].flatMap((copy) =>
  DESTINATIONS.map((destination) => ({ ...destination, copy, key: `${copy}-${destination.id}` })),
);