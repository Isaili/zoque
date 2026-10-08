import { ALL_ROUTES, buildDepartures, departureTimes, type RouteItem } from '../../schedules/components/schedulesData';
import { ROAD_GEOMETRY } from './roadGeometry';

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
  // En Tuxtla la terminal está en el Mercado de los Ancianos (Av. 9a Sur Oriente)
  { name: 'Tuxtla Gutiérrez', lon: -93.10539, lat: 16.74427, chip: 'below' },
  { name: 'Coapilla', lon: -93.1667, lat: 17.1333, chip: 'right' },
  { name: 'Ocotepec', lon: -93.1636, lat: 17.2253, chip: 'right' },
  { name: 'Tecpatán', lon: -93.3167, lat: 17.1333, chip: 'left' },
  { name: 'Raudales Malpaso', lon: -93.6061, lat: 17.1931, chip: 'below' },
  { name: 'Ostuacán', lon: -93.3364, lat: 17.4064, chip: 'right' },
];

// Puntos de paso (sin parada) para que el trazo siga la carretera real
const WAYPOINTS: Record<string, [number, number]> = {
  Ocozocoautla: [-93.3747, 16.7597],
  // Calles por las que salen las unidades de Tuxtla (ubicadas con OpenStreetMap)
  'Tuxtla: Terminal de paso': [-93.12026, 16.74591], // Calle 3a Poniente Sur 1083
  'Tuxtla: Av. 9a Sur Poniente': [-93.12313, 16.74705],
  'Tuxtla: Blvd. Belisario Domínguez poniente': [-93.17787, 16.76069],
  'Tuxtla: Periférico Norte Pte. (Parque Caña Hueca)': [-93.14609, 16.76008],
  'Tuxtla: Blvd. Los Laguitos': [-93.15192, 16.76208],
  'Tuxtla: Blvd. Los Laguitos norte': [-93.17293, 16.7835],
};

// Recorrido dentro de Tuxtla, de la terminal (Mercado de los Ancianos) hacia la salida. Todas pasan por la
// terminal de paso y siguen por la 9a Sur hasta el Belisario Domínguez a la altura del Hotel Marriott; las de
// Malpaso y Ostuacán siguen por el Belisario Domínguez hasta salir por La Pochota, y las de Copainalá,
// Coapilla, Tecpatán y Ocotepec suben por el Periférico junto al Parque Caña Hueca y salen por Los Laguitos.
// (No hay punto en el Marriott: el trazo pasa solo por ese cruce y un punto ahí lo desviaba al estacionamiento.)
const TUXTLA_TO_MARRIOTT = ['Tuxtla: Terminal de paso', 'Tuxtla: Av. 9a Sur Poniente'];
const TUXTLA_EXIT: Record<'poniente' | 'norte', string[]> = {
  poniente: [...TUXTLA_TO_MARRIOTT, 'Tuxtla: Blvd. Belisario Domínguez poniente'],
  norte: [
    ...TUXTLA_TO_MARRIOTT,
    'Tuxtla: Periférico Norte Pte. (Parque Caña Hueca)',
    'Tuxtla: Blvd. Los Laguitos',
    'Tuxtla: Blvd. Los Laguitos norte',
  ],
};
// Paradas intermedias con espera programada (ya incluida en la duración del viaje)
export interface Stopover {
  id: string;
  name: string;
  address: string;
  lon: number;
  lat: number;
  dwellMin: number;
  servesFrom: string; // solo las corridas que salen de esta localidad hacen la parada
}

export const STOPOVERS: Stopover[] = [
  {
    id: 'terminal-de-paso',
    name: 'Terminal de paso',
    address: 'Calle 3a Poniente Sur 1083, Tuxtla Gutiérrez',
    lon: -93.12026,
    lat: 16.74591,
    dwellMin: 8,
    servesFrom: 'Tuxtla Gutiérrez',
  },
];

