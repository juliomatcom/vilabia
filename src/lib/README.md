# lib/

Framework-agnostic code, in three layers. Imports point inward only: `presentation` → `application` → `domain`.

- `domain/` — Spanish speech and mouth rules: `g2p`, `viseme`, `timing`, `crossfade`, `mouth`, `words`.
- `application/` — what the product does with them: `articulation`, `games`, `speech`.
- `presentation/` — domain data made drawable or readable: `mouth` (SVG geometry, CSV), `labels`.

No React or Next imports anywhere here; `src/components/` and `src/app/` are the callers. Import via `@/lib/<layer>/<module>`. Each module colocates its tests (`*.test.ts`). `pnpm lint` enforces the direction. Layer map: `wiki-llm/architecture.md`.
