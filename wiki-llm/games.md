# Games

> **Maintenance Invariant:** One section per game. Shared contract first, then the games. No pipeline internals — those live in [architecture.md](architecture.md). Update in the SAME commit as any new game or any change to a round loop.
> **Answers:** What games exist, which is the MVP, what does a game get from the pipeline and what does it own?
> **Design reference:** `.local/vilabia-design.jpeg` (untracked, `.local` is gitignored). Screen anatomy, shell and theme live in [ui.md](ui.md); this page holds rules only.

## Catalogue

| Game                 | Slug                 | Status            | Shape                                                                |
| :------------------- | :------------------- | :---------------- | :------------------------------------------------------------------- |
| ¡Adivina la palabra! | `adivina-la-palabra` | MVP, built        | Forced choice: avatar articulates a word, learner picks one of four. |
| Frases por sílaba    | `frases-por-silaba`  | Built             | Forced choice inside one sound group: pick the sentence said.        |
| ¿Qué frase dijo?     | `que-frase-dijo`     | Built             | Forced choice: pick the sentence said among four near-identical.     |
| Ordena la frase      | `ordena-la-frase`    | Built             | Arrange the shuffled words of the sentence said, in order.           |
| Construye la frase   | `construye-la-frase` | Built             | As Ordena, with look-alike extra words in the pile to leave out.     |
| —                    | —                    | Not yet specified | More games planned. Add a row before adding a section.               |

- `src/lib/application/games/index.ts` — `GAMES`, the single source for each game's slug, display name, card tagline and SEO title/description. `gameBySlug` resolves one. Never hardcode a game's metadata in a route; read it from here.
- `/juegos` is a portal listing `GAMES`; each game plays at `/juegos/<slug>`, its screen registered in `src/app/(product)/juegos/[slug]/screens.ts`. Only built games are listed. See [ui.md](ui.md).

## Shared contract

- The pipeline supplies: viseme sequence, timing, avatar player, dialect setting, word bank. See [architecture.md](architecture.md).
- A game owns: round rules, scoring, distractor policy, level progression, and its own screens under `JUEGOS`.
- Prohibit a game re-implementing G2P or viseme mapping. A game that needs new phonetic behaviour changes the pipeline, not itself.
- Settings split: global (dialect, avatar) in `AJUSTES`; per-round (speed, difficulty) exposed by the game.
- `PROGRESO` aggregates across games, so every game reports results in the same shape. OPEN: that shape.

## ¡Adivina la palabra! — MVP

### Why this one first

- It is the evaluation harness for the model. Forced choice over viseme-confusable sets produces a per-viseme confusion matrix from ordinary play.
- Success signal: learners separate what the mouth genuinely distinguishes (`/t/` from the bilabials) and fail at chance on what it cannot (`/m/` vs `/p/` vs `/b/`). A model that beats chance on a same-viseme set is rendering something that is not there.
- Cheapest game to build: no free-text input, no scoring model, four buttons.

### Round loop

1. Prompt `¡ADIVINA LA PALABRA!`; a target word and three distractors are drawn for the current level.
2. The avatar articulates the target. Replay on demand via the play button. The first round waits for that click ("primero escucha a la logopeda"); once the learner has played one round, every later round starts itself ~1s after it appears (a manual play inside that window cancels the autoplay).
3. Learner answers by picking one of four illustrated cards, or by saying the word (`HABLAR PALABRA`). The cards are locked until the target has been played — by the learner or by autoplay — at least once this round; no guessing before watching.
4. Correct card is marked; the round is scored and the level curve advances.
5. Refresh re-draws four new words at the same level. It abandons the round: no score, no level change.

### Distractors

