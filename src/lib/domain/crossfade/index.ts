import type { Phoneme } from '@/lib/domain/g2p';
import type { TimelineEntry } from '@/lib/domain/timing';
import type { Viseme } from '@/lib/domain/viseme';

export type Layer = {
  readonly viseme: Viseme;
  readonly phoneme?: Phoneme;
  readonly opacity: number;
};

const layer = (entry: TimelineEntry, opacity: number): Layer =>
  entry.phoneme === undefined
    ? { viseme: entry.viseme, opacity }
    : { viseme: entry.viseme, phoneme: entry.phoneme, opacity };

export type CrossfadeOptions = {
  readonly crossfadeMs?: number;
};

export const CROSSFADE_MS = 70;

const entryAt = (
  timeline: readonly TimelineEntry[],
  elapsedMs: number,
): { readonly entry: TimelineEntry; readonly index: number } | undefined => {
  const index = timeline.findIndex((candidate) => elapsedMs < candidate.endMs);
  const entry = index === -1 ? timeline[timeline.length - 1] : timeline[index];
  return entry === undefined
    ? undefined
    : { entry, index: index === -1 ? timeline.length - 1 : index };
};

const spanBetween = (
  entry: TimelineEntry,
  neighbour: TimelineEntry | undefined,
  crossfadeMs: number,
): number =>
  neighbour === undefined
    ? 0
    : Math.min(
        crossfadeMs,
        (entry.endMs - entry.startMs) / 2,
        (neighbour.endMs - neighbour.startMs) / 2,
      );

export const layersAt = (
  timeline: readonly TimelineEntry[],
  elapsedMs: number,
  { crossfadeMs = CROSSFADE_MS }: CrossfadeOptions = {},
): readonly Layer[] => {
  const found = entryAt(timeline, elapsedMs);
  if (found === undefined) return [];

  const { entry, index } = found;
  const previous = timeline[index - 1];
  const next = timeline[index + 1];
  const entering = spanBetween(entry, previous, crossfadeMs);
  const leaving = spanBetween(entry, next, crossfadeMs);

  if (previous !== undefined && entering > 0 && elapsedMs < entry.startMs + entering / 2) {
    const weight = 0.5 + (elapsedMs - entry.startMs) / entering;
    return [layer(previous, 1 - weight), layer(entry, weight)];
  }

  if (next !== undefined && leaving > 0 && elapsedMs > entry.endMs - leaving / 2) {
    const weight = (elapsedMs - (entry.endMs - leaving / 2)) / leaving;
    return [layer(entry, 1 - weight), layer(next, weight)];
  }

  return [layer(entry, 1)];
};
