'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CHIAPAS_OUTLINE } from './chiapasGeo';
import { STOPOVERS, TOWNS, TOWNS_BOUNDS, pointAlong, splitTrip, tripsInProgress, type DelaysByPath, type MapPath, type Trip } from './coverageData';
import { incidentTitle, isSevere, type IncidentKind, type TrafficIncident } from './traffic';
import { clockMinutes, type Clock } from './clock';
import { formatTime12 } from '../../schedules/components/schedulesData';
import { buildMapStyle } from './mapStyle';

interface CoverageMapProps {
  paths: MapPath[];
  clock: Clock;
  highlightedPaths: string[] | null; // null = todas resaltadas
  highlightedTowns: string[] | null;
  hoveredTrip: string | null;
  selectedTrip: string | null;
  follow: boolean;
  reducedMotion: boolean;
  viewResetKey: number; // al cambiar, vuelve a mostrar todas las rutas
  delays: DelaysByPath;
  incidents: TrafficIncident[];
  selectedIncident: string | null;
  focus: { lngLat: [number, number]; nonce: number } | null; // al cambiar, la cámara va a ese punto
  onIncidentSelect: (incident: string | null) => void;
  showFlow: boolean; // tráfico de TomTom en todas las calles
  showIncidentTiles: boolean; // incidentes de TomTom en todas las calles
  baseMap: 'zoque' | 'tomtom';
  onTownHover: (town: string | null) => void;
  onTripHover: (trip: string | null) => void;
  onTripSelect: (trip: string | null) => void;
  onFollowChange: (follow: boolean) => void;
}

const VIEW = { pitch: 52, bearing: -14 };
const STOPOVER_MIN_ZOOM = 11.5;

// Margen del encuadre: en pantallas angostas más espacio a los lados para que quepan las etiquetas
const fitPadding = (width: number) =>
  width < 500 ? { top: 90, bottom: 70, left: 70, right: 110 } : { top: 70, bottom: 50, left: 50, right: 50 };

// Secuencia de guiones para que las líneas "fluyan" (técnica del ejemplo oficial de MapLibre)
const DASH_SEQUENCE = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
  [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];

const routesGeoJSON = (paths: MapPath[]) => ({
  type: 'FeatureCollection' as const,
  features: paths.map((path) => ({
    type: 'Feature' as const,
    properties: { key: path.key },
    geometry: { type: 'LineString' as const, coordinates: path.coordinates },
  })),
});

// Todo el mundo menos Chiapas, para oscurecer lo que queda fuera del estado
const OUTSIDE_CHIAPAS = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], CHIAPAS_OUTLINE],
  },
};

const CHIAPAS_BORDER = {
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates: CHIAPAS_OUTLINE },
};

// Urban vista de lado con franja verde (mira a la derecha; se voltea según el sentido)
const VAN_SVG = `
<svg viewBox="-12 -13 24 15" width="34" height="21" aria-hidden="true">
  <ellipse cx="0" cy="1" rx="11" ry="2.6" fill="#000" opacity="0.4"/>
  <path d="M-10,-1.5 L-10,-10 Q-10,-12 -8,-12 L4,-12 Q6,-12 7.6,-9.6 L10.2,-5.6 Q11,-4.6 11,-3.4 L11,-1.5 Z" fill="#FFFFFF" stroke="#0A2C1A" stroke-width="0.7"/>
  <rect x="-8" y="-10.4" width="4.4" height="3.6" rx="0.6" fill="#0F3A23"/>
  <rect x="-2.6" y="-10.4" width="4.4" height="3.6" rx="0.6" fill="#0F3A23"/>
  <path d="M3,-10.4 L6,-10.4 L8.6,-6.8 L3,-6.8 Z" fill="#0F3A23"/>
  <rect x="-10" y="-5.6" width="21" height="1.5" fill="#1F7A4A"/>
  <circle cx="10" cy="-3.2" r="0.9" fill="#FEF08A"/>
  <circle cx="-5.6" cy="-1.4" r="2" fill="#111827" stroke="#9CA3AF" stroke-width="0.6"/>
  <circle cx="6" cy="-1.4" r="2" fill="#111827" stroke="#9CA3AF" stroke-width="0.6"/>
</svg>`;

