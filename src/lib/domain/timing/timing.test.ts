import { toPhonemes } from '@/lib/domain/g2p';
import { toVisemes } from '@/lib/domain/viseme';
import {
  INTER_WORD_MS,
  LEAD_IN_MS,
  TAIL_MS,
  durationMs,
  speechSpan,
  spokenMs,
  toTimeline,
  toWordSpans,
  type TimingOptions,
} from './index';

const timeline = (text: string, options?: TimingOptions) =>
  toTimeline(toVisemes(toPhonemes(text)), options);

const codes = (text: string, options?: TimingOptions) =>
  timeline(text, options).map((entry) => entry.viseme);

const wordSpans = (text: string, options?: TimingOptions) =>
  toWordSpans(toVisemes(toPhonemes(text)), options);

describe('shape of the timeline', () => {
  it('frames the word in rest', () => {
    expect(codes('pala')).toEqual(['REST', 'BILABIAL', 'A', 'DENTAL', 'A', 'REST']);
  });

  it('is contiguous — every entry starts where the last one ended', () => {
    timeline('pingüino').reduce((previousEnd, entry) => {
      expect(entry.startMs).toBe(previousEnd);
      expect(entry.endMs).toBeGreaterThan(entry.startMs);
      return entry.endMs;
    }, 0);
  });

  it('holds a repeated sound once instead of twice', () => {
    expect(codes('innato')).toEqual(['REST', 'I', 'DENTAL', 'A', 'DENTAL', 'O', 'REST']);
  });

  it('keeps two sounds of one viseme apart, so each shows its own pose', () => {
    expect(timeline('canto').map((entry) => entry.phoneme)).toEqual([
      undefined,
      'k',
      'a',
      'n',
      't',
      'o',
      undefined,
    ]);
  });

  it('returns nothing for empty input', () => {
    expect(timeline('')).toEqual([]);
    expect(durationMs([])).toBe(0);
  });
});

describe('word boundaries', () => {
  it('rests between words so the learner can group syllables', () => {
    expect(codes('gato negro')).toEqual([
      'REST',
      'VELAR',
      'A',
      'DENTAL',
      'O',
      'REST',
      'DENTAL',
      'E',
      'VELAR',
      'DENTAL',
      'O',
      'REST',
    ]);
  });

  it('never merges a viseme across a word boundary', () => {
    const entries = timeline('casa alta');
    expect(entries.filter((entry) => entry.viseme === 'REST')).toHaveLength(3);
  });

  it('can be switched off, leaving only the rest that frames the clip', () => {
    const entries = timeline('gato negro', { interWordMs: 0 });
    expect(entries.filter((entry) => entry.viseme === 'REST')).toHaveLength(2);
  });
});

describe('stress', () => {
  it('holds the stressed vowel longer than the same unstressed vowel', () => {
    const [, , stressed, , unstressed] = timeline('pala');
    const held = (entry: { startMs: number; endMs: number }) => entry.endMs - entry.startMs;
    expect(held(stressed!)).toBeGreaterThan(held(unstressed!));
  });
});

describe('speed', () => {
  it('halves the clip at x2', () => {
    expect(durationMs(timeline('pingüino', { speed: 2 }))).toBeCloseTo(
      durationMs(timeline('pingüino')) / 2,
      -0.5,
    );
  });

  it('doubles the clip at x0.5', () => {
    expect(durationMs(timeline('pingüino', { speed: 0.5 }))).toBeCloseTo(
      durationMs(timeline('pingüino')) * 2,
      -0.5,
    );
  });

  it('leaves the viseme sequence untouched', () => {
    expect(codes('pingüino', { speed: 2 })).toEqual(codes('pingüino'));
  });

  it('rejects a speed of zero or less', () => {
    expect(() => timeline('pala', { speed: 0 })).toThrow(RangeError);
  });
});

describe('word spans', () => {
  it('gives one span per word, in order, spanning the whole clip', () => {
    const spans = wordSpans('gato negro');
    expect(spans.map((span) => span.wordIndex)).toEqual([0, 1]);
    expect(spans[0]!.startMs).toBe(LEAD_IN_MS);
    expect(spans[1]!.startMs).toBeGreaterThan(spans[0]!.endMs);
    expect(spans[1]!.endMs).toBe(durationMs(timeline('gato negro')) - TAIL_MS);
  });

  it('scales with speed like the timeline it comes from', () => {
    const base = wordSpans('gato negro');
    const fast = wordSpans('gato negro', { speed: 2 });
    expect(fast[1]!.endMs).toBeCloseTo(base[1]!.endMs / 2, -0.5);
  });
});

describe('speech span', () => {
  it('excludes the rest frames the clip is wrapped in', () => {
    const entries = timeline('pala');
    expect(speechSpan(entries)).toEqual({
      startMs: LEAD_IN_MS,
      endMs: durationMs(entries) - TAIL_MS,
    });
  });

  it('keeps the inter-word pause inside the span', () => {
    const span = speechSpan(timeline('gato negro'));
    const spans = wordSpans('gato negro');
    expect(span.startMs).toBe(spans[0]!.startMs);
    expect(span.endMs).toBe(spans[1]!.endMs);
  });

  it('scales with speed', () => {
    const span = speechSpan(timeline('pala', { speed: 2 }));
    const base = speechSpan(timeline('pala'));
    expect(span.endMs - span.startMs).toBeCloseTo((base.endMs - base.startMs) / 2, -0.5);
  });

  it('is empty for empty input', () => {
    expect(speechSpan(timeline(''))).toEqual({ startMs: 0, endMs: 0 });
  });

  it('covers the whole clip when it is not framed by rest', () => {
    const entries = timeline('pala', { leadInMs: 0, tailMs: 0 });
    expect(speechSpan(entries)).toEqual({ startMs: 0, endMs: durationMs(entries) });
  });
});

describe('spoken time', () => {
  it('is the speech span for a single word', () => {
    const span = speechSpan(timeline('pala'));
    expect(spokenMs(wordSpans('pala'))).toBe(span.endMs - span.startMs);
  });

  it('drops the pause between words, which no voice reproduces', () => {
    const span = speechSpan(timeline('gato negro'));
    expect(spokenMs(wordSpans('gato negro'))).toBe(span.endMs - span.startMs - INTER_WORD_MS);
  });

  it('is zero for empty input', () => {
    expect(spokenMs(wordSpans(''))).toBe(0);
  });
});

describe('what timing recovers that visemes lose', () => {
  it('separates pero from perro by duration, though they share every viseme', () => {
    expect(codes('perro')).toEqual(codes('pero'));
    expect(durationMs(timeline('perro'))).toBeGreaterThan(durationMs(timeline('pero')));
  });
});
