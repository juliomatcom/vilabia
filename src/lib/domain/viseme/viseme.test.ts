import { PHONEMES, SESEO, toPhonemes } from '@/lib/domain/g2p';
import { VISEMES, toVisemeCodes, visemeOf } from './index';

const codes = (text: string): readonly string[] => toVisemeCodes(toPhonemes(text));

describe('inventory', () => {
  it('maps every phoneme to a viseme in the inventory', () => {
    PHONEMES.forEach((phoneme) => expect(VISEMES).toContain(visemeOf(phoneme)));
  });

  it('folds each glide into the vowel it looks like', () => {
    expect(visemeOf('j')).toBe(visemeOf('i'));
    expect(visemeOf('w')).toBe(visemeOf('u'));
  });
});

describe('the MVP round', () => {
  it('makes pala, bala and mala identical on the lips', () => {
    expect(codes('bala')).toEqual(codes('pala'));
    expect(codes('mala')).toEqual(codes('pala'));
  });

  it('separates tala from them at the first viseme only', () => {
    expect(codes('tala')).not.toEqual(codes('pala'));
    expect(codes('tala').slice(1)).toEqual(codes('pala').slice(1));
    expect(codes('pala')).toEqual(['BILABIAL', 'A', 'DENTAL', 'A']);
    expect(codes('tala')).toEqual(['DENTAL', 'A', 'DENTAL', 'A']);
  });
});

describe('what the face must distinguish', () => {
  it('separates casa from caza — the tongue is visible on θ', () => {
    expect(codes('casa')).toEqual(['VELAR', 'A', 'SIBILANT', 'A']);
    expect(codes('caza')).toEqual(['VELAR', 'A', 'INTERDENTAL', 'A']);
  });

  it('merges them under seseo, where the words are homophones anyway', () => {
    const seseo = (text: string) => toVisemeCodes(toPhonemes(text, SESEO));
    expect(seseo('caza')).toEqual(seseo('casa'));
  });

  it('separates ch from ll and y', () => {
    expect(visemeOf('tʃ')).not.toBe(visemeOf('ʝ'));
    expect(codes('chico')[0]).toBe('POSTALVEOLAR');
    expect(codes('llave')[0]).toBe('PALATAL');
  });
});

describe('what the face cannot distinguish', () => {
  it('makes pero and perro identical — tap and trill share a viseme', () => {
    expect(codes('perro')).toEqual(codes('pero'));
  });

  it('hides the velars behind the vowels', () => {
    expect(codes('casa')[0]).toBe(codes('gasa')[0]);
  });
});
