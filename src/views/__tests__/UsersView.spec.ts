import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { setToken } from '@/lib/http'
import UsersView from '../UsersView.vue'
import { useAuthStore } from '@/stores/auth'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

async function renderUsers(initial = '/users') {
  setActivePinia(createPinia())
  setToken(null)

  const auth = useAuthStore()
  await auth.login('admin@example.com', 'admin')

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/users', name: 'users', component: UsersView }],
  })

  router.push(initial)
  await router.isReady()

  const wrapper = mount(UsersView, { global: { plugins: [router] } })
  await flushPromises()

  return { wrapper, router }
}

describe('loading and success', () => {
  it('renders rows once the request resolves', async () => {
    const { wrapper } = await renderUsers()

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(10)
    expect(wrapper.text()).toContain('@example.com')
  })

  it('shows how many results there are', async () => {
    const { wrapper } = await renderUsers()
    expect(wrapper.text()).toMatch(/Showing\s*1–10\s*of/)
  })
})

describe('filtering', () => {
  it('applies a status filter from the URL', async () => {
    const { wrapper } = await renderUsers('/users?status=suspended')
    await flushPromises()

    const badges = wrapper.findAll('tbody tr').map((row) => row.text())
    expect(badges.length).toBeGreaterThan(0)
    for (const text of badges) expect(text).toContain('suspended')
  })

  it('offers a way out when filters match nothing', async () => {
    const { wrapper } = await renderUsers('/users?search=nobodymatchesthis')
    await flushPromises()

    expect(wrapper.text()).toContain('No users match these filters')
    expect(wrapper.text()).toContain('Clear filters')
  })

  it('distinguishes an empty collection from empty results', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ items: [], total: 0, page: 1, perPage: 10 }),
      ),
    )

    const { wrapper } = await renderUsers()
    await flushPromises()

    expect(wrapper.text()).toContain('No users yet')
    expect(wrapper.text()).not.toContain('No users match these filters')
  })
})

describe('sorting', () => {
  it('marks the sorted column for assistive tech', async () => {
    const { wrapper } = await renderUsers('/users?sort=name')
    await flushPromises()

    const header = wrapper.findAll('th').find((th) => th.text().includes('User'))
    expect(header?.attributes('aria-sort')).toBe('ascending')
  })

  it('puts the sort in the URL when a header is clicked', async () => {
    const { wrapper, router } = await renderUsers()

    const button = wrapper.findAll('th button').find((b) => b.text().includes('Role'))
    await button!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.sort).toBe('role')
  })
})

describe('error handling', () => {
  it('renders the API message with a retry', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ message: 'Upstream is down.' }, { status: 500 }),
      ),
    )

    const { wrapper } = await renderUsers()
    await flushPromises()

    expect(wrapper.text()).toContain('Upstream is down.')
    expect(wrapper.text()).toContain('Try again')
  })

  it('omits retry on a permission error, which retrying cannot fix', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ message: 'Not allowed.' }, { status: 403 }),
      ),
    )

    const { wrapper } = await renderUsers()
    await flushPromises()

    expect(wrapper.text()).toContain('Access restricted')
    expect(wrapper.text()).not.toContain('Try again')
  })
})
