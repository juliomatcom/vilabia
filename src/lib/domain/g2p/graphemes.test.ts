import { toGraphemes } from './graphemes';

describe('toGraphemes', () => {
  it.each([
    ['queso', ['qu', 'e', 's', 'o']],
    ['chico', ['ch', 'i', 'c', 'o']],
    ['llave', ['ll', 'a', 'v', 'e']],
    ['carro', ['c', 'a', 'rr', 'o']],
    ['guerra', ['gu', 'e', 'rr', 'a']],
    ['pingüino', ['p', 'i', 'n', 'gü', 'i', 'n', 'o']],
    ['guante', ['g', 'u', 'a', 'n', 't', 'e']],
    ['quórum', ['q', 'u', 'ó', 'r', 'u', 'm']],
  ])('%s', (word, expected) => {
    expect(toGraphemes(word)).toEqual(expected);
  });
});
