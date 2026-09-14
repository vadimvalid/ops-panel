# ops-panel

Admin/operations panel. Vue 3 + TypeScript SPA, no backend in this repo —
the API is consumed over REST with JWT auth.

## Commands

```sh
npm run dev                 # dev server on :5173
npm run build               # type-check + production build
npm run test:unit -- --run  # single pass; bare `test:unit` watches
npm run type-check          # vue-tsc only
npm run lint                # oxlint + eslint, autofixing
npm run format              # prettier over src/
```

Before handing over any task, all four must pass: `type-check`, `lint`,
`test:unit -- --run`, `build`.

## Architecture

```
src/
  assets/      global CSS, design tokens
  components/  shared components; ui/ holds the primitives
  composables/ reusable composition functions
  layouts/     page shells
  lib/         framework-agnostic helpers (http client, ...)
  mocks/       MSW handlers
  router/      route definitions
  stores/      Pinia stores
  types/       shared TypeScript types
  views/       route-level components
```

**All HTTP goes through `src/lib/http.ts`.** It attaches the JWT and
normalises every failure into an `ApiError` (`{ status, message, fields? }`).
Never call `axios` directly from a component or store — views render error
state from `ApiError` without knowing the transport.

**Design tokens live in `src/assets/main.css`.** Semantic surface variables
(`canvas`, `surface`, `ink`, `line`, `brand-*`) flip with the theme. Use them
instead of literal colours so theming stays in one place.

## Conventions

See `.claude/rules/` for the full set:

- `vue.md` — component authoring, composables, props/emits
- `state.md` — Pinia stores, when state belongs in a store vs a component
- `styling.md` — Tailwind and token usage
- `api.md` — HTTP, error handling, UX states
- `testing.md` — what to test and how
- `git.md` — branches, commits, merges

## Workflow

Every feature ships on its own branch, merges to `main` after verification,
then pushes. Branch names: `feat/`, `fix/`, `chore/`, `refactor/`.

## Environment notes

- **Node 26** defines a `localStorage` global that throws without
  `--localstorage-file` and shadows the jsdom one. `src/__tests__/setup.ts`
  shims it. Don't "fix" storage code to work around test failures — check the
  shim first.
- **Tailwind v4** has no `tailwind.config.js`. Configuration is the
  `@theme` block in `src/assets/main.css` and the Vite plugin.
- `oxlint` and `eslint-plugin-oxlint` versions must stay in lockstep (both
  ~1.82) or `npm install` fails on a peer conflict.

## Tooling

Plugins are enabled per-project in `.claude/settings.json`:

- **playwright** — drive a real browser. Use it to verify UI work at mobile
  and desktop widths instead of assuming a change renders correctly.
- **context7** — fetch current docs for Vue 3, Tailwind v4, Pinia and the rest
  of the stack. Prefer it over recalling API details from memory; several of
  these libraries had breaking changes in their latest majors.
- **frontend-design** — guidance for building polished, non-generic UI.
- **pr-review-toolkit** — review agents for tests, error handling and types.
- **superpowers** — brainstorming, TDD and systematic debugging workflows.

Figma is available through the account-level MCP connector for reading
designs, components and tokens.
