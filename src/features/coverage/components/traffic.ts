// Tráfico e incidentes en las rutas (datos de TomTom), compartido entre el servidor y el navegador

type Point = [number, number];

export type IncidentKind = 'accident' | 'jam' | 'closure' | 'lane' | 'works' | 'breakdown' | 'hazard' | 'other';

export interface TrafficIncident {
  id: string;
  kind: IncidentKind;
  magnitude: 0 | 1 | 2 | 3 | 4; // 0 desconocido, 1 leve, 2 moderado, 3 fuerte, 4 sin definir
  description: string;
  from: string | null;
  to: string | null;
  delayMin: number | null;
  lengthM: number | null;
  startTime: string | null;
  point: Point; // dónde va el ícono
  line: Point[]; // tramo afectado (vacío si es un punto)
  pathKeys: string[]; // caminos del mapa que pasan por ahí
}

export type TrafficReport =
  | { enabled: false }
  | {
      enabled: true;
      demo: boolean;
      updatedAt: string;
      incidents: TrafficIncident[];
      // Mosaicos de TomTom que la llave tiene permitidos
      layers: { flow: boolean; incidents: boolean; map: boolean };
    };

export const INCIDENT_LABEL: Record<IncidentKind, string> = {
  accident: 'Accidente',
  jam: 'Tráfico detenido',
  closure: 'Vía cerrada',
  lane: 'Carril cerrado',
  works: 'Obras',
  breakdown: 'Vehículo descompuesto',
  hazard: 'Condición peligrosa',
  other: 'Incidente',
};

// Título según el tipo y, para el tráfico, según qué tan fuerte es
export const incidentTitle = (incident: Pick<TrafficIncident, 'kind' | 'magnitude'>) => {
  if (incident.kind !== 'jam') return INCIDENT_LABEL[incident.kind];
  if (incident.magnitude === 3) return 'Tráfico detenido';
  if (incident.magnitude === 2) return 'Tráfico en cola';
  return 'Tráfico lento';
};

// Categorías de TomTom (iconCategory) a nuestro tipo de incidente
export const kindFromTomTom = (iconCategory: number): IncidentKind => {
  switch (iconCategory) {
    case 1:
      return 'accident';
    case 6:
      return 'jam';
    case 7:
      return 'lane';
    case 8:
      return 'closure';
    case 9:
      return 'works';
    case 14:
      return 'breakdown';
    case 2:
    case 3:
    case 4:
    case 5:
    case 10:
    case 11:
      return 'hazard';
    default:
      return 'other';
  }
};

// Incidentes que detienen o frenan a las unidades (los demás solo se informan)
export const isBlocking = (incident: TrafficIncident) =>
  incident.kind === 'accident' ||
  incident.kind === 'closure' ||
  incident.kind === 'breakdown' ||
  (incident.kind === 'jam' && incident.magnitude >= 2) ||
  (incident.kind === 'lane' && incident.magnitude >= 2);

export const isSevere = (incident: TrafficIncident) =>
  incident.kind === 'accident' || incident.kind === 'closure' || incident.magnitude === 3;

// Distancia en metros entre un punto y una línea (aproximación plana, suficiente a escala de carretera)
const M_PER_DEG = 111_320;
export const distanceToLineM = ([lon, lat]: Point, line: Point[]) => {
  const k = Math.cos((lat * Math.PI) / 180);
  const px = lon * k;
  const py = lat;
  if (line.length === 1) return Math.hypot(line[0][0] * k - px, line[0][1] - py) * M_PER_DEG;
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const ax = line[i - 1][0] * k;
    const ay = line[i - 1][1];
    const bx = line[i][0] * k;
    const by = line[i][1];
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy;
    const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx - px, ay + t * dy - py));
  }
  return best * M_PER_DEG;
};

// Distancia mínima entre dos líneas (o puntos), en metros
export const distanceBetweenM = (a: Point[], b: Point[]) => Math.min(...a.map((point) => distanceToLineM(point, b)));
