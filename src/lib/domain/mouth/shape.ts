import type { Phoneme } from '@/lib/domain/g2p';

export const SHAPE_KEYS = [
  'open',
  'width',
  'round',
  'cornerLift',
  'upperLip',
  'lowerLip',
  'upperTeeth',
  'lowerTeeth',
  'tongueLow',
  'tongueUp',
  'tongueOut',
  'tongueBack',
  'lipTuck',
  'press',
  'puff',
  'creases',
  'trill',
  'nasal',
  'airflow',
] as const;

export type ShapeKey = (typeof SHAPE_KEYS)[number];

export type MouthShape = Readonly<Record<ShapeKey, number>>;

/** Every key runs 0–1 except the corners, which can also turn down. */
export const SHAPE_RANGE = Object.fromEntries(
  SHAPE_KEYS.map((key) => [key, key === 'cornerLift' ? [-1, 1] : [0, 1]] as const),
) as unknown as Readonly<Record<ShapeKey, readonly [number, number]>>;

/** A phoneme, or the silence that frames and separates words. */
export type Sound = Phoneme | 'REST';

export const REST_SHAPE: MouthShape = {
  open: 0,
  width: 0.45,
  round: 0.1,
  cornerLift: 0,
  upperLip: 0.5,
  lowerLip: 0.5,
  upperTeeth: 0,
  lowerTeeth: 0,
  tongueLow: 0,
  tongueUp: 0,
  tongueOut: 0,
  tongueBack: 0,
  lipTuck: 0,
  press: 0,
  puff: 0,
  creases: 0,
  trill: 0,
  nasal: 0,
  airflow: 0,
};

export const SMILE_SHAPE: MouthShape = {
  ...REST_SHAPE,
  width: 0.7,
  cornerLift: 0.6,
  upperLip: 0.4,
  lowerLip: 0.45,
};

const shape = (overrides: Partial<MouthShape>): MouthShape => ({ ...REST_SHAPE, ...overrides });

const I = shape({
  open: 0.2,
  width: 0.8,
  round: 0,
  cornerLift: 0.5,
  upperLip: 0.3,
  lowerLip: 0.35,
  upperTeeth: 0.95,
  lowerTeeth: 0.7,
});

const U = shape({
  open: 0.25,
  width: 0.08,
  round: 1,
  upperLip: 0.9,
  lowerLip: 0.9,
  creases: 0.5,
});

/**
 * One shape per sound, drawn after the speech therapist's alphabet chart. Sounds that share a
 * viseme stay close, but each keeps its own shape so /p/ /b/ /m/ and /t/ /d/ /n/ /l/ /r/ can be
 * told apart where the face shows a difference.
 */
