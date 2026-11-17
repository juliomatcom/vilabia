# Voice

> **Maintenance Invariant:** How the avatar's voice is chosen, timed and synced. Update in the SAME commit as any change to `src/lib/application/speech/` or `src/components/voice.ts`. Terms are defined once, in [glossary.md](glossary.md).
> **Answers:** How does the avatar speak, how does the voice stay on the lips, what breaks it?

## Contract

- Web Speech `speechSynthesis` only. No asset, no build step, no server. Online is permitted here and nowhere else in the pipeline — see [architecture.md](architecture.md).
- The timeline is the clock. The voice bends to the lips through `rate`; the lips never bend to the voice.
- A missing, blocked, muted or failed voice never degrades the animation. Every silent path plays the clip exactly as before.
- Voice is an option on `useArticulation`, not a prop on `Player`. A caller that omits it is silent; a caller that passes it is voiced.
- A voice must be measured before it can be spoken, and that costs one silent clip. The app pays it at load, before any player mounts, so no learner ever hears a clip play silent.

## Modules

- `src/lib/application/speech/` — pure policy. No DOM, no React. `langFor`, `pickVoice`, `spanishVoices`, `rateFor`, `calibrate`, `canFit`, `fitPace`; constants in `rates.ts`.
- `src/components/voice.ts` — the imperative edge. `browserSpeaker()` wraps `window.speechSynthesis` behind the `Speaker` port; `useVoices` subscribes to it; `useVoice` turns an utterance request into a spoken one. Options: `gender`, `name`, `volume`, `pitch`, `rate`, `syllablesPerSecond`.
- One app-wide store holds what is known about the engine's voices — pace, start latency, whether a pass is running — over `useSyncExternalStore`, published by `measureVoice` and read by every `useVoice`. Nothing about a voice is component state: it belongs to the engine, not to a player.
- `forgetVoices()` drops all of it, in-flight pass included. `/debug` calls it through `voice.forget` when the pinned voice changes.
- `src/lib/domain/timing`'s `speechSpan(timeline)` gives the span the voice has to fill: the clip minus its lead-in and tail rest.

## Mute

- `useMuted()` in `src/components/voice.ts` — one app-wide store over `useSyncExternalStore`, held for the session only. Returns `[muted, setMuted]`; `setMuted` is also a bare export.
- Not persisted, on purpose: every load starts with sound on. A mute that outlived the tab read as a broken voice, since `Player` draws it exactly like `silenced`. Revisit alongside that icon.
- A voiced caller folds `muted` into `voice.enabled` (the game: `enabled: !muted && difficulty < Difícil`). Muted takes the silent path immediately — no utterance, no start-event wait — and clears `silenced`, since nothing was asked of the voice.
- `Player` renders the toggle top-right when the caller passes `onMuteToggle`, mirroring the play icon, visible while playing. `SoundIcon` unmuted, `MuteIcon` when `muted` or `silenced`. Labels `Silenciar` / `Activar sonido`, `aria-pressed` on the state.
- The caller hides the toggle where `speechSynthesis` is absent (passes no `onMuteToggle`); `Player` then falls back to the standalone `silenced` indicator.
- No mute surface outside the player icon — `AJUSTES` does not carry one.

## Warming up

- `<VoiceWarmup />` in `src/app/layout.tsx` — mounted above every route, renders nothing, measures the default `es-ES` voice on load. `useVoiceWarmup` is the hook behind it.
- One pass serves the whole app: pace is the engine's number, so it does not vary by game, word, level or speed. A game never measures anything itself.
- Autoplay policy refuses an utterance with no user activation behind it, so the load-time attempt fails on Chrome and Safari. The first `pointerdown` or `keydown` anywhere retries it — the walk from `INICIO` to a game is several gestures, so the voice is ready before the play button is ever pressed.
- Both attempts are silent (`volume: 0`) and idempotent, and the listeners come off as soon as the voice is known.
- Warm-up ignores mute and `DIFICULTAD`: the pass makes no sound, and the learner who unmutes later should not pay for it then.
- Worst case survives: a deep link straight into a game whose first gesture is the play button plays that one clip silent, exactly as before.

## Choosing a voice

- `langFor(dialect)` → `es-ES` under distinción, `es-419` under seseo, so voice and visemes agree.
- `pickVoice` ranks language first, then gender, then local over network — an `es-ES` male voice beats an `es-419` female one, because the language is what the visemes were built for. An explicit name beats the ranking outright; that is how `/debug` pins one voice.
- Gender defaults to `mujer`: the avatar is a woman, and `GÉNERO` is the only thing that should change it. The Web Speech API exposes no gender, so `genderOf` reads the given name out of the platform's voice label against a table in `src/lib/application/speech/`. An unlisted voice is simply unknown and ranks without the bonus — extend the table when a platform ships a name it does not know.
- No Spanish voice installed → nothing is spoken, and the clip plays silently.
- Voices arrive asynchronously: `getVoices()` is empty on the first synchronous call in Chrome. `useVoices` re-reads on `voiceschanged`.

## Timing the utterance

