# UI

> **Maintenance Invariant:** One fact per line. Shell, theme and screen anatomy only — no game rules (those live in [games.md](games.md)), no pipeline (that lives in [architecture.md](architecture.md)). Update in the SAME commit as any change to the shell, the theme tokens or a screen's anatomy.
> **Answers:** What does the product look like, what are the theme tokens, what does each screen contain?
> **Design reference:** `.local/vilabia-design.jpeg` (a game screen), `.local/juegos.jpeg` (the `JUEGOS` catalogue portal) and `.local/Inicio.jpeg` (the `INICIO` screen), all untracked, `.local` is gitignored. The screenshots are the spec; this page is its readable form.

## Target

- Tablet landscape first. The design is drawn at 1408×768.
- Desktop widens the main column; the sidebar width is fixed. The whole shell caps at 1440px (`max-w-360`) and centers, so it never stretches to the full width of an ultra-wide screen. All four product routes share one `src/app/(product)/layout.tsx` — there is exactly one shell, not a per-page copy.
- A screen's own content must fill that main column, not add a second, narrower cap of its own (no per-screen `max-w-*` on top of the shell's). `INICIO`'s hero and `JUEGOS`'s stage row both go edge to edge of the main column for this reason — a screen that stopped short would look narrower than the others even though the shell is identical, which is exactly the bug a stray `max-w-3xl` caused once already.
- The shell carries `w-full` alongside `mx-auto max-w-360`. It is a flex item of `body` (`flex flex-col`), and per flexbox an item with an auto cross-axis margin never gets `align-self: stretch` — without an explicit width it sizes to fit-content, so each route ends up as wide as its own content and `JUEGOS`, `PROGRESO` and `MI PERFIL` render narrower than `INICIO`.
- `html { scrollbar-gutter: stable }` in `globals.css` — without it, a page tall enough to scroll gets a scrollbar the others don't, narrowing the viewport by its width and visibly shifting the centered shell (sidebar included) sideways between routes.
- Responsive down to phone. Shell is `flex-col` below `md`, `flex-row` from `md`; padding `p-3 sm:p-6`. Below `md` the sidebar is a full-width top bar — wordmark left, hamburger button right (`MenuIcon`/`CloseIcon`, `md:hidden`) — and the nav list is collapsed (`hidden`) until toggled, then stacks vertically; tapping a link closes it. From `md` it is the fixed `w-64` left column with the list always shown and the hamburger gone. `Sidebar` owns the open/closed `useState`.
- Single light theme. No dark mode — the palette is the product's identity, and a dark inversion was never designed.
- Copy is Spanish, hardcoded, same rule as `/debug`. No i18n framework.

## Palette

Sampled from the design reference. Values are decisions, not approximations of a screenshot. `src/app/globals.css` `@theme` is the only copy of the hex values — Tailwind derives a utility per token (`--color-brand` → `bg-brand`/`text-brand`/`border-brand`, etc.).

| Token                  | Used for                                                                  |
| :--------------------- | :------------------------------------------------------------------------ |
| `--color-canvas`       | Page background behind the sidebar and every screen.                      |
| `--color-surface`      | Sidebar, cards, stage frame, pills.                                       |
| `--color-panel`        | Settings panel body.                                                      |
| `--color-edge`         | Panel header band, hairlines, card borders.                               |
| `--color-brand`        | Active nav pill, slider fill, play ring, focus ring.                      |
| `--color-brand-deep`   | Hover and pressed states of `--color-brand`.                              |
| `--color-ink`          | Primary text, icons, the wordmark.                                        |
| `--color-ink-soft`     | Labels, slider legends, secondary text.                                   |
| `--color-stage`        | Centre of the game stage's radial wash (behind the avatar).               |
| `--color-stage-edge`   | Outer stop of that wash. Derived — a deeper `--color-stage`.              |
| `--color-tile`         | Tile of the 1st unanswered word card (also `JUEGOS` card preview panel).  |
| `--color-card-2/3/4`   | Tiles of the 2nd–4th unanswered word cards, one light tint each. Derived. |
| `--color-correct`      | Fill of the correct card.                                                 |
| `--color-correct-edge` | Border, ring and check badge of the correct card.                         |
| `--color-correct-ink`  | Label of the correct card.                                                |
| `--color-wrong`        | Fill of a wrong pick. Derived — absent from the design.                   |
| `--color-wrong-edge`   | Border of a wrong pick. Derived.                                          |
| `--color-wrong-ink`    | Label of a wrong pick. Derived.                                           |
| `--color-hero`         | `INICIO` hero panel background.                                           |

