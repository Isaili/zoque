'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CHIAPAS_OUTLINE } from './chiapasGeo';
import { TOWNS, TOWNS_BOUNDS, pointAlong, type MapPath, type Trip } from './coverageData';
import { buildMapStyle } from './mapStyle';

interface CoverageMapProps {
  paths: MapPath[];
  trips: Trip[];
  highlightedPaths: string[] | null; // null = todas resaltadas
  highlightedTowns: string[] | null;
  activeTrip: string | null;
  reducedMotion: boolean;
  onTownHover: (town: string | null) => void;
  onTripHover: (trip: string | null) => void;
}

const VIEW = { pitch: 52, bearing: -14 };

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

export function CoverageMap({
  paths,
  trips,
  highlightedPaths,
  highlightedTowns,
  activeTrip,
  reducedMotion,
  onTownHover,
  onTripHover,
}: CoverageMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [failed, setFailed] = useState(false);
  const markerClassRef = useRef<typeof Marker | null>(null);
  const townMarkers = useRef(new Map<string, HTMLElement>());
  const vanMarkers = useRef(new Map<string, { marker: Marker; inner: HTMLElement }>());
  const callbacks = useRef({ onTownHover, onTripHover });
  const initialPaths = useRef(paths);

  useEffect(() => {
    callbacks.current = { onTownHover, onTripHover };
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
        m.addSource('outside-chiapas', { type: 'geojson', data: OUTSIDE_CHIAPAS });
        m.addSource('chiapas-border', { type: 'geojson', data: CHIAPAS_BORDER });
        m.addSource('routes', { type: 'geojson', data: routesGeoJSON(initialPaths.current) });

        m.addLayer({ id: 'outside-chiapas', type: 'fill', source: 'outside-chiapas', paint: { 'fill-color': '#020B06', 'fill-opacity': 0.55 } });
        m.addLayer({
          id: 'chiapas-border-glow',
          type: 'line',
          source: 'chiapas-border',
          paint: { 'line-color': '#FCD34D', 'line-width': 6, 'line-blur': 6, 'line-opacity': 0.25 },
        });
        m.addLayer({ id: 'chiapas-border', type: 'line', source: 'chiapas-border', paint: { 'line-color': '#FDE68A', 'line-width': 1.3, 'line-opacity': 0.6 } });

        const lineLayout = { 'line-cap': 'round' as const, 'line-join': 'round' as const };
        m.addLayer({
          id: 'routes-glow',
          type: 'line',
          source: 'routes',
          layout: lineLayout,
          paint: { 'line-color': '#FCD34D', 'line-width': 12, 'line-blur': 8, 'line-opacity': 0.4 },
        });
        m.addLayer({
          id: 'routes-core',
          type: 'line',
          source: 'routes',
          layout: lineLayout,
          paint: { 'line-color': '#FCD34D', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2.2, 14, 5] },
        });
        m.addLayer({
          id: 'routes-flow',
          type: 'line',
          source: 'routes',
          layout: lineLayout,
          paint: {
            'line-color': '#FFFBEB',
            'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2.2, 14, 5],
            'line-dasharray': DASH_SEQUENCE[0],
          },
        });
        if (!cancelled) setMap(m);
      });

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
    return () => {
      cancelled = true;
      instance?.remove();
      vans.clear();
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

  // Urbans en camino: crear, mover y quitar según la hora
  useEffect(() => {
    const MarkerClass = markerClassRef.current;
    if (!map || !MarkerClass) return;
    const current = vanMarkers.current;
    const seen = new Set<string>();

    for (const trip of trips) {
      seen.add(trip.key);
      const { lngLat, facingRight } = pointAlong(trip.path, trip.progress, trip.forward);
      let entry = current.get(trip.key);
      if (!entry) {
        const el = document.createElement('div');
        el.className = 'cursor-pointer transition-opacity duration-300';
        const inner = document.createElement('div');
        inner.innerHTML = VAN_SVG;
        el.appendChild(inner);
        el.addEventListener('mouseenter', () => callbacks.current.onTripHover(trip.key));
        el.addEventListener('mouseleave', () => callbacks.current.onTripHover(null));
        entry = { marker: new MarkerClass({ element: el, anchor: 'bottom' }).setLngLat(lngLat).addTo(map), inner };
        current.set(trip.key, entry);
      }
      entry.marker.setLngLat(lngLat);
      entry.inner.style.setProperty('transform', facingRight ? 'none' : 'scaleX(-1)');
      const pathOn = !highlightedPaths || highlightedPaths.includes(trip.path.key);
      entry.marker.getElement().style.setProperty('opacity', pathOn && (!activeTrip || activeTrip === trip.key) ? '1' : '0.25');
    }

    for (const [key, entry] of current) {
      if (!seen.has(key)) {
        entry.marker.remove();
        current.delete(key);
      }
    }
  }, [map, trips, highlightedPaths, activeTrip]);

  const recenter = () =>
    map?.fitBounds(TOWNS_BOUNDS, { padding: fitPadding(map.getContainer().clientWidth), ...VIEW, duration: 1200 });

  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-[#0B2E1B] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:h-[540px]">
      {/* MapLibre le pone position: relative al contenedor, por eso la altura va explícita */}
      <div ref={containerRef} className="h-full w-full" />
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