- The four cards are a viseme-confusable set, not random words. `MALA` `TALA` `PALA` `BALA`.
- `/m/ /p/ /b/` share one bilabial viseme — indistinguishable on the lips by construction. `/t/` is coronal and visibly different, so `TALA` is the easier out.
- Selection is a consumer of the viseme mapping: group the word bank by viseme sequence, pick same-class words for hard rounds, cross-class for easy ones. Difficulty is therefore viseme distance, and the floor at maximum difficulty is chance.

### Levels

- Twenty-five levels. A learner starts at level 1.
- The level is the single progression axis. It moves two things at once: which words can be drawn, and how they are articulated.
- Word axis — the four cards are always within one viseme of each other in length, and the viseme distance between them shrinks as the level rises. Level 1 pairs antagonistic viseme groups; level 25 draws inside one viseme row: `morro / foto / modo / mono`, every pair within one viseme.
- Length is deliberately held constant across the four cards. Levenshtein distance grows with a length difference, so an unconstrained draw serves the farthest words, which are simply the longest ones — the learner then picks by card width without reading a single mouth. Prohibit a draw that lets word length separate the target.
- Articulation axis — the exaggeration factor falls, so the mouth moves from clinical demonstration towards natural speech. Speed is NOT on this axis: every round starts at x1.0, natural pace. See [avatar.md](avatar.md).
- Levels 1–24 guarantee at least one visible cue separating the target from every distractor. Hard, never impossible.
- Level 25 is the only level allowed to draw pure homophenes. Its floor is chance, and that is the point — it is the ceiling of lipreading itself.
- Prohibit a level whose set is unreadable by construction below 25. A learner who cannot possibly see the difference reads the round as broken, not as hard.
- Decided for the MVP: a correct answer advances the level by one; a wrong answer holds it. A level cannot be lost. Simplest rule that satisfies the guarantees above — revisit if playtesting says otherwise.
- `src/lib/application/games/adivina/level.ts` — `levelExaggeration(level)` maps level to the exaggeration factor on a straight line from clinical (level 1) to natural (level 25); `levelConfusion(level)` maps it to the share of the target's visemes a distractor should differ in, 0.9 at level 1 down to 0.05 at level 25.
- The band applies to EVERY PAIR of the four cards, not just target-to-distractor. A set whose distractors are each close to the target but far from each other has an odd one out, and a learner who spots it has cut the round from four cards to three without reading a mouth. `drawRound` grows the set one card at a time, admitting a candidate only if it is in band with every card already chosen.
- `src/lib/application/games/adivina/round.ts` — `drawRound(bank, { level, difficultyOffset, rng, avoidTarget })` implements the word axis. Per draw: keep bank words within one viseme of the target's length, score each by `visemeDistance` (see [visemes.md](visemes.md)), keep those whose distance is within 1 of `levelConfusion(level) × target length` — the raw distance the level is asking for — then grow the quad pairwise, picking each card at random from the sixteen best-ranked still in band. The same target yields a different set each time.
- The target is drawn by rejection sampling, not uniformly: `drawRound` retries up to twenty-four random targets until one anchors a full quad, then falls back to its three nearest. This is what makes a high level bite — a word with no mutually confusable trio behind it cannot honour level 25, so it is passed over rather than served with whatever happened to be nearest.
- ~13ms per top-level draw, the cost of the retries. It runs off the render path (a redraw is already behind a 1.4s answer delay), so it buys difficulty rather than paying for it.
- `avoidTarget` keeps the immediately preceding round from repeating.

### Word bank

