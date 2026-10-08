import { EMPTY_PNG, browserMaxAge, getTile, isAllowedTile, isTileLayer } from '@/features/coverage/server/tiles';

// Mosaicos de TomTom (tráfico, incidentes o mapa base) pasando por nuestro servidor para no exponer la llave
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ layer: string; z: string; x: string; y: string }> },
) {
  const { layer, z, x, y } = await params;
  const [zoom, tileX, tileY] = [z, x, y].map(Number);
  if (!isTileLayer(layer) || !isAllowedTile(zoom, tileX, tileY)) {
    return new Response('Mosaico fuera de la zona del mapa', { status: 404 });
  }

  const tile = await getTile(layer, zoom, tileX, tileY).catch(() => null);
  const maxAge = browserMaxAge(layer);
  return new Response(tile ?? EMPTY_PNG, {
    headers: {
      'Content-Type': 'image/png',
      // Sin mosaico no se guarda, para volver a intentar en la siguiente consulta
      'Cache-Control': tile ? `public, max-age=${maxAge}, s-maxage=${maxAge * 2}` : 'no-store',
    },
  });
}
