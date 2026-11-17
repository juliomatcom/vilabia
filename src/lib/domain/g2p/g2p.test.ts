import { DISTINCION, SESEO, toIpa, toPhonemes } from './index';

const ipa = (text: string, dialect = DISTINCION): string => toIpa(toPhonemes(text, dialect));

describe('toPhonemes — acceptance words (distinción, the default)', () => {
  it.each([
    ['queso', 'ˈke.so'],
    ['hola', 'ˈo.la'],
    ['carro', 'ˈka.ro'],
    ['pero', 'ˈpe.ɾo'],
    ['cielo', 'ˈθje.lo'],
    ['casa', 'ˈka.sa'],
    ['zapato', 'θa.ˈpa.to'],
    ['guerra', 'ˈɡe.ra'],
    ['pingüino', 'pin.ˈɡwi.no'],
    ['día', 'ˈdi.a'],
    ['rey', 'ˈrej'],
    ['México', 'ˈme.xi.ko'],
    ['chico', 'ˈtʃi.ko'],
    ['llave', 'ˈʝa.be'],
  ])('%s → %s', (word, expected) => {
    expect(ipa(word)).toBe(expected);
  });
});

describe('dialect', () => {
  it('moves only the c/z words under seseo', () => {
    expect(ipa('cielo', SESEO)).toBe('ˈsje.lo');
    expect(ipa('zapato', SESEO)).toBe('sa.ˈpa.to');
  });

  it('leaves every other acceptance word untouched', () => {
    const unaffected = ['queso', 'hola', 'carro', 'pero', 'casa', 'guerra', 'día', 'rey', 'chico'];
    unaffected.forEach((word) => expect(ipa(word, SESEO)).toBe(ipa(word, DISTINCION)));
  });

  it('keeps casa and caza apart under distinción, merges them under seseo', () => {
    expect(ipa('casa', DISTINCION)).toBe('ˈka.sa');
    expect(ipa('caza', DISTINCION)).toBe('ˈka.θa');
    expect(ipa('casa', SESEO)).toBe(ipa('caza', SESEO));
  });

  it('splits ll from y under lleísmo', () => {
    expect(ipa('llave', { ...DISTINCION, yeismo: false })).toBe('ˈʎa.be');
  });
});

describe('spelling that lies', () => {
  it('drops silent h', () => {
    expect(ipa('hielo')).toBe('ˈje.lo');
  });

  it('drops the u of qu and gu', () => {
    expect(ipa('quién')).toBe('ˈkjen');
    expect(ipa('guitarra')).toBe('ɡi.ˈta.ra');
  });

  it('keeps the u of gü and gu before a back vowel', () => {
    expect(ipa('guante')).toBe('ˈɡwan.te');
    expect(ipa('vergüenza')).toBe('beɾ.ˈɡwen.θa');
  });

  it('merges b and v', () => {
    expect(ipa('vaca')).toBe(ipa('baca'));
  });

  it('splits c by the following vowel', () => {
    expect(ipa('cena')).toBe('ˈθe.na');
    expect(ipa('cana')).toBe('ˈka.na');
  });
});

describe('rhotics', () => {
  it('contrasts tap and trill', () => {
    expect(ipa('pero')).not.toBe(ipa('perro'));
    expect(ipa('perro')).toBe('ˈpe.ro');
  });

  it('trills word-initially and after n, l, s', () => {
    expect(ipa('rosa')).toBe('ˈro.sa');
    expect(ipa('honra')).toBe('ˈon.ra');
    expect(ipa('alrededor')).toBe('al.re.de.ˈdoɾ');
  });
});

describe('syllables and stress', () => {
  it('stresses the written accent wherever it falls', () => {
    expect(ipa('canción')).toBe('kan.ˈθjon');
    expect(ipa('árbol')).toBe('ˈaɾ.bol');
  });

  it('stresses the penultimate when the word ends in a vowel, n or s', () => {
    expect(ipa('casas')).toBe('ˈka.sas');
    expect(ipa('cantan')).toBe('ˈkan.tan');
  });

  it('stresses the last syllable otherwise', () => {
    expect(ipa('reloj')).toBe('re.ˈlox');
    expect(ipa('abrir')).toBe('a.ˈbɾiɾ');
  });

  it('keeps obstruent + liquid clusters in the onset', () => {
    expect(ipa('padre')).toBe('ˈpa.dɾe');
    expect(ipa('hablar')).toBe('a.ˈblaɾ');
  });

  it('splits other clusters across syllables', () => {
    expect(ipa('canto')).toBe('ˈkan.to');
  });

  it('makes a glide of the unstressed high vowel', () => {
    expect(ipa('bien')).toBe('ˈbjen');
    expect(ipa('cuando')).toBe('ˈkwan.do');
  });

  it('breaks the diphthong when the high vowel carries the accent', () => {
    expect(ipa('día')).toBe('ˈdi.a');
    expect(ipa('búho')).toBe('ˈbu.o');
  });

  it('keeps two strong vowels apart', () => {
    expect(ipa('caer')).toBe('ka.ˈeɾ');
  });
});

describe('the MVP round', () => {
  it('separates pala, bala, mala and tala by exactly one phoneme', () => {
    expect(ipa('pala')).toBe('ˈpa.la');
    expect(ipa('bala')).toBe('ˈba.la');
    expect(ipa('mala')).toBe('ˈma.la');
    expect(ipa('tala')).toBe('ˈta.la');
  });
});

describe('text handling', () => {
  it('returns one word per token', () => {
    expect(ipa('gato negro')).toBe('ˈɡa.to ˈne.ɡɾo');
  });

  it('marks every monosyllable stressed, function words included', () => {
    expect(ipa('un beso')).toBe('ˈun ˈbe.so');
  });

  it('ignores punctuation and casing', () => {
    expect(ipa('¡Hola, mundo!')).toBe('ˈo.la ˈmun.do');
  });

  it('returns nothing for empty input', () => {
    expect(toPhonemes('')).toEqual([]);
    expect(ipa('')).toBe('');
  });
});
