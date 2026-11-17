# G2P — Spanish grapheme-to-phoneme

> **Maintenance Invariant:** Rules and stage contract only. Update in the SAME commit as any change to `src/lib/domain/g2p/`. Terms are defined once, in [glossary.md](glossary.md).
> **Answers:** Why convert spelling to sound first? Which Spanish rules must the converter cover? What is dialect-configurable?

## Why it exists

- Mouth shapes follow sounds, not letters. Animating letters closes the mouth on a silent `h` and produces nonsense on `qu`.
- Spelling lies about pronunciation: `queso` is 5 letters but 4 phonemes /ˈke.so/; `hola` has a silent `h`; `carro` has one `rr` sound, not two; `cielo` and `casa` share a `c` with different phonemes.
- Spanish spelling is rule-complete: a letter plus its neighbours always determines the sound. No lexicon, no trained model.
- Contrast English: `though` `through` `tough` `cough` — one `ough`, four pronunciations. English needs a dictionary or a model. Spanish does not.
- Consequence: G2P is a few hundred lines of conditionals with no lexicon and no model. It never forces a download on its own — see [architecture.md](architecture.md).

## Stage contract

- Input: raw Spanish text.
- Output: IPA phoneme sequence, syllabified, with lexical stress marked.
- Downstream stages consume phonemes only. Never letters.
- Pure and deterministic. Dialect settings are explicit arguments, never globals.
- Entry point: `toPhonemes(text, dialect)` in `src/lib/domain/g2p/`, returning words → syllables → phonemes, each syllable flagged `stressed`. `toIpa(words)` renders them for debugging and tests.
- Dialect presets: `SESEO` (default) and `DISTINCION`, each also carrying `yeismo`.

## Modules

- `normalize.ts` — lowercase, split on non-letters, respell the fixed `x` words.
- `graphemes.ts` — tokenize into graphemes, digraphs first.
- `phonemes.ts` — one grapheme + its neighbours → zero or more phonemes.
- `syllables.ts` — group nuclei, resolve diphthong vs hiatus, split clusters by maximal legal onset, emit glides.
- `stress.ts` — written accent, else the vowel/`n`/`s` rule.

## Rule surface

Digraphs consumed as one grapheme: `ch` `ll` `rr` `qu` `gu`(+`e`/`i`).

- Vowels `a e i o u` → /a e i o u/. Five, stable, no reduction, no length.
- `h` → silent, except inside `ch`.
- `ch` → /tʃ/.
- `qu` + `e`/`i` → /k/; the `u` is silent.
- `gu` + `e`/`i` → /ɡ/; the `u` is silent. `gü` + `e`/`i` → /ɡw/.
- `c` + `e`/`i` → /θ/ by default, /s/ under seseo; elsewhere → /k/.
- `z` → /θ/ by default, /s/ under seseo. Interdental: tongue between the teeth, visible on the lips.
- `g` + `e`/`i` → /x/; elsewhere → /ɡ/.
- `j` → /x/.
- `ñ` → /ɲ/.
- `ll` → /ʝ/ under yeísmo (default); /ʎ/ under lleísmo.
- `y` → /ʝ/ before a vowel; → /i/ word-final (`rey`) and standalone.
- `rr` → trill /r/. `r` word-initial or after `n` `l` `s` → /r/; elsewhere tap /ɾ/.
- `b` and `v` → /b/. One phoneme, one viseme — spelling difference is invisible on the lips.
- `x` → /ks/ between vowels, /s/ word-initial; /x/ in fixed spellings (`México`, `Texas`, `Oaxaca`), handled by respelling those words before the rules run.
- `w` → loanwords only. OPEN: /w/ vs /b/ realisation. Low frequency, defer.

## Syllable and stress

- Syllabify first, then assign stress. Output syllable boundaries; the viseme timing stage needs them.
- Written accent wins outright (`día`, `canción`).
- Otherwise: word ends in vowel, `n`, or `s` → stress the penultimate syllable; else stress the final one.
- Unstressed `i`/`u` next to `a`/`e`/`o` forms a diphthong (one nucleus). An accented weak vowel breaks it into hiatus.
- The non-peak vowel of a diphthong is emitted as a glide: /j/ or /w/. `bien` → /ˈbjen/.
- Every monosyllable is marked stressed, function words included: `un beso` → /ˈun ˈbe.so/. OPEN: destress the closed class (`un` `el` `de` `que` …) once phrases matter.

## Dialect settings

- **Distinción is the default.** Vilabia targets Spain. `zapato` is /θa.ˈpa.to/, `casa` and `caza` are different words. Prohibit defaulting to seseo.
- Seseo stays supported as a setting for Latin American learners. Passing `SESEO` merges /θ/ into /s/.
- /s/ and /θ/ are different visemes — the tongue between the teeth is visible — so the setting changes what is on screen, not just the audio.
- Yeísmo vs lleísmo — default yeísmo, standard in most of Spain. Marginal viseme difference; low priority.
- Presets: `DISTINCION` (default) and `SESEO`, both exported from `src/lib/domain/g2p/`.

## Open questions

- Nasal assimilation: `n` before a bilabial closes the lips (`un beso`). Viseme-relevant. Model it, or leave to coarticulation?
- Intervocalic /b d ɡ/ → approximants [β ð ɣ]: the lips do not fully close in `la boca`. Viseme-relevant. Model it as an allophone rule, or ignore?
- Sinalefa is cross-word, so it cannot live in a per-word converter. Owned by a phrase-level pass after G2P.

## Non-goals

- /s/ aspiration, `d` elision, and other dialect-specific reductions.
- Prosody beyond lexical stress.
- Audio. G2P is the text→phoneme stage only; playback and spoken answers are separate stages — see [games.md](games.md).
