import { ALPHABET } from './alphabet';

describe('ALPHABET', () => {
  it('lists the 27 letters of the Spanish alphabet in order, then the digraphs', () => {
    expect(ALPHABET.slice(0, 27).map((entry) => entry.letter)).toEqual([
      ...'ABCDEFGHIJKLMN',
      'Ñ',
      ...'OPQRSTUVWXYZ',
    ]);
    expect(ALPHABET.slice(27).map((entry) => entry.letter)).toEqual(['CH', 'LL', 'RR']);
  });

  it('keeps H silent and gives Ñ its own sound', () => {
    expect(ALPHABET.find((entry) => entry.letter === 'H')?.sounds).toEqual([]);
    expect(ALPHABET.find((entry) => entry.letter === 'Ñ')?.sounds).toEqual(['ɲ']);
  });
});
