# Articulemas

> **Maintenance Invariant:** One row per photo in `articulemas/`. Describe only what the photo shows. Update in the SAME commit as any photo added, renamed or replaced.
> **Answers:** What does each Spanish sound look like on a real mouth, per the speech therapist's reference?

## Source

- _Articulemas — Nivel inicial, con color_, Comunicar-Nos (coord. Belinda Haro Castilla, María Blanco Casillas). Licence CC BY-NC-SA: reference only, no commercial use, never shipped in the app. Committed in the public repo under that licence, not the repo's CC BY 4.0 (see `README.md`).
- Sent by the speech therapist as the definitive reference for `SHAPES` (`src/lib/domain/mouth/shape.ts`). Original PDF at `.local/articulemas.pdf`, not committed.
- Photos extracted from the PDF and cropped to the inner frame. File name = letter, lowercase; one file per card.
- Card colour is the PDF's own key: white for vowels, a colour per consonant.

## Photos

| Letter | Sound   | Colour     | Photo                        | What it shows                                                                           |
| :----- | :------ | :--------- | :--------------------------- | :-------------------------------------------------------------------------------------- |
| A      | /a/     | white      | [a.jpg](articulemas/a.jpg)   | Wide open, tall oval; upper teeth; tongue flat and low.                                 |
| E      | /e/     | white      | [e.jpg](articulemas/e.jpg)   | Spread, half open; upper teeth; tongue low behind lower teeth.                          |
| I      | /i/     | white      | [i.jpg](articulemas/i.jpg)   | Wide smile; both rows of teeth nearly touching.                                         |
| O      | /o/     | white      | [o.jpg](articulemas/o.jpg)   | Lips rounded and forward; round opening; tongue low.                                    |
| U      | /u/     | white      | [u.jpg](articulemas/u.jpg)   | Lips pushed far forward, puckered with wrinkles; small round hole.                      |
| B/V    | /b/     | lilac      | [b.jpg](articulemas/b.jpg)   | Lips relaxed, almost closed; small dark hole at the centre.                             |
| CH     | /tʃ/    | cyan       | [ch.jpg](articulemas/ch.jpg) | Lips forward and flared; both rows of teeth clenched, fully shown.                      |
| D      | /d/     | silver     | [d.jpg](articulemas/d.jpg)   | Teeth apart; thick band of tongue between them, full width, inside the lips.            |
| F      | /f/     | red        | [f.jpg](articulemas/f.jpg)   | Upper teeth resting on the lower lip.                                                   |
| G      | /ɡ/     | dark grey  | [g.jpg](articulemas/g.jpg)   | Open oval; upper teeth barely; tongue body humped at the back.                          |
| J      | /x/     | magenta    | [j.jpg](articulemas/j.jpg)   | Open, spread; both rows of teeth; tongue top surface raised, filling the opening.       |
| K/C/Q  | /k/     | light blue | [k.jpg](articulemas/k.jpg)   | Wide open, spread; both rows of teeth fully shown; tongue body at the back.             |
| L      | /l/     | purple     | [l.jpg](articulemas/l.jpg)   | Open; both rows of teeth; tongue tip raised, underside and frenulum across the opening. |
| LL     | /ʝ/ /ʎ/ | yellow     | [ll.jpg](articulemas/ll.jpg) | Wide smile; tongue broad and flat, top surface filling the opening.                     |
| M      | /m/     | orange     | [m.jpg](articulemas/m.jpg)   | Lips closed, relaxed, thin.                                                             |
| N      | /n/     | black      | [n.jpg](articulemas/n.jpg)   | Less open than L; upper teeth barely; tongue underside fills the opening's full width.  |
| Ñ      | /ɲ/     | green      | [ñ.jpg](articulemas/ñ.jpg)   | Wide smile, teeth apart; tongue raised behind the lower teeth.                          |
| P      | /p/     | blue       | [p.jpg](articulemas/p.jpg)   | Lips closed, pressed and pushed forward; wrinkles across the lips.                      |
| R      | /ɾ/     | tan        | [r.jpg](articulemas/r.jpg)   | Half open, spread; both rows of teeth; tongue underside and frenulum between them.      |
| RR     | /r/     | brown      | [rr.jpg](articulemas/rr.jpg) | As R; tongue tip up, underside and frenulum between both rows of teeth.                 |
| S      | /s/     | pink       | [s.jpg](articulemas/s.jpg)   | Lips slightly open; both rows of teeth together.                                        |
| T      | /t/     | lime       | [t.jpg](articulemas/t.jpg)   | Lips spread; teeth almost closed, thin line of tongue between them.                     |
| X      | /ks/    | teal       | [x.jpg](articulemas/x.jpg)   | Spread; teeth slightly apart, tongue tip just visible behind them.                      |
| Z      | /θ/     | mint       | [z.jpg](articulemas/z.jpg)   | Tongue out past the teeth, over the lower lip, full width; upper teeth covered.         |

## Contrasts the photos settle

- /t/ /d/ /θ/ differ by how far the tongue comes out: thin line between the teeth, band between the teeth, out over the lip.
- /p/ /b/ /m/ differ by the lips: pressed and forward, relaxed with a hole, closed and thin.
- /l/ /n/ /ɾ/ /r/ show the raised tongue from below (underside, frenulum), not a dome from above.