const PIN_SVG = `
<svg viewBox="0 0 24 32" width="26" height="34" aria-hidden="true">
  <defs><linearGradient id="hub-pin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FEF3C7"/><stop offset="0.55" stop-color="#FCD34D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs>
  <path d="M12,31 C7,24 1,19 1,12 a11,11 0 1 1 22,0 c0,7 -6,12 -11,19z" fill="url(#hub-pin)" stroke="#FFFBEB" stroke-width="1.2"/>
  <circle cx="12" cy="12" r="4" fill="#0A2C1A"/>
</svg>`;

const CHIP_POSITION = {
  right: 'left-3 top-0 -translate-y-1/2',
  left: 'right-3 top-0 -translate-y-1/2',
  below: 'left-0 top-3 -translate-x-1/2',
};

const townElement = (town: (typeof TOWNS)[number]) => {
  const el = document.createElement('div');
  el.className = 'relative z-10 h-0 w-0 cursor-pointer transition-opacity duration-300';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', town.name);
  const chip = town.hub
    ? `<div class="absolute ${CHIP_POSITION.below} mt-1 whitespace-nowrap rounded-full border border-amber-50/80 bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 px-4 py-1 text-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.6)]">
         <div class="text-[8px] font-bold tracking-[0.25em] text-[#0A2C1A]/70">TERMINAL</div>
         <div class="text-sm font-extrabold leading-tight text-[#0A2C1A]">${town.name}</div>
       </div>`
    : `<div class="absolute ${CHIP_POSITION[town.chip]} whitespace-nowrap rounded-full border border-amber-200/30 bg-[#04140B]/85 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_6px_20px_-4px_rgba(0,0,0,0.6)] backdrop-blur">${town.name}</div>`;
  el.innerHTML = `
    <span class="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/30 blur-[3px]"></span>
    ${
      town.hub
        ? `<span class="absolute -translate-x-1/2 -translate-y-full">${PIN_SVG}</span>`
        : '<span class="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-50 bg-amber-300 shadow"></span>'
    }
    ${chip}`;
  return el;
};

const EMPTY_LINE = { type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: [] as number[][] } };
const line = (coordinates: number[][]) => ({ ...EMPTY_LINE, geometry: { ...EMPTY_LINE.geometry, coordinates } });

interface VanEntry {
  marker: Marker;
  inner: HTMLElement;
  facingRight: boolean | null;
  look: string;
  held: boolean;
}

const INCIDENT_ICON: Record<IncidentKind, string> = {
  accident: '<path d="M12 4 3 20h18L12 4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".9" fill="currentColor"/>',
  hazard: '<path d="M12 4 3 20h18L12 4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".9" fill="currentColor"/>',
  breakdown: '<path d="M12 4 3 20h18L12 4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".9" fill="currentColor"/>',
  closure: '<circle cx="12" cy="12" r="8.5"/><path d="M6 12h12"/>',
  lane: '<circle cx="12" cy="12" r="8.5"/><path d="M6 12h12"/>',
  jam: '<path d="M5 15.5h14l-1.6-5.2a1.5 1.5 0 0 0-1.4-1.1H8a1.5 1.5 0 0 0-1.4 1.1z"/><circle cx="8.2" cy="16.5" r="1.4"/><circle cx="15.8" cy="16.5" r="1.4"/>',
  works: '<path d="M9.5 4h5l4.5 16h-14z"/><path d="M7.4 13h9.2"/>',
  other: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5"/><circle cx="12" cy="16" r=".9" fill="currentColor"/>',
};

