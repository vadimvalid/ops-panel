import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { useTableQuery } from '../useTableQuery'

type Api = ReturnType<typeof useTableQuery>

/** Mount the composable inside a real router so query handling is exercised
 *  end to end rather than against a stubbed route. */
async function setup(initial = '/') {
  let api!: Api

  const Host = defineComponent({
    setup() {
      api = useTableQuery({ filters: ['status', 'role'], debounce: 10 })
      return () => null
    },
  })

  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Host }],
  })

  router.push(initial)
  await router.isReady()
  mount(Host, { global: { plugins: [router] } })

  return { api, router }
}

describe('reading state from the URL', () => {
  it('defaults to page 1 with no filters', async () => {
    const { api } = await setup()
    expect(api.page.value).toBe(1)
    expect(api.hasActiveFilters.value).toBe(false)
  })

  it('reads page, sort, search and filters', async () => {
    const { api } = await setup('/?page=3&sort=-name&search=anna&status=active')
    expect(api.page.value).toBe(3)
    expect(api.sort.value).toBe('-name')
    expect(api.search.value).toBe('anna')
    expect(api.activeFilters.value).toEqual({ status: 'active' })
    expect(api.hasActiveFilters.value).toBe(true)
  })

  it('falls back to page 1 for a nonsense page value', async () => {
    const { api } = await setup('/?page=abc')
    expect(api.page.value).toBe(1)
  })

  it('ignores filter keys it was not told about', async () => {
    const { api } = await setup('/?nonsense=1')
    expect(api.activeFilters.value).toEqual({})
  })
})

describe('sorting', () => {
  it('cycles ascending, descending, then off', async () => {
    const { api, router } = await setup()

    api.toggleSort('name')
    await flushPromises()
    expect(api.sort.value).toBe('name')

    api.toggleSort('name')
    await flushPromises()
    expect(api.sort.value).toBe('-name')

    api.toggleSort('name')
    await flushPromises()
    expect(api.sort.value).toBe('')
    expect(router.currentRoute.value.query.sort).toBeUndefined()
  })

  it('returns to page 1 when the sort changes', async () => {
    const { api } = await setup('/?page=4')
    api.toggleSort('name')
    await flushPromises()
    expect(api.page.value).toBe(1)
  })
})

describe('filtering', () => {
  it('sets and clears a single filter', async () => {
    const { api } = await setup()

    api.setFilter('status', 'active')
    await flushPromises()
    expect(api.activeFilters.value).toEqual({ status: 'active' })

    api.setFilter('status', '')
    await flushPromises()
    expect(api.activeFilters.value).toEqual({})
  })

  it('clears search and every filter at once', async () => {
    const { api } = await setup('/?search=x&status=active&role=admin&page=2')

    api.clearFilters()
    await flushPromises()

    expect(api.hasActiveFilters.value).toBe(false)
    expect(api.page.value).toBe(1)
  })
})

describe('search debouncing', () => {
  beforeEach(() => vi.useFakeTimers())

  it('waits before committing the term to the URL', async () => {
    const { api } = await setup()

    api.searchInput.value = 'ann'
    await nextTick()
    expect(api.search.value).toBe('')

    await vi.advanceTimersByTimeAsync(20)
    await flushPromises()
    expect(api.search.value).toBe('ann')

    vi.useRealTimers()
  })

  it('only commits the final value while typing', async () => {
    const { api, router } = await setup()

    api.searchInput.value = 'a'
    await nextTick()
    api.searchInput.value = 'an'
    await nextTick()
    api.searchInput.value = 'ann'
    await nextTick()

    await vi.advanceTimersByTimeAsync(20)
    await flushPromises()

    expect(router.currentRoute.value.query.search).toBe('ann')
    vi.useRealTimers()
  })
})

describe('params for the API', () => {
  it('includes only what is set', async () => {
    const { api } = await setup('/?search=anna&status=active')
    expect(api.params.value).toEqual({ page: 1, perPage: 10, search: 'anna', status: 'active' })
  })
})
