import { computed, watch, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface TableQueryOptions {
  /** Filter keys this table understands, beyond page/perPage/sort/search. */
  filters: readonly string[]
  perPage?: number
  /** Milliseconds to wait before committing a search term to the URL. */
  debounce?: number
}

/**
 * Keeps table state — page, sort, search and filters — in the URL query so a
 * filtered view is shareable and survives a reload. The URL is the single
 * source of truth; nothing here mirrors it into separate local state.
 */
export function useTableQuery(options: TableQueryOptions) {
  const { filters, perPage = 10, debounce = 300 } = options
  const route = useRoute()
  const router = useRouter()

  function readString(key: string): string {
    const value = route.query[key]
    return typeof value === 'string' ? value : ''
  }

  const page = computed(() => {
    const parsed = Number(route.query.page)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
  })

  const sort = computed(() => readString('sort'))
  const search = computed(() => readString('search'))

  const activeFilters = computed(() => {
    const result: Record<string, string> = {}
    for (const key of filters) {
      const value = readString(key)
      if (value) result[key] = value
    }
    return result
  })

  const hasActiveFilters = computed(
    () => search.value !== '' || Object.keys(activeFilters.value).length > 0,
  )

  /** Merge into the query, dropping empty values so URLs stay clean. */
  function patchQuery(patch: Record<string, string | number | undefined>) {
    const next: Record<string, string> = {}

    for (const [key, value] of Object.entries({ ...route.query, ...patch })) {
      if (value === undefined || value === null || value === '') continue
      next[key] = String(value)
    }

    router.replace({ query: next })
  }

  function setPage(value: number) {
    patchQuery({ page: value > 1 ? value : undefined })
  }

  /** Toggles asc -> desc -> off, matching what the header arrows show. */
  function toggleSort(field: string) {
    const current = sort.value
    const next = current === field ? `-${field}` : current === `-${field}` ? '' : field
    patchQuery({ sort: next || undefined, page: undefined })
  }

  function setFilter(key: string, value: string) {
    patchQuery({ [key]: value || undefined, page: undefined })
  }

  function clearFilters() {
    const cleared: Record<string, undefined> = { search: undefined, page: undefined }
    for (const key of filters) cleared[key] = undefined
    patchQuery(cleared)
  }

  // Typing shouldn't push a navigation per keystroke.
  const searchInput = ref(search.value)
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(searchInput, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => patchQuery({ search: value || undefined, page: undefined }), debounce)
  })

  // Keep the box in step when the URL changes from elsewhere (back button,
  // "clear filters"), without re-triggering the debounce.
  watch(search, (value) => {
    if (value !== searchInput.value) searchInput.value = value
  })

  onUnmounted(() => clearTimeout(timer))

  /** Params to hand straight to the API client. */
  const params = computed(() => ({
    page: page.value,
    perPage,
    ...(sort.value ? { sort: sort.value } : {}),
    ...(search.value ? { search: search.value } : {}),
    ...activeFilters.value,
  }))

  return {
    page,
    perPage,
    sort,
    search,
    searchInput,
    activeFilters,
    hasActiveFilters,
    params,
    setPage,
    toggleSort,
    setFilter,
    clearFilters,
  }
}