- The three `wrong` tokens, `--color-hero`, `--color-stage-edge` and `--color-card-2/3/4` are the invented colours. The design never shows a wrong answer, `--color-hero` is sampled from `Inicio.jpeg` by eye, `--color-stage-edge` is a deeper `--color-stage` for the radial wash, and the `card` tints sit beside `--color-tile`; Julio reviews them on first render.
- The four idle cards each take a tint by position (`--color-tile`, then `--color-card-2/3/4`). One tint is green-ish, so the correct card is not told apart by colour alone — it is also lifted (scale, ring, `shadow-xl`, `font-black` label). See the word card anatomy.
- The logo `Mark` also uses a lip red (`#e2504d` / `#b23a3b` shadow) and a pale bubble fill (`#eaf6f6`), inlined in `wordmark.tsx` / `icon.svg`, not `@theme` tokens — from Julio's reference art, pending his review.

## Shell

- Two columns: fixed sidebar left, scrolling main right on `--color-canvas`.
- Sidebar is `--color-surface`, full height, rounded outer corners, no border.
- Sidebar top: the Vilabia wordmark — `Mark` (a teal "V" whose two strokes converge on a red lip shape, with a small speech-bubble-with-dots top-right) plus "Vilabia" in `--color-ink`. `Mark` and `src/components/wordmark.tsx` live together; `src/app/icon.svg` is the standalone favicon (the `Mark` alone) and must be kept visually in sync by hand — there is no shared source.
- Sidebar nav, in order: `INICIO`, `FORMAS`, `JUEGOS`, `PROGRESO`, `MI PERFIL`. Icon left, uppercase label right.
- Active item is a filled `--color-brand` pill spanning the sidebar's inner width; its icon and label go white.
- Inactive item is transparent with `--color-ink` icon and label.
- `PROGRESO` and `MI PERFIL` are deactivated: rendered as non-interactive `<span>` (not `Link`), `aria-disabled`, `text-ink-soft/50`, `cursor-not-allowed`, `title="Disponible próximamente"`. Their screens still exist and still carry `robots: { index: false }`.
- Product shell footer: one centered line under `<main>`, `text-xs text-ink-soft`, "Creado por Julio César Martín" linking to `https://x.com/depre_cuba` (new tab, `rel="noopener noreferrer"`).
- `AJUSTES` — from `md` up, a white pill button in the top-right of the main column (`SettingsPill`, `hidden md:flex`), present on every screen. Below `md` that pill is hidden and `AJUSTES` shows instead as the last item of the collapsible sidebar nav (`md:hidden`, `GearIcon`). Deactivated in both places: `disabled` / `aria-disabled`, `text-ink-soft/50`, `cursor-not-allowed`, `title="Disponible próximamente"` — same treatment as the deactivated nav items.
- `/debug` keeps its own bare layout and never renders this shell.

## Screens

| Route                | Nav item    | State                                                                                                    |
| :------------------- | :---------- | :------------------------------------------------------------------------------------------------------- |
| `/`                  | `INICIO`    | Marketing entry point: headline, hero player demo, three benefit cards, link to `JUEGOS`.                |
| `/formas-de-la-boca` | `FORMAS`    | Public reference: the full alphabet, each letter's mouth shapes, for beginners. See anatomy below.       |
| `/juegos`            | `JUEGOS`    | Catalogue portal: one card per game in `GAMES`, each linking to its own route.                           |
| `/juegos/<slug>`     | `JUEGOS`    | One game's screen, keyed by slug. Five built games. See [games.md](games.md).                            |
| `/progreso`          | `PROGRESO`  | Blank placeholder, `noindex`. Nav item deactivated — reachable only by direct URL. Metrics unspecified.  |
| `/perfil`            | `MI PERFIL` | Blank placeholder, `noindex`. Nav item deactivated — reachable only by direct URL. Identity unspecified. |
| `/debug`             | —           | Library tester, dev-only, outside the shell.                                                             |

- A blank placeholder renders the shell, the screen title and nothing else. It is not a "coming soon" screen.
- `JUEGOS` is the portal, active for `/juegos` and every `/juegos/<slug>`.

## Player

`src/components/player.tsx` — the one interaction shell every avatar player uses (`/debug` and each `/juegos/<slug>` game). Renders its children (the `Face` or `ParametricMouth`) inside a `<button>` so the whole stage is a single click target; a caller never builds its own separate click-to-play region. `INICIO` and the `JUEGOS` catalogue cards render a bare static `Face` with no `Player` — there is no play button outside a game.

