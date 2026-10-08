import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel no lee .env.local en las funciones del servidor; con "env" los valores se fijan al compilar.
  // Solo los usan archivos del servidor (src/features/coverage/server), así que no llegan al navegador.
  env: {
    TOMTOM_API_KEY: process.env.TOMTOM_API_KEY ?? "",
    TRAFFIC_REFRESH_SECONDS: process.env.TRAFFIC_REFRESH_SECONDS ?? "",
  },
};

export default nextConfig;