- `src/lib/domain/words/words.json` — the spelling list, plain JSON so it can be edited without touching TypeScript, alphabetical because grouping is derived and the file order carries no meaning. `src/lib/domain/words/index.ts` re-exports it as `WORDS`, adds `sequenceOf(word)` (peninsular, distinción), and exports `BANK` — every word paired with its viseme sequence, computed once at module load. `drawRound` takes `BANK`, never the raw strings: re-running G2P over the bank on every draw costs ~15ms, precomputing costs that once.
- ~2081 words. Large enough that a level rarely repeats a set, and dense enough that ~1000 of them have three or more look-alikes at viseme distance ≤ 1 — the supply the top levels draw on. 414 words have at least one exact homophene.
- Minimal pairs (distinción, one phoneme swapped, same length): 1,380 pairs over 749 words; 224 are homophene pairs. 163 words sit in a frame with four distinct visemes in the swapped slot (`_ala`: `bala cala gala mala pala sala tala`) — the visible-contrast paradigms.
- No two words sound the same under distinción, stress included (`words.test.ts`). `ala`/`hala`, `hola`/`ola`, `valla`/`vaya` were such pairs: the voice says both identically, so no card is the answer. `carne`/`carné` differ in stress and stay. Under seseo `casa`/`caza`, `tasa`/`taza` and seven more pairs collide; the game plays distinción only.
- Foreign spellings the Spanish g2p mis-articulates (`short`, `surf`, `hockey`) stay out. Candidates left for the native reviewer: conjugated or rare forms (`besa`, `pesa`, `mima`, `rala`, `romo`, `riza`).
- High levels skew short by construction, not by rule: near-homophenous quadruples exist mostly among 3–5 viseme words. Growing the bank raises the top levels' ceiling; adding long words does not.
- Cards are text only. No illustrations — decided, not deferred work blocking the bank.
- Nothing but phonetics constrains the vocabulary, so the bank grows as far as the viseme groups allow. Words need only be Spanish and known to the learner.
- Grouping is derived, never authored: the bank stores words, the viseme mapping groups them. Prohibit hand-written distractor lists.
- Current list is a first pass by the agent, not yet native-speaker reviewed. Treat it as provisional until Julio reviews it.

### Settings

- `GÉNERO` — avatar identity. Must not change the viseme sequence, only its rendering. Disabled in the MVP: only `Mujer` exists, no second avatar rendering yet, so the select is shown disabled.
- `VELOCIDAD` — x0.5 to x2.0. Scales the timing stage; does not re-run G2P. Resets to x1.0 at the start of each round, every level — natural pace is the default a learner is trained against; the learner can still drag it for that round.
- `DIFICULTAD` — Fácil / Media / Difícil, a 3-position slider worth ±5 levels (±2 of the old ten, kept proportional to the level count so the three positions still feel distinct). An offset on the level, not a second scale: it nudges the drawn set easier or harder around the level's baseline. The level remains what progresses. Applies to the next round drawn, not the one on screen.
- Fácil pairs visually antagonistic groups: `BILABIAL` against `VELAR`, `bala` / `cala`. Extreme visual difference, suitable for children.
- Difícil pairs inside one viseme row: `mata` / `pata` / `bata`.
- Prohibit `DIFICULTAD` from pushing a sub-25 level onto pure homophenes. The level 25 exemption is not transferable — `drawRound` clamps the offset level to 1–25 before deciding whether homophenes are allowed.
- `DIFICULTAD` also gates the voice: audible at Fácil and Media, silent at Difícil (`offset >= DIFFICULTY_RANGE.hardest` → `voice.enabled: false`). A fade was the intent but Chrome renders any fractional utterance volume as silence, so it is on/off, not a dial. Audio is a permanent affordance up to Media; at Difícil the mouth carries the round. No second voice-only control; the player's mute is the only manual switch.

## Sentence games — shared rules

Four follow-ups to ¡Adivina la palabra! for the same learners, over sentences authored by speech therapists.

