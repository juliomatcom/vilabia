import { toPhonemes } from '@/lib/domain/g2p';
import { visemeDistance } from './distance';
import { toVisemeCodes, type Viseme } from './index';

const codes = (text: string): readonly Viseme[] => toVisemeCodes(toPhonemes(text));

describe('visemeDistance', () => {
  it('is zero between homophenous words', () => {
    expect(visemeDistance(codes('pala'), codes('bala'))).toBe(0);
  });

  it('counts a single substitution for one differing viseme', () => {
    expect(visemeDistance(codes('pala'), codes('tala'))).toBe(1);
  });

  it('handles sequences of different lengths', () => {
    expect(visemeDistance(['A', 'A'] as const, ['A'] as const)).toBe(1);
  });
});
