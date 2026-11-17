# Avatar

> **Maintenance Invariant:** Rendering approach, the shape model, risks. Update in the SAME commit as any change to `src/lib/domain/mouth/` or the components that draw it.
> **Answers:** How is the face rendered, what drives the mouth, how does it join a face, what can go wrong?

## Decision

A drawn 2D mouth, parametric. One shape per sound — 26 phonemes plus `REST` — expressed as nineteen numbers each; the renderer interpolates between them. No photographs, no 3D, no asset pipeline.

## Why parametric beats stills

- It moves. Frames can only crossfade, and a dissolve between two pictures of a mouth reads as a glitch. Interpolated parameters produce actual movement at any speed.
- Coarticulation is a weighted average of two mouth positions, which is what it physically is — not an opacity trick.
- Exaggeration is `exaggerate(shape, factor)`. Clinical demonstration versus natural speech becomes one number, not a second set of assets, so it can serve as a difficulty axis. See [games.md](games.md).
- The tongue is drawable. `/θ/` needs the tongue visible between the teeth; a parameter renders it exactly, where a 3D rig exposes only `tongueOut` and generated stills drifted between /s/, /m/ and /f/ across repeated attempts.
- Deterministic and tunable. A clinician can correct a shape by dragging a slider; nobody has to re-shoot or re-generate anything.
- Nothing to download, nothing to license, no identity drift between frames.

## The model

- `src/lib/domain/mouth/shape.ts` — nineteen parameters and one set per sound (`Sound` = phoneme or `REST`), in `SHAPES`. A viseme groups sounds; each sound keeps its own shape (1 viseme → n shapes). That constant is the only copy of the values; the tuner in `/debug` copies the whole table to the clipboard as CSV, live, to paste back into it. The table is never printed on the page.
- Values are drawn after the speech therapist's alphabet chart (`.local/bocas_fonemas.jpg`, not committed): per letter, opening shape, width, teeth and tongue as the chart shows them.
- The definitive reference is her photo set, one photo per letter: [articulemas.md](articulemas.md). Where the chart and the photos disagree, the photos win.
- `soundsOf(viseme)` lists a viseme's sounds.
- The same file exports `SMILE_SHAPE`, a closed, wide-corners idle look. It is not a viseme and never appears in `SHAPES` — `REST` stays "closed, neutral" because it also plays mid-utterance, between words. `useArticulation`'s `idleShape` option shows `SMILE_SHAPE` only while the player isn't playing, eased in and out over `IDLE_BLEND_MS` (150 ms) by `useIdleWeight`; see [ui.md](ui.md)'s Player section.
- No instant mouth change, anywhere: between sounds the crossfade meets at weight 0.5 on each boundary; into and out of idle `useIdleWeight` eases; every drawn part grows from zero or fades by opacity. `mouth.test.ts` samples whole words at 1 ms and fails on any step of 0.1 or more.

| Parameter    | 0                                      | 1                                                                                               |
| :----------- | :------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `open`       | Lips touching, mouth closed            | Opening as tall as `/a/`                                                                        |
| `width`      | Lips pursed, corners drawn in          | Corners pulled wide, as in `/i/`                                                                |
| `round`      | Opening is a lens with pointed corners | Opening is an ellipse; lips fuller                                                              |
| `cornerLift` | Neutral corners (−1 turns them down)   | Corners raised                                                                                  |
| `upperLip`   | Thin upper lip                         | Full upper lip                                                                                  |
| `lowerLip`   | Thin lower lip                         | Full lower lip                                                                                  |
| `upperTeeth` | Upper teeth hidden                     | Upper teeth fully exposed                                                                       |
| `lowerTeeth` | Lower teeth hidden                     | Lower teeth fully exposed                                                                       |
| `tongueLow`  | —                                      | Tongue lying low in the opening (`/a/`, `/e/`)                                                  |
| `tongueUp`   | —                                      | Tongue raised, seen from below with its frenulum; width grows with it (`/l/` `/n/` `/ɾ/` `/r/`) |
| `tongueOut`  | —                                      | Tongue between the teeth; past 0.6 it rests on the lower lip (`/t/` < `/d/` < `/θ/`)            |
| `tongueBack` | —                                      | Tongue body bunched in the opening (`/k/`)                                                      |
| `lipTuck`    | Lower lip in its normal position       | Lower lip rolled under the upper teeth (`/f/`)                                                  |
| `press`      | Lips resting against each other        | Lips pressed, vermilion thinned, seam sharpened                                                 |
| `puff`       | —                                      | Cheeks held with air, drawn as arcs bending toward the mouth (`/p/`)                            |
| `creases`    | —                                      | Pressure lines across the lips (`/p/` `/b/` `/m/`)                                              |
| `trill`      | —                                      | Raised tongue tip vibrates (`/r/`)                                                              |
| `nasal`      | —                                      | Air lines out of the nose (`/m/` `/n/` `/ɲ/`)                                                   |
| `airflow`    | —                                      | Air lines below the lips (`/f/` `/s/` `/r/` `/b/` `/tʃ/` `/θ/`)                                 |

