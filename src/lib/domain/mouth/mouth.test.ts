import { PHONEMES, toPhonemes } from '@/lib/domain/g2p';
import { toTimeline } from '@/lib/domain/timing';
import { VISEMES, toVisemes } from '@/lib/domain/viseme';
import {
  REST_SHAPE,
  SHAPES,
  SHAPE_KEYS,
  SHAPE_RANGE,
  blend,
  easeWeight,
  exaggerate,
  shapeAt,
  soundAt,
  soundsOf,
} from './index';

const timeline = toTimeline(toVisemes(toPhonemes('pala')));

describe('the shape table', () => {
  it('has a shape for silence and for every phoneme', () => {
    expect(Object.keys(SHAPES).sort()).toEqual(['REST', ...PHONEMES].sort());
  });

  it('keeps every parameter inside its range', () => {
    Object.values(SHAPES).forEach((shape) =>
      SHAPE_KEYS.forEach((key) => {
        expect(shape[key]).toBeGreaterThanOrEqual(SHAPE_RANGE[key][0]);
        expect(shape[key]).toBeLessThanOrEqual(SHAPE_RANGE[key][1]);
      }),
    );
  });

  it('closes the lips for /p/ /m/, leaves /b/ a small hole, and opens widest for /a/', () => {
    ['p', 'm'].forEach((sound) => expect(SHAPES[sound as 'p'].open).toBe(0));
    expect(SHAPES.b.open).toBeGreaterThan(0);
    expect(SHAPES.b.open).toBeLessThan(0.15);
    PHONEMES.forEach((sound) => expect(SHAPES.a.open).toBeGreaterThanOrEqual(SHAPES[sound].open));
  });

  it('tells /p/ /b/ /m/ apart: /p/ puffs the cheeks, /b/ lets air through the fullest lips', () => {
    expect(SHAPES.b.airflow).toBeGreaterThan(0.5);
    expect(SHAPES.p.puff).toBeGreaterThan(0.5);
    expect(SHAPES.b.puff + SHAPES.m.puff).toBe(0);
    expect(SHAPES.b.upperLip).toBeGreaterThan(SHAPES.m.upperLip);
    expect(SHAPES.p.press).toBeGreaterThan(SHAPES.b.press);
  });

  it('keeps the rounded vowels narrow and the spread ones wide', () => {
    expect(SHAPES.u.width).toBeLessThan(SHAPES.o.width);
    expect(SHAPES.o.width).toBeLessThan(SHAPES.a.width);
    expect(SHAPES.a.width).toBeLessThan(SHAPES.e.width);
    expect(SHAPES.a.width).toBeLessThan(SHAPES.i.width);
  });

  it('tucks the lower lip only for /f/', () => {
    PHONEMES.filter((sound) => sound !== 'f').forEach((sound) =>
      expect(SHAPES[sound].lipTuck).toBe(0),
    );
    expect(SHAPES.f.upperTeeth).toBe(1);
  });

  it('shows the tongue between the teeth only for /t/ /d/ /θ/, furthest out for /θ/', () => {
    PHONEMES.filter((sound) => !['t', 'd', 'θ'].includes(sound)).forEach((sound) =>
      expect(SHAPES[sound].tongueOut).toBe(0),
    );
    expect(SHAPES.t.tongueOut).toBeLessThan(SHAPES.d.tongueOut);
    expect(SHAPES.d.tongueOut).toBeLessThan(SHAPES.θ.tongueOut);
  });

  it('raises the tongue for /l/ and /n/, with /n/ the wider and /rr/ the highest', () => {
    expect(SHAPES.l.tongueUp).toBeGreaterThanOrEqual(0.8);
    expect(SHAPES.l.tongueUp).toBeLessThan(SHAPES.n.tongueUp);
    expect(SHAPES.n.width).toBeGreaterThan(SHAPES.l.width);
    expect(SHAPES.r.tongueUp).toBe(1);
    expect(SHAPES.r.tongueUp).toBeGreaterThan(SHAPES.ɾ.tongueUp);
  });

  it('draws /s/ with thinner lips than /i/, and /i/ the widest smile', () => {
    expect(SHAPES.s.upperLip).toBeLessThan(0.4);
    expect(SHAPES.s.lowerLip).toBeLessThan(0.4);
    PHONEMES.filter((sound) => sound !== 'i' && sound !== 'j').forEach((sound) =>
      expect(SHAPES.i.width).toBeGreaterThan(SHAPES[sound].width),
    );
  });

  it('shows both rows of teeth for /s/ and none for the rounded vowels', () => {
    expect(SHAPES.s.upperTeeth).toBe(1);
    expect(SHAPES.s.lowerTeeth).toBe(1);
    expect(SHAPES.o.upperTeeth + SHAPES.u.upperTeeth).toBe(0);
  });
});