- Watch-and-respond only. No speech input; no mic pill on these screens.
- Sentences go through `articulate` unchanged: one g2p pass per word, every word keeps its own lexical stress (function words included), no cross-word linking — pipeline stage 3 is still OPEN. Decided for the MVP; revisit if the speech therapist flags a sentence.
- Same shell as the word game: `Player` + `Face`, voice on by default, app-wide mute, replay on demand, answers locked until the sentence has been played once, autoplay ~1s into every round after the learner's first manual play. `src/app/(product)/juegos/shared/round-player.tsx` (`useRoundPlayer`, `RoundStage`, `useSeededGame`) is that shell; ¡Adivina la palabra! renders it too. Never fork it per game.
- `VELOCIDAD` and `DIFICULTAD` as in the word game: speed resets to x1.0 every round; `DIFICULTAD` shifts exaggeration by the same ±5 level offset and silences the voice at Difícil (`voiceAllowed`).
- No distractor generation and no sentence editing by rule: every card is authored. Changes go through `phrases.json`.
- Levels walk the authored order. A correct answer advances; a wrong one holds. Slide order is assumed easy → hard, unconfirmed with the speech therapist.
- Exaggeration — `phraseExaggeration(progress, offset)` lays a game's progress through its list (0 first entry, 1 last) onto `levelExaggeration`'s 1–25 line, so the first sentence is as clinical as level 1 and the last as natural as level 25.
- After the last entry, a "¡Lo has conseguido!" panel offers "Volver a empezar" (back to the first entry, `DIFICULTAD` kept).
- Feedback for children: `¡Muy bien!` on a right answer; on a miss the right card carries ✓, the wrong one goes red and the others fade (`WordCard` `dimmed`), so nothing else reads as green.
- Each screen credits its sentence set's authors under the tip.
- Rules are pure, in `src/lib/application/games/frases/` (`shared.ts`, `que-frase.ts`, `por-silaba.ts`, `ordena.ts`), tested there.

### Phrase data