export const SHAPES: Readonly<Record<Sound, MouthShape>> = {
  REST: REST_SHAPE,
  a: shape({
    open: 0.85,
    width: 0.5,
    round: 0.55,
    upperLip: 0.5,
    lowerLip: 0.55,
    upperTeeth: 0.5,
    lowerTeeth: 0.15,
    tongueLow: 0.6,
  }),
  e: shape({
    open: 0.45,
    width: 0.6,
    round: 0.2,
    cornerLift: 0.1,
    upperLip: 0.45,
    lowerLip: 0.5,
    upperTeeth: 0.6,
    lowerTeeth: 0.2,
    tongueLow: 0.5,
  }),
  i: I,
  o: shape({ open: 0.6, width: 0.28, round: 1, upperLip: 0.75, lowerLip: 0.75 }),
  u: U,
  j: { ...I, open: 0.18, width: 0.55 },
  w: { ...U, open: 0.22, width: 0.15 },
  p: shape({ width: 0.4, press: 1, puff: 1, creases: 1, upperLip: 0.35, lowerLip: 0.4 }),
  b: shape({
    open: 0.09,
    width: 0.45,
    round: 0.3,
    upperLip: 0.6,
    lowerLip: 0.75,
    airflow: 0.8,
  }),
  m: shape({ width: 0.5, press: 0.15, nasal: 1, upperLip: 0.4, lowerLip: 0.45 }),
  f: shape({
    open: 0.2,
    width: 0.6,
    upperLip: 0.45,
    lowerLip: 0.35,
    upperTeeth: 1,
    lipTuck: 0.8,
    airflow: 1,
  }),
  θ: shape({
    open: 0.3,
    width: 0.6,
    round: 0.1,
    upperTeeth: 0.35,
    tongueOut: 0.85,
    airflow: 0.8,
  }),
  t: shape({
    open: 0.33,
    width: 0.68,
    upperLip: 0.4,
    lowerLip: 0.45,
    upperTeeth: 0.75,
    lowerTeeth: 0.45,
    tongueOut: 0.35,
  }),
  d: shape({
    open: 0.5,
    width: 0.64,
    round: 0.1,
    upperLip: 0.45,
    upperTeeth: 0.6,
    lowerTeeth: 0.5,
    tongueOut: 0.6,
  }),
  n: shape({
    open: 0.4,
    width: 0.56,
    round: 0.3,
    upperTeeth: 0.15,
    lowerTeeth: 0.35,
    tongueUp: 1,
    nasal: 1,
  }),
  l: shape({
    open: 0.5,
    width: 0.52,
    round: 0.25,
    upperTeeth: 0.6,
    lowerTeeth: 0.4,
    tongueUp: 0.8,
  }),
  ɾ: shape({
    open: 0.45,
    width: 0.6,
    upperLip: 0.45,
    upperTeeth: 0.5,
    lowerTeeth: 0.35,
    tongueUp: 0.85,
  }),
  r: shape({
    open: 0.45,
    width: 0.6,
    upperLip: 0.45,
    lowerLip: 0.45,
    upperTeeth: 0.5,
    lowerTeeth: 0.35,
    tongueUp: 1,
    trill: 1,
    airflow: 0.8,
  }),
  s: shape({
    open: 0.2,
    width: 0.58,
    round: 0.1,
    cornerLift: 0.35,
    upperLip: 0.25,
    lowerLip: 0.3,
    upperTeeth: 1,
    lowerTeeth: 1,
    airflow: 1,
  }),
  tʃ: shape({
    open: 0.22,
    width: 0.35,
    round: 0.75,
    upperLip: 0.8,
    lowerLip: 0.8,
    upperTeeth: 1,
    lowerTeeth: 1,
    airflow: 0.8,
  }),
  ʝ: shape({
    open: 0.38,
    width: 0.75,
    round: 0.15,
    upperLip: 0.45,
    upperTeeth: 0.7,
    lowerTeeth: 0.6,
    tongueLow: 0.6,
  }),
  ʎ: shape({
    open: 0.38,
    width: 0.68,
    round: 0.2,
    upperTeeth: 0.6,
    lowerTeeth: 0.4,
    tongueBack: 0.5,
  }),
  ɲ: shape({
    open: 0.38,
    width: 0.7,
    cornerLift: 0.2,
    upperLip: 0.45,
    upperTeeth: 0.8,
    lowerTeeth: 0.4,
    tongueLow: 0.8,
    nasal: 1,
  }),
  k: shape({
    open: 0.55,
    width: 0.62,
    round: 0.15,
    cornerLift: 0.2,
    upperLip: 0.4,
    lowerLip: 0.45,
    upperTeeth: 0.9,
    lowerTeeth: 0.6,
    tongueBack: 0.9,
  }),
  ɡ: shape({
    open: 0.55,
    width: 0.42,
    round: 0.6,
    upperTeeth: 0.25,
    tongueBack: 0.6,
  }),
  x: shape({
    open: 0.58,
    width: 0.55,
    round: 0.2,
    upperTeeth: 0.6,
    lowerTeeth: 0.4,
    tongueLow: 0.9,
    tongueBack: 0.3,
  }),
};

const lerp = (a: number, b: number, t: number): number => a * (1 - t) + b * t;

const mapShape = (fn: (key: ShapeKey) => number): MouthShape =>
  Object.fromEntries(SHAPE_KEYS.map((key) => [key, fn(key)])) as MouthShape;

export const blend = (a: MouthShape, b: MouthShape, t: number): MouthShape =>
  mapShape((key) => lerp(a[key], b[key], t));

export const exaggerate = (value: MouthShape, factor: number): MouthShape =>
  mapShape((key) =>
    Math.max(
      SHAPE_RANGE[key][0],
      Math.min(SHAPE_RANGE[key][1], REST_SHAPE[key] + (value[key] - REST_SHAPE[key]) * factor),
    ),
  );

export const weightedSum = (
  parts: readonly { readonly shape: MouthShape; readonly weight: number }[],
): MouthShape =>
  mapShape((key) => parts.reduce((total, part) => total + part.shape[key] * part.weight, 0));
