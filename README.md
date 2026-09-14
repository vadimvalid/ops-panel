# ops-panel

Admin/operations panel built with Vue 3.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Vue 3 (`<script setup>`), TypeScript |
| Routing / state | Vue Router, Pinia |
| Build | Vite |
| Styling | Tailwind CSS v4, Flowbite |
| HTTP | Axios (JWT interceptor, normalised errors) |
| Charts / dates | Chart.js via vue-chartjs, date-fns |
| Tests | Vitest, Vue Test Utils, jsdom |
| API mocks | MSW |
| Quality | ESLint, oxlint, Prettier, vue-tsc |

## Getting started

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` to point the app at a different API base URL.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm run test:unit` | Unit tests (append `-- --run` for a single pass) |
| `npm run type-check` | `vue-tsc` only |
| `npm run lint` | oxlint + ESLint, autofixing |
| `npm run format` | Prettier over `src/` |

## Layout

```
src/
  assets/      global CSS and design tokens
  components/  shared components (ui/ holds the primitives)
  composables/ reusable composition functions
  layouts/     page shells
  lib/         framework-agnostic helpers (http client, ...)
  mocks/       MSW handlers
  router/      route definitions
  stores/      Pinia stores
  types/       shared TypeScript types
  views/       route-level components
```

## Conventions

- Design tokens live in `src/assets/main.css`. Components use semantic
  utilities rather than hard-coded colours so theming stays in one place.
- All HTTP goes through `src/lib/http.ts`, which attaches the JWT and
  normalises failures into an `ApiError` for views to render.
- Every feature ships on its own branch and merges to `main` after review.

## Notes

`src/__tests__/setup.ts` installs an in-memory `localStorage`. Node 26 defines
its own global that throws without `--localstorage-file` and shadows the one
jsdom provides; the shim keeps storage code paths testable.
