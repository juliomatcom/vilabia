<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Vilabia

> **Operational Core:** Rules for all repository agents. Overridden only by explicit user command.
> **Maintenance Invariant:** Updates to this file MUST preserve its token-optimized design. Use strict imperative syntax. Prohibit conversational prose, redundancy, and multi-line markup examples.

## Global Rules

- **Explain Plainly:** State the point first, in plain language. Short sentences. Prefer a short list over a dense paragraph. Cut hedging and restatement.
- **Functional Over Imperative:** Compose small pure functions; prefer `map`/`filter`/`reduce`/`flatMap` over loops with accumulators. Prohibit classes, inheritance, and `this`. Data is immutable — `const`, `readonly`, no mutation of arguments. Use a loop only where it is measurably clearer or faster; justify it in the PR, not in a comment.
- **Dependency Rule:** Imports point inward only: `src/app` → `src/components` → `src/lib/presentation` → `src/lib/application` → `src/lib/domain`. `src/lib/` never imports React or Next. Put computable logic in `lib/` as pure functions; hooks hold only state and timers. `pnpm lint` enforces it; layer map in `wiki-llm/architecture.md`.
- **Code Comments (default: none):** Assume the reader reads code. Write a comment ONLY for a true edge case — a WHY the code cannot express (external bug workaround, non-obvious constraint, deliberately counterintuitive logic). Prohibit comments that narrate an edit, restate the code, or describe what a name already says. When editing a line, delete adjacent obsolete comments.
- **No Raw `console.*`:** Use it only for intentional server-side logging, never left over from debugging.
- **Silent Operations:** Prohibit status chatter or progress narration in commits/PRs. State results, not process.

## 0. Source of Truth: `wiki-llm/`

`wiki-llm/` is the authoritative model of how Vilabia works and the map an agent reads before touching code.

- **Wiki First:** To answer any architectural or operational question, read `wiki-llm/index.md`, then open ONLY the page it names. `tasks/` holds the roadmap and nothing else — never record facts or rationale there. Do this BEFORE open-ended grep. Drop to source only when no page covers the question or the page is demonstrably stale (then fix the page).
- **Update-On-Change:** Update the affected `wiki-llm/` page in the SAME commit as any change to the pipeline, module boundaries, route structure, stack, or scripts. New page → add its `index.md` row. Prohibit orphan pages.
- **Authoring Standard:** Telegraphic, imperative, one fact per line. No narrative prose, no rule repeated across pages, no multi-line mock examples.

## 1. Definition of Done

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] `pnpm test` passes (tests colocated as `*.test.ts`/`*.test.tsx`).
- [ ] `pnpm format:check` clean (or run `pnpm format` before committing).
- [ ] Affected `wiki-llm/` page updated in the same commit, per §0.
- [ ] No new comment except a true edge-case WHY; none narrating a fix or restating code.
