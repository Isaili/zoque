import { ALL_ROUTES, buildDepartures, departureTimes, type RouteItem } from '../../schedules/components/schedulesData';

export interface Town {
  name: string;
  lon: number;
  lat: number;
  // Lado del pin donde va su etiqueta
  chip: 'right' | 'left' | 'below';
  hub?: boolean;
}

// Cabeceras municipales (coordenadas verificadas dentro de su municipio con los límites de INEGI)
export const TOWNS: Town[] = [
  { name: 'Copainalá', lon: -93.2125, lat: 17.0939, chip: 'below', hub: true },
  { name: 'Tuxtla Gutiérrez', lon: -93.1156, lat: 16.7531, chip: 'below' },
  { name: 'Coapilla', lon: -93.1667, lat: 17.1333, chip: 'right' },
  { name: 'Ocotepec', lon: -93.1636, lat: 17.2253, chip: 'right' },
  { name: 'Tecpatán', lon: -93.3167, lat: 17.1333, chip: 'left' },
  { name: 'Raudales Malpaso', lon: -93.6061, lat: 17.1931, chip: 'below' },
  { name: 'Ostuacán', lon: -93.3364, lat: 17.4064, chip: 'right' },
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

type Point = [number, number];

// Coordenadas [longitud, latitud] de una localidad o punto de paso
const pointOf = (name: string): Point | null => {
  const town = townByName.get(name);
  if (town) return [town.lon, town.lat];
  return WAYPOINTS[name] ?? null;
};

// Las curvas se calculan en un plano donde un grado de longitud mide lo mismo que en el mapa
const COS_LAT = Math.cos((17 * Math.PI) / 180);
const toPlane = ([lon, lat]: Point): Point => [lon * COS_LAT, lat];
const toLonLat = ([x, y]: Point): Point => [x / COS_LAT, y];

// Curva suave que pasa por todos los puntos, muestreada con su distancia acumulada
// (para ubicar urbans por avance). Dos puntos: arco ligero. Más puntos: spline de Catmull-Rom.
const sampleCurve = (lonLats: Point[]) => {
  const points = lonLats.map(toPlane);
  const STEPS = 40;
  const raw: Point[] = [];
  if (points.length === 2) {
    const [start, end] = points;
    const bow = 0.18;
    const control: Point = [
      (start[0] + end[0]) / 2 - (end[1] - start[1]) * bow,
      (start[1] + end[1]) / 2 + (end[0] - start[0]) * bow,
    ];
    for (let step = 0; step <= STEPS; step++) {
      const t = step / STEPS;
      raw.push([
        (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t ** 2 * end[0],
        (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t ** 2 * end[1],
      ]);
    }
  } else {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const [p1, p2] = [points[i], points[i + 1]];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      for (let step = i === 0 ? 0 : 1; step <= STEPS; step++) {
        const t = step / STEPS;
        const at = (k: 0 | 1) =>
          0.5 *
          (2 * p1[k] +
            (-p0[k] + p2[k]) * t +
            (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t ** 2 +
            (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t ** 3);
        raw.push([at(0), at(1)]);
      }
    }
  }
  const samples: { x: number; y: number; len: number }[] = [];
  for (const [x, y] of raw) {
    const prev = samples[samples.length - 1];
    samples.push({ x, y, len: prev ? prev.len + Math.hypot(x - prev.x, y - prev.y) : 0 });
  }
  return samples;
};

export interface MapPath {
  key: string;
  stops: string[]; // localidades por las que pasa (sin puntos de paso)
  coordinates: Point[]; // trazo en [longitud, latitud]
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
    const samples = sampleCurve(points);
    const path =
      paths.get(key) ??
      {
        key,
        stops: canonical.filter((name) => townByName.has(name)),
        coordinates: samples.map(({ x, y }) => toLonLat([x, y])),
        routes: [],
        forward: false,
        backward: false,
        directions: {},
        samples,
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

// Punto [longitud, latitud] a una fracción (0 a 1) del recorrido, y si ahí avanza hacia el este
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
    lngLat: toLonLat([a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t]),
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

// Encuadre inicial: todas las localidades con un poco de margen
export const TOWNS_BOUNDS: [Point, Point] = [
  [Math.min(...TOWNS.map((t) => t.lon)), Math.min(...TOWNS.map((t) => t.lat))],
  [Math.max(...TOWNS.map((t) => t.lon)), Math.max(...TOWNS.map((t) => t.lat))],
];