- Clicking anywhere on the player toggles play/pause — the caller supplies `playing` and `onToggle`, backed by the same `useArticulation`/`usePlayback` (`src/components/articulation.ts`, `playback.ts`) everywhere. The stage `<button>` keeps the default cursor; only the two round controls — the play icon (while paused) and the mute toggle — show `cursor-pointer`.
- Always overlays a translucent circular play icon (`bg-white/75`, `--color-brand` ring), fixed top-left with a small margin from the stage's edge — the same position on every screen, not customizable per caller. It fades to fully transparent while `playing` and fades back in on pause or at the end.
- `min-w-72 min-h-72` (288px) on the button itself, so the icon always has room and never sits in front of the avatar's face regardless of how small a caller's content is. The game and `/debug` render bigger content and just go past it.
- `/debug` also keeps its own labelled "Hablar/Pausa" button and a timeline scrubber below the stage, for explicit state and seeking — those are additions on top of `Player`, not a replacement for its icon.
- Sound is an option on `useArticulation`, not a prop on `Player`: a caller that passes `voice` is spoken, one that omits it is silent. Only `/debug` passes it today. See [voice.md](voice.md).
- `Player` takes `silenced`, and draws a struck-through speaker top-right (mirroring the play icon, but always visible) when a caller asked for a voice that will not be heard — no Spanish voice installed, or a clip outside what the engine can stretch to. `useArticulation` computes it; a caller passes it straight through.
- `Player` takes `muted` + `onMuteToggle`. With `onMuteToggle` it renders a mute toggle top-right instead of the standalone `silenced` indicator, same size and treatment as the play icon, visible while playing: `SoundIcon` unmuted, `MuteIcon` when `muted` or `silenced`, `silenced` reason on its `title`. The learner's mute; backed by `useMuted` in `src/components/voice.ts`. Caller omits `onMuteToggle` where `speechSynthesis` is absent. See [voice.md](voice.md).
- Idle look: `src/lib/domain/mouth/shape.ts` exports `SMILE_SHAPE`, a closed, wide-corners shape distinct from the `REST` viseme (`REST` stays "closed, neutral" per [visemes.md](visemes.md) — it is also the mid-utterance pause shape, and must not become a smile). `useArticulation`'s `idleShape` option eases to `SMILE_SHAPE` whenever `playing` is false, and back when it starts (150 ms, never a cut); the game passes it, `/debug` omits it so the tester keeps showing the pipeline's real rest shape. `INICIO` and the catalogue cards render `SMILE_SHAPE` on a static `Face` directly, no `useArticulation`.

## INICIO anatomy

Top to bottom inside the main column:

1. Headline and one-line subcopy, left-aligned, `--color-ink` / `--color-ink-soft`.
2. Hero panel — a wide rounded `--color-hero` card. Decorative line icons (clock, sound wave, hearing aid, child face, chat bubble) are fixed dressing, not interactive — positioned relative to the panel's horizontal center (`left-1/2` plus a `translate-x`), clustered close around the avatar, not pinned to the panel's outer edges.
3. The avatar, centered in the hero panel. Static: a still `Face` in `SMILE_SHAPE`, no `Player`, no play icon, no autoplay, no voice, not `alive`. It never moves on this screen.
4. Caption bubble — a small `--color-surface` speech bubble beside the avatar, always showing the full greeting "Hola, bienvenido". Static text, bespoke to this screen (inline in `welcome-player.tsx`), not the `JUEGOS` card layout.
5. `¡EMPEZAR A PRACTICAR!` — a `--color-brand` pill straddling the hero panel's bottom edge, linking to `JUEGOS`.
6. Three benefit cards below, `--color-surface`, each with a small icon pair, a bold uppercase title and one line of body copy.
7. "Por qué leer los labios importa tanto" — a `--color-surface` card, one `h2` plus four `--color-ink-soft` paragraphs on why lipreading matters for deaf/hard-of-hearing people, that it complements sign language / hearing aids / cochlear implants, and that it is a complement to speech therapy. SEO body copy.
8. "Preguntas frecuentes" — a `<details>`/`<summary>` list (`--color-surface`) from the `FAQ` array, mirrored by a `FAQPage` JSON-LD block. The `/` page emits `WebApplication` + `FAQPage` JSON-LD as one array; the site-wide `Organization` + `WebSite` graph is in `layout.tsx`.

`welcome-player.tsx` is a server component — nothing on this screen is interactive. The play button and the moving avatar live only inside a game.

## FORMAS DE LA BOCA anatomy

