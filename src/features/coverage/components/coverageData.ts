import { ALL_ROUTES, buildDepartures, departureTimes, type RouteItem } from '../../schedules/components/schedulesData';
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
  { name: 'Copainalá', lon: -93.2125, lat: 17.0939, label: { dx: 0, dy: 0, anchor: 'middle' }, hub: true },
  { name: 'Tuxtla Gutiérrez', lon: -93.1156, lat: 16.7531, label: { dx: 0, dy: 0, anchor: 'middle' } },
  { name: 'Coapilla', lon: -93.1667, lat: 17.1333, label: { dx: 12, dy: 5, anchor: 'start' } },
  { name: 'Ocotepec', lon: -93.1636, lat: 17.2253, label: { dx: 12, dy: 5, anchor: 'start' } },
  { name: 'Tecpatán', lon: -93.3167, lat: 17.1333, label: { dx: -12, dy: 5, anchor: 'end' } },
  { name: 'Raudales Malpaso', lon: -93.6061, lat: 17.1931, label: { dx: 0, dy: 0, anchor: 'middle' } },
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
  '9': ['Ocozocoautla'],
  '10': ['Copainalá', 'Coapilla'],
};

const townByName = new Map(TOWNS.map((town) => [town.name, town]));

const pointOf = (name: string): [number, number] | null => {
  const town = townByName.get(name);
  if (town) return project(town.lon, town.lat);
  const waypoint = WAYPOINTS[name];
  return waypoint ? project(...waypoint) : null;
};

type Point = [number, number];

// Tramos de curva suave que pasan por todos los puntos (cada tramo se arquea un poco hacia un lado)
const segmentsThrough = (points: Point[]) =>
  points.slice(1).map((end, i) => {
    const start = points[i];
    const bow = 0.18;
    const control: Point = [
      (start[0] + end[0]) / 2 - (end[1] - start[1]) * bow,
      (start[1] + end[1]) / 2 + (end[0] - start[0]) * bow,
    ];
    return { start, control, end };
  });

const curveThrough = (points: Point[]) =>
  segmentsThrough(points).reduce(
    (d, { control, end }) => `${d} Q${control[0].toFixed(1)},${control[1].toFixed(1)} ${end[0].toFixed(1)},${end[1].toFixed(1)}`,
    `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`,
  );

// Puntos de muestra a lo largo de la curva con su distancia acumulada, para ubicar urbans por avance
const sampleCurve = (points: Point[]) => {
  const samples: { x: number; y: number; len: number }[] = [];
  for (const { start, control, end } of segmentsThrough(points)) {
    for (let step = samples.length ? 1 : 0; step <= 24; step++) {
      const t = step / 24;
      const x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t ** 2 * end[0];
      const y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t ** 2 * end[1];
      const prev = samples[samples.length - 1];
      samples.push({ x, y, len: prev ? prev.len + Math.hypot(x - prev.x, y - prev.y) : 0 });
    }
  }
  return samples;
};

export interface MapPath {
  key: string;
  stops: string[]; // localidades por las que pasa (sin puntos de paso)
  d: string;
  routes: RouteItem[]; // corridas que usan este camino, en cualquier sentido
  forward: boolean; // hay corridas en el sentido del trazo
  backward: boolean; // hay corridas en sentido contrario
  directions: Record<string, boolean>; // por id de ruta: true si va en el sentido del trazo
  samples: { x: number; y: number; len: number }[];
}

// Caminos del mapa generados a partir de la lista de corridas: si cambia la lista, cambia el mapa.
// La ida y el regreso comparten un solo trazo.
export const MAP_PATHS: MapPath[] = (() => {
  const paths = new Map<string, MapPath>();
  for (const route of ALL_ROUTES.filter((r) => r.available)) {
    const sequence = [route.from, ...(VIA[route.id] ?? []), route.to];
    if (sequence.some((name) => pointOf(name) === null)) continue;
    const reversed = [...sequence].reverse();
    const forward = sequence.join('>') <= reversed.join('>');
    const canonical = forward ? sequence : reversed;
    const key = canonical.join('>');
    const points = canonical.map(pointOf) as Point[];
    const path =
      paths.get(key) ??
      {
        key,
        stops: canonical.filter((name) => townByName.has(name)),
        d: curveThrough(points),
        routes: [],
        forward: false,
        backward: false,
        directions: {},
        samples: sampleCurve(points),
      };
    path.routes.push(route);
    path.directions[route.id] = forward;
    if (forward) path.forward = true;
    else path.backward = true;
    paths.set(key, path);
  }
  return [...paths.values()];
})();

const departures = buildDepartures(ALL_ROUTES);

export const runsFrom = (town: string) => departures.filter((d) => d.route.from === town).length;

export const runsOn = (path: MapPath) =>
  departures.filter((d) => path.routes.includes(d.route)).length;

export const COVERAGE_STATS = {
  towns: new Set(MAP_PATHS.flatMap((p) => p.stops)).size,
  routes: ALL_ROUTES.filter((r) => r.available).length,
  dailyRuns: departures.length,
};

// Punto a una fracción (0 a 1) del recorrido del trazo, y si ahí avanza hacia la derecha
export const pointAlong = (path: MapPath, fraction: number, forward: boolean) => {
  const { samples } = path;
  const total = samples[samples.length - 1].len;
  const target = (forward ? fraction : 1 - fraction) * total;
  let i = samples.findIndex((sample) => sample.len >= target);
  if (i <= 0) i = 1;
  const a = samples[i - 1];
  const b = samples[i];
  const t = b.len === a.len ? 0 : (target - a.len) / (b.len - a.len);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    facingRight: forward ? b.x >= a.x : a.x >= b.x,
  };
};

export interface Trip {
  key: string;
  route: RouteItem;
  path: MapPath;
  forward: boolean;
  departure: number; // minutos desde medianoche
  arrival: number;
  progress: number; // 0 al salir, 1 al llegar
}

// Corridas que van en camino a la hora dada (minutos desde medianoche, con fracción de segundos)
export const tripsInProgress = (nowMin: number): Trip[] =>
  MAP_PATHS.flatMap((path) =>
    path.routes.flatMap((route) =>
      departureTimes(route.schedule)
        .filter((departure) => nowMin >= departure && nowMin < departure + route.durationMin)
        .map((departure) => ({
          key: `${route.id}-${departure}`,
          route,
          path,
          forward: path.directions[route.id],
          departure,
          arrival: departure + route.durationMin,
          progress: (nowMin - departure) / route.durationMin,
        })),
    ),
  );
