'use client';

import { useEffect, useMemo, useState } from 'react';
import { fractionAlong, type DelaysByPath, type MapPath, type Trip } from './coverageData';
import { isBlocking, type TrafficIncident, type TrafficReport } from './traffic';

const REFRESH_MS = 2 * 60_000;

/* Pide el reporte de tráfico al servidor y lo actualiza mientras la pestaña esté visible.
   Con ?trafico=demo en la dirección se usan datos de prueba (solo en desarrollo). */
export function useTrafficReport() {
  const [report, setReport] = useState<TrafficReport>({ enabled: false });

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get('trafico') === 'demo';
    const controller = new AbortController();
    let lastFetch = 0;

    const load = () => {
      if (document.hidden) return;
      lastFetch = Date.now();
      fetch(`/api/traffic${demo ? '?demo=1' : ''}`, { signal: controller.signal })
        .then((response) => (response.ok ? (response.json() as Promise<TrafficReport>) : null))
        .then((data) => data && setReport(data))
        .catch(() => {
          // Sin conexión o abortado: se conserva el último reporte
        });
    };
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastFetch > REFRESH_MS) load();
    };

    load();
    const interval = setInterval(load, REFRESH_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return report;
}

/* Retrasos por camino: cada incidente que frena el paso, ubicado sobre el trazo */
export function useDelays(incidents: TrafficIncident[], paths: MapPath[]): DelaysByPath {
  return useMemo(() => {
    const delays: DelaysByPath = {};
    for (const incident of incidents) {
      if (!isBlocking(incident) || !incident.delayMin) continue;
      for (const key of incident.pathKeys) {
        const path = paths.find((p) => p.key === key);
        if (!path) continue;
        (delays[key] ??= []).push({ id: incident.id, fraction: fractionAlong(path, incident.point), minutes: incident.delayMin });
      }
    }
    return delays;
  }, [incidents, paths]);
}

/* Incidentes que una corrida todavía tiene por delante (o en los que está detenida) */
export const incidentsAhead = (trip: Trip, incidents: TrafficIncident[]) =>
  incidents
    .filter((incident) => incident.pathKeys.includes(trip.path.key))
    .map((incident) => {
      const along = fractionAlong(trip.path, incident.point);
      return { incident, fraction: trip.forward ? along : 1 - along };
    })
    .filter(({ incident, fraction }) => incident.id === trip.heldBy || fraction > trip.progress)
    .sort((a, b) => a.fraction - b.fraction);