- `src/app/(product)/formas-de-la-boca/page.tsx` — public, indexed, server component. SEO `metadata` + a `LearningResource` JSON-LD block. Own left-aligned `h1` (like `/`), not `ScreenTitle`. In the sitemap.
- Beginner reference, letter by letter. Top to bottom: `h1` + subcopy; "Qué lees cuando lees los labios" (`--color-surface` card); "El alfabeto" (`--color-surface` card holding the shared chart); "Las que se confunden de serie" (`--color-surface` card, a `<dl>` of `--color-panel` rows: p·b·m, r·rr, velars, s·z); "Cómo practicar esto" (`--color-hero` card, ordered list + a `--color-brand` pill to `/juegos`).
- The chart is `src/components/alphabet-chart.tsx` (`AlphabetChart`) — the ONE implementation, also on `/debug`. One cell per letter of `ALPHABET` (A–Z, Ñ, CH, LL, RR); each sound of the letter gets a cropped `ParametricMouth` and its `/IPA/`; silent H shows the rest mouth as "muda"; hover text is the viseme's Spanish name and `VISEME_MOUTH`. Static here; `onPick` makes each mouth a button on `/debug`. Styling rides `currentColor` so it sits on either surface. See [visemes.md](visemes.md).

## JUEGOS portal anatomy

- Title `SELECCIÓN DE JUEGOS VILABIA`, centered, uppercase, `--color-ink`.
- A responsive grid of game cards, one per entry in `GAMES` (`src/lib/application/games/index.ts`). Only built games appear — no "próximamente" placeholders.
- Card: `--color-surface`, rounded, drop shadow; game name centered uppercase, a preview panel, one line of tagline, a `--color-brand` `JUGAR` pill bottom-right. The whole card links to `/juegos/<slug>`.
- Preview panel — different per game, drawn in code (`juegos/game-previews.tsx`, keyed by slug): its own tile tint (`--color-tile`, `--color-card-3/2/4`, `--color-hero`), the `Face` frozen on a different sound (`a`, `o`, `e`, `u`, `i`) and a small scene of the game's own move — four word cards with one ✓, syllable bubbles over a sentence, three sentence cards with one ✓, shuffled words falling into numbered slots, a word bag with look-alikes struck out. Decorative (`aria-hidden`). A slug with no preview falls back to the resting `Face` on `--color-tile`; every game in `GAMES` must have one (tested).
- No level or star stats on the card — no progress store exists.
- Each game's screen renders under `/juegos/<slug>` via the `[slug]` route; the slug→component map is `src/app/(product)/juegos/[slug]/screens.ts`, `dynamicParams = false` so an unknown slug 404s.

## ¡Adivina la palabra! anatomy

Top to bottom inside the main column:

1. Title `¡ADIVINA LA PALABRA!`, uppercase, `--color-ink`, centered over the play column (stage and cards), not the whole main column: `juegos/shared/game-heading.tsx` adds a `lg:w-64` spacer matching the settings panel. Every game screen uses it.
2. A two-column row spanning the full main column — same width as every other screen, nothing here is capped narrower. Left column (`lg:flex-1`): the stage, then the card row. Right column: the settings panel, a fixed `lg:w-64`, not absolutely positioned — a normal flex sibling, so it can never overlap the stage. Both columns top-align. Below `lg` the row is `flex-col`: stage, then card row, then the full-width settings panel — the learner reaches the avatar and the cards before the panel.
3. Stage — a wide rounded card filling the left column, holding the player. Background is a `--color-stage`→`--color-stage-edge` radial wash (halo behind the face), hairline `--color-edge` border, soft shadow — a teal zone that the white cards below read against. No bottom padding: the avatar fills the frame and its shoulders meet the bottom edge (`overflow-hidden` clips them to the corners). See [avatar.md](avatar.md).
4. Play button — a translucent white circle with a `--color-brand` ring and a solid triangle, top-left with a margin from the stage's edge (`Player`, see above — same position on every screen). Toggles play/pause; clicking anywhere on the stage does the same. Fades out while playing, back in on pause or at the end. The first manual play arms autoplay: from then on each new round starts itself `AUTOPLAY_DELAY_MS` (1s) after it renders, unless the learner plays it first (`juegos/shared/round-player.tsx`, shared with the sentence games).
5. Settings panel — `CUSTOMIZAR MODELO`, `--color-edge` header band, `--color-panel` body, rounded, `lg:mt-6` to sit a little below the stage's own top edge on the two-column layout.
6. Card row — four word cards under the stage: a `grid`, two columns by default, four across from `xl` (only where the column is wide enough for the longest words). While the cards are still locked, a line above them reads "Para elegir una palabra, primero escucha a la logopeda." (`role="status"`), gone once the word has been played (by the learner or by autoplay).
7. `HABLAR PALABRA` — a white pill with a mic glyph, centered under the main column. Deactivated (`disabled`, `text-ink-soft/50`, `cursor-not-allowed`) — speech input is unbuilt.
8. `Nivel: N` — bottom-right of the main column, `--color-ink`.
9. `Tip` — full-width `--color-panel` hint card at the very bottom, telling the learner the mute mode raises the difficulty.

