# Roadmap 3 — voice

> Tracks planned work in order and nothing else. `wiki-llm/` is the source of truth for how anything works; prohibit recording facts, tables, values or rationale here.
> Continues `roadmap-2-ui.md`, which built the product UI. Step numbers continue from it.
> Every step ships under the Definition of Done in `AGENTS.md` §1.
> Spec: the audio section of `wiki-llm/games.md`; clip structure in `wiki-llm/timing.md`; the shared player in `wiki-llm/ui.md`.

## Step 7 — the avatar speaks

Goal: every `Player` speaks the word it articulates, aligned with the lips, and carries its own mute control. `speechSynthesis` only — no asset, no build step.

Invariants for the whole step:

- The timeline is the clock. The voice bends to the lips (`rate`), never the lips to the voice.
- A missing, blocked, muted or silent voice never degrades the animation.
- Voice is on by default, everywhere, including in the game. The learner mutes.

### 7a. `lib/application/speech/` — voice policy, pure — DONE

- `langFor(dialect)` → `es-ES` under distinción, `es-419` under seseo.
- `pickVoice(voices, { lang, gender })` → rank exact `lang`, then any `es-*`, then undefined; prefer `localService`. Takes voice descriptors as plain data, never touches `window`.
- `rateFor({ syllables, targetMs, voiceRate })` → utterance rate so spoken length ≈ the clip's speech span; clamped to an audible range. `VELOCIDAD` reaches it only through `targetMs`, never as a separate multiplier.
- ~~`volumeFor(difficultyOffset)` → utterance volume across the `DIFICULTAD` range.~~ Removed in 7g: Chrome renders any fractional `utterance.volume` as silence, so a volume dial is not deliverable. `DIFICULTAD` gates the voice on/off instead.
- `calibrate(estimate, { syllables, measuredMs })` → fold one measured utterance into a per-voice syllables-per-second estimate, so the second play of a session is tighter than the first.
- Constants (baseline syllables/s, rate clamps, drift tolerance) in one `src/lib/application/speech/rates.ts`, mirroring `lib/domain/timing/durations.ts`. It stays the only copy of the tuned numbers from 7d.
- Table-driven tests, one row per case. No DOM.

### 7b. `components/voice.ts` — the imperative edge — DONE, except the mute store

- `useVoices()` — `useSyncExternalStore` over `voiceschanged`; empty on the server, empty when the API is absent (Chrome returns nothing on the first synchronous call).
- `useVoice({ text, lang, gender, rate, volume, enabled })` → `{ speak, cancel, supported, speaking }`.
- Cancels on unmount, on text change and on pause. Guards the `speak()`-then-`cancel()` queue wedge.
- `useMuted()` — DONE with 7e. One app-wide store, `useSyncExternalStore`, persisted to `localStorage` (`vilabia.voice.muted`), unmuted by default. Returns `[muted, setMuted]`. Voiced callers pass `enabled: !muted`.
- Synthesis handle is injectable, so jsdom tests drive a fake and assert utterance rate, lang, mute and cancel ordering.
- Feature detection only — no UA sniffing. Absent API reports `supported: false` and no-ops.

### 7c. Sync — `voice` option on `useArticulation` — DONE, acceptance pending 7d

- One option; call sites keep their existing `Player` / `onToggle` wiring untouched.
- Syllable count comes from the `Word[]` `useArticulation` already computes; target duration is the clip minus lead-in and tail, so the voice covers the speech span, not the rest frames.
- `play()` schedules the utterance; the playback clock starts on the utterance's `start` event, so voice latency does not desync. Fallback timer starts the animation silently if `start` never fires.
- Voice starts at `leadInMs / speed` into the clip; the clock is anchored so the lips reach the first viseme as the voice begins.
- `VELOCIDAD` is already in the timeline the rate is derived from, so the voice tracks the slider by construction; the clamp wins at the extremes, and the mismatch is reported rather than hidden.
- `DIFICULTAD` gates the voice, nothing else. It must not touch rate, or the voice leaves the lips; it leaves the timeline alone. Intended as a fade, shipped as on/off — Chrome renders fractional `utterance.volume` as silence (7g).
- The gate applies to the next round, not the clip on screen.
- Muted playback, and Difícil, take the silent path immediately — no utterance, no start-event wait, no latency.
- Resume mid-clip is silent; pause cancels. Single-word clips are ~1 s, so a restart is worse than a gap.
- Acceptance: at x0.5, x1 and x2 the utterance ends within the drift tolerance of the timeline's speech end, on a local `es-ES` voice.

