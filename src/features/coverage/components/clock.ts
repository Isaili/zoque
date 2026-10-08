// Reloj del mapa: la hora real de Chiapas o una simulación del día que se puede adelantar y pausar

export const SIM_START = 3 * 60 + 45; // 3:45 AM, antes de la primera corrida
export const SIM_END = 23 * 60; // 11:00 PM
export const SIM_SPEED = 2; // minutos simulados por cada segundo real

export type Clock =
  | { mode: 'live' }
  | { mode: 'sim'; base: number; startedAt: number | null }; // startedAt = null cuando está en pausa

const chiapasClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Mexico_City',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});

// Minutos desde medianoche en Chiapas (con fracción), sin importar desde dónde se vea la página
export const chiapasMinutes = (ms: number) => {
  const parts = Object.fromEntries(
    chiapasClock.formatToParts(new Date(ms)).map(({ type, value }) => [type, Number(value)]),
  );
  return parts.hour * 60 + parts.minute + (parts.second + (ms % 1000) / 1000) / 60;
};

const wrapSim = (minutes: number) => SIM_START + ((((minutes - SIM_START) % (SIM_END - SIM_START)) + (SIM_END - SIM_START)) % (SIM_END - SIM_START));

export const clockMinutes = (clock: Clock, ms: number) => {
  if (clock.mode === 'live') return chiapasMinutes(ms);
  if (clock.startedAt === null) return clock.base;
  return wrapSim(clock.base + ((ms - clock.startedAt) / 1000) * SIM_SPEED);
};

export const simClock = (minutes: number, playing: boolean, ms: number): Clock => ({
  mode: 'sim',
  base: minutes,
  startedAt: playing ? ms : null,
});
