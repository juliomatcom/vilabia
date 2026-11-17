# Roadmap 1 — pipeline and player

> Complete. Continues in `roadmap-2-ui.md`.
> Tracks planned work in order and nothing else. `wiki-llm/` is the source of truth for how anything works; prohibit recording facts, tables or rationale here.
> Every step ships under the Definition of Done in `AGENTS.md` §1.

## Step 1 — text-to-viseme library

Goal: text in, viseme timeline out. Pure TypeScript under `src/lib/`. No React, no 3D, no audio, no network. Fully unit-testable.

### 1a. `lib/domain/g2p/` — text → phonemes — DONE

- Deliver `toPhonemes(text, { dialect })` → syllables, each with phonemes and a stress flag.
- Implement the rule surface and stress rules in `wiki-llm/g2p.md`. Dialect is an argument, never a global.
- Table-driven tests, one row per word. Julio reviews the expected column — native-speaker judgement is the oracle here.
- Acceptance words, at minimum: `queso` `hola` `carro` `pero` `cielo` `casa` `zapato` `guerra` `pingüino` `día` `rey` `México` `chico` `llave`.
- Acceptance: `cielo` and `zapato` differ between seseo and distinción; the other twelve are identical.

### 1b. `lib/domain/viseme/` — phonemes → visemes — DONE

- Fourteen codes, native-speaker reviewed, canonical in `wiki-llm/visemes.md`.
- Deliver `toVisemes(phonemes)` → viseme codes, and the phoneme→viseme table as inspectable data.
- Acceptance: `pala` `bala` `mala` produce identical viseme sequences; `tala` differs at the first position only.

### 1c. Timing — visemes → timeline — DONE

- Deliver `toTimeline(visemes, { speed })` → `[{ viseme, startMs, endMs }]`.
- Per-class base durations; stressed syllables longer; `speed` is a scalar on the time axis.
- Acceptance: `speed: 2` halves total duration. Invariant: contiguous, no gaps, no overlaps.
- Timing lives here, not in the player, so it stays testable without rendering.

### 1d. Library tester at `/debug` — DONE

- `/debug`: text input, dialect toggle, speed and transition controls, IPA, timeline bars and the drawn mouth.
- Purpose: inspect the pipeline directly, at any stage of the product. Kept, not thrown away.
- Local-only: 404 in production unless the host is localhost.
- Prohibit game or pipeline code depending on it. The dependency runs one way: the tester reads the library.

## Step 2 — the player

Goal: play a timeline as a moving mouth. See `wiki-llm/avatar.md`.

### 2a. Frames — ABANDONED

- Photographed and generated stills were tried and dropped. Image models would not hold /f/ apart from /s/ and /m/ across attempts, and stills can only crossfade.
- Replaced by the parametric mouth in 2b.

### 2b. Parametric mouth — DONE

- `src/lib/domain/mouth/` — parameters per viseme, geometry to SVG paths, `shapeAt(timeline, elapsedMs)` blending them on the crossfade weights from `src/lib/domain/crossfade/`. See `wiki-llm/avatar.md`.
- `src/components/parametric-mouth.tsx` draws it; `/debug` hosts it.
- `exaggerate(shape, factor)` gives clinical-versus-natural articulation as one number.

### 2c. Tuning panel — DONE

- `/debug` carries a tuner: pick a viseme, drag its parameters, watch the shape live.
- Edits feed playback too, so a change can be judged inside a word rather than in isolation.
- Exports the whole table as CSV to paste back into `src/lib/domain/mouth/shape.ts`, which stays the only copy of the values.

### 2d. Transport — DONE

- Play from the start, pause, resume where it stopped, and seek by clicking a timeline block.
- The mouth holds whatever position the playhead sits on, so a posture can be inspected still.
- Acceptance, still to be judged with a face around the mouth: `pala` and `bala` indistinguishable, `tala` visibly different, `casa` and `caza` separated by a visible tongue.

### 2e. The face — DONE, quality unresolved

- `src/components/face.tsx`: vector face written in code, following `assets/models/woman-animated.jpeg`. Proportions measured off the model; see `wiki-llm/avatar.md`.
- Chin drops with the `jaw` value the geometry reports; the eyes blink on a CSS keyframe.
- `/debug` switches between the face and the bare mouth.
- It does not look good enough, and iterating did not fix it. Parked as-is; a real redraw needs an illustrator, not another pass.

### 2f. Photographic face — ABANDONED

- Second attempt at stills, after 2a. The player worked; producing the thirteen mouth images was impractical. Player and base photo removed; recoverable from history.
- Do not attempt a third time without new image tooling. See `wiki-llm/avatar.md`.

## Not in these steps

Games and round logic, audio in either direction, `PROGRESO`, profiles, levels, settings UI, word bank and icons. Everything but audio is picked up by `roadmap-2-ui.md`.