### 7d. Calibration — DONE, and it calibrates itself

- Decided: no hand-tuned per-voice constants ship, and no calibration knobs exist. A voice measures itself or the feature does not ship.
- Decided: playback is deterministic. A voice is measured once, in a silent two-word pass, and fixed after that — a running estimate made the same clip sound different on every press.
- The measurement is cached in `localStorage` per voice, so it costs one silent clip per device.
- `/debug` reports those measurements and offers no way to set them. Its remaining controls are real settings: dialect, speed, pause, exaggeration, transition, voice on/off, gender, which voice, volume.
- Removed: the síl/s prior, the overhead constant, the manual rate, the pitch slider, the recalibrate toggle, the mouth-lead slider, and the stress/final shaping sliders.

### 7e. Mute in `Player` — DONE

- `Player` draws a struck-through speaker when `silenced` — the voice was asked for and will not be heard, because no Spanish voice exists or the clip is outside what the engine can stretch to.
- The learner's mute toggle sits opposite the play icon: caller passes `muted` + `onMuteToggle`, `Player` renders the toggle in place of the standalone `silenced` indicator. Same size and treatment as the play icon; visible while playing. It is a sibling of the play `<button>`, not nested.
- `SoundIcon` when unmuted, `MuteIcon` when `muted` or `silenced`; `silenced` reason on `title`.
- `SoundIcon` / `MuteIcon` in `src/components/icons.tsx`, matching the existing line set.
- Labelled `Silenciar` / `Activar sonido`, `aria-pressed` on the state.
- Caller omits `onMuteToggle` when `speechSynthesis` is absent — a dead control is worse than none.

### 7f. The timeline drives the voice — DONE, replaced 7c's sync

- `boundary` events re-anchor the clock through `seekTo` against `toWordSpans`, and only past the drift threshold, so no visible jump inside tolerance.
- Single words need none; the case is any future phrase game (INICIO's two-word greeting was the original driver, now discarded).
- 7c had two clocks: the clip's, and the engine's. Matching their totals, then re-anchoring on `boundary`, never held — the fault was the architecture, not the constants.
- Now there is one clock. The clip plays; each word's utterance is fired when the clock reaches that word, launched early by the engine's measured latency. The voice never moves the clock.
- Removed with it: start gating, `boundary` re-anchoring, `wordIndexAt`, and the whole-clip rate.

### 7g. Callers — DONE

- Discarded: INICIO hero greeting speaks. INICIO has no player and no audio — it stays silent and static.
- ¡Adivina la palabra! — DONE. Target word speaks, on by default; the player's mute is the only manual control. Decided: audio is a permanent affordance, not a difficulty-gated hint. Closes `games.md`'s open item.
- Both game sliders reach the voice: `VELOCIDAD` through the timeline, `DIFICULTAD` as an on/off gate (`offset >= DIFFICULTY_RANGE.hardest` → `voice.enabled: false`; audible up to Media, off at Difícil). A volume fade was the plan; Chrome renders any fractional `utterance.volume` as silence, confirmed against `/debug`'s volume slider, so `volumeFor` was removed. Neither slider gets a second, voice-only control.
- `/debug` keeps the 7d panel; no mute toggle there (it passes no `onMuteToggle`).
- `GÉNERO` stays inert for the face, but `pickVoice` accepts gender — wiring the existing select to voice choice only is a candidate follow-up, not part of this step.

### 7h. Wiki — DONE

- `wiki-llm/voice.md` — voice selection, rate calibration, the sync contract, the mute store, browser caveats. `index.md` row present.
- `architecture.md` — audio playback beside the pipeline; current state names the game wiring.
- `games.md` — speak-the-word built; hint open item closed per 7g; `DIFICULTAD` gates the voice off at Difícil; Chrome fractional-volume caveat.
- `ui.md` — Player section: the mute toggle, its position and icons.
- `index.md` status paragraph.

## Not in this roadmap

`SpeechRecognition` and the `HABLAR PALABRA` mic pill — its own step. Recorded or neural TTS assets. A second avatar rendering per gender. A mute surface in `AJUSTES` beyond the player icon. Offline voice guarantees — audio stays online-permitted, the pipeline stays offline.
