# Roadmap 4 — sentence games

> Tracks planned work in order and nothing else. `wiki-llm/` is the source of truth for how anything works; prohibit recording facts, tables, values or rationale here.
> Continues `roadmap-3-voice.md`. Step numbers continue from it.
> Every step ships under the Definition of Done in `AGENTS.md` §1.
> Spec for a single goal: implement 8a–8e together. Everything not stated here is the implementer's decision.

## Step 8 — three sentence games

Goal: three new games in `JUEGOS`, each with the avatar articulating a full sentence, built on the existing pipeline and the ¡Adivina la palabra! shell. Follow-ups to the word game, for the same learners.

Input: `.local/frases/extracted.json` (untracked; produced from the speech therapist's documents in `.local/frases/`). Move the data into tracked JSON under `src/lib/domain/phrases/` so it can be edited without touching TypeScript. Keys: `porSilaba`, `encuentraFrase.frases_1|frases_2`, `ordena`.

Invariants for the whole step:

- Watch-and-respond only. No speech input from the learner. The mic stays inert, as today.
- Sentences go through the existing `articulate` pipeline unchanged. No G2P or viseme changes unless a sentence demonstrably breaks.
- The sentence sets are authored by the speech therapist. Prohibit generating or editing sentences by rule; changes go through the data files.
- Logic is pure and colocated-tested in `lib/`. Reuse the word game's shell, cards, player, voice, mute and `VELOCIDAD`/`DIFICULTAD` wiring; do not fork them.
- Voice, replay, autoplay-after-first-play and locked-until-played behave as in ¡Adivina la palabra!.

### 8a. Data — `src/lib/domain/phrases/`

- Tracked JSON for the three sets, plus typed accessors.
- Each set validated by a test: no empty entries, no duplicate sentences within a card set, every `encuentraFrase` entry has its target among its four cards.
- Every sentence in every set must articulate without throwing (test).
- Attribution carried in the data or its module header: the slides are by Alberto Abarca, the syllable document by Cristina Vega and Goretti Rodríguez. Surface the credit on the game screens or the portal.

### 8b. ¿Qué frase dijo? — recognition

- Source: `encuentraFrase`. The avatar articulates `target`; the learner picks it among the four `cards`, shuffled.
- Levels follow the slide order across both decks (`frases_1`, then `frases_2`), one entry per level. Level advance rule: as in the word game.
- No distractor generation. The cards are authored.
- Done when a level can be played end to end, including the first level and the last.

### 8c. Frases por sílaba — gentle on-ramp

- Source: `porSilaba`. A group is one consonant sound with its sentences. The avatar articulates one sentence of the group; the learner picks it among the group's sentences.
- Progression across groups in document order. Groups with fewer than four sentences use what they have.
- Each group is also its own entry point if that is cheap; otherwise a linear path is enough.

### 8d. Ordena la frase — recognition and memory

- Source: `ordena`. The avatar articulates the sentence; the learner arranges its words, shown shuffled, into the order they heard. Replay at any time.
- Scoring by words in the right place; a complete correct order passes the round.
- The shuffle must never equal the answer.

### 8e. Catalogue and docs

- Three rows in `GAMES` (`src/lib/application/games/index.ts`) with slug, name, tagline and SEO block; sitemap and portal follow from `GAMES`.
- `wiki-llm/games.md`: catalogue rows and one section per game, rules only. `wiki-llm/architecture.md` and `index.md` status lines where they change. Phrase data documented where the word bank is.
- Record in the wiki what was decided on sentence articulation (stress of function words, no cross-word linking) if the implementer touches either.

### 8f. Construye la frase — added on the speech therapist's request

- Ordena la frase with extra words in the pile that are not in the sentence; the learner leaves them out.

## Open for the implementer

- Route, component and file layout; how `lib/application/games/` shares round state between the three.
- Level curve details, exaggeration per level, scoring shape, results screen.
- Card layout for long sentences on narrow screens.
- Whether `/debug` gets a sentence preset.

## Not in this roadmap

- Speech input of any kind.
- A further game beyond 8f, or editing the therapist's sentences.
- Native-speaker review of the sentence sets: authored by a speech therapist, treated as reviewed.
- Confirming slide order as easy to hard: assumed from deck order, to be confirmed with the speech therapist.
