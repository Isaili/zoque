// Descarga el trazado real por carretera de cada camino del mapa de cobertura (servicio OSRM,
// datos de OpenStreetMap) y lo guarda en src/features/coverage/components/roadGeometry.ts.
// Uso: npm run trace-routes  (volver a correrlo si cambian las rutas o paradas)
import { writeFileSync } from 'node:fs';
import { MAP_PATHS } from '../src/features/coverage/components/coverageData';
import { fetchRoad } from '../src/features/coverage/components/roadLoader';

const OUTPUT = 'src/features/coverage/components/roadGeometry.ts';

const main = async () => {
  const roads: Record<string, [number, number][]> = {};
  for (const path of MAP_PATHS) {
    const road = await fetchRoad(path);
    if (!road) throw new Error(`No se pudo trazar ${path.key}`);
    roads[path.key] = road;
    console.log(`✔ ${path.stops.join(' → ')}: ${road.length} puntos`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // sin saturar el servicio
  }

  const body = Object.entries(roads)
    .map(([key, road]) => `  ${JSON.stringify(key)}: ${JSON.stringify(road)},`)
    .join('\n');
  writeFileSync(
    OUTPUT,
    `// Trazados reales por carretera de cada camino del mapa, en [longitud, latitud].
// Se generan con \`npm run trace-routes\` (OSRM + OpenStreetMap). No editar a mano.
// Mientras un camino no esté aquí, el mapa lo pide al servicio de rutas desde el navegador.
export const ROAD_GEOMETRY: Record<string, [number, number][]> = {
${body}
};
`,
  );
  console.log(`Listo: ${OUTPUT}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
