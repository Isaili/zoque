import { OSRM_ROUTE_URL, osrmWaypoints, simplifyLine, type MapPath } from './coverageData';

type Point = [number, number];

const CACHE_PREFIX = 'zoque-road:v1:';

const readCache = (key: string): Point[] | null => {
  try {
    const value = window.localStorage.getItem(CACHE_PREFIX + key);
    return value ? (JSON.parse(value) as Point[]) : null;
  } catch {
    return null;
  }
};

const writeCache = (key: string, road: Point[]) => {
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(road));
  } catch {
    // Sin almacenamiento disponible: se vuelve a pedir en la próxima visita
  }
};

// Pide al servicio de rutas OSRM el trazado por carretera que pasa por las paradas del camino
export const fetchRoad = async (path: MapPath, signal?: AbortSignal): Promise<Point[] | null> => {
  const response = await fetch(`${OSRM_ROUTE_URL}${osrmWaypoints(path)}?overview=full&geometries=geojson`, { signal });
  if (!response.ok) return null;
  const data = (await response.json()) as { code?: string; routes?: { geometry?: { coordinates?: Point[] } }[] };
  const line = data.code === 'Ok' ? data.routes?.[0]?.geometry?.coordinates : undefined;
  if (!line || line.length < 2) return null;
  return simplifyLine(line.map(([lon, lat]) => [Number(lon.toFixed(5)), Number(lat.toFixed(5))] as Point));
};

// Trazados por carretera de los caminos que aún no los tienen (de la memoria del navegador o del servicio).
// Si algo falla, ese camino se queda con su curva aproximada.
export const loadMissingRoads = async (paths: MapPath[], signal?: AbortSignal) => {
  const roads = new Map<string, Point[]>();
  await Promise.all(
    paths
      .filter((path) => !path.onRoad)
      .map(async (path) => {
        const cached = readCache(path.key);
        if (cached) {
          roads.set(path.key, cached);
          return;
        }
        try {
          const road = await fetchRoad(path, signal);
          if (road) {
            roads.set(path.key, road);
            writeCache(path.key, road);
          }
        } catch {
          // Sin conexión con el servicio de rutas: se mantiene la curva
        }
      }),
  );
  return roads;
};
