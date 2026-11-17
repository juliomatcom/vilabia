# Conventions

> **Maintenance Invariant:** One fact per line. Update in the SAME commit as any change to scripts, layout, or hard rules.
> **Answers:** Repo layout, stack, scripts, hard rules, definition of done.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4, single app — no monorepo, no workspaces.
- pnpm as package manager (`packageManager` pinned in `package.json`).
- Jest + ts-jest + Testing Library for tests; jsdom environment.
- Prettier + ESLint (`eslint-config-next` + `eslint-config-prettier`).

## Layout

- `src/app/` — routes, layouts, and components used by exactly one route, colocated with it.
- `src/components/` — UI shared across routes. Anything more than one screen renders lives here, never under a route folder.
- `src/lib/` — framework-agnostic code in three layers: `domain/`, `application/`, `presentation/`, one subfolder per concern (e.g. `lib/domain/viseme/`). See [architecture.md](architecture.md)'s Layers. No `next/*` or React imports inside `lib/`.
- `wiki-llm/` — source of truth (this directory). Read `index.md` first, then the one page it names.
- `tasks/` — the roadmap: what to build next, in order. Never source of truth. Prohibit recording facts, tables, parameter values or rationale here; those belong in `wiki-llm/`, and values that live in code are documented by pointing at the code.
- `AGENTS.md` — operational rules for coding agents in this repo.

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start` — Next.js.
- `pnpm typecheck` — `next typegen && tsc --noEmit` (typegen writes the route helper types `tsc` needs on a clean checkout).
- `pnpm lint` — ESLint.
- `pnpm test` — Jest.
- `pnpm format` / `pnpm format:check` — Prettier.

## CI

- `.github/workflows/ci.yml` — runs on push to `main` and every PR.
- One `validate` job: `pnpm install --frozen-lockfile`, then `typecheck`, `lint`, `format:check`, `test`.
- `.github/workflows/deploy.yml` — on push to `main`: `pnpm build`, uploads `out/`, deploys to GitHub Pages.
- All jobs run on `ubuntu-latest` (GitHub-hosted); never `self-hosted` — the repo is public, fork PRs would run on it.

## Deployment

- Static site on GitHub Pages, custom domain `vilabia.es` (set in repo Settings → Pages; DNS points at GitHub).
- `next.config.ts` sets `output: 'export'`; `pnpm build` writes `out/`. No server: no `headers()`, `cookies()`, route handlers.
- Metadata routes (`robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`) set `dynamic = 'force-static'`.
- No `public/` dir; `assets/` is design reference, never shipped.
- Production origin is `https://vilabia.es` — the `NEXT_PUBLIC_SITE_URL` default in code. See `architecture.md` SEO.

## Hard rules

- No raw `console.*` in `src/` outside of intentional server logging.
- No comment that narrates an edit or restates the code; only a true WHY (hidden constraint, external workaround) survives.
- Dependency rule: imports point inward only — app → components → lib/presentation → lib/application → lib/domain. `pnpm lint` enforces it.

## Definition of done

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] `pnpm test` passes.
- [ ] `pnpm format:check` clean.
- [ ] Affected `wiki-llm/` page updated in the same commit, if behavior/stack changed.
