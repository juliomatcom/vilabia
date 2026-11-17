export const MIN_RATE = 0.5;
export const MAX_RATE = 2;
export const NEUTRAL_RATE = 1;

export const MIN_FIT_SPREAD = 0.2;

export const MIN_PLAUSIBLE_SYLLABLES_PER_SECOND = 1.5;
export const MAX_PLAUSIBLE_SYLLABLES_PER_SECOND = 14;
export const MAX_OVERHEAD_MS = 800;
export const MAX_LATENCY_MS = 800;

export const DRIFT_TOLERANCE_MS = 120;

/** How long a measuring pass may wait on one utterance before it is written off. */
export const MEASURE_TIMEOUT_MS = 4000;

/** How far the mouth runs ahead of its own sound, as real articulation does. Not per voice. */
export const MOUTH_LEAD_MS = 60;
