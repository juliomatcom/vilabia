# Vilabia

[![CI](https://github.com/juliomatcom/vilabia/actions/workflows/ci.yml/badge.svg)](https://github.com/juliomatcom/vilabia/actions/workflows/ci.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/license-CC%20BY%204.0-lightgrey.svg)](LICENSE)

Free lipreading exercises in Spanish, at [vilabia.com](https://vilabia.com). An animated avatar says a word or a sentence without sound cues; you read its lips and answer. Built as a support tool for speech therapy and for people with hearing loss.

Text goes in, a timed sequence of visemes (mouth shapes) comes out, and a vector face articulates it. Everything runs in the browser.

## Run it locally

Needs Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The developer tool is at `/debug` (dev server only).

## Scripts

- `pnpm dev` — dev server.
- `pnpm build` — static export to `out/`.
- `pnpm typecheck` / `pnpm lint` / `pnpm test` / `pnpm format:check` — the checks CI runs.

## Deployment

Static site on GitHub Pages. Every push to `main` runs [`deploy.yml`](.github/workflows/deploy.yml), which builds and publishes `out/`.

## How it works

Architecture, conventions and domain notes live in [`wiki-llm/`](wiki-llm/index.md), starting at its index. [`AGENTS.md`](AGENTS.md) holds the rules for AI coding agents working in this repo.

## Contributing

Issues and pull requests are welcome. Run the four checks above before opening a PR.

## License

Code, texts, word and phrase lists: [CC BY 4.0](LICENSE). Reuse them freely, with attribution to Vilabia.

Exceptions:

- `wiki-llm/articulemas/*.jpg` come from _Articulemas — Nivel inicial, con color_ (Comunicar-Nos; coord. Belinda Haro Castilla, María Blanco Casillas), licensed CC BY-NC-SA. They are a reference only and are not part of the site.
- Third-party packages keep their own licenses.
