# wiki-llm — Vilabia Source of Truth & Routing Index

> **Maintenance Invariant:** Routing table only. One row per page. Prohibit orphan pages. Prohibit content here — content lives in the page. Update this row set in the SAME commit as any new/renamed page.
> **Answers:** Which wiki page answers my question?

Vilabia is a Spanish lipreading trainer: a set of games over one viseme pipeline. Text goes in, a timed sequence of visemes (mouth shapes) comes out, an avatar articulates it, and the learner reads the lips. First game is the MVP that evaluates the model.

| Page                               | Answers                                                                                               |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------- |
| [conventions.md](conventions.md)   | Repo layout, stack, scripts, hard rules, definition of done.                                          |
| [architecture.md](architecture.md) | What does the app do end-to-end, what is the pipeline, which layer does code go in (dependency rule)? |
| [games.md](games.md)               | What games exist, which is the MVP, what does a game get from the pipeline and what does it own?      |
| [ui.md](ui.md)                     | What does the product look like, what are the theme tokens, what does each screen contain?            |
| [avatar.md](avatar.md)             | How is the face rendered, what drives the mouth, how does it join a face, what can go wrong?          |
| [voice.md](voice.md)               | How does the avatar speak, how does the voice stay on the lips, what breaks it?                       |
| [visemes.md](visemes.md)           | What are the viseme codes, which phonemes map to each, what does the mapping lose?                    |
| [articulemas.md](articulemas.md)   | What does each Spanish sound look like on a real mouth (speech therapist's reference photos)?         |
| [timing.md](timing.md)             | How do viseme codes become a timed clip, what are the durations, what does speed change?              |
| [g2p.md](g2p.md)                   | Why convert spelling to sound first, which Spanish rules apply, what is dialect-configurable?         |
| [glossary.md](glossary.md)         | What does this domain term mean?                                                                      |

## Status

Library complete: `src/lib/domain/g2p/`, `src/lib/domain/viseme/`, `src/lib/domain/timing/`, `src/lib/domain/crossfade/` and `src/lib/domain/mouth/` turn text into a timed viseme clip, drawn as an interpolated mouth inside a vector face. `/debug` renders the whole pipeline with transport, an alphabet panel (every letter's mouth, after the speech therapist's chart, with its air and pressure marks) and a per-sound shape tuner. The mouth draws one shape per sound (27), grouped under the fourteen visemes. The product shell and its screens are built, on the theme from `ui.md`. `FORMAS DE LA BOCA` (`/formas-de-la-boca`) is a public beginner reference: the full alphabet with each letter's mouths, on the shared `AlphabetChart`, also used by `/debug`. `JUEGOS` is a catalogue portal of five built games. ¡Adivina la palabra! plays at `/juegos/adivina-la-palabra`, end to end over twenty-five levels on a ~2100-word bank (`src/lib/domain/words/words.json`, agent-drafted, not yet native-speaker reviewed) grouped by viseme distance (`src/lib/domain/viseme/distance.ts`). Four sentence games — Frases por sílaba, ¿Qué frase dijo?, Ordena la frase, Construye la frase — play the speech therapists' authored sets (`src/lib/domain/phrases/phrases.json`) on the same shell. `INICIO` is a marketing page with a static avatar and a fixed greeting bubble — no player, no motion; `PROGRESO` and `MI PERFIL` are still blank placeholders; `AJUSTES` is a deactivated pill. The site carries SEO metadata, `robots.ts` and `sitemap.ts` (see `architecture.md`'s SEO section) targeting Spanish speech-therapy search terms. Speech output is built and wired: `src/lib/application/speech/` and `src/components/voice.ts` speak the articulated word through `speechSynthesis`, synced to the timeline, calibrated on `/debug`, and live in every game — voice on by default, `DIFICULTAD` gates it off at Difícil, the learner mutes on the `Player` icon (`useMuted`, one app-wide store). See `voice.md`. `INICIO` stays silent and static. Speech input is decided (Web Speech, online) and unbuilt — the mic pill is inert.

## Maintaining this wiki

- Update the affected page in the SAME commit as any behavior or stack change. See `AGENTS.md` §0.
- Write every page telegraphically: one fact per line, no narrative prose, no repeated rules across pages.
- Add a page → add its index row. Prohibit orphan pages.
