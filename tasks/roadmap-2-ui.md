# Roadmap 2 — the product UI

> Tracks planned work in order and nothing else. `wiki-llm/` is the source of truth for how anything works; prohibit recording facts, tables, values or rationale here.
> Continues `roadmap.md`, which built the pipeline and the player. Step numbers continue from it.
> Every step ships under the Definition of Done in `AGENTS.md` §1.
> Spec: `wiki-llm/ui.md` for the shell, theme and screen anatomy; `wiki-llm/games.md` for the round loop, levels and distractors.

## Step 3 — shell and theme — DONE

Goal: every screen in the design frame, on the design's colours, with the four nav destinations reachable. No game yet.

### 3a. Theme — DONE, pending Julio's review of the `wrong` tokens

- Palette in `src/app/globals.css` under `@theme`; hex column stripped from `wiki-llm/ui.md`, the stylesheet is now the only copy.
- `prefers-color-scheme` and the old `--background` / `--foreground` boilerplate deleted. One light theme.
- Acceptance open: Julio reviews the three derived `wrong` tokens on screen — invented, no design reference.

### 3b. Shell — DONE

- `src/components/sidebar.tsx`, `wordmark.tsx`, `settings-pill.tsx`, `icons.tsx`; active item resolved from `usePathname()`.
- `src/app/(product)/` route group carries the shell layout; `/debug` sits outside it, untouched.
- `AJUSTES` renders as the top-right pill on every product screen. Inert.

### 3c. Screens — DONE

- `/` `INICIO`, `/progreso` `PROGRESO`, `/perfil` `MI PERFIL` — blank, shell and title only (`src/components/screen-title.tsx`).
- `/juegos` `JUEGOS` — built straight through to Step 5 below rather than staged as an empty frame first.
- "Hello world" home page and its test replaced.

## Step 4 — ¡Adivina la palabra!, mocked — DONE, merged with Step 5

Goal: the design screen, playable end to end. Built directly against the real word bank instead of a throwaway hardcoded set, since Step 5 was implemented in the same pass — no intermediate scaffolding to discard.

### 4a. Layout — DONE

- Stage, floating settings panel, four cards, mic pill, `Nivel: N` — `src/app/(product)/juegos/`. Anatomy in `wiki-llm/ui.md`.
- Cards are the word alone.

### 4b. Player in the stage — DONE

- `src/components/playback.ts` (`usePlayback`) and `src/components/articulation.ts` (`useArticulation`) extracted from `/debug`; both `/debug` and `AdivinaScreen` build on them, neither imports the other.
- Play button replays the target word's timeline through the same `Face` component from Step 2.

### 4c. Round — DONE

- `src/lib/application/games/adivina/game.ts` — `answer`/`redraw` reducer-style functions; round rules are pure and tested without rendering.
- `src/lib/application/games/adivina/round.ts` draws from the real bank (Step 5), not a hardcoded set.

### 4d. Controls — DONE

- `VELOCIDAD` drives the timing stage and resets to the level's baseline each round. `DIFICULTAD` offsets the level for the next draw. `GÉNERO` is inert (no second avatar rendering exists).

### 4e. Level — DONE

- Level 1 to 10 in `GameState`, in memory, resets on reload. Displayed bottom-right.
- `src/lib/application/games/adivina/level.ts` maps level to speed and exaggeration.

## Step 5 — word bank and round generation — DONE, word bank pending Julio's review

Goal: real vocabulary, and four cards that are genuinely as hard as the level claims.

### 5a. Bank — DONE, not yet native-speaker reviewed

- `src/lib/domain/words/` — Spanish words, nothing per word but the spelling.
- Acceptance open: Julio reviews the list. The current ~115 words are an agent-drafted first pass, not yet vetted.

### 5b. Grouping — DONE

- `visemeDistance` lives in `src/lib/domain/viseme/distance.ts` (edit distance over viseme codes); `src/lib/domain/words/sequence.ts` computes a word's sequence for it. `src/lib/application/games/adivina/round.ts` bands the bank by distance and draws from it.
- `mala` `pala` `bala` land at distance 0; `tala` does not — covered in `src/lib/domain/viseme/distance.test.ts`.

### 5c. Level curve — DONE

- `drawRound` bands eligible distractors by distance and slides the band by level; `DIFICULTAD` offsets the level before banding.
- Levels 1–9 filter out distance-0 distractors; level 10 allows them — covered in `src/lib/application/games/adivina/round.test.ts`.
- Repeats are damped by excluding the immediately preceding target (`avoidTarget`), not by tracking a full session history.

## Step 6 — JUEGOS catalogue portal — DONE

Goal: `/juegos` is a portal, not the game. Games play at their own SEO-friendly routes, metadata driven by data.

- `src/lib/application/games/index.ts` — `GAMES` holds each game's slug, name, tagline and SEO title/description; `gameBySlug` resolves one.
- `/juegos` renders a card grid over `GAMES`, only built games. `/juegos/<slug>` renders the game via the `[slug]` route and a slug→component map; `dynamicParams = false`.
- `generateMetadata` and `sitemap.ts` read `GAMES` — no per-route hardcoded title/description/canonical.
- Adivina's screen moved to `src/app/(product)/juegos/adivina-la-palabra/`.

## Not in this roadmap

Card illustrations — cards stay text-only. Audio in either direction — the mic pill stays inert and `speechSynthesis` stays unbuilt. Persistence of level or profile. `PROGRESO` metrics. `AJUSTES` contents. Per-game level/star stats on the catalogue card. A second game. Phone layout.