- `creases`, `nasal` and `airflow` copy the chart's annotations, not anatomy: drawn marks, faded in by their value. `nasal` sits where the face's nostrils are, so it reads as air from the nose on the face and above the lips on the bare mouth.
- Games fade the air marks (`nasal`, `airflow`) to 0.35 through `Face`'s `airOpacity`: at full strength they give the answer away. `/debug` and `FORMAS DE LA BOCA` keep them at full strength, as reference.
- `trill` is the one moving part: an SVG `animateTransform` on the raised tongue, so it vibrates without React re-rendering.

- `src/lib/presentation/mouth/geometry.ts` — parameters to SVG paths, written with a `path` template tag that formats the numbers. Overlays (seam, cheeks, creases, air) are one `Mark` type: a path and an opacity. The opening is its own shape, independent of the lips' outline: two cubic edges that run from a lens (spread sounds) to an ellipse (rounded ones). Teeth are bands with tooth gaps, clipped to the opening; the four tongue parameters each draw their own shape and grow with their value, so a tongue moves in and out instead of popping. Pure, no React.
- Widths are deliberately modest: only `/i/` `/e/` `/ʝ/` are wide on the chart. `/s/` is fuller and pushed forward ("más morros"), not wide; it stays wider than `/tʃ/`. A mouth tuned wide everywhere was the main complaint of the first speech-therapist review.
- The mouth is drawn as two lips with a seam between them, not one band. A closed mouth is otherwise indistinguishable from a pressed one: `/m/` differs from rest by compression, which shows as a thinner vermilion and a sharper mouth line, and that needs a seam to show at all.
- `src/lib/domain/mouth/index.ts` — `shapeAt(timeline, elapsedMs)` reuses the crossfade weights from `src/lib/domain/crossfade/` and blends parameters instead of opacities.
- The blend straddles each boundary rather than following it: half the movement happens in the outgoing block, half in the incoming one, so a posture is whole in the middle of its own block. Starting the blend at the boundary makes the mouth lag the timeline by half a transition.
- `src/components/mouth-art.tsx` — draws it: cavity, tongue, teeth, lips with an outline, seam, cheek arcs. `parametric-mouth.tsx` wraps it in its own `<svg>`; its `viewBox` prop crops in for thumbnails.
- Values were redrawn after the first speech-therapist review, against her chart, then corrected after her second (29-09) and third (06-10) reviews against [articulemas.md](articulemas.md). Not yet re-reviewed by her.
- Third review (06-10): `/d/` tongue a full-width band between both rows of teeth; `/l/` tongue narrower than `/n/`, side gaps left dark; `/r/` tongue at the top; `/s/` thin lips, marked corners; `/i/` the widest smile, corners lifted; `/k/` spread and open with both rows of teeth (letter X = /k/ + /s/). `/ɲ/` already carries `nasal` 1, the maximum.
- `tongueOut` is drawn behind the teeth, so the gap between the rows sets how much shows: a thin line for `/t/`, a band for `/d/`. Past 0.6 the tongue comes out of the opening as one piece and drapes over the lower lip, under the upper lip (`/θ/`); it grows from nothing at 0.6, so it slides out instead of appearing. The band between the teeth is capped in thickness and rests on the lower teeth; uncapped, a blend from `/θ/` into an open vowel filled the mouth with tongue.
- Cheek arcs bend toward the mouth. Bent away they read as smile lines.
- Below `open` 0.15 the opening narrows toward the centre, so nearly closed lips part in the middle first (`/b/`).
- Rounded, narrow shapes pucker: the opening shrinks toward a circle as `round` nears 1 and `width` nears 0 (`/u/`).

## Reviewing the shapes

Anyone reviewing the numbers has to be told four things, or the corrections come back wrong:

- The target is a speech therapist demonstrating, not conversational speech. Clear beats natural.
- Phonemes sharing a viseme are meant to look identical. That is the inventory, not a defect to fix.
- Different visemes must be distinguishable head-on, looking only at the mouth.
- Protrusion can only be suggested — width, lip thickness and shading — because the drawing has no depth.

## The face