const WEST_TOWNS = new Set(['Raudales Malpaso', 'Ostuacán']);
const TUXTLA = 'Tuxtla Gutiérrez';

// Inserta las calles de Tuxtla junto a la terminal, en el orden del viaje
const withTuxtlaStreets = (sequence: string[]) => {
  const exit = TUXTLA_EXIT[sequence.some((name) => WEST_TOWNS.has(name)) ? 'poniente' : 'norte'];
  if (sequence[0] === TUXTLA) return [TUXTLA, ...exit, ...sequence.slice(1)];
  if (sequence[sequence.length - 1] === TUXTLA) return [...sequence.slice(0, -1), ...[...exit].reverse(), TUXTLA];
  return sequence;
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

// Muestras de una línea ya trazada (por ejemplo, la carretera real)
const samplePolyline = (lonLats: Point[]) => {
  const samples: { x: number; y: number; len: number }[] = [];
  for (const [x, y] of lonLats.map(toPlane)) {
    const prev = samples[samples.length - 1];
    samples.push({ x, y, len: prev ? prev.len + Math.hypot(x - prev.x, y - prev.y) : 0 });
  }
  return samples;
};

export interface MapPath {
  key: string;
  stops: string[]; // localidades por las que pasa (sin puntos de paso)
  waypoints: Point[]; // localidades y puntos de paso en orden, para trazar por las calles reales
  coordinates: Point[]; // trazo en [longitud, latitud]
  routes: RouteItem[]; // corridas que usan este camino, en cualquier sentido
  forward: boolean; // hay corridas en el sentido del trazo
  backward: boolean; // hay corridas en sentido contrario
  directions: Record<string, boolean>; // por id de ruta: true si va en el sentido del trazo
  samples: { x: number; y: number; len: number }[];
  onRoad: boolean; // true si el trazo sigue la carretera real
}

// Mismo camino, ahora siguiendo la carretera real
export const withRoad = (path: MapPath, road: Point[]): MapPath => ({
  ...path,
  coordinates: road,
  samples: samplePolyline(road),
  onRoad: true,
});

// Paradas del camino en el formato del servicio de rutas OSRM ("lon,lat;lon,lat")
export const osrmWaypoints = (path: MapPath) => path.waypoints.map(([lon, lat]) => `${lon},${lat}`).join(';');

export const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving/';

// Quita puntos muy juntos para que el trazo pese poco (distancia mínima en grados aproximados)
export const simplifyLine = (line: Point[], minStep = 0.0008): Point[] =>
  line.filter((point, i) => {
    if (i === 0 || i === line.length - 1) return true;
    const [x, y] = toPlane(point);
    const [px, py] = toPlane(line[i - 1]);
    return Math.hypot(x - px, y - py) >= minStep;
  });

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
    const points = withTuxtlaStreets(canonical).map(pointOf) as Point[];
    const samples = sampleCurve(points);
    const path =
      paths.get(key) ??
      {
        key,
        stops: canonical.filter((name) => townByName.has(name)),
        waypoints: points,
        coordinates: samples.map(({ x, y }) => toLonLat([x, y])),
        routes: [],
        forward: false,
        backward: false,
        directions: {},
        samples,
        onRoad: false,
      };
    path.routes.push(route);
    path.directions[route.id] = forward;
    if (forward) path.forward = true;
    else path.backward = true;
    paths.set(key, path);
  }
  return [...paths.values()].map((path) => (ROAD_GEOMETRY[path.key] ? withRoad(path, ROAD_GEOMETRY[path.key]) : path));
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

// Retraso reportado en un punto del camino (fracción 0 a 1 en el sentido del trazo)
export interface PathDelay {
  id: string;
  fraction: number;
  minutes: number;
}
export type DelaysByPath = Record<string, PathDelay[]>;

