# Visemes

> **Maintenance Invariant:** The inventory table is canonical — `src/lib/domain/viseme/inventory.ts` follows it, not the reverse. Update in the SAME commit as any code added, removed, or re-assigned.
> **Answers:** What are Vilabia's viseme codes, which phonemes map to each, what does the mapping deliberately lose?

## Design principle

Group by what is externally visible, not by how the sound is produced. Two phonemes with different places or manners of articulation share a code whenever the face shows the same thing.

## Inventory

Fourteen codes. Peninsular Spanish. Reviewed by a native speaker, and checked against clinical articulatory phonetics (Quilis) — the table was confirmed, no entries changed.

| Code           | Phonemes       | What the mouth does                     |
| :------------- | :------------- | :-------------------------------------- |
| `REST`         | silence, pause | Closed, neutral                         |
| `BILABIAL`     | p b m          | Lips meet and close                     |
| `LABIODENTAL`  | f              | Lower lip to upper teeth                |
| `INTERDENTAL`  | θ              | Tongue tip between the teeth            |
| `DENTAL`       | t d n l r ɾ    | Tongue behind the teeth, small aperture |
| `SIBILANT`     | s              | Teeth close together, narrow slit       |
| `POSTALVEOLAR` | tʃ             | Lips protruded and rounded, teeth close |
| `PALATAL`      | ʝ ʎ ɲ          | Tongue body up, lips neutral or spread  |
| `VELAR`        | k ɡ x          | Back of tongue; almost nothing visible  |
| `A`            | a              | Open, jaw down                          |
| `E`            | e              | Mid, spread                             |
| `I`            | i j            | Narrow, spread                          |
| `O`            | o              | Mid, rounded                            |
| `U`            | u w            | Closed, rounded                         |

## Reference data

- `src/lib/presentation/labels/index.ts` — beginner-facing labels that mirror this table, one entry per code: `VISEME_NAME_ES` (Spanish display name — `REST` → `Reposo`, etc.; the code stays the internal id) and `VISEME_MOUTH` (short "qué hace la boca" line, therapist-reviewed copy).
- `VISEME_DISPLAY_ORDER` (same file) is the legend's reading order — `REST`, then the five vowels, then consonants front to back — a permutation of `VISEMES`, not a reordering of it. `VISEMES` stays canonical.
- Consumed by `src/components/alphabet-chart.tsx` (hover text on each mouth) and the `/debug` tuner. Letters live in `ALPHABET`, not per viseme.

## Stage contract

- Input: `Word[]` from [g2p.md](g2p.md). Output: one segment per phoneme — `{ phoneme, viseme, stressed }`.
- `toVisemeCodes(words)` drops to bare codes for tests and comparisons.
- `visemeDistance(a, b)` in `src/lib/domain/viseme/distance.ts` — edit distance between two code sequences, 0 for homophenous words. Consumed by `src/lib/application/games/adivina/round.ts` to draw distractor sets; see [games.md](games.md).
- Pure lookup. No timing, no durations, no merging of repeats — that is the timing stage.
- `REST` exists in the inventory but is never emitted here. Silence is a timing decision.
- A code is not a drawing: each sound under it has its own shape (`SHAPES` in `src/lib/domain/mouth/`). The code groups sounds for games and scoring; the renderer draws sounds. See [avatar.md](avatar.md).
- `src/lib/domain/viseme/alphabet.ts` — `ALPHABET`: each letter (A–Z, Ñ, CH, LL, RR) with the sounds it can stand for, after the speech therapist's chart. Rendered on `/debug`.

## Why the contentious groupings hold

- `BILABIAL` (/p/ /b/ /m/) is the standard grouping in auditory rehabilitation. Voicing and nasal resonance are internal mechanics; the eye cannot see either. These are homophenes.
- `DENTAL` merges dental /t/ /d/ with alveolar /n/ /l/ /ɾ/ /r/. The articulation differs; the external view does not — minimal aperture, tongue active behind the upper incisors.
- `LABIODENTAL` (/f/) sits between /s/ and /m/ and is easy to get wrong in either direction. Two rows of teeth with a dark gap is /s/; evenly pressed lips showing nothing is /m/. Correct is the lower lip rolled in under a thin edge of upper teeth, jaw closed, no gap behind.
- `POSTALVEOLAR` (/tʃ/) stays separate from `PALATAL` because the affricate requires lip protrusion. The pure palatals /ʝ/ /ʎ/ /ɲ/ keep the corners relaxed or spread. This is anatomy, not convention.
- `INTERDENTAL` is mandatory for the peninsular standard and collapses into `SIBILANT` wherever seseo applies.

## The velar blank canvas

- /k/ /ɡ/ /x/ produce no lip activity of their own. The mouth takes the shape of the adjacent vowel.
- The absence of movement is the cue. Prohibit inventing a lip gesture for velars in any renderer — a fake movement destroys the only real signal a lipreader has here.
- Exception: the therapist's `/k/` photo is open and spread with both rows of teeth, and `SHAPES.k` follows it (06-10). Her photos outrank this rule.
- Strongest candidate for a context variant, since `VELAR` has no shape of its own. See Open below.

## Rounding is the vowel cue, not aperture

- `A` and `O` are both open. What separates them on the lips is rounding and protrusion, not how wide the mouth is.
- Drawing or shooting them as a large circle and a smaller circle makes them the same gesture. Vilabia's own schematic had this bug.
- Same trap for `U` and `O` against `VELAR`, and for `POSTALVEOLAR` (`ch`) which protrudes where `PALATAL` does not.

## What the mapping deliberately loses

- `p` `b` `m` collapse. This is the game's premise, not a defect: `pala` `bala` `mala` are identical on the lips.
- `r` and `ɾ` collapse: `pero` and `perro` are homophenous.
- `k` `ɡ` `x` are near-invisible; the surrounding vowels carry those words.
- Glides fold into their vowels — `j` reads as `i`, `w` as `u`. They differ in duration, which the timing stage owns.
- Under seseo, `θ` never appears, so `casa` and `caza` become identical. Under distinción — the default — they are `SIBILANT` vs `INTERDENTAL` and must be visibly different on screen.

## Open

- Coarticulation is not modelled here. A consonant's real shape is pulled toward its neighbouring vowels; at this fidelity the player's crossfade approximates it.
- No context variants: one shape per sound regardless of the vowel around it. `VELAR` is the first place this will hurt, because its real appearance is whatever vowel surrounds it. Revisit there first.
