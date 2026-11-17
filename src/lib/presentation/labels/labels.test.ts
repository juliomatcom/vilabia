import { VISEMES } from '@/lib/domain/viseme';
import { VISEME_DISPLAY_ORDER, VISEME_NAME_ES, VISEME_MOUTH } from './index';

describe('viseme reference', () => {
  it('describes every code in the inventory', () => {
    VISEMES.forEach((viseme) => {
      expect(VISEME_MOUTH[viseme].length).toBeGreaterThan(0);
      expect(VISEME_NAME_ES[viseme].length).toBeGreaterThan(0);
    });
  });

  it('names REST in Spanish', () => {
    expect(VISEME_NAME_ES.REST).toBe('Reposo');
  });

  it('orders the visemes as reposo, then the five vowels, then consonants', () => {
    expect([...VISEME_DISPLAY_ORDER].sort()).toEqual([...VISEMES].sort());
    expect(VISEME_DISPLAY_ORDER.slice(0, 6)).toEqual(['REST', 'A', 'E', 'I', 'O', 'U']);
  });
});
