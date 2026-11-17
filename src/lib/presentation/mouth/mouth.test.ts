import { PHONEMES } from '@/lib/domain/g2p';
import { SHAPES, SHAPE_KEYS } from '@/lib/domain/mouth';
import { toCsv, toGeometry } from './index';

describe('toCsv', () => {
  it('writes one row per sound with a header', () => {
    const rows = toCsv(SHAPES).split('\n');
    expect(rows[0]).toBe(['sound', ...SHAPE_KEYS].join(','));
    expect(rows).toHaveLength(PHONEMES.length + 2);
    expect(rows[1]?.startsWith('REST,')).toBe(true);
  });
});

describe('toGeometry', () => {
  it('draws a seam for closed lips and none once they part', () => {
    expect(toGeometry(SHAPES.m).seam).toBeDefined();
    expect(toGeometry(SHAPES.a).seam).toBeUndefined();
  });

  it('draws teeth, tongue and cheeks only where the shape asks for them', () => {
    expect(toGeometry(SHAPES.s).upperTeeth).toBeDefined();
    expect(toGeometry(SHAPES.s).lowerTeeth).toBeDefined();
    expect(toGeometry(SHAPES.o).upperTeeth).toBeUndefined();
    expect(toGeometry(SHAPES.θ).tongueOut).toBeDefined();
    expect(toGeometry(SHAPES.l).tongueUp).toBeDefined();
    expect(toGeometry(SHAPES.k).tongueBack).toBeDefined();
    expect(toGeometry(SHAPES.p).cheeks).toBeDefined();
    expect(toGeometry(SHAPES.m).cheeks).toBeUndefined();
  });

  it('marks the chart annotations only where the chart has them', () => {
    expect(toGeometry(SHAPES.p).creases).toBeDefined();
    expect(toGeometry(SHAPES.a).creases).toBeUndefined();
    ['m', 'n', 'ɲ'].forEach((sound) =>
      expect(toGeometry(SHAPES[sound as 'm']).nasal).toBeDefined(),
    );
    expect(toGeometry(SHAPES.t).nasal).toBeUndefined();
    ['f', 's', 'r', 'b', 'tʃ', 'θ'].forEach((sound) =>
      expect(toGeometry(SHAPES[sound as 'f']).airflow).toBeDefined(),
    );
    expect(toGeometry(SHAPES.r).trill).toBeGreaterThan(0);
    expect(toGeometry(SHAPES.ɾ).trill).toBe(0);
  });

  it('puts the tongue past the lips only for /θ/', () => {
    expect(toGeometry(SHAPES.θ).tongueTip).toBeDefined();
    expect(toGeometry(SHAPES.d).tongueTip).toBeUndefined();
    expect(toGeometry(SHAPES.t).tongueOut).toBeDefined();
  });

  it('slides the tongue out past the lips from nothing, not in one frame', () => {
    const tipWidth = (tongueOut: number) =>
      100 -
      Number(toGeometry({ ...SHAPES.θ, tongueOut }).tongueTip?.match(/^M ([\d.]+)/)?.[1] ?? 100);
    expect(toGeometry({ ...SHAPES.θ, tongueOut: 0.6 }).tongueTip).toBeUndefined();
    expect(tipWidth(0.601)).toBeLessThan(1.5);
    expect(tipWidth(0.7)).toBeLessThan(tipWidth(0.85));
  });

  it('bends the cheek arcs toward the mouth', () => {
    const [left] = toGeometry(SHAPES.p).cheeks!.d.split(' M');
    const [, startX, controlX] = left!.match(/M ([\d.]+) [\d.]+ Q ([\d.]+)/) ?? [];
    expect(Number(startX)).toBeLessThan(100);
    expect(Number(controlX)).toBeGreaterThan(Number(startX));
  });

  it('parts nearly closed lips at the centre first', () => {
    const innerLeft = (open: number) =>
      Number(toGeometry({ ...SHAPES.b, open }).inner.match(/^M ([\d.]+)/)?.[1]);
    expect(toGeometry(SHAPES.b).seam).toBeDefined();
    expect(innerLeft(SHAPES.b.open)).toBeGreaterThan(innerLeft(0.3) + 5);
  });

  it('grows the tongue smoothly instead of popping it in', () => {
    const small = toGeometry({ ...SHAPES.θ, tongueOut: 0.2 }).tongueOut!;
    const large = toGeometry(SHAPES.θ).tongueOut!;
    expect(small.ry).toBeLessThan(large.ry);
    expect(small.rx).toBeLessThan(large.rx);
  });
});
