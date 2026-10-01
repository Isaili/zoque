export type FrequencyType = 'diaria' | 'habiles' | 'sabado'; // diaria=verde, habiles(L-V)=índigo, sabado(L-S)=azul

// Una corrida por intervalo (p. ej. cada 30 min de 04:00 a 19:00) o una lista fija de horas
export type DepartureRule =
  | { first: string; last: string; everyMin: number }
  | { times: string[] };

export interface RouteItem {
  id: string;
  from: string;
  to: string;
  state: string;
  originStation: string;
  note: string;
  schedule: DepartureRule;
  frequency: string;
  frequencyType: FrequencyType;
  durationMin: number;
  price: number;
  available: boolean;
}

export interface Departure {
  key: string;
  time: number; // minutos desde medianoche
  route: RouteItem;
}

export const ALL_ROUTES: RouteItem[] = [
  {
    id: '1',
    from: 'Copainalá',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Copainalá',
    note: 'Corridas desde las 4:00 AM hasta las 7:00 PM',
    schedule: { first: '04:00', last: '19:00', everyMin: 30 },
    frequency: 'Diaria',
    frequencyType: 'diaria',
    durationMin: 90,
    price: 90,
    available: true,
  },
  {
    id: '2',
    from: 'Coapilla',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Coapilla (Pasa 7:00 AM en Copainalá)',
    note: 'Pasa por Copainalá a las 7:00 AM',
    schedule: { times: ['05:00'] },
    frequency: 'Diaria (1 corrida)',
    frequencyType: 'diaria',
    durationMin: 210,
    price: 160,
    available: true,
  },
  {
    id: '3',
    from: 'Ocotepec',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Ocotepec (Pasa Coapilla y Copainalá)',
    note: 'Escalas en Coapilla y Copainalá',
    schedule: { times: ['05:00'] },
    frequency: 'Diaria (Regreso 14:00)',
    frequencyType: 'diaria',
    durationMin: 240,
    price: 200,
    available: true,
  },
  {
    id: '4',
    from: 'Tecpatán',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Tecpatán (Pasa 5:00 AM Copainalá)',
    note: 'Pasa por Copainalá a las 5:00 AM',
    schedule: { first: '04:00', last: '18:00', everyMin: 120 },
    frequency: 'Diaria (Cada 2h)',
    frequencyType: 'diaria',
    durationMin: 180,
    price: 120,
    available: true,
  },
  {
    id: '5',
    from: 'Raudales Malpaso',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Raudales Malpaso',
    note: 'Corridas desde las 4:00 AM hasta las 6:30 PM',
    schedule: { first: '04:00', last: '18:30', everyMin: 30 },
    frequency: 'Diaria',
    frequencyType: 'diaria',
    durationMin: 120,
    price: 120,
    available: true,
  },
  {
    id: '6',
    from: 'Ostuacán',
    to: 'Tuxtla Gutiérrez',
    state: 'Chiapas, México',
    originStation: 'Ostuacán',
    note: 'Corridas: 4:00 AM, 11:00 AM y 4:00 PM',
    schedule: { times: ['04:00', '11:00', '16:00'] },
    frequency: 'Diaria (3 corridas)',
    frequencyType: 'diaria',
    durationMin: 180,
    price: 210,
    available: true,
  },
  {
    id: '7',
    from: 'Tecpatán',
    to: 'Raudales Malpaso',
    state: 'Chiapas, México',
    originStation: 'Tecpatán',
    note: 'Corridas cada hora de 5:00 AM a 4:00 PM',
    schedule: { first: '05:00', last: '16:00', everyMin: 60 },
    frequency: 'Diaria (Cada 1h)',
    frequencyType: 'diaria',
    durationMin: 60,
    price: 60,
    available: true,
  },
];

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// "04:00 AM", "07:00 PM", igual que en la tabla de la portada
export const formatTime12 = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

export const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;

// Expande la regla de horario a cada corrida individual
export const departureTimes = (rule: DepartureRule): number[] => {
  if ('times' in rule) return rule.times.map(toMinutes);
  const times: number[] = [];
  for (let t = toMinutes(rule.first); t <= toMinutes(rule.last); t += rule.everyMin) times.push(t);
  return times;
};

// Resumen compacto para la tabla: "04:00 · 04:30 · ...cada 30 min hasta 19:00"
export const departuresSummary = (rule: DepartureRule): string => {
  const times = departureTimes(rule).map(formatTime);
  if ('times' in rule) return times.join(' · ');
  const every = rule.everyMin % 60 === 0 ? `${rule.everyMin / 60}h` : `${rule.everyMin} min`;
  return `${times.slice(0, 2).join(' · ')} · ...cada ${every} hasta ${rule.last}`;
};

// Todas las corridas de las rutas dadas, ordenadas por hora de salida
export const buildDepartures = (routes: RouteItem[]): Departure[] =>
  routes
    .filter((route) => route.available)
    .flatMap((route) =>
      departureTimes(route.schedule).map((time) => ({ key: `${route.id}-${time}`, time, route })),
    )
    .sort((a, b) => a.time - b.time || a.route.from.localeCompare(b.route.from));
