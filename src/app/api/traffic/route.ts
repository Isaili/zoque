import { demoTrafficReport, getTrafficReport } from '@/features/coverage/server/trafficService';
import { availableLayers } from '@/features/coverage/server/tiles';

// Incidentes de tráfico sobre nuestras rutas y qué mosaicos de TomTom se pueden mostrar.
// La llave de TomTom nunca sale del servidor.
// En desarrollo, /api/traffic?demo=1 devuelve incidentes inventados para probar la interfaz.
export async function GET(request: Request) {
  const demo = new URL(request.url).searchParams.get('demo') === '1' && process.env.NODE_ENV !== 'production';
  const [report, layers] = await Promise.all([demo ? demoTrafficReport() : getTrafficReport(), availableLayers()]);
  return Response.json(report.enabled ? { ...report, layers } : report, { headers: { 'Cache-Control': 'no-store' } });
}
