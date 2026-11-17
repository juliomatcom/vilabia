import type { Phoneme } from '@/lib/domain/g2p';
import type { Viseme, VisemeSegment } from '@/lib/domain/viseme';
import { BASE_MS, INTER_WORD_MS, LEAD_IN_MS, STRESS_FACTOR, TAIL_MS } from './durations';

export { BASE_MS, STRESS_FACTOR, LEAD_IN_MS, TAIL_MS, INTER_WORD_MS } from './durations';

export type TimelineEntry = {
  readonly viseme: Viseme;
  readonly phoneme?: Phoneme;
  readonly startMs: number;
  readonly endMs: number;
};

export type TimingOptions = {
  readonly speed?: number;
  readonly leadInMs?: number;
  readonly tailMs?: number;
  readonly interWordMs?: number;
};

type Hold = {
  readonly viseme: Viseme;
  readonly phoneme?: Phoneme;
  readonly ms: number;
};

const holdFor = (segment: VisemeSegment): number =>
  BASE_MS[segment.phoneme] * (segment.stressed ? STRESS_FACTOR : 1);

const toHolds = (segments: readonly VisemeSegment[], interWordMs: number): readonly Hold[] =>
  segments.reduce<readonly Hold[]>((holds, segment, index) => {
    const ms = holdFor(segment);
    const boundary = segment.startsWord && index > 0 && interWordMs > 0;
    const open = boundary ? undefined : holds[holds.length - 1];
    const pause: readonly Hold[] = boundary ? [{ viseme: 'REST', ms: interWordMs }] : [];
    return open !== undefined && open.phoneme === segment.phoneme
      ? [...holds.slice(0, -1), { ...open, ms: open.ms + ms }]
      : [...holds, ...pause, { viseme: segment.viseme, phoneme: segment.phoneme, ms }];
  }, []);

const framed = (holds: readonly Hold[], leadInMs: number, tailMs: number): readonly Hold[] =>
  holds.length === 0
    ? []
    : [{ viseme: 'REST', ms: leadInMs }, ...holds, { viseme: 'REST', ms: tailMs }];

export const toTimeline = (
  segments: readonly VisemeSegment[],
  {
    speed = 1,
    leadInMs = LEAD_IN_MS,
    tailMs = TAIL_MS,
    interWordMs = INTER_WORD_MS,
  }: TimingOptions = {},
): readonly TimelineEntry[] => {
  if (speed <= 0) throw new RangeError('speed must be greater than 0');
  return framed(toHolds(segments, interWordMs), leadInMs, tailMs).reduce<{
    readonly entries: readonly TimelineEntry[];
    readonly elapsedMs: number;
  }>(
    ({ entries, elapsedMs }, hold) => {
      const endMs = elapsedMs + hold.ms;
      return {
        entries: [
          ...entries,
          {
            viseme: hold.viseme,
            ...(hold.phoneme === undefined ? {} : { phoneme: hold.phoneme }),
            startMs: Math.round(elapsedMs / speed),
            endMs: Math.round(endMs / speed),
          },
        ],
        elapsedMs: endMs,
      };
    },
    { entries: [], elapsedMs: 0 },
  ).entries;
};

export const durationMs = (timeline: readonly TimelineEntry[]): number =>
  timeline[timeline.length - 1]?.endMs ?? 0;

export type Span = {
  readonly startMs: number;
  readonly endMs: number;
};

export const speechSpan = (timeline: readonly TimelineEntry[]): Span => {
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  if (first === undefined || last === undefined) return { startMs: 0, endMs: 0 };
  const startMs = first.viseme === 'REST' ? first.endMs : first.startMs;
  const endMs = last.viseme === 'REST' ? last.startMs : last.endMs;
  return { startMs, endMs: Math.max(startMs, endMs) };
};

export type WordSpan = {
  readonly wordIndex: number;
  readonly startMs: number;
  readonly endMs: number;
};

type WordAccumulator = {
  readonly spans: readonly WordSpan[];
  readonly elapsedMs: number;
};

export const spokenMs = (spans: readonly WordSpan[]): number =>
  spans.reduce((total, span) => total + (span.endMs - span.startMs), 0);

export const toWordSpans = (
  segments: readonly VisemeSegment[],
  { speed = 1, leadInMs = LEAD_IN_MS, interWordMs = INTER_WORD_MS }: TimingOptions = {},
): readonly WordSpan[] => {
  if (speed <= 0) throw new RangeError('speed must be greater than 0');
  const { spans } = segments.reduce<WordAccumulator>(
    ({ spans, elapsedMs }, segment, index) => {
      const boundary = segment.startsWord && index > 0 && interWordMs > 0;
      const startedAt = elapsedMs + (boundary ? interWordMs : 0);
      const endedAt = startedAt + holdFor(segment);
      return segment.startsWord
        ? {
            spans: [...spans, { wordIndex: spans.length, startMs: startedAt, endMs: endedAt }],
            elapsedMs: endedAt,
          }
        : {
            spans: [...spans.slice(0, -1), { ...spans[spans.length - 1], endMs: endedAt }],
            elapsedMs: endedAt,
          };
    },
    { spans: [], elapsedMs: leadInMs },
  );
  return spans.map((span) => ({
    ...span,
    startMs: Math.round(span.startMs / speed),
    endMs: Math.round(span.endMs / speed),
  }));
};
