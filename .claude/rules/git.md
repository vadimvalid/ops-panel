# Git workflow

## Branches

- One feature per branch, off `main`: `feat/`, `fix/`, `chore/`, `refactor/`.
- Short, descriptive names: `feat/users-table`, not `feat/new-stuff`.

## Before merging

All four must pass:

```sh
npm run type-check
npm run lint
npm run test:unit -- --run
npm run build
```

Check the change in the browser at mobile and desktop widths when it touches UI.

## Commits

- Imperative subject under ~70 chars, `type: summary`.
- Body explains **why**, not what the diff already shows. Note anything
  surprising — a workaround, a version pin, a deliberate trade-off.
- Don't commit `dist/`, `.env`, or `node_modules` (all gitignored).

## Merging

- Merge to `main` with `--no-ff` so the feature's history stays visible.
- Push after merging.
- Don't commit directly to `main`.
