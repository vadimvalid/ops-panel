# State management

## Where state belongs

- **Component `ref`** — UI state only that component cares about: open/closed,
  hovered, the current tab. Most state is this. Start here.
- **Props/emits** — passing to a child, lifting to a shared parent.
- **Pinia store** — server data shared across routes, session/auth, or state
  that must survive navigation. Don't create a store for one component.
- **Route query params** — filters, pagination, sort. These belong in the URL
  so a filtered table is shareable and survives reload.

## Pinia

- Setup syntax, matching the rest of the codebase:
  ```ts
  export const useUsersStore = defineStore('users', () => {
    const items = ref<User[]>([])
    const loading = ref(false)
    const error = ref<ApiError | null>(null)
    const activeCount = computed(() => items.value.filter((u) => u.active).length)
    async function fetch() { /* ... */ }
    return { items, loading, error, activeCount, fetch }
  })
  ```
- One store per domain concept, named `useXStore` in `src/stores/x.ts`.
- Stores hold state and the actions that change it. No DOM access, no router
  navigation inside a store — return a result and let the caller navigate.
- Destructuring a store loses reactivity: use `storeToRefs(store)` for state,
  and take actions off the store directly.
- Every store holding server data tracks `loading` and `error` alongside it,
  so views can render all UX states without extra plumbing.

## Server data

- Don't duplicate server data into component refs — read it from the store.
  A local copy for an edit form is fine; write back through an action.
- Normalise by id when the same entity appears in several places.
- Invalidate or refetch after a mutation rather than patching local state
  optimistically, unless the UX genuinely needs the optimistic update — and
  then roll back on failure.