export interface Trip {
  key: string;
  route: RouteItem;
  path: MapPath;
  forward: boolean;
  departure: number; // minutos desde medianoche
  arrival: number; // llegada estimada, incluyendo retrasos reportados
  scheduledArrival: number; // llegada según el horario
  progress: number; // 0 al salir, 1 al llegar (distancia recorrida)
  delayMin: number; // retraso total estimado por incidentes en su camino
  heldBy: string | null; // incidente donde se estima que está detenida
  dwellingAt: string | null; // parada programada donde está cargando pasaje
  travelMin: number; // tiempo en movimiento según el horario (sin paradas programadas)
  holds: TripHold[]; // esperas en el sentido del viaje, ordenadas
}

export interface TripHold {
  id: string;
  fraction: number;
  minutes: number;
  scheduled: boolean; // true = parada programada; false = retraso por incidente
}

// Posición estimada: avanza según el horario y se detiene en cada incidente el tiempo de retraso reportado
const MAX_HOLD_MIN = 120;
const estimate = (elapsed: number, duration: number, holds: TripHold[]) => {
  let time = 0;
  let fraction = 0;
  const moving = (progress: number) => ({ progress, heldBy: null, dwellingAt: null });
  for (const hold of holds) {
    const travel = (hold.fraction - fraction) * duration;
    if (elapsed <= time + travel) return moving(fraction + (elapsed - time) / duration);
    time += travel;
    fraction = hold.fraction;
    if (elapsed <= time + hold.minutes) {
      return { progress: fraction, heldBy: hold.scheduled ? null : hold.id, dwellingAt: hold.scheduled ? hold.id : null };
    }
    time += hold.minutes;
  }
  return moving(Math.min(1, fraction + (elapsed - time) / duration));
};

// Dónde queda cada parada programada sobre cada camino (se calcula una vez por trazo)
const stopoverFractions = new WeakMap<MapPath, Map<string, number>>();
const stopoverFraction = (path: MapPath, stop: Stopover) => {
  let byStop = stopoverFractions.get(path);
  if (!byStop) stopoverFractions.set(path, (byStop = new Map()));
  if (!byStop.has(stop.id)) byStop.set(stop.id, fractionAlong(path, [stop.lon, stop.lat]));
  return byStop.get(stop.id)!;
};

// Corridas que van en camino a la hora dada (minutos desde medianoche, con fracción de segundos)
export const tripsInProgress = (nowMin: number, paths: MapPath[] = MAP_PATHS, delays: DelaysByPath = {}): Trip[] =>
  paths.flatMap((path) =>
    path.routes.flatMap((route) => {
      const forward = path.directions[route.id];
      const along = (fraction: number) => (forward ? fraction : 1 - fraction);
      const incidentHolds: TripHold[] = (delays[path.key] ?? [])
        .map(({ id, fraction, minutes }) => ({ id, fraction: along(fraction), minutes: Math.min(minutes, MAX_HOLD_MIN), scheduled: false }))
        .filter((hold) => hold.minutes > 0 && hold.fraction > 0 && hold.fraction < 1);
      const scheduledHolds: TripHold[] = STOPOVERS.filter((stop) => stop.servesFrom === route.from).map((stop) => ({
        id: stop.id,
        fraction: along(stopoverFraction(path, stop)),
        minutes: stop.dwellMin,
        scheduled: true,
      }));
      const holds = [...scheduledHolds, ...incidentHolds].sort((a, b) => a.fraction - b.fraction);
      const delayMin = incidentHolds.reduce((sum, hold) => sum + hold.minutes, 0);
      // La espera programada ya está dentro de la duración del horario
      const travelMin = Math.max(1, route.durationMin - scheduledHolds.reduce((sum, hold) => sum + hold.minutes, 0));
      const total = route.durationMin + delayMin;
      return departureTimes(route.schedule)
        .filter((departure) => nowMin >= departure && nowMin < departure + total)
        .map((departure) => ({
          key: `${route.id}-${departure}`,
          route,
          path,
          forward,
          departure,
          arrival: departure + total,
          scheduledArrival: departure + route.durationMin,
          delayMin,
          travelMin,
          holds,
          ...estimate(nowMin - departure, travelMin, holds),
        }));
    }),
  );