- `src/lib/domain/phrases/phrases.json` — tracked, editable without touching TypeScript. Keys: `credits`, `porSilaba` (21 groups of `syllables` + `sentences`, document order), `encuentraFrase.frases_1|frases_2` (`slide`, `target`, four `cards`, deck order), `ordena` (20 sentences; Ordena la frase also plays `porSilaba`'s).
- Sources: `.local/frases/` (untracked) — Alberto Abarca's «Frases 1» and «Frases 2» slides (`encuentraFrase`, `ordena`); Cristina Vega and Goretti Rodríguez's «Frases por sílabas» (`porSilaba`). Text kept as authored, typos included (`Lola esta sola`, `rie`, `Pepé`).
- `src/lib/domain/phrases/index.ts` — `SYLLABLE_GROUPS`, `FIND_SENTENCES` (both decks flattened, `frases_1` first, tagged with `deck`), `ORDER_SENTENCES`, `PHRASE_CREDITS`.
- `phrases.test.ts` — no empty entry, no duplicate sentence within a card set, every `encuentraFrase` target among its four cards. `src/lib/application/games/frases/articulates.test.ts` — every sentence in every set articulates.

## Frases por sílaba — gentle on-ramp

- Source: `porSilaba`. A group is one consonant sound (`ba · bo · be · bu · bi`) and its sentences.
- Round: the avatar articulates one sentence of the group; the learner picks it among up to four of the group's sentences (target plus three others at random; a smaller group shows them all).
- A correct answer retires the sentence; a wrong one sends it to the back of the group. The group passes once every sentence has been recognised; then the next group in document order.
- Every group is also its own entry point: a row of syllable pills above the avatar (`groupShortLabels` — each group's first syllable not already shown by an earlier one, so the two `ja` groups read `ja` and `gi`).
- Progress line: `Sonido n de 21 · Frase k de m`.

## ¿Qué frase dijo? — recognition

- Source: `encuentraFrase`. One authored entry per level, 40 levels: `frases_1` slides 15→1, then `frases_2` slides 25→1.
- Round: the avatar articulates `target`; the learner picks it among the entry's four `cards`, shuffled.
- Wrong answer: the same entry again, reshuffled, after a longer pause (2.8s) so the learner reads the ✓ card.

## Ordena la frase — recognition and memory

- Source: every authored sentence of three words or more from both documents — `porSilaba` (short, 3–7 words) and `ordena` (the slides, 6–11 words) — one per level, 123 levels (`ORDENA_SENTENCES` in `ordena.ts`).
- Order: fewest words first, authored order within a length (`byLength`), so the game opens on `El abuelo bebe.` and ends on the slides. Reorders and filters only; never writes or edits a sentence. Two-word sentences (`Lola suma.`) are left out: their only wrong order is a swap.
- A row of word-count pills (`3` … `11`) above the stage jumps to the first sentence of that length (`lengthSteps`, `startAt`); the pill of the current sentence's length is pressed.
- Words are split on spaces, punctuation stripped, every word lowercased (`tokenize`) — a capital singles a chip out, whether the first word or a name (`Lola`). The solved sentence is then shown as authored.
- The chips are shown in an order that never equals the answer (`shuffleTokens`: random shuffles, then a guaranteed swap of two different words).
- Tap a chip to put it in the next empty slot; tap a placed word to send it back. `Borrar` empties every slot not yet confirmed. Replay the avatar at any time.
- No check button: placing the word that fills the last slot checks the sentence (`placeAndCheck`). The check scores words in the right place, matching by text so a repeated word (`de … de`) counts in either of its places. All right passes the round and advances the level; otherwise the right words lock green and the wrong ones return to the pile, with `n de m palabras en su sitio`.

## Construye la frase — recognition, memory and discrimination

- Ordena la frase with extra words in the pile that are not in the sentence: the learner picks only the words said and orders them. Asked for by the speech therapist as the harder step after Ordena.
- Same rules and screen as Ordena (`WordOrderGame`, `ordena.ts`): a level is a `WordRound` — sentence, `extras` pool, `extraCount` dealt. Ordena's rounds deal none (`plainRounds`).
- Source: every `porSilaba` sentence of 3+ words and every `encuentraFrase` target, one per level, fewest words first, 141 levels (`CONSTRUYE_ROUNDS`, `construye.ts`). A target in both decks is one level, its extras merged.
- Extras are words of authored sentences, never written by rule (`extrasFor`): a slide target takes the words of its look-alike cards it lacks (`roca` → `foca`, `su`, `cabía`); a syllable sentence takes words of its group-mates (`El abuelo bebe.` → `abuela`, `bebé`, `bola`…). A word the sentence has is never an extra.
- Extras dealt per round grow with length (`extraCountFor`): 2 up to four words, 3 up to six, 4 from seven — capped by the pool. Drawn at random each round, dropped among the shuffled words (`dealPile`), which still never read in order.
- One slot per sentence word. An extra placed in a slot is wrong at the check and goes back to the pile; the round passes with only the sentence's words, in order. Same word-count pills as Ordena.

## Audio

Two jobs only. Both may use the network in the MVP — decided, do not re-litigate.

- Speak the word — built. The avatar's voice, replayable, on by default; `speechSynthesis` through `useArticulation`'s `voice` option. `VELOCIDAD` reaches it through the timeline; `DIFICULTAD` gates it off at Difícil. Mute is the player icon. See [voice.md](voice.md).
- Hear the answer — `HABLAR PALABRA` transcribes the learner's speech and auto-selects the matching card. Web Speech `SpeechRecognition` (`webkitSpeechRecognition` prefix). Sends audio to a vendor server in Chrome; acceptable for MVP.
- Recognition is a closed 4-word choice, not open dictation. Match the transcript against the four card labels: lowercase, strip accents, then nearest-match. Reject if no card is close.
- Set `lang` from the dialect setting: `es-ES` by default, `es-419` under seseo, so both voice and recogniser match the visemes on screen.
- Mic is progressive enhancement: `SpeechRecognition` is missing in Firefox. Cards always work; hide the mic button when the API is absent.
- Offline promise now reads: pipeline and gameplay offline, audio online. See [architecture.md](architecture.md).
