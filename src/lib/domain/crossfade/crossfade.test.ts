import { toPhonemes } from '@/lib/domain/g2p';
import { toTimeline } from '@/lib/domain/timing';
import { toVisemes } from '@/lib/domain/viseme';
import { CROSSFADE_MS, layersAt } from './index';

const timeline = toTimeline(toVisemes(toPhonemes('pala')));
const [rest, bilabial] = timeline;

describe('layersAt', () => {
  it('shows one frame in the middle of a hold', () => {
    expect(layersAt(timeline, rest!.endMs - CROSSFADE_MS - 10)).toEqual([
      { viseme: 'REST', opacity: 1 },
    ]);
  });

  it('blends the two frames across a boundary', () => {
    const layers = layersAt(timeline, bilabial!.startMs + 5);
    expect(layers.map((layer) => layer.viseme)).toEqual(['REST', 'BILABIAL']);
    expect(layers.reduce((total, layer) => total + layer.opacity, 0)).toBeCloseTo(1);
  });

  it('straddles the boundary: half the movement happens before it', () => {
    const before = layersAt(timeline, bilabial!.startMs - 5);
    expect(before.map((layer) => layer.viseme)).toEqual(['REST', 'BILABIAL']);
    expect(before[1]!.opacity).toBeLessThan(0.5);
  });

  it('is half way through the movement exactly on the boundary', () => {
    const [outgoing, incoming] = layersAt(timeline, bilabial!.startMs);
    expect(outgoing!.opacity).toBeCloseTo(0.5);
    expect(incoming!.opacity).toBeCloseTo(0.5);
  });

  it('paints the outgoing frame first, so the incoming one fades in over it', () => {
    const [outgoing, incoming] = layersAt(timeline, bilabial!.startMs - 5);
    expect(outgoing!.opacity).toBeGreaterThan(incoming!.opacity);
  });

  it('shows the shape whole in the middle of its own block', () => {
    const middle = (bilabial!.startMs + bilabial!.endMs) / 2;
    expect(layersAt(timeline, middle)).toEqual([{ viseme: 'BILABIAL', phoneme: 'p', opacity: 1 }]);
  });

  it('never blends into the very first frame', () => {
    expect(layersAt(timeline, 0)).toEqual([{ viseme: 'REST', opacity: 1 }]);
  });

  it('holds the last frame after the clip ends', () => {
    expect(layersAt(timeline, 10_000)).toEqual([{ viseme: 'REST', opacity: 1 }]);
  });

  it('caps the blend at half a frame, so even a brief shape is fully shown', () => {
    const brief = [
      { viseme: 'A' as const, startMs: 0, endMs: 100 },
      { viseme: 'DENTAL' as const, startMs: 100, endMs: 120 },
    ];
    expect(layersAt(brief, 119, { crossfadeMs: 200 })).toEqual([{ viseme: 'DENTAL', opacity: 1 }]);
  });

  it('returns nothing for an empty timeline', () => {
    expect(layersAt([], 0)).toEqual([]);
  });
});
