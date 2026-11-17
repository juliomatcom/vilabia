import { articulate } from '@/lib/application/articulation';
import { FIND_SENTENCES, ORDER_SENTENCES, SYLLABLE_GROUPS } from '@/lib/domain/phrases';

const EVERY_SENTENCE = [
  ...SYLLABLE_GROUPS.flatMap((group) => group.sentences),
  ...FIND_SENTENCES.flatMap((entry) => entry.cards),
  ...ORDER_SENTENCES,
];

describe('every authored sentence', () => {
  it.each(EVERY_SENTENCE)('articulates %s', (sentence) => {
    const clip = articulate(sentence);
    expect(clip.words.length).toBeGreaterThan(1);
    expect(clip.totalMs).toBeGreaterThan(0);
    expect(clip.timeline.length).toBeGreaterThan(0);
  });
});
