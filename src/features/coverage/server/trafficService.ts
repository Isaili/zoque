// Solo para el servidor: consulta incidentes de TomTom con la llave secreta y los guarda en memoria unos minutos
import { MAP_PATHS, TOWNS_BOUNDS } from '../components/coverageData';
import {
  distanceBetweenM,
  distanceToLineM,
  kindFromTomTom,
  type TrafficIncident,
  type TrafficReport,
} from '../components/traffic';

type Point = [number, number];

// La ruta /api/traffic completa estas capas con las que la llave tiene permitidas
const NO_LAYERS = { flow: false, incidents: false, map: false };

const TOMTOM_URL = 'https://api.tomtom.com/traffic/services/5/incidentDetails';
const FIELDS =
  '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description},startTime,from,to,length,delay}}}';
// Un incidente cuenta solo si va sobre la misma carretera que la ruta (no en una calle cercana):
// la mayor parte de su tramo debe quedar pegada al trazo
const ON_ROUTE_M = 50;
const ON_ROUTE_SHARE = 0.6;
const POINT_ON_ROUTE_M = 60;
const NEAR_ROUTE_M = 250; // solo para los datos de demostración
const REFRESH_MS = Math.max(60, Number(process.env.TRAFFIC_REFRESH_SECONDS) || 120) * 1000;

// Zona de consulta: todas las localidades con margen (TomTom acepta hasta 10,000 km²)
const MARGIN = 0.1;
const BBOX = [
  TOWNS_BOUNDS[0][0] - MARGIN,
  TOWNS_BOUNDS[0][1] - MARGIN,
  TOWNS_BOUNDS[1][0] + MARGIN,
  TOWNS_BOUNDS[1][1] + MARGIN,
].join(',');

interface TomTomIncident {
  geometry?: { type: 'Point' | 'LineString'; coordinates: Point | Point[] };
  properties?: {
    id?: string;
    iconCategory?: number;
    magnitudeOfDelay?: number;
    events?: { description?: string }[];
    startTime?: string | null;
    from?: string | null;
    to?: string | null;
    length?: number | null;
    delay?: number | null;
  };
}

const onRoute = (line: Point[], point: Point, route: Point[]) => {
  if (line.length < 2) return distanceToLineM(point, route) < POINT_ON_ROUTE_M;
  const close = line.filter((vertex) => distanceToLineM(vertex, route) < ON_ROUTE_M).length;
  return close / line.length >= ON_ROUTE_SHARE;
};

const toIncident = (raw: TomTomIncident, index: number): TrafficIncident | null => {
  const geometry = raw.geometry;
  const props = raw.properties ?? {};
  if (!geometry) return null;
  const line = geometry.type === 'LineString' ? (geometry.coordinates as Point[]) : [];
  const point = geometry.type === 'Point' ? (geometry.coordinates as Point) : line[Math.floor(line.length / 2)];
  if (!point) return null;

  const pathKeys = MAP_PATHS.filter((path) => onRoute(line, point, path.coordinates)).map((path) => path.key);
  if (pathKeys.length === 0) return null;

  const magnitude = props.magnitudeOfDelay ?? 0;
  return {
    id: props.id ?? `tt-${index}`,
    kind: kindFromTomTom(props.iconCategory ?? 0),
    magnitude: (magnitude >= 0 && magnitude <= 4 ? magnitude : 0) as TrafficIncident['magnitude'],
    description: props.events?.map((e) => e.description).filter(Boolean).join(' · ') || '',
    from: props.from ?? null,
    to: props.to ?? null,
    delayMin: props.delay ? Math.round(props.delay / 60) : null,
    lengthM: props.length ?? null,
    startTime: props.startTime ?? null,
    point,
    line,
    pathKeys,
  };
};