### Settings panel controls

- `GÉNERO` — a select, avatar identity only. Disabled in the MVP: only `Mujer`.
- `VELOCIDAD` — a slider, current value shown as `x1.00` right-aligned in the label, legend `x0.5 (Lenta) -- x1.0 -- x2.0 (Rápida)`.
- `DIFICULTAD` — a slider, current position shown as `Fácil` / `Media` / `Difícil` right-aligned in the label, legend `Fácil -- Media -- Difícil`.
- Panel controls are per-round and belong to the game. Global settings live behind `AJUSTES`. See [games.md](games.md).

### Word card

- White rounded card, drop shadow (`shadow-md`, `shadow-xl` and a small lift on hover), no border when untouched.
- Inside: a rounded tile panel filling the card, the word centered on it in uppercase. Each of the four cards takes a different light tile tint by position (`--color-tile`, then `--color-card-2/3/4`).
- Text only. The design's illustration sits above the word; there are no illustrations, so the word takes the whole panel. See [games.md](games.md).
- Correct: card and panel go `--color-correct`, border `--color-correct-edge`, label `--color-correct-ink` (`font-black`), a filled check badge on the top-right corner, and the card is lifted above its neighbours — `scale-[1.03]`, `ring-4 ring-correct-edge/30`, `shadow-xl`, `z-10`. Colour alone does not carry it: one idle tint is green-ish.
- Wrong: the `wrong` tokens, no badge. Derived — see the palette note.
- The card is the whole hit target, not the label.
- Locked until the word has played at least once this round — the learner's click or the autoplay both count: dimmed (`opacity-55`), `cursor-not-allowed`, not clickable. Once played, cards answer normally and show `cursor-pointer` on hover. Playing again is not required; re-rolling (Refresh) or a new round re-locks them.

### Refresh

- A refresh control re-rolls the four cards at the current level. It does not change the level and does not count as an answer.
- Placement is unspecified in the design. Nearest free corner of the card row.

## Sentence game anatomy

Frases por sílaba, ¿Qué frase dijo?, Ordena la frase and Construye la frase share one frame (`juegos/shared/sentence-game.tsx`, `SentenceGameLayout`); stage, settings panel and two-column row are the word game's. Rules in [games.md](games.md).

1. Title, uppercase, centered over the play column (`GameHeading`, as in the word game), then ONE plain instruction line in `--color-ink-soft` ("Mira la boca de la logopeda y…"). Written for children: one action per sentence, no jargon.
2. Stage and settings panel as in ¡Adivina la palabra!, same lock line under the stage until the sentence has played.
3. Choice games: four sentence cards stacked in one column at every width (`WordCard` `size="sentence"`: sentence case, `text-lg sm:text-xl`, wraps instead of shrinking). A long sentence never shares a row.
4. Answer line above the cards (`role="status"`): `¡Muy bien!` or "Casi. La frase con ✓ es la que dijo."; idle cards fade to `opacity-40` meanwhile.
5. Frases por sílaba only: a wrapping row of syllable pills above the stage (current one `--color-brand`, `aria-pressed`), the group's full syllables under it in `--color-brand-deep`.
6. Ordena la frase and Construye la frase (one screen, `juegos/shared/word-order-game.tsx`, `WordOrderGame`, configured per game): a `Palabras por frase` row of word-count pills above the stage (same pill style as the syllable picker), then under the stage a white slot tray (dashed `--color-panel` boxes for empty slots, filled slots `--color-brand`-bordered, confirmed ones `--color-correct` with a check), the score line, the word pile in the card tints (placed words leave the pile), then `Borrar` (white pill). No check button: the tray checks itself when its last slot fills. Chips are ≥56px tall for small fingers.
7. Progress line bottom-right (`Nivel: n de N`, or `Sonido n de 21 · Frase k de m`), the `Tip`, then the sentence set's credit in small `--color-ink-soft` text.
8. After the last entry the choice/word area becomes a `--color-correct` panel: check badge, "¡Lo has conseguido!", one line, `VOLVER A EMPEZAR`.
