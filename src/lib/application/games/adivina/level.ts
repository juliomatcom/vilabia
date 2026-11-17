export const MIN_LEVEL = 1;
export const MAX_LEVEL = 25;

/** `DIFICULTAD` offset bounds. The voice plays up to Media and is off at `hardest` (Difícil). */
export const DIFFICULTY_RANGE = { easiest: -5, hardest: 5 } as const;

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const clampLevel = (level: number): number =>
  Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));

const progress = (level: number): number =>
  (clampLevel(level) - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);

export const levelExaggeration = (level: number): number => lerp(1.5, 0.85, progress(level));

export const levelConfusion = (level: number): number => lerp(0.9, 0.05, progress(level));
