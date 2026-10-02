// Trazados reales por carretera de cada camino del mapa, en [longitud, latitud].
// Se generan con `npm run trace-routes` (OSRM + OpenStreetMap). No editar a mano.
// Mientras un camino no esté aquí, el mapa lo pide al servicio de rutas desde el navegador.
export const ROAD_GEOMETRY: Record<string, [number, number][]> = {};