// Encuadre inicial: todas las localidades con un poco de margen
export const TOWNS_BOUNDS: [Point, Point] = [
  [Math.min(...TOWNS.map((t) => t.lon)), Math.min(...TOWNS.map((t) => t.lat))],
  [Math.max(...TOWNS.map((t) => t.lon)), Math.max(...TOWNS.map((t) => t.lat))],
];

// Fracción (0 a 1) del camino más cercana a un punto [longitud, latitud], en el sentido del trazo
export const fractionAlong = (path: MapPath, [lon, lat]: Point) => {
  const [tx, ty] = toPlane([lon, lat]);
  let best = path.samples[0];
  for (const sample of path.samples) {
    if (Math.hypot(sample.x - tx, sample.y - ty) < Math.hypot(best.x - tx, best.y - ty)) best = sample;
  }
  const total = path.samples[path.samples.length - 1].len;
  return total ? best.len / total : 0;
};

// Hora estimada en que una corrida pasa por una fracción de su viaje, contando las esperas antes de ese punto
export const timeAtFraction = (trip: Trip, fraction: number) =>
  trip.departure +
  fraction * trip.travelMin +
  trip.holds.filter((hold) => hold.fraction < fraction).reduce((sum, hold) => sum + hold.minutes, 0);

// Localidades por las que aún pasará una corrida, con la hora estimada (en el sentido del viaje)
const stopFractionsCache = new WeakMap<MapPath, { name: string; fraction: number }[]>();
const stopFractions = (path: MapPath) => {
  const cached = stopFractionsCache.get(path);
  if (cached) return cached;
  const fractions = path.stops.map((name) => {
    const town = townByName.get(name)!;
    return { name, fraction: fractionAlong(path, [town.lon, town.lat]) };
  });
  stopFractionsCache.set(path, fractions);
  return fractions;
};

export const upcomingStops = (trip: Trip) =>
  stopFractions(trip.path)
    .map(({ name, fraction }) => ({ name, fraction: trip.forward ? fraction : 1 - fraction }))
    .filter(({ fraction }) => fraction > trip.progress + 0.005)
    .sort((a, b) => a.fraction - b.fraction)
    .concat(
      trip.holds
        .filter((hold) => hold.scheduled && hold.fraction > trip.progress + 0.001)
        .map((hold) => ({ name: STOPOVERS.find((stop) => stop.id === hold.id)?.name ?? hold.id, fraction: hold.fraction })),
    )
    .sort((a, b) => a.fraction - b.fraction)
    .map(({ name, fraction }) => ({ name, at: timeAtFraction(trip, fraction) }));

// Trazo de una corrida partido en lo ya recorrido y lo que falta (ambos en el sentido del viaje)
export const splitTrip = (trip: Trip): { done: Point[]; left: Point[] } => {
  const { path } = trip;
  const ordered = trip.forward ? path.coordinates : [...path.coordinates].reverse();
  const samples = trip.forward
    ? path.samples
    : [...path.samples].reverse().map((s) => ({ ...s, len: path.samples[path.samples.length - 1].len - s.len }));
  const target = trip.progress * samples[samples.length - 1].len;
  const cut = Math.max(1, samples.findIndex((s) => s.len >= target));
  const { lngLat } = pointAlong(path, trip.progress, trip.forward);
  return {
    done: [...ordered.slice(0, cut), lngLat],
    left: [lngLat, ...ordered.slice(cut)],
  };
};

// Primera salida a partir de la hora dada (si ya no hay, la primera del día siguiente)
export const nextDeparture = (nowMin: number) =>
  departures.find((d) => d.time > nowMin) ?? departures[0];