- Playback is deterministic. The same clip on the same voice sounds identical on every press, because the voice's numbers are measured once and then fixed. Nothing a play does changes what the next play sounds like.
- Nothing is hardcoded either: no prior, no per-voice constant, no calibration knob.
- A voice's duration takes two numbers: `measured = overheadMs + syllables / (pace × rate)`. The overhead is silence the engine wraps every utterance in whatever its length — `Flo (es-ES)` adds about 330 ms. One utterance cannot separate the two.
- So a voice is measured once, in a silent pass: `CALIBRATION_WORDS` — two real words of different syllable counts — spoken at `volume: 0` and rate 1, then `fitPace` solves both numbers by least squares. `voice.measuring` is true while it runs.
- The pass is normally over before a player mounts (see Warm-up). A clip that does hit an unmeasured voice plays silently, marked, and asks for the pass itself.
- One pass at a time, guarded by module state, not by render state: a clip fires one `speak` per word off timers that each hold the closure they were built with, so a state flag would start a pass per word and each would cancel the last.
- The pass owns the channel while it runs. `voice.cancel()` is a no-op during it — a measuring clip has no sound to cut, and cutting the pass would only cost the learner another silent clip. So pressing play again mid-pass does not restart it.
- A pass that is interrupted or answered late lands on a stale pass id and is dropped, samples included: a truncated utterance would fit a pace that is not the voice's.
- `MEASURE_TIMEOUT_MS` (4 s) per utterance. An engine that swallows one fires neither `start` nor `end`; without the timeout the voice would wait on it for the rest of the session and never speak.
- The result is kept in `localStorage` per voice name, so a voice is measured once per device rather than once per session, and in the store, so it is measured once per app load rather than once per player.
- Start latency is learned the same way — per voice, in the store, from the pass and then from every utterance. It is not per player: a fresh mount would otherwise schedule its first word as if the engine started instantly.
- What survives in `rates.ts` are bounds and one perceptual constant, none of them per-voice: rate clamps, plausibility limits, the fit's spread guard, the drift tolerance, the measuring timeout, and `MOUTH_LEAD_MS`.

## Silence beats a sound off the lips

- `rate` is a coarse multiplier, clamped to `MIN_RATE`–`MAX_RATE`. Outside that band the engine cannot stretch or hurry far enough, and no scheduling can fix it: `speechSynthesis` has no phoneme control and will not sustain a vowel.
- `canFit` asks, per word, whether the span is reachable. If any word in the clip is out of range the whole clip plays silently — a voice that is right for three words and wrong for the fourth is worse than none.
- `useArticulation` reports this as `silenced`, and `Player` draws a struck-through speaker when it is set. The learner sees why there is no sound instead of hearing something that contradicts the mouth.
- A voice still being measured is silent for that clip, and marked the same way. Warm-up means the learner rarely sees it.
- This binds first at slow speeds, which is where the trainer lives: at `VELOCIDAD` x0.5 the clip is twice as long as the voice can stretch to, so the voice drops out and the mouth carries the exercise.

## Staying in sync

- The timeline drives everything. `usePlayback` plays the clip from `toTimeline` and nothing the voice does ever moves it — no start gating, no re-anchoring. Two clocks running side by side cannot be made to agree; there is one clock.
- The voice is fired BY that clock, one utterance per word: when the clip reaches a word's span, that word is spoken, launched `latencyMs` early so the sound lands on time. `latencyMs` is what the engine takes between `speak()` and its start event, measured per voice and learned as it plays.
- Each word gets the rate that fits its own span, so a long phrase cannot accumulate error: every word re-syncs by construction because the clock, not the previous word, decides when it starts.
- `mouthLeadMs` (`MOUTH_LEAD_MS`, 60 ms) delays the sound behind the mouth. Real articulation precedes its own sound, and viewers tolerate a mouth that leads far better than one that trails.
- The clock waits at the start only when the first word cannot be launched early enough — when the clip's lead-in rest is shorter than the engine's latency. Otherwise it plays immediately.
- A word still sounding when the next is due is cut off. The clip's timing wins; that is the whole point.
- Resuming mid-clip schedules only the words that have not been heard yet.

## When the totals match and it still looks wrong

- Total duration is the weak constraint; distribution is the strong one. A drift of a few tens of milliseconds over a long word can still show the mouth trailing the voice through the middle and catching up at the end.
- That is a timing-model problem, not a voice problem: the clip spends its time more evenly than speech does. See the distribution section of [timing.md](timing.md); `stressFactor` and `finalFactor` are the knobs.
- Nothing inside a single word can be corrected: the engine exposes no phoneme timing. A long word has to be right by construction, which is what the timing model's distribution decides.

## What breaks it

- Autoplay policy: Chrome and Safari refuse to speak before a user gesture. Every voiced player starts from a click, so the first utterance is always gesture-backed; warm-up retries on the first gesture instead.
- Chrome drops an utterance queued in the same task as `cancel()`. `browserSpeaker` defers the `speak` call by one task.
- Chrome renders any `utterance.volume` below ~1 as silence, not a quieter voice. Treat volume as on/off only: callers that want a quieter voice cannot have one, and `DIFICULTAD` gates the game's voice instead of fading it. `/debug`'s volume slider inherits the same limitation.
- `speechSynthesis` is absent in some environments (jsdom included). `browserSpeaker()` degrades to `SILENT_SPEAKER`, and `useVoice` reports `supported: false`.
- A `Speaker` implementation must return a stable array from `voices()`. `useSyncExternalStore` loops forever on a fresh array per call.
- Voice quality is the platform's, not ours. A network voice can lag by hundreds of milliseconds before `start`; prefer local voices, which is what the ranking does.