- `src/components/face.tsx` — a vector face drawn in code, modelled on `assets/models/woman-animated.jpeg`. Head, hair with a wrapped bun, ears with gold studs, brows, eyes, nose, neck and shirt, with gradient shading and a dark outline.
- Symmetric parts (ears, brows, nostrils, hair strands, collar, cheek shading) are drawn once and mirrored by `BothSides`; edit the left side only.
- The shadow under the chin is a gradient over the neck that fades downward. A solid band there read as a necklace.
- Proportions are measured off the model, not eyeballed. Landmarks as a fraction of hairline→chin height: brow 0.32, eye 0.46, nose base 0.66, mouth 0.79, widest 0.53, hair top −0.20, bun centre −0.30.
- Face width is drawn at 0.82 × that height, not the measured 1.03. Twice the measured width read as a circle. Trust the eye over the tape here: the landmark _positions_ transfer from the model, the width does not. The outline also runs concave between cheekbone and jaw — one convex oval reads round however narrow it is.
- The brow's inner end must not sit lower than its outer end. That single detail is what made earlier versions look angry.
- `MOUTH_SCALE` shrinks the mouth to 0.76 inside the face. The shape table is sized for the clinical close-up; at face scale it reads oversized, `I` worst.
- To re-measure: `sips -s format bmp` the model, decode the BMP in Python, scan rows for the silhouette and skin edges. Verify by overlaying the rendered SVG on the model at matched scale.
- **Its quality is unresolved.** Matching the measured proportions did not make it look right; what is missing is drawing craft — varied line weight, hair built from overlapping locks rather than a filled blob. Proportions are measurable, craft is not. Treat a full redraw as needing an illustrator, not another pass.
- `src/components/mouth-art.tsx` holds the mouth drawing as a bare `<g>`, so it nests inside the face with a transform. `parametric-mouth.tsx` is the same art wrapped in its own `<svg>` for the tuner and the legend.
- The chin drops with `jaw`, and the mouth shifts down slightly with it. Everything else is static.
- `alive` gates all idle liveliness — the CSS blink and the pointer-follow gaze. Default off: the face is a still drawing. Only an active game passes it (`/juegos/<slug>`, and `/debug`); `INICIO` and the `JUEGOS` catalogue cards render a dead-still face.
- With `alive` on: the eyes follow the pointer while idle, each computing its own angle so the gaze converges, and the eyes blink. `speaking` then centres them and detaches the listener: during playback the face looks straight ahead, only the mouth moving (the blink continues), so the avatar is still until the learner presses play.
- Gaze deflection is capped at ±6 horizontally and ±3 vertically, and reaches full travel 130 units from the eye. Push it further and the iris leaves the lid.
- Prohibit cheek highlights, blush, and creases at the mouth corners. The first two read as makeup; the third reads as wrinkles. Both were tried and rejected.
- Prohibit drawing this mouth over a photographed face. The mismatch is uncanny and neither half fixes it.
- `/debug` toggles between the face and the bare mouth. Tune shapes on the bare mouth, judge them on the face.

## Photographic stills: tried twice, abandoned twice

- Both attempts died producing the images, never on the code. 2a: whole-face generation drifted, and image models would not hold `/f/` apart from `/s/` and `/m/`. Second attempt: inpainting one fixed base removed head drift by construction, and producing thirteen usable mouth edits was still impractical.
- A working crossfade player existed and was deleted with the base photo. `layersAt` still returns the two weighted layers such a player needs, so rebuilding it is small.
- Do not start a third attempt without new image tooling. The obstacle is asset production, and it has not moved.

## 3D: tried once, abandoned

- A procedural three.js head (face built from math functions, 3D lips, teeth, tongue) was built on `/debug` and dropped. Photoreal and then cartoon styling both looked wrong: a face modelled in code cannot reach the quality of a sculpted, rigged character.
- Do not restart it in code. A 3D or richer 2D character needs artist-made assets (a sculpted rig, or an illustrator's drawing driven by numbers, e.g. Rive), fed by the same per-sound table.

## Risks

1. **Protrusion is a depth cue and this is a head-on 2D drawing.** `O` `U` and `ch` push the lips forward, which the drawing can only suggest. `round` (fuller lips, elliptic opening) and narrow `width` are the stand-in. Still the most likely place for a false merge.
2. **Transfer to real faces is unproven.** A stylized mouth may teach cues that do not carry to a real speaker. A question for the speech therapist, and the strongest argument for eventually offering a photographed or 3D mode as well.
3. **Shapes must stay mutually distinguishable** as they are tuned. Changing one sound's set can collapse it into a neighbour; check the whole alphabet panel on `/debug` after edits.
4. **Velars show the tongue, not the lips.** What separates /k/ /ɡ/ /x/ is the tongue body (`tongueBack`) and the opening. /ɡ/ /x/ /k/ follow their photos (open oval with a humped tongue; spread with both rows of teeth). The therapist's photos override the vowel-copy rule in [visemes.md](visemes.md) for /k/. See [visemes.md](visemes.md).
