import { ALL_ROUTES, buildDepartures, type RouteItem } from '../../schedules/components/schedulesData';
import { project } from './chiapasGeo';

export interface Town {
  name: string;
  lon: number;
  lat: number;
  // Posición de la etiqueta respecto al pin
  label: { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' };
  hub?: boolean;
}

// Cabeceras municipales (coordenadas verificadas dentro de su municipio con los límites de INEGI)
export const TOWNS: Town[] = [
  { name: 'Copainalá', lon: -93.2125, lat: 17.0939, label: { dx: 0, dy: 30, anchor: 'middle' }, hub: true },
  { name: 'Tuxtla Gutiérrez', lon: -93.1156, lat: 16.7531, label: { dx: 0, dy: 24, anchor: 'middle' } },
  { name: 'Coapilla', lon: -93.1667, lat: 17.1333, label: { dx: 12, dy: 5, anchor: 'start' } },
  { name: 'Ocotepec', lon: -93.1636, lat: 17.2253, label: { dx: 12, dy: 5, anchor: 'start' } },
  { name: 'Tecpatán', lon: -93.3167, lat: 17.1333, label: { dx: -12, dy: 5, anchor: 'end' } },
  { name: 'Raudales Malpaso', lon: -93.6061, lat: 17.1931, label: { dx: 0, dy: 24, anchor: 'middle' } },
  { name: 'Ostuacán', lon: -93.3364, lat: 17.4064, label: { dx: 12, dy: 5, anchor: 'start' } },
];

// Puntos de paso (sin parada) para que el trazo siga la carretera real
const WAYPOINTS: Record<string, [number, number]> = {
  Ocozocoautla: [-93.3747, 16.7597],
};

// Escalas de cada corrida entre su origen y destino (por id de ruta de la lista de horarios)
const VIA: Record<string, string[]> = {
  '2': ['Copainalá'],
  '3': ['Coapilla', 'Copainalá'],
  '4': ['Copainalá'],
  '5': ['Ocozocoautla'],
};

const townByName = new Map(TOWNS.map((town) => [town.name, town]));

const pointOf = (name: string): [number, number] | null => {
  const town = townByName.get(name);
  if (town) return project(town.lon, town.lat);
  const waypoint = WAYPOINTS[name];
  return waypoint ? project(...waypoint) : null;
};

// Curva suave que pasa por todos los puntos (cada tramo se arquea un poco hacia un lado)
const curveThrough = (points: [number, number][]) =>
  points.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const [px, py] = points[i - 1];
    const bow = 0.18;
    const cx = (px + x) / 2 - (y - py) * bow;
    const cy = (py + y) / 2 + (x - px) * bow;
    return `${d} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, '');

export interface MapRoute {
  route: RouteItem;
  stops: string[]; // localidades por las que pasa (sin puntos de paso)
  d: string;
}

// Rutas del mapa generadas a partir de la lista de corridas: si cambia la lista, cambia el mapa
export const MAP_ROUTES: MapRoute[] = ALL_ROUTES.filter((route) => route.available).flatMap((route) => {
  const sequence = [route.from, ...(VIA[route.id] ?? []), route.to];
  const points = sequence.map(pointOf);
  if (points.some((point) => point === null)) return [];
  return [
    {
      route,
      stops: sequence.filter((name) => townByName.has(name)),
      d: curveThrough(points as [number, number][]),
    },
  ];
});

const departures = buildDepartures(ALL_ROUTES);

export const runsFrom = (town: string) => departures.filter((d) => d.route.from === town).length;

export const COVERAGE_STATS = {
  towns: new Set(MAP_ROUTES.flatMap((r) => r.stops)).size,
  routes: MAP_ROUTES.length,
  dailyRuns: departures.length,
};
