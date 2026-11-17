import type { Dialect } from '@/lib/domain/g2p';
import {
  MAX_OVERHEAD_MS,
  MAX_PLAUSIBLE_SYLLABLES_PER_SECOND,
  MAX_RATE,
  MIN_FIT_SPREAD,
  MIN_PLAUSIBLE_SYLLABLES_PER_SECOND,
  MIN_RATE,
  NEUTRAL_RATE,
} from './rates';

export {
  DRIFT_TOLERANCE_MS,
  MAX_LATENCY_MS,
  MAX_RATE,
  MEASURE_TIMEOUT_MS,
  MIN_RATE,
  MOUTH_LEAD_MS,
  NEUTRAL_RATE,
} from './rates';

export type VoiceInfo = {
  readonly name: string;
  readonly lang: string;
  readonly localService: boolean;
};

export type Gender = 'mujer' | 'hombre';

/**
 * Two words of different lengths. One length cannot separate a voice's pace from the
 * fixed silence it adds to every utterance; two can.
 */
export const CALIBRATION_WORDS: readonly { readonly text: string; readonly syllables: number }[] = [
  { text: 'sí', syllables: 1 },
  { text: 'murciélago', syllables: 4 },
];

export type VoiceQuery = {
  readonly lang: string;
  readonly name?: string;
  readonly gender?: Gender;
};

export type RateInput = {
  readonly syllables: number;
  readonly targetMs: number;
  /** Omit for a voice that has not been heard yet: it speaks at its own natural rate. */
  readonly pace?: Pace;
};

export type Sample = {
  readonly syllables: number;
  readonly measuredMs: number;
  readonly rate: number;
};

/**
 * How a voice turns syllables into time: a pace, plus the silence it adds to every
 * utterance. Both are measured from the voice as it plays; neither is ever assumed.
 */
export type Pace = {
  readonly syllablesPerSecond: number;
  readonly overheadMs: number;
};

const SPANISH = 'es';

const FEMALE_NAMES: readonly string[] = [
  'monica',
  'paulina',
  'marisol',
  'angelica',
  'helena',
  'laura',
  'elvira',
  'dalia',
  'sabina',
  'esperanza',
  'lucia',
  'ximena',
  'sofia',
  'camila',
  'carmen',
  'conchita',
  'penelope',
  'triana',
  'irene',
  'nuria',
  'abril',
  'renata',
  'salome',
  'yolanda',
  'maria',
  'elena',
  'isabela',
  'lupe',
  'catalina',
  'francisca',
  'tania',
  'flo',
];

const MALE_NAMES: readonly string[] = [
  'jorge',
  'juan',
  'diego',
  'carlos',
  'pablo',
  'alvaro',
  'enrique',
  'miguel',
  'rodrigo',
  'javier',
  'gonzalo',
  'pedro',
  'luis',
  'raul',
  'felipe',
  'liberto',
  'lorenzo',
  'tomas',
  'victor',
  'arnau',
  'elias',
  'damian',
  'cecilio',
  'dalmacio',
  'mateo',
  'andres',
];

const GENDER_WEIGHT = 1.5;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const normalize = (lang: string): string => lang.toLowerCase().replace('_', '-');

const base = (lang: string): string => normalize(lang).split('-')[0];

const tokens = (name: string): readonly string[] =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length > 0);

export const genderOf = ({ name }: VoiceInfo): Gender | undefined => {
  const parts = tokens(name);
  if (parts.some((part) => FEMALE_NAMES.includes(part))) return 'mujer';
  if (parts.some((part) => MALE_NAMES.includes(part))) return 'hombre';
  return undefined;
};

export const langFor = (dialect: Dialect): string => (dialect.seseo ? 'es-419' : 'es-ES');

export const spanishVoices = (voices: readonly VoiceInfo[]): readonly VoiceInfo[] =>
  voices.filter((voice) => base(voice.lang) === SPANISH);

const score = (voice: VoiceInfo, { lang, gender }: VoiceQuery): number =>
  (normalize(voice.lang) === normalize(lang) ? 4 : base(voice.lang) === base(lang) ? 2 : 0) +
  (gender !== undefined && genderOf(voice) === gender ? GENDER_WEIGHT : 0) +
  (voice.localService ? 1 : 0);

export const pickVoice = (voices: readonly VoiceInfo[], query: VoiceQuery): VoiceInfo | undefined =>
  voices.find((voice) => voice.name === query.name) ??
  spanishVoices(voices).reduce<VoiceInfo | undefined>(
    (best, voice) =>
      best === undefined || score(voice, query) > score(best, query) ? voice : best,
    undefined,
  );

/** The rate this span would need, before clamping. Undefined while the voice is unmeasured. */
export const requiredRate = ({ syllables, targetMs, pace }: RateInput): number | undefined =>
  pace === undefined || syllables <= 0 || targetMs <= 0 || pace.syllablesPerSecond <= 0
    ? undefined
    : syllables / (targetMs / 1000) / pace.syllablesPerSecond;

export const rateFor = (input: RateInput): number => {
  const required = requiredRate(input);
  return required === undefined ? NEUTRAL_RATE : clamp(required, MIN_RATE, MAX_RATE);
};

/**
 * Whether the voice can actually hold this span. Outside the clamp the engine cannot
 * stretch or hurry far enough, and speaking anyway would put the sound off the lips.
 */
export const canFit = (input: RateInput): boolean => {
  const required = requiredRate(input);
  return required === undefined || (required >= MIN_RATE && required <= MAX_RATE);
};

const plausible = (pace: Pace): boolean =>
  pace.syllablesPerSecond >= MIN_PLAUSIBLE_SYLLABLES_PER_SECOND &&
  pace.syllablesPerSecond <= MAX_PLAUSIBLE_SYLLABLES_PER_SECOND &&
  pace.overheadMs >= 0 &&
  pace.overheadMs <= MAX_OVERHEAD_MS;

export const fitPace = (
  samples: readonly Sample[],
  fallback: Pace | undefined,
): Pace | undefined => {
  const points = samples
    .filter((sample) => sample.syllables > 0 && sample.measuredMs > 0 && sample.rate > 0)
    .map((sample) => ({ x: sample.syllables / sample.rate, y: sample.measuredMs }));
  if (points.length < 2) return fallback;
  const meanX = points.reduce((total, point) => total + point.x, 0) / points.length;
  const meanY = points.reduce((total, point) => total + point.y, 0) / points.length;
  const spread = points.reduce((total, point) => total + (point.x - meanX) ** 2, 0);
  const range =
    Math.max(...points.map((point) => point.x)) - Math.min(...points.map((point) => point.x));
  // Samples of one length at one rate sit on top of each other; a line through them is noise.
  if (spread === 0 || range < meanX * MIN_FIT_SPREAD) return fallback;
  const slope =
    points.reduce((total, point) => total + (point.x - meanX) * (point.y - meanY), 0) / spread;
  if (slope <= 0) return fallback;
  const fitted = { syllablesPerSecond: 1000 / slope, overheadMs: meanY - slope * meanX };
  return plausible(fitted) ? fitted : fallback;
};
