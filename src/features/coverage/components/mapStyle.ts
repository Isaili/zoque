import type { PropertyValueSpecification, StyleSpecification } from 'maplibre-gl';

// Estilo propio del mapa (verde oscuro y dorado) sobre los mosaicos vectoriales gratuitos de
// OpenFreeMap (datos de OpenStreetMap, esquema OpenMapTiles). No requiere llave de API.
const ROAD_CLASSES = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'];

// Tipo de expresión del estilo (maplibre-gl no lo exporta con nombre propio)
type Expression = Extract<PropertyValueSpecification<number>, unknown[]>;

const byRoadClass = (major: number | string, mid: number | string, minor: number | string) =>
  ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], major, ['secondary', 'tertiary'], mid, minor] as Expression;

export const buildMapStyle = (hiddenPlaceNames: string[]): StyleSpecification => ({
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#0B2E1B' } },
    {
      id: 'landcover',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      paint: {
        'fill-color': ['match', ['get', 'class'], ['wood', 'forest'], '#0E3A22', ['grass', 'farmland'], '#123F27', '#0F3823'],
        'fill-opacity': 0.7,
      },
    },
    {
      id: 'urban',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      minzoom: 9,
      filter: ['match', ['get', 'class'], ['residential', 'suburb', 'neighbourhood', 'commercial', 'industrial'], true, false],
      paint: { 'fill-color': '#1A4D33', 'fill-opacity': 0.55 },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: { 'fill-color': '#114A2C', 'fill-opacity': 0.6 },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#0A3B3F' },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      minzoom: 8,
      paint: { 'line-color': '#0F4E52', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2] },
    },
    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', ['get', 'admin_level'], 4],
      paint: { 'line-color': '#A7F3D0', 'line-opacity': 0.25, 'line-width': 1, 'line-dasharray': [3, 2] },
    },
    {
      id: 'roads-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ROAD_CLASSES, true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#05180E',
        'line-width': [
          'interpolate', ['exponential', 1.5], ['zoom'],
          6, byRoadClass(1.6, 0.6, 0),
          10, byRoadClass(3.5, 2, 0.8),
          14, byRoadClass(9, 6, 3.5),
          17, byRoadClass(20, 14, 9),
        ],
      },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ROAD_CLASSES, true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': byRoadClass('#5FAF83', '#3E8C62', '#2C6B4A'),
        'line-width': [
          'interpolate', ['exponential', 1.5], ['zoom'],
          6, byRoadClass(0.8, 0.3, 0),
          10, byRoadClass(2, 1.2, 0.4),
          14, byRoadClass(6, 4, 2),
          17, byRoadClass(15, 10, 6),
        ],
      },
    },
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#2C7350',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.75,
      },
    },
    {
      id: 'road-names',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 13,
      layout: {
        'symbol-placement': 'line',
        'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
      },
      paint: { 'text-color': '#D1FAE5', 'text-halo-color': '#06200F', 'text-halo-width': 1.4 },
    },
    {
      id: 'places',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: [
        'all',
        ['match', ['get', 'class'], ['city', 'town', 'village', 'suburb', 'neighbourhood'], true, false],
        ['!', ['in', ['get', 'name'], ['literal', hiddenPlaceNames]]],
      ],
      layout: {
        'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['match', ['get', 'class'], 'city', 13, 'town', 12, 11],
      },
      paint: { 'text-color': '#A7F3D0', 'text-opacity': 0.75, 'text-halo-color': '#06200F', 'text-halo-width': 1.4 },
    },
  ],
});
