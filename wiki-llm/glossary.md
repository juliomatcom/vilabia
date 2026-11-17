# Glossary

> **Maintenance Invariant:** One term per row. Definitions only — no rules, no design. Rules live in the page that owns them.
> **Answers:** What does this domain term mean?

| Term           | Meaning                                                                                                                                                       |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Grapheme       | A written letter or letter cluster. `qu`, `ch`, `rr` are each one grapheme.                                                                                   |
| Phoneme        | A distinct speech sound.                                                                                                                                      |
| Digraph        | Two letters, one phoneme. Spanish: `ch` `ll` `rr` `qu` `gu`.                                                                                                  |
| Allophone      | Positional variant of one phoneme. Intervocalic `b` is [β], not [b].                                                                                          |
| G2P            | Grapheme-to-phoneme. Spelling → sound sequence. Pipeline stage 1. See [g2p.md](g2p.md).                                                                       |
| IPA            | International Phonetic Alphabet. One symbol per sound. The notation G2P outputs.                                                                              |
| Viseme         | Visual counterpart of a phoneme — the mouth shape. Many phonemes map to one viseme.                                                                           |
| Homophenous    | Words or sounds that look identical on the lips though they sound different. `pan` / `ban`. Spanish clinical term: homofenemas.                               |
| Coarticulation | The mouth forming the next sound before finishing the current one. Lips already round during the `p` of `puro`.                                               |
| Sinalefa       | Two vowels across a word boundary merging into one gesture. `la abeja` = one vowel movement, not two.                                                         |
| Diphthong      | Two vowels in one syllable nucleus. `bien`.                                                                                                                   |
| Hiatus         | Adjacent vowels split across syllables. `dí.a`.                                                                                                               |
| Seseo          | Dialect: `z` and soft `c` → /s/. Most of Latin America, parts of Andalusia.                                                                                   |
| Distinción     | Dialect: `z` and soft `c` → /θ/ (the `th` sound). Most of Spain.                                                                                              |
| Yeísmo         | Dialect: `ll` merged with `y` → /ʝ/. Majority of speakers.                                                                                                    |
| Tap / trill    | `r` in `pero` is a tap /ɾ/; `rr` in `carro` is a trill /r/. Different phonemes, one letter shape.                                                             |
| WASM           | WebAssembly. Compiled code (C++, Rust) running in the browser at near-native speed. Not used: MVP audio goes online via Web Speech. See [games.md](games.md). |
| TTS            | Text-to-speech. Source of the spoken word, via Web Speech `speechSynthesis`. See [games.md](games.md).                                                        |
| ASR            | Automatic speech recognition. Transcribes the spoken answer at `HABLAR PALABRA` and auto-selects the card.                                                    |
| Minimal pair   | Two words differing in one phoneme. `pala` / `bala`. Viseme-identical ones are the game's hardest distractors.                                                |
