# Vue conventions

## Component authoring

- `<script setup lang="ts">` always. No Options API, no `defineComponent`.
- Order blocks `<script setup>`, `<template>`, `<style scoped>`.
- One component per file, PascalCase filename matching the component name.
- Multi-word names (`UserTable`, not `Table`) — avoids clashing with HTML.
- Prefer no `<style>` block at all; Tailwind utilities cover nearly everything.
  When you do need one, it must be `scoped`.

## Props and emits

- Type props with the generic form, never the runtime object form:
  ```ts
  const props = defineProps<{ userId: string; compact?: boolean }>()
  const emit = defineEmits<{ save: [value: FormData]; cancel: [] }>()
  ```
- Defaults via `withDefaults` or destructuring defaults, not a `default` key.
- Props are readonly. Never mutate one — emit and let the owner change it.
- `v-model` on a component uses `defineModel<T>()`.

## Reactivity

- `ref` for values, `computed` for derived state. Reach for `reactive` only
  when a nested object genuinely needs it — mixing the two confuses readers.
- Never destructure a `reactive` object; it loses reactivity. Use `toRefs`.
- No side effects in `computed` — it must be pure. Use `watch` for effects.
- Prefer `computed` over `watch` for anything derived. A `watch` that only
  assigns to another ref should have been a `computed`.
- `watch` with an explicit source, not a whole object, unless you mean `deep`.
- Clean up every subscription, timer and listener in `onUnmounted`.

## Template

- `v-for` always has a stable `:key` — an id, never the array index when the
  list can reorder or items can be inserted.
- Never `v-if` and `v-for` on the same element. Filter in a `computed`.
- Keep template expressions trivial. Anything with a condition chain or a
  calculation belongs in a `computed`.
- Extract a component when a template block exceeds ~80 lines or repeats.

## Composables

- Reusable logic goes in `src/composables/useThing.ts`, returning refs.
- A composable owns its own cleanup.
- Name them `useX`. Call them at setup top level, never inside a condition,
  loop, or callback.

## Async and lifecycle

- Route-level code splitting: `component: () => import('@/views/X.vue')`.
- Guard against the "component unmounted during await" case before touching
  reactive state after an `await`.
- No `async setup()` without `<Suspense>` — fetch in `onMounted` or a
  composable that exposes `loading`/`error`.

## Accessibility

- Interactive elements are `<button>`/`<a>`, not `<div @click>`. A div needs
  `role`, `tabindex` and keyboard handlers — just use the right element.
- Every input has an associated `<label>`; icon-only buttons get `aria-label`.
- Don't remove focus outlines. The base stylesheet already styles
  `:focus-visible`.
