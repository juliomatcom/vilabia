# Timing

> **Maintenance Invariant:** Duration constants and the timeline contract. Update in the SAME commit as any change to `src/lib/domain/timing/`.
> **Answers:** How do viseme codes become a timed clip, what are the durations, what does speed change?

## Stage contract

- Input: `VisemeSegment[]` from [visemes.md](visemes.md). Output: `{ viseme, phoneme?, startMs, endMs }[]` — `phoneme` is absent only on `REST`.
- Contiguous by construction: every entry starts where the previous ended. No gaps, no overlaps.
- `durationMs(timeline)` gives the clip length. Empty input yields an empty timeline, not a lone rest.
- `speechSpan(timeline)` gives the part that is actually spoken — the clip minus the rest frames at either end. It is what the voice has to fill; see [voice.md](voice.md).
- This is the library's final output and the player's only input. The player draws each entry's sound, not its viseme.

## Rules

- Each phoneme carries a base duration in milliseconds — `BASE_MS` in `src/lib/domain/timing/durations.ts`.
- Rough classes: vowels ~130, fricatives ~120, affricate 130, stops ~85, nasals ~95, laterals 80, glides 70, trill 125, tap 40.
- A segment in a stressed syllable is multiplied by `STRESS_FACTOR` (1.30).
- Adjacent identical sounds merge into one longer hold. `innato` shows one /n/, not two; `canto` keeps /n/ and /t/ apart although both are `DENTAL`, so each shows its own shape.
- The clip is framed by `REST`: 150 ms lead-in, 250 ms tail. Both are options.
- Words are separated by 120 ms of `REST`, which also prevents a viseme merging across a word boundary. Set `interWordMs: 0` to run them together.
- `speed` divides every boundary — x2 halves the clip, x0.5 doubles it. It never changes the viseme sequence. Zero or less throws.

## What the numbers produce

| Word       | Phonemes         | Syllables |  Speech | With rest | Syll/s |
| :--------- | :--------------- | --------: | ------: | --------: | -----: |
| pala       | /ˈpa.la/         |         2 |  490 ms |    890 ms |    4.1 |
| caza       | /ˈka.θa/         |         2 |  536 ms |    936 ms |    3.7 |
| pingüino   | /pin.ˈɡwi.no/    |         3 |  859 ms |   1259 ms |    3.5 |
| gato negro | /ˈɡa.to ˈne.ɡɾo/ |         4 | 1149 ms |   1549 ms |    3.5 |

## Distribution, not just duration

- The clip spends its time more evenly than speech does: unstressed syllables are not reduced as far, and nothing is lengthened phrase-finally. Inside one long word the voice can therefore run ahead even when the durations agree, and no API exposes phoneme timing to correct it.
- OPEN, and a speech-therapist question rather than a tuning knob: whether the clip should model phrase-final lengthening and a stronger unstressed reduction at all. It is a change to what the learner is taught to read, not a sync fix.

## Notes

- Durations sit between demonstrative and conversational speech: about 3.5–4.1 syllables per second at x1, against 6.5–8.0 conversational. `pala` runs 490 ms of speech. A review put demonstration at 3.0–3.5; that read as sluggish in the render, so the values are 15% faster than it proposed.
- They are longer than real speech on purpose. Interpolated 2D needs enough frames to show a closure before moving on, and a learner needs time to fix on each posture.
- Tap vs trill survives here even though [visemes.md](visemes.md) merges them: `pero` and `perro` share every viseme and differ in length. Duration is the only cue a lipreader gets for that pair.
- The inter-word pause contradicts sinalefa, which merges vowels across a word boundary in natural speech. Lexical boundaries win here: a learner must be able to tell where one word ends. Revisit only if a phrase-level game needs natural linking.
- `lib/domain/viseme` marks the first segment of each word with `startsWord`, which is what makes the pause possible.
