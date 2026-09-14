# Testing

## What to test

- **Composables and `lib/` helpers** — pure logic, cheapest and highest value.
- **Stores** — actions, derived state, error paths.
- **Components** — behaviour a user can observe: what renders for a given
  state, what a click emits. Not internal refs.

Don't test framework behaviour or chase coverage on trivial markup.

## How

- Vitest + Vue Test Utils, jsdom environment.
- Query by accessible role or text, the way a user finds things — not by CSS
  class, which couples the test to styling.
- Assert on rendered output and emitted events, never on `wrapper.vm`
  internals.
- Mock at the HTTP boundary with MSW, not by stubbing the store — tests then
  cover the real wiring.
- Cover the failure paths: a test suite where every request succeeds proves
  very little.

## Conventions

- Specs sit in `__tests__/` next to the code, named `thing.spec.ts`.
- `describe` names the unit, `it` states behaviour: `it('clears the token
  when set to null')`.
- No shared mutable state between tests; reset in `beforeEach`.
- `npm run test:unit -- --run` for a single pass. Note `--disable-console-
  intercept` if you need `console.log` output while debugging.

## Environment

`src/__tests__/setup.ts` installs an in-memory `localStorage`. Node 26 defines
a global that throws without `--localstorage-file` and shadows jsdom's. If
storage tests fail, look there before changing production code.