const fetchTomTom = async (key: string): Promise<TrafficIncident[]> => {
  const params = new URLSearchParams({
    key,
    bbox: BBOX,
    fields: FIELDS,
    language: 'es-ES',
    timeValidityFilter: 'present',
  });
  const response = await fetch(`${TOMTOM_URL}?${params}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`TomTom respondió ${response.status}`);
  const data = (await response.json()) as { incidents?: TomTomIncident[] };
  return (data.incidents ?? []).map(toIncident).filter((incident): incident is TrafficIncident => incident !== null);
};

// Una sola consulta compartida por todas las visitas mientras siga vigente
let cache: { at: number; report: TrafficReport } | null = null;
let inFlight: Promise<TrafficReport> | null = null;

export const getTrafficReport = async (): Promise<TrafficReport> => {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) return { enabled: false };
  if (cache && Date.now() - cache.at < REFRESH_MS) return cache.report;
  if (inFlight) return inFlight;

  const request = fetchTomTom(key)
    .then((incidents): TrafficReport => {
      const report: TrafficReport = { enabled: true, demo: false, updatedAt: new Date().toISOString(), incidents, layers: NO_LAYERS };
      cache = { at: Date.now(), report };
      return report;
    })
    .catch((error: unknown): TrafficReport => {
      console.error('[tráfico] No se pudo consultar TomTom:', error);
      // Si falla, se sigue mostrando lo último que se tenía (o nada)
      return cache?.report ?? { enabled: false };
    })
    .finally(() => {
      inFlight = null;
    });
  inFlight = request;
  return request;
};

// Datos inventados para probar la interfaz en desarrollo (nunca se sirven en producción)
const slice = (path: (typeof MAP_PATHS)[number], from: number, to: number) => {
  const coords = path.coordinates;
  return coords.slice(Math.floor(coords.length * from), Math.max(Math.floor(coords.length * to), Math.floor(coords.length * from) + 2));
};

export const demoTrafficReport = (): TrafficReport => {
  const byKey = (key: string) => MAP_PATHS.find((path) => path.key === key) ?? MAP_PATHS[0];
  const main = byKey('Copainalá>Tuxtla Gutiérrez');
  const malpaso = byKey('Raudales Malpaso>Ocozocoautla>Tuxtla Gutiérrez');
  const ostuacan = byKey('Ostuacán>Tuxtla Gutiérrez');
  const accidentLine = slice(main, 0.44, 0.47);
  const jamLine = slice(malpaso, 0.62, 0.72);
  const worksLine = slice(ostuacan, 0.3, 0.33);
  const at = (line: Point[]) => line[Math.floor(line.length / 2)];
  const sharedPaths = (line: Point[]) =>
    MAP_PATHS.filter((path) => distanceBetweenM(line, path.coordinates) < NEAR_ROUTE_M).map((path) => path.key);

  return {
    enabled: true,
    demo: true,
    layers: NO_LAYERS,
    updatedAt: new Date().toISOString(),
    incidents: [
      {
        id: 'demo-accidente',
        kind: 'accident',
        magnitude: 3,
        description: 'Accidente: tráfico detenido',
        from: 'Copainalá',
        to: 'Tuxtla Gutiérrez',
        delayMin: 25,
        lengthM: 1200,
        startTime: new Date(Date.now() - 20 * 60_000).toISOString(),
        point: at(accidentLine),
        line: accidentLine,
        pathKeys: sharedPaths(accidentLine),
      },
      {
        id: 'demo-trafico',
        kind: 'jam',
        magnitude: 2,
        description: 'Tráfico lento',
        from: 'Ocozocoautla',
        to: 'Tuxtla Gutiérrez',
        delayMin: 12,
        lengthM: 3500,
        startTime: null,
        point: at(jamLine),
        line: jamLine,
        pathKeys: sharedPaths(jamLine),
      },
      {
        id: 'demo-obras',
        kind: 'works',
        magnitude: 1,
        description: 'Obras en la vía: un carril cerrado',
        from: 'Ostuacán',
        to: 'Tuxtla Gutiérrez',
        delayMin: null,
        lengthM: 400,
        startTime: null,
        point: at(worksLine),
        line: worksLine,
        pathKeys: sharedPaths(worksLine),
      },
    ],
  };
};
