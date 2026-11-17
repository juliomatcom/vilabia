import { canFit, type Pace } from '@/lib/application/speech';
import { DISTINCION, toPhonemes, type Dialect, type Word } from '@/lib/domain/g2p';
import {
  SHAPES,
  shapeAt,
  soundAt,
  type MouthShape,
  type ShapeTable,
  type Sound,
} from '@/lib/domain/mouth';
import {
  durationMs,
  speechSpan,
  spokenMs,
  toTimeline,
  toWordSpans,
  type Span,
  type TimelineEntry,
  type WordSpan,
} from '@/lib/domain/timing';
import { toVisemes, type Viseme, type VisemeSegment } from '@/lib/domain/viseme';

export type ClipOptions = {
  readonly dialect?: Dialect;
  readonly speed?: number;
  readonly interWordMs?: number;
};

/** Everything the pipeline derives from one text: sounds, visemes, and when each is shown. */
export type Clip = {
  readonly words: readonly Word[];
  readonly segments: readonly VisemeSegment[];
  readonly timeline: readonly TimelineEntry[];
  readonly wordSpans: readonly WordSpan[];
  readonly totalMs: number;
  readonly speech: Span;
  /** Time the voice has to fill: the speech span minus the pauses between words. */
  readonly spokenMs: number;
};

export const articulate = (
  text: string,
  { dialect = DISTINCION, speed = 1, interWordMs }: ClipOptions = {},
): Clip => {
  const words = toPhonemes(text, dialect);
  const segments = toVisemes(words);
  const timeline = toTimeline(segments, { speed, interWordMs });
  const wordSpans = toWordSpans(segments, { speed, interWordMs });
  return {
    words,
    segments,
    timeline,
    wordSpans,
    totalMs: durationMs(timeline),
    speech: speechSpan(timeline),
    spokenMs: spokenMs(wordSpans),
  };
};

export type FrameOptions = {
  /** Transition at x1; it scales with `speed` like every duration. */
  readonly crossfadeMs?: number;
  readonly speed?: number;
  readonly exaggeration?: number;
  readonly shapes?: ShapeTable;
};

export type Frame = {
  readonly shape: MouthShape;
  readonly sound: Sound;
  readonly viseme: Viseme;
};

/** What the mouth shows `elapsedMs` into the clip. */
export const frameAt = (
  clip: Clip,
  elapsedMs: number,
  { crossfadeMs, speed = 1, exaggeration, shapes = SHAPES }: FrameOptions = {},
): Frame => ({
  shape: shapeAt(clip.timeline, elapsedMs, {
    crossfadeMs: crossfadeMs === undefined ? undefined : crossfadeMs / speed,
    exaggeration,
    shapes,
  }),
  sound: soundAt(clip.timeline, elapsedMs),
  viseme:
    clip.timeline.find((entry) => elapsedMs >= entry.startMs && elapsedMs < entry.endMs)?.viseme ??
    'REST',
});

/** Every word has to fit, or the clip is spoken with one word out of step with the mouth. */
export const voiceFits = (clip: Clip, pace: Pace | undefined): boolean =>
  clip.wordSpans.every((span, index) =>
    canFit({
      syllables: clip.words[index]?.syllables.length ?? 0,
      targetMs: span.endMs - span.startMs,
      pace,
    }),
  );

/** One word for the voice to say, and when to launch it, relative to pressing play. */
export type Cue = {
  readonly text: string;
  readonly syllables: number;
  readonly targetMs: number;
  readonly atMs: number;
};

export type CuePlan = {
  readonly cues: readonly Cue[];
  /** How long the clock waits before starting, so the first word is not late. */
  readonly delayMs: number;
};

/**
 * The timeline is the clock. Each word's audio is launched when the clock reaches that word,
 * minus what the engine takes to start speaking. Nothing the voice does moves the clock; it
 * waits only if the first word could not be launched early enough to be on time.
 */
export const voiceCues = (
  clip: Clip,
  {
    fromMs,
    mouthLeadMs,
    latencyMs,
  }: { readonly fromMs: number; readonly mouthLeadMs: number; readonly latencyMs: number },
): CuePlan => {
  const pending = clip.wordSpans.flatMap((span, index) => {
    const word = clip.words[index];
    const heardAt = span.startMs + mouthLeadMs;
    return word === undefined || heardAt < fromMs
      ? []
      : [
          {
            text: word.text,
            syllables: word.syllables.length,
            targetMs: span.endMs - span.startMs,
            dueAt: heardAt - latencyMs,
          },
        ];
  });
  const delayMs = Math.max(0, fromMs - Math.min(...pending.map((cue) => cue.dueAt), fromMs));
  return {
    cues: pending.map(({ dueAt, ...cue }) => ({ ...cue, atMs: dueAt - fromMs + delayMs })),
    delayMs,
  };
};
