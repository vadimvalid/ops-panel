# Styling

## Tokens first

- Colours come from the semantic tokens in `src/assets/main.css`:
  `canvas`, `surface`, `surface-muted`, `line`, `ink`, `ink-muted`, `brand-*`.
- Never hard-code a hex value or a raw Tailwind palette step (`bg-slate-700`)
  in a component. If a shade is missing, add a token — don't inline it.
- Dark mode comes free when you use tokens. Verify both themes.

## Tailwind v4

- No `tailwind.config.js`. Configuration is the `@theme` block in
  `src/assets/main.css`, loaded through `@tailwindcss/vite`.
- Utilities in the template. Don't write custom CSS for something a utility
  already does.
- `@apply` is a last resort — it reintroduces the indirection utilities exist
  to remove. Extract a component instead.
- Repeated utility strings mean a missing component, not a missing CSS class.

## Responsive, mobile-first

- Base styles target small screens; add `sm:` `md:` `lg:` upward. Never write
  a desktop layout and patch it with `max-*` breakpoints.
- Tables need a plan below `md`: horizontal scroll in a wrapper, or a card
  layout. A table that overflows the viewport is a bug.
- Tap targets at least 44x44px.
- Check 360px, 768px and 1280px before calling a screen done.

## Flowbite

- Use Flowbite markup patterns for common widgets rather than reinventing
  them, but wrap them in our own component in `components/ui/` so the rest of
  the app depends on our API, not Flowbite's.
- Flowbite's interactive JS is optional — prefer Vue state over its data
  attributes for anything we already control.

## Consistency

- Spacing on the Tailwind scale. No arbitrary `p-[13px]` without a reason.
- One radius token for cards (`rounded-card`), consistent across surfaces.
- Transitions are short (150–200ms) and respect `prefers-reduced-motion`,
  which the base stylesheet already handles globally.