describe('sounds and visemes', () => {
  it('groups every sound under exactly one viseme', () => {
    const grouped = VISEMES.flatMap((viseme) => soundsOf(viseme));
    expect([...grouped].sort()).toEqual(['REST', ...PHONEMES].sort());
  });
});

describe('shapeAt', () => {
  const [rest, bilabial, vowel] = timeline;

  it('rests before the word starts', () => {
    expect(shapeAt(timeline, 0)).toEqual(REST_SHAPE);
  });

  it('holds each sound whole in the middle of its block', () => {
    expect(shapeAt(timeline, (bilabial!.startMs + bilabial!.endMs) / 2)).toEqual(SHAPES.p);
    expect(shapeAt(timeline, (vowel!.startMs + vowel!.endMs) / 2).open).toBeCloseTo(SHAPES.a.open);
  });

  it('is half way between two sounds on their boundary', () => {
    const half = blend(REST_SHAPE, SHAPES.p, 0.5);
    const at = shapeAt(timeline, rest!.endMs);
    SHAPE_KEYS.forEach((key) => expect(at[key]).toBeCloseTo(half[key]));
  });

  it('uses the table it is given', () => {
    const shapes = { ...SHAPES, p: { ...SHAPES.p, width: 0.9 } };
    expect(shapeAt(timeline, (bilabial!.startMs + bilabial!.endMs) / 2, { shapes }).width).toBe(
      0.9,
    );
  });

  it('names the sound being held', () => {
    expect(soundAt(timeline, (bilabial!.startMs + bilabial!.endMs) / 2)).toBe('p');
    expect(soundAt(timeline, 0)).toBe('REST');
  });
});

describe('continuity', () => {
  const words = ['pala', 'cazo', 'zumo', 'bota', 'llueve', 'perro', 'mano'];
  const largestStep = (text: string, speed: number): number => {
    const steps = toTimeline(toVisemes(toPhonemes(text)), { speed });
    const endMs = steps[steps.length - 1]!.endMs;
    const frames = Array.from({ length: Math.ceil(endMs) + 1 }, (_, ms) => shapeAt(steps, ms));
    return frames
      .slice(1)
      .flatMap((frame, i) => SHAPE_KEYS.map((key) => Math.abs(frame[key] - frames[i]![key])))
      .reduce((max, step) => Math.max(max, step), 0);
  };

  it.each(words)('never jumps within "%s", even at double speed', (text) => {
    expect(largestStep(text, 1)).toBeLessThan(0.1);
    expect(largestStep(text, 2)).toBeLessThan(0.1);
  });
});

describe('easeWeight', () => {
  it('starts where it was, ends on target, and moves in between', () => {
    expect(easeWeight(1, 0, 0)).toBe(1);
    expect(easeWeight(1, 0, 75, 150)).toBeCloseTo(0.5);
    expect(easeWeight(1, 0, 400, 150)).toBe(0);
    expect(easeWeight(0.3, 1, 0, 150)).toBe(0.3);
  });
});

describe('exaggerate', () => {
  it('pushes a shape away from rest and keeps it in range', () => {
    const more = exaggerate(SHAPES.a, 1.5);
    expect(more.open).toBe(1);
    expect(exaggerate(SHAPES.a, 1)).toEqual(SHAPES.a);
    expect(exaggerate(SHAPES.a, 0)).toEqual(REST_SHAPE);
  });
});