const incidentElement = (incident: TrafficIncident) => {
  const el = document.createElement('div');
  el.dataset.incident = incident.id;
  el.dataset.severity = isSevere(incident) ? 'severe' : incident.kind === 'works' ? 'works' : 'moderate';
  el.className = 'zoque-incident cursor-pointer';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${incidentTitle(incident)}${incident.from ? ` cerca de ${incident.from}` : ''}`);
  el.innerHTML = `<span class="zoque-incident-pulse"></span><span class="zoque-incident-badge"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${INCIDENT_ICON[incident.kind]}</svg></span>`;
  return el;
};

const vanElement = (trip: Trip) => {
  const el = document.createElement('div');
  el.dataset.van = trip.key;
  el.className = 'zoque-van cursor-pointer';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute(
    'aria-label',
    `Urban ${trip.route.from} a ${trip.route.to}, salió ${formatTime12(trip.departure)}, llega ${formatTime12(trip.arrival)}`,
  );
  const ring = document.createElement('span');
  ring.className = 'zoque-van-ring';
  const alert = document.createElement('span');
  alert.className = 'zoque-van-alert';
  alert.textContent = '!';
  const inner = document.createElement('div');
  inner.className = 'zoque-van-body';
  inner.innerHTML = VAN_SVG;
  el.append(ring, inner, alert);
  return { el, inner };
};

export function CoverageMap({
  paths,
  clock,
  highlightedPaths,
  highlightedTowns,
  hoveredTrip,
  selectedTrip,
  follow,
  reducedMotion,
  viewResetKey,
  delays,
  incidents,
  selectedIncident,
  focus,
  onIncidentSelect,
  showFlow,
  showIncidentTiles,
  baseMap,
  onTownHover,
  onTripHover,
  onTripSelect,
  onFollowChange,
}: CoverageMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [failed, setFailed] = useState(false);
  const markerClassRef = useRef<typeof Marker | null>(null);
  const townMarkers = useRef(new Map<string, HTMLElement>());
  const vanMarkers = useRef(new Map<string, VanEntry>());
  const callbacks = useRef({ onTownHover, onTripHover, onTripSelect, onFollowChange, onIncidentSelect });
  const live = useRef({ paths, clock, highlightedPaths, hoveredTrip, selectedTrip, follow, delays });
  const incidentMarkers = useRef(new Map<string, Marker>());
  const baseLayerIds = useRef<string[]>([]);
  const initialPaths = useRef(paths);

  useEffect(() => {
    callbacks.current = { onTownHover, onTripHover, onTripSelect, onFollowChange, onIncidentSelect };
    live.current = { paths, clock, highlightedPaths, hoveredTrip, selectedTrip, follow, delays };
  });

  // Crear el mapa (solo en el navegador)
  useEffect(() => {
    let cancelled = false;
    let instance: MapLibreMap | null = null;

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !containerRef.current) return;
      try {
        instance = new maplibregl.Map({
          container: containerRef.current,
          style: buildMapStyle(TOWNS.map((t) => t.name)),
          bounds: TOWNS_BOUNDS,
          fitBoundsOptions: { padding: fitPadding(containerRef.current.clientWidth) },
          ...VIEW,
          minZoom: 6,
          maxZoom: 17.5,
          maxBounds: [[-96, 13.5], [-89, 19]],
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: {
            'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl + rueda del mouse para acercar el mapa',
            'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + rueda del mouse para acercar el mapa',
            'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
            'NavigationControl.ZoomIn': 'Acercar',
            'NavigationControl.ZoomOut': 'Alejar',
            'NavigationControl.ResetBearing': 'Restablecer orientación',
          },
        });
      } catch {
        setFailed(true);
        return;
      }
      markerClassRef.current = maplibregl.Marker;
      instance.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

      instance.on('load', () => {
        const m = instance!;
        // Capas del mapa base propio, para poder ocultarlas al usar el mapa de TomTom
        baseLayerIds.current = m.getStyle().layers.map((layer) => layer.id);
        m.addSource('outside-chiapas', { type: 'geojson', data: OUTSIDE_CHIAPAS });
        m.addSource('chiapas-border', { type: 'geojson', data: CHIAPAS_BORDER });
        m.addSource('routes', { type: 'geojson', data: routesGeoJSON(initialPaths.current) });
        m.addSource('trip-done', { type: 'geojson', data: EMPTY_LINE });
        m.addSource('incidents', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addSource('trip-left', { type: 'geojson', data: EMPTY_LINE });

        m.addLayer({ id: 'outside-chiapas', type: 'fill', source: 'outside-chiapas', paint: { 'fill-color': '#020B06', 'fill-opacity': 0.55 } });
        m.addLayer({
          id: 'chiapas-border-glow',
          type: 'line',
          source: 'chiapas-border',
          paint: { 'line-color': '#FCD34D', 'line-width': 6, 'line-blur': 6, 'line-opacity': 0.25 },
        });
        m.addLayer({ id: 'chiapas-border', type: 'line', source: 'chiapas-border', paint: { 'line-color': '#FDE68A', 'line-width': 1.3, 'line-opacity': 0.6 } });

        const lineLayout = { 'line-cap': 'round' as const, 'line-join': 'round' as const };
        const lineWidth = ['interpolate', ['linear'], ['zoom'], 7, 2.2, 14, 5] as never;
        m.addLayer({
          id: 'routes-glow',
          type: 'line',
          source: 'routes',
          layout: lineLayout,
          paint: { 'line-color': '#FCD34D', 'line-width': 12, 'line-blur': 8, 'line-opacity': 0.4 },
        });
        m.addLayer({ id: 'routes-core', type: 'line', source: 'routes', layout: lineLayout, paint: { 'line-color': '#FCD34D', 'line-width': lineWidth } });
        m.addLayer({
          id: 'routes-flow',
          type: 'line',
          source: 'routes',
          layout: lineLayout,
          paint: { 'line-color': '#FFFBEB', 'line-width': lineWidth, 'line-dasharray': DASH_SEQUENCE[0] },
        });

        // Tramos con incidentes: rojo si es grave, amarillo si son obras, naranja en lo demás
        const incidentColor = [
          'case',
          ['get', 'severe'],
          '#EF4444',
          ['==', ['get', 'kind'], 'works'],
          '#FACC15',
          '#F97316',
        ] as never;
        m.addLayer({
          id: 'incidents-glow',
          type: 'line',
          source: 'incidents',
          layout: lineLayout,
          paint: { 'line-color': incidentColor, 'line-width': 18, 'line-blur': 10, 'line-opacity': 0.55 },
        });
        m.addLayer({
          id: 'incidents-line',
          type: 'line',
          source: 'incidents',
          layout: lineLayout,
          paint: { 'line-color': incidentColor, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 3.5, 14, 8] as never },
        });

        // Urban seleccionada: lo que ya recorrió (verde brillante) y lo que le falta (punteado)
        m.addLayer({
          id: 'trip-left',
          type: 'line',
          source: 'trip-left',
          layout: { 'line-cap': 'round' },
          paint: { 'line-color': '#FFFBEB', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2.5, 14, 6], 'line-dasharray': [0.5, 2], 'line-opacity': 0.9 },
        });
        m.addLayer({
          id: 'trip-done-glow',
          type: 'line',
          source: 'trip-done',
          layout: lineLayout,
          paint: { 'line-color': '#34D399', 'line-width': 16, 'line-blur': 10, 'line-opacity': 0.55 },
        });
        m.addLayer({
          id: 'trip-done',
          type: 'line',
          source: 'trip-done',
          layout: lineLayout,
          paint: { 'line-color': '#6EE7B7', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 3.5, 14, 7] },
        });

        // Tocar fuera de una urban la deselecciona
        m.on('click', (e) => {
          const target = e.originalEvent.target as HTMLElement | null;
          if (target?.closest('[data-van], [data-incident]')) return;
          callbacks.current.onTripSelect(null);
          callbacks.current.onIncidentSelect(null);
        });
        // Si la persona mueve el mapa, la cámara deja de seguir a la urban
        m.on('dragstart', () => callbacks.current.onFollowChange(false));

        if (!cancelled) setMap(m);
      });

      // Paradas intermedias (terminal de paso en Tuxtla): solo con el mapa acercado, para no encimarse con Tuxtla
      const stopoverEls: HTMLElement[] = [];
      const toggleStopovers = () => {
        const show = instance!.getZoom() >= STOPOVER_MIN_ZOOM;
        for (const el of stopoverEls) el.style.display = show ? '' : 'none';
      };
      instance.on('zoom', toggleStopovers);
      for (const stop of STOPOVERS) {
        const el = document.createElement('div');
        el.className = 'relative z-10 h-0 w-0';
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', `${stop.name}: ${stop.address}, parada de ${stop.dwellMin} minutos`);
        el.title = `${stop.name} · ${stop.address} · parada de ${stop.dwellMin} min`;
        el.innerHTML = `
          <span class="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-50 bg-amber-500 shadow"></span>
          <div class="absolute ${CHIP_POSITION.right} whitespace-nowrap rounded-full border border-amber-200/30 bg-[#04140B]/85 px-2 py-0.5 text-[10px] font-semibold text-amber-100 shadow backdrop-blur">${stop.name} · ${stop.dwellMin} min</div>`;
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([stop.lon, stop.lat]).addTo(instance);
        stopoverEls.push(el);
      }
      toggleStopovers();

      // Pueblos
      for (const town of TOWNS) {
        const el = townElement(town);
        el.addEventListener('mouseenter', () => callbacks.current.onTownHover(town.name));
        el.addEventListener('mouseleave', () => callbacks.current.onTownHover(null));
        el.addEventListener('focus', () => callbacks.current.onTownHover(town.name));
        el.addEventListener('blur', () => callbacks.current.onTownHover(null));
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([town.lon, town.lat]).addTo(instance);
        townMarkers.current.set(town.name, el);
      }
    });

    const vans = vanMarkers.current;
    const towns = townMarkers.current;
    const incidentEls = incidentMarkers.current;
    return () => {
      cancelled = true;
      instance?.remove();
      vans.clear();
      incidentEls.clear();
      towns.clear();
    };
  }, []);

  // Al llegar el trazado real de las carreteras, actualizar las líneas
  useEffect(() => {
    (map?.getSource('routes') as GeoJSONSource | undefined)?.setData(routesGeoJSON(paths));
  }, [map, paths]);

  // Líneas que fluyen
  useEffect(() => {
    if (!map || reducedMotion) return;
    let step = -1;
    let frame = 0;
    const animate = (timestamp: number) => {
      const next = Math.floor(timestamp / 60) % DASH_SEQUENCE.length;
      if (next !== step) {
        step = next;
        map.setPaintProperty('routes-flow', 'line-dasharray', DASH_SEQUENCE[step]);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [map, reducedMotion]);

  // Resaltar rutas y pueblos
  useEffect(() => {
    if (!map) return;
    const opacity = (on: number, off: number) =>
      highlightedPaths
        ? (['match', ['get', 'key'], highlightedPaths.length ? highlightedPaths : ['__ninguna__'], on, off] as const)
        : on;
    map.setPaintProperty('routes-glow', 'line-opacity', opacity(0.4, 0.04) as never);
    map.setPaintProperty('routes-core', 'line-opacity', opacity(1, 0.15) as never);
    map.setPaintProperty('routes-flow', 'line-opacity', opacity(1, 0) as never);
    for (const [name, el] of townMarkers.current) {
      el.style.setProperty('opacity', !highlightedTowns || highlightedTowns.includes(name) ? '1' : '0.35');
    }
  }, [map, highlightedPaths, highlightedTowns]);

  // Al elegir una urban, la cámara vuela hacia ella; luego la sigue cuadro por cuadro
  const followFrom = useRef(0);
  useEffect(() => {
    if (!map || !selectedTrip || !follow) return;
    const { paths: currentPaths, clock: currentClock, delays: currentDelays } = live.current;
    const trip = tripsInProgress(clockMinutes(currentClock, Date.now()), currentPaths, currentDelays).find((t) => t.key === selectedTrip);
    if (!trip) return;
    const { lngLat } = pointAlong(trip.path, trip.progress, trip.forward);
    const duration = reducedMotion ? 0 : 1400;
    // La urban queda centrada en la parte del mapa que no tapa la tarjeta de detalle
    const narrow = map.getContainer().clientWidth < 640;
    const padding = narrow ? { top: 0, right: 0, bottom: 190, left: 0 } : { top: 0, right: 0, bottom: 0, left: 330 };
    map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 11.2), pitch: 55, padding, duration });
    followFrom.current = performance.now() + duration;
  }, [map, selectedTrip, follow, reducedMotion]);

  // Sin urban elegida, el mapa vuelve a usar todo su espacio
  useEffect(() => {
    if (!map || selectedTrip) return;
    map.easeTo({ padding: { top: 0, right: 0, bottom: 0, left: 0 }, duration: reducedMotion ? 0 : 600 });
  }, [map, selectedTrip, reducedMotion]);

  // Urbans en camino: se calculan y mueven en cada cuadro para un movimiento continuo
  useEffect(() => {
    const MarkerClass = markerClassRef.current;
    if (!map || !MarkerClass) return;
    const current = vanMarkers.current;
    let frame = 0;
    let visible = true;
    let lastTrail = 0;
    let trailKey: string | null = null;

    const update = (time: number) => {
      frame = 0;
      if (!visible) return;
      const {
        paths: currentPaths,
        clock: currentClock,
        highlightedPaths: hp,
        hoveredTrip: hovered,
        selectedTrip: selected,
        follow: following,
        delays: currentDelays,
      } = live.current;
      const trips = tripsInProgress(clockMinutes(currentClock, Date.now()), currentPaths, currentDelays);
      const seen = new Set<string>();
      let selectedTripNow: Trip | undefined;

      for (const trip of trips) {
        seen.add(trip.key);
        const { lngLat, facingRight } = pointAlong(trip.path, trip.progress, trip.forward);
        let entry = current.get(trip.key);
        if (!entry) {
          const { el, inner } = vanElement(trip);
          el.addEventListener('mouseenter', () => callbacks.current.onTripHover(trip.key));
          el.addEventListener('mouseleave', () => callbacks.current.onTripHover(null));
          el.addEventListener('click', () => callbacks.current.onTripSelect(trip.key));
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              callbacks.current.onTripSelect(trip.key);
            }
          });
          entry = {
            marker: new MarkerClass({ element: el, anchor: 'bottom' }).setLngLat(lngLat).addTo(map),
            inner,
            facingRight: null,
            look: '',
            held: false,
          };
          current.set(trip.key, entry);
        }
        entry.marker.setLngLat(lngLat);
        if (entry.facingRight !== facingRight) {
          entry.facingRight = facingRight;
          entry.inner.style.setProperty('transform', facingRight ? 'none' : 'scaleX(-1)');
        }

        // Aspecto: seleccionada, atenuada o normal (solo se toca el DOM cuando cambia)
        const isSelected = selected === trip.key;
        if (isSelected) selectedTripNow = trip;
        const pathOn = !hp || hp.includes(trip.path.key);
        const dimmed = selected ? !isSelected : !pathOn || (hovered !== null && hovered !== trip.key);
        const look = isSelected ? 'selected' : dimmed ? 'dimmed' : 'normal';
        // Detenida por un incidente: aviso rojo sobre la urban
        const held = trip.heldBy !== null;
        if (entry.held !== held) {
          entry.held = held;
          entry.marker.getElement().dataset.held = held ? 'true' : 'false';
        }
        if (entry.look !== look) {
          entry.look = look;
          const el = entry.marker.getElement();
          el.dataset.look = look;
          el.style.zIndex = isSelected ? '30' : '';
        }
      }

      for (const [key, entry] of current) {
        if (!seen.has(key)) {
          entry.marker.remove();
          current.delete(key);
        }
      }

      // Trazo recorrido de la urban seleccionada (unas 5 veces por segundo basta)
      if (selectedTripNow && (time - lastTrail > 200 || trailKey !== selectedTripNow.key)) {
        lastTrail = time;
        trailKey = selectedTripNow.key;
        const { done, left } = splitTrip(selectedTripNow);
        (map.getSource('trip-done') as GeoJSONSource | undefined)?.setData(line(done));
        (map.getSource('trip-left') as GeoJSONSource | undefined)?.setData(line(left));
      } else if (!selectedTripNow && trailKey !== null) {
        trailKey = null;
        (map.getSource('trip-done') as GeoJSONSource | undefined)?.setData(EMPTY_LINE);
        (map.getSource('trip-left') as GeoJSONSource | undefined)?.setData(EMPTY_LINE);
      }

      if (selectedTripNow && following && time > followFrom.current) {
        map.setCenter(pointAlong(selectedTripNow.path, selectedTripNow.progress, selectedTripNow.forward).lngLat);
      }

      frame = requestAnimationFrame(update);
    };

    // Fuera de pantalla no se anima nada
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(update);
    });
    observer.observe(map.getContainer());
    frame = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [map]);

  useEffect(() => {
    if (!map || viewResetKey === 0) return;
    map.fitBounds(TOWNS_BOUNDS, { padding: fitPadding(map.getContainer().clientWidth), ...VIEW, duration: reducedMotion ? 0 : 1200 });
  }, [map, viewResetKey, reducedMotion]);

  // Mosaicos de TomTom vía nuestro servidor: mapa base hasta abajo; tráfico e incidentes bajo nuestras rutas
  useEffect(() => {
    if (!map) return;
    const tileUrl = (layer: string, version = '') =>
      `${window.location.origin}/api/traffic/tiles/${layer}/{z}/{x}/{y}${version ? `?v=${version}` : ''}`;
    const ensure = (id: string, layer: string, visible: boolean, before: string, paint: Record<string, number>) => {
      if (visible && !map.getSource(id)) {
        // TomTom entrega 512 px por mosaico (alta resolución); se muestran a 256 para que textos y líneas tengan su tamaño real
        map.addSource(id, { type: 'raster', tiles: [tileUrl(layer)], tileSize: 256, minzoom: 5, maxzoom: 17, attribution: '© TomTom' });
        map.addLayer({ id, type: 'raster', source: id, paint }, map.getLayer(before) ? before : undefined);
      }
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    };

    const tomtomBase = baseMap === 'tomtom';
    ensure('tomtom-base', 'map', tomtomBase, 'outside-chiapas', { 'raster-fade-duration': 200 });
    for (const id of baseLayerIds.current) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', tomtomBase ? 'none' : 'visible');
    }
    ensure('traffic-incident-tiles', 'incidents', showIncidentTiles, 'routes-glow', { 'raster-opacity': 0.9, 'raster-fade-duration': 300 });
    ensure('traffic-flow', 'flow', showFlow, map.getLayer('traffic-incident-tiles') ? 'traffic-incident-tiles' : 'routes-glow', {
      'raster-opacity': 0.85,
      'raster-fade-duration': 300,
    });

    // Cada 2 minutos se piden mosaicos de tráfico nuevos (el parámetro solo evita la copia guardada del navegador)
    if (!showFlow && !showIncidentTiles) return;
    const interval = setInterval(() => {
      const version = String(Date.now());
      for (const [id, layer] of [
        ['traffic-flow', 'flow'],
        ['traffic-incident-tiles', 'incidents'],
      ] as const) {
        (map.getSource(id) as { setTiles?: (tiles: string[]) => void } | undefined)?.setTiles?.([tileUrl(layer, version)]);
      }
    }, 120_000);
    return () => clearInterval(interval);
  }, [map, showFlow, showIncidentTiles, baseMap]);

  // Tramos con incidentes
  useEffect(() => {
    if (!map) return;
    (map.getSource('incidents') as GeoJSONSource | undefined)?.setData({
      type: 'FeatureCollection',
      features: incidents
        .filter((incident) => incident.line.length > 1)
        .map((incident) => ({
          type: 'Feature' as const,
          properties: { id: incident.id, kind: incident.kind, severe: isSevere(incident) },
          geometry: { type: 'LineString' as const, coordinates: incident.line },
        })),
    });
  }, [map, incidents]);

  // Íconos de incidentes (se reconstruyen cuando llega un reporte nuevo)
  useEffect(() => {
    const MarkerClass = markerClassRef.current;
    if (!map || !MarkerClass) return;
    const current = incidentMarkers.current;
    for (const incident of incidents) {
      if (current.has(incident.id)) {
        current.get(incident.id)!.setLngLat(incident.point);
        continue;
      }
      const el = incidentElement(incident);
      el.addEventListener('click', () => callbacks.current.onIncidentSelect(incident.id));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          callbacks.current.onIncidentSelect(incident.id);
        }
      });
      current.set(incident.id, new MarkerClass({ element: el, anchor: 'center' }).setLngLat(incident.point).addTo(map));
    }
    const ids = new Set(incidents.map((incident) => incident.id));
    for (const [id, marker] of current) {
      if (!ids.has(id)) {
        marker.remove();
        current.delete(id);
      }
    }
  }, [map, incidents]);

  useEffect(() => {
    for (const [id, marker] of incidentMarkers.current) {
      marker.getElement().dataset.selected = id === selectedIncident ? 'true' : 'false';
    }
  }, [selectedIncident, incidents]);

  // Llevar la cámara a un punto (por ejemplo, un incidente elegido en la lista)
  useEffect(() => {
    if (!map || !focus) return;
    onFollowChange(false);
    map.easeTo({ center: focus.lngLat, zoom: Math.max(map.getZoom(), 12.5), duration: reducedMotion ? 0 : 1200 });
    // Solo debe moverse cuando cambia el destino pedido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focus?.nonce]);

  const recenter = () => {
    onTripSelect(null);
    map?.fitBounds(TOWNS_BOUNDS, { padding: fitPadding(map.getContainer().clientWidth), ...VIEW, duration: 1200 });
  };

  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-[#0B2E1B] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:h-[540px]">
      {/* MapLibre le pone position: relative al contenedor, por eso la altura va explícita */}
      <div ref={containerRef} className="h-full w-full" translate="no" />
      {/* Viñeta para dar profundidad */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_80px_rgba(2,11,6,0.85)]"
      />
      {failed ? (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-emerald-50/70">
          Tu navegador no puede mostrar el mapa interactivo.
        </p>
      ) : (
        <button
          type="button"
          onClick={recenter}
          className="absolute right-14 top-3 rounded-full border border-white/10 bg-[#04140B]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200 shadow-xl backdrop-blur-md transition-colors hover:bg-[#04140B]"
        >
          <span className="sm:hidden">Todas</span>
          <span className="hidden sm:inline">Ver todas las rutas</span>
        </button>
      )}
    </div>
  );
}
