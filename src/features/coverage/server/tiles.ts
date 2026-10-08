// Solo para el servidor: mosaicos de TomTom Orbis (tráfico, incidentes y mapa base) sin exponer la llave

export type TileLayer = 'flow' | 'incidents' | 'map';

export const TILE_SIZE = 512; // alta resolución: el mapa los muestra a 256 px para que se vean nítidos

const LAYERS: Record<TileLayer, { path: string; ext: string; params: Record<string, string>; ttlMs: number; browserMaxAge: number }> = {
  // Velocidad del tráfico en todas las calles
  flow: {
    path: 'maps/orbis/traffic/flow/raster/tile',
    ext: '',
    params: { apiVersion: '2', style: 'dark' },
    ttlMs: 120_000,
    browserMaxAge: 60,
  },
  // Incidentes (líneas de colores según gravedad) en todas las calles
  incidents: {
    path: 'maps/orbis/traffic/incidents/raster/tile',
    ext: '',
    params: { apiVersion: '2', style: 'dark' },
    ttlMs: 120_000,
    browserMaxAge: 60,
  },
  // Mapa base de TomTom (requiere tener activada la Map Display API en la llave)
  map: {
    path: 'maps/orbis/map-display/tile',
    ext: '.png',
    params: { apiVersion: '1', style: 'street-dark' },
    ttlMs: 24 * 60 * 60_000,
    browserMaxAge: 24 * 60 * 60,
  },
};

export const isTileLayer = (value: string): value is TileLayer => value in LAYERS;
export const browserMaxAge = (layer: TileLayer) => LAYERS[layer].browserMaxAge;

const MIN_ZOOM = 5;
const MAX_ZOOM = 17;
const MAX_CACHED = 400; // por capa

// Solo se sirven mosaicos de la zona del mapa (con margen sobre los límites del mapa de cobertura)
const AREA = { west: -97, south: 13, east: -88, north: 20 };

const tileToLon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
const tileToLat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

export const isAllowedTile = (z: number, x: number, y: number) => {
  if (![z, x, y].every(Number.isInteger) || z < MIN_ZOOM || z > MAX_ZOOM) return false;
  if (x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) return false;
  const west = tileToLon(x, z);
  const east = tileToLon(x + 1, z);
  const north = tileToLat(y, z);
  const south = tileToLat(y + 1, z);
  return east > AREA.west && west < AREA.east && north > AREA.south && south < AREA.north;
};

// PNG transparente de 1×1 para cuando no hay mosaico (así el mapa no marca error)
export const EMPTY_PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
  (c) => c.charCodeAt(0),
);

const caches: Record<TileLayer, Map<string, { at: number; body: ArrayBuffer }>> = {
  flow: new Map(),
  incidents: new Map(),
  map: new Map(),
};

const requestTile = (layer: TileLayer, key: string, z: number, x: number, y: number) => {
  const { path, ext, params } = LAYERS[layer];
  const query = new URLSearchParams({ ...params, key, tileSize: String(TILE_SIZE) });
  return fetch(`https://api.tomtom.com/${path}/${z}/${x}/${y}${ext}?${query}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
};

// Mosaico compartido entre visitas: no se vuelve a pedir a TomTom mientras siga vigente
export const getTile = async (layer: TileLayer, z: number, x: number, y: number): Promise<ArrayBuffer | null> => {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) return null;
  const cache = caches[layer];
  const id = `${z}/${x}/${y}`;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < LAYERS[layer].ttlMs) return hit.body;

  const response = await requestTile(layer, key, z, x, y);
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return null;
  const body = await response.arrayBuffer();
  if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value!);
  cache.set(id, { at: Date.now(), body });
  return body;
};

// ¿La llave tiene permiso para esta capa? Se prueba con un mosaico de Copainalá y se recuerda 10 minutos
const PROBE_TILE = [10, 246, 462] as const;
const availability: Partial<Record<TileLayer, { at: number; ok: boolean }>> = {};

const isAvailable = async (layer: TileLayer, key: string) => {
  const known = availability[layer];
  if (known && Date.now() - known.at < 10 * 60_000) return known.ok;
  const ok = await requestTile(layer, key, ...PROBE_TILE)
    .then((response) => response.ok && Boolean(response.headers.get('content-type')?.startsWith('image/')))
    .catch(() => false);
  availability[layer] = { at: Date.now(), ok };
  return ok;
};

export const availableLayers = async (): Promise<Record<TileLayer, boolean>> => {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) return { flow: false, incidents: false, map: false };
  const [flow, incidents, map] = await Promise.all((['flow', 'incidents', 'map'] as const).map((layer) => isAvailable(layer, key)));
  return { flow, incidents, map };
};
