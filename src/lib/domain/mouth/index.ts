import { PHONEMES } from '@/lib/domain/g2p';
import { layersAt, type CrossfadeOptions } from '@/lib/domain/crossfade';
import type { TimelineEntry } from '@/lib/domain/timing';
import { VISEME_OF, type Viseme } from '@/lib/domain/viseme';
import { REST_SHAPE, SHAPES, exaggerate, weightedSum, type MouthShape, type Sound } from './shape';

export {
  SHAPES,
  SHAPE_KEYS,
  SHAPE_RANGE,
  REST_SHAPE,
  SMILE_SHAPE,
  blend,
  exaggerate,
} from './shape';
export type { MouthShape, ShapeKey, Sound } from './shape';

export type ShapeTable = Readonly<Record<Sound, MouthShape>>;

export const SOUNDS: readonly Sound[] = ['REST', ...PHONEMES];

/** The sounds one viseme groups, in inventory order. */
export const soundsOf = (viseme: Viseme): readonly Sound[] =>
  viseme === 'REST' ? ['REST'] : PHONEMES.filter((phoneme) => VISEME_OF[phoneme] === viseme);

export type MouthOptions = CrossfadeOptions & {
  readonly exaggeration?: number;
  readonly shapes?: ShapeTable;
};

export const shapeAt = (
  timeline: readonly TimelineEntry[],
  elapsedMs: number,
  { crossfadeMs, exaggeration = 1, shapes: table = SHAPES }: MouthOptions = {},
): MouthShape => {
  const layers = layersAt(timeline, elapsedMs, { crossfadeMs });
  const shape =
    layers.length === 0
      ? REST_SHAPE
      : weightedSum(
          layers.map((layer) => ({ shape: table[layer.phoneme ?? 'REST'], weight: layer.opacity })),
        );
  return exaggeration === 1 ? shape : exaggerate(shape, exaggeration);
};

/** How long the mouth takes to ease between its idle shape and speech. */
export const IDLE_BLEND_MS = 150;

/** A weight easing from `from` to `to`, `elapsedMs` into a `durationMs` move: smoothstep, clamped. */
export const easeWeight = (
  from: number,
  to: number,
  elapsedMs: number,
  durationMs: number = IDLE_BLEND_MS,
): number => {
  const t = durationMs <= 0 ? 1 : Math.min(1, Math.max(0, elapsedMs / durationMs));
  return from + (to - from) * t * t * (3 - 2 * t);
};

export const soundAt = (timeline: readonly TimelineEntry[], elapsedMs: number): Sound =>
  timeline.find((entry) => elapsedMs >= entry.startMs && elapsedMs < entry.endMs)?.phoneme ??
  'REST';
