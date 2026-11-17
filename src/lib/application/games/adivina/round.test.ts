import { BANK, sequenceOf, toBank } from '@/lib/domain/words';
import { visemeDistance } from '@/lib/domain/viseme';
import { MAX_LEVEL } from './level';
import { drawRound, type Round } from './round';

const sequential = (seed: { value: number }) => () => {
  seed.value = (seed.value + 0.37) % 1;
  return seed.value;
};

const distancesFrom = (target: string, options: readonly string[]): readonly number[] =>
  options
    .filter((word) => word !== target)
    .map((word) => visemeDistance(sequenceOf(target), sequenceOf(word)));

const pairwise = (options: readonly string[]): readonly number[] =>
  options.flatMap((a, index) =>
    options.slice(index + 1).map((b) => visemeDistance(sequenceOf(a), sequenceOf(b))),
  );

const roundsAt = (level: number, count: number): readonly Round[] => {
  const rng = sequential({ value: 0.13 });
  return Array.from({ length: count }, () => drawRound(BANK, { level, rng }));
};

describe('drawRound', () => {
  it('always includes the target among four unique options', () => {
    const round = drawRound(BANK, { level: 5, rng: sequential({ value: 0 }) });
    expect(round.options).toHaveLength(4);
    expect(new Set(round.options).size).toBe(4);
    expect(round.options).toContain(round.target);
  });

  it('gives every distractor a visible cue below the top level', () => {
    for (let level = 1; level < MAX_LEVEL; level += 1) {
      const round = drawRound(BANK, { level, rng: sequential({ value: level / MAX_LEVEL }) });
      expect(distancesFrom(round.target, round.options).every((d) => d >= 1)).toBe(true);
    }
  });

  it('allows pure homophenes at the top level', () => {
    const round = drawRound(toBank(['pala', 'bala', 'mala', 'tala', 'rala']), {
      level: MAX_LEVEL,
      rng: sequential({ value: 0.5 }),
    });
    expect(Math.min(...distancesFrom(round.target, round.options))).toBe(0);
  });

  it('keeps every option within one viseme of the target in length', () => {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      const round = drawRound(BANK, { level, rng: sequential({ value: level / MAX_LEVEL }) });
      const targetLength = sequenceOf(round.target).length;
      const lengths = round.options.map((word) => sequenceOf(word).length);
      expect(lengths.every((length) => Math.abs(length - targetLength) <= 1)).toBe(true);
    }
  });

  it('draws closer look-alikes as the level rises', () => {
    const meanSpread = (level: number): number => {
      const all = roundsAt(level, 25).flatMap((round) => pairwise(round.options));
      return all.reduce((sum, distance) => sum + distance, 0) / all.length;
    };
    expect(meanSpread(MAX_LEVEL)).toBeLessThan(meanSpread(13));
    expect(meanSpread(13)).toBeLessThan(meanSpread(1));
  });

  it('makes the four options confusable with each other, not just with the target', () => {
    const spread = roundsAt(MAX_LEVEL, 25).map((round) => {
      const distances = pairwise(round.options);
      return Math.max(...distances) - Math.min(...distances);
    });
    expect(Math.max(...spread)).toBeLessThanOrEqual(2);
  });

  it('leaves no option separable by length at any level', () => {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      const lengths = roundsAt(level, 3).map((round) =>
        round.options.map((word) => sequenceOf(word).length),
      );
      lengths.forEach((set) => expect(Math.max(...set) - Math.min(...set)).toBeLessThanOrEqual(2));
    }
  });

  it('avoids repeating the previous target', () => {
    const round = drawRound(BANK, {
      level: 5,
      rng: sequential({ value: 0.1 }),
      avoidTarget: 'pala',
    });
    expect(round.target).not.toBe('pala');
  });
});
