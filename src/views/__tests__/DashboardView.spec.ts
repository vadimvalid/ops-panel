import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { setToken } from '@/lib/http'
import DashboardView from '../DashboardView.vue'
import { useAuthStore } from '@/stores/auth'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Chart.js needs a canvas jsdom doesn't implement; the charts are covered by
// their own colour/config tests, so stub them out here.
const stubs = { RevenueTrendChart: true, PlanBreakdownChart: true }

async function renderDashboard() {
  setActivePinia(createPinia())
  setToken(null)

  const auth = useAuthStore()
  await auth.login('admin@example.com', 'admin')

  const wrapper = mount(DashboardView, { global: { stubs } })
  await flushPromises()

  return wrapper
}

describe('success', () => {
  it('renders the KPI row', async () => {
    const wrapper = await renderDashboard()
    const text = wrapper.text()

    expect(text).toContain('Monthly recurring revenue')
    expect(text).toContain('Active users')
    expect(text).toContain('Active subscriptions')
    expect(text).toContain('Past due')
  })

  it('formats money rather than printing minor units', async () => {
    const wrapper = await renderDashboard()
    // Cents would show as a six-figure integer; a formatted value carries €.
    expect(wrapper.text()).toMatch(/€/)
  })

  it('renders both charts once data arrives', async () => {
    const wrapper = await renderDashboard()

    expect(wrapper.findComponent({ name: 'RevenueTrendChart' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PlanBreakdownChart' }).exists()).toBe(true)
  })
})

describe('deltas', () => {
  it('describes direction in words, not colour alone', async () => {
    server.use(
      http.get('/api/stats/overview', () =>
        HttpResponse.json({
          activeUsers: 10,
          activeSubscriptions: 5,
          pastDueSubscriptions: 0,
          mrr: 10000,
          currency: 'EUR',
          revenue: [
            { month: '2026-07', total: 1000 },
            { month: '2026-08', total: 1500 },
          ],
          signups: [
            { month: '2026-07', total: 10 },
            { month: '2026-08', total: 5 },
          ],
          planBreakdown: [],
        }),
      ),
    )

    const wrapper = await renderDashboard()
    const text = wrapper.text()

    expect(text).toContain('up 50.0%')
    expect(text).toContain('down 50.0%')
  })

  it('omits the delta when the previous month was zero', async () => {
    server.use(
      http.get('/api/stats/overview', () =>
        HttpResponse.json({
          activeUsers: 1,
          activeSubscriptions: 1,
          pastDueSubscriptions: 0,
          mrr: 0,
          currency: 'EUR',
          revenue: [
            { month: '2026-07', total: 0 },
            { month: '2026-08', total: 500 },
          ],
          signups: [],
          planBreakdown: [],
        }),
      ),
    )

    const wrapper = await renderDashboard()
    // A jump from zero is not a meaningful percentage, so nothing is claimed.
    expect(wrapper.text()).not.toContain('vs. previous month')
  })
})

describe('error handling', () => {
  it('shows the API message with a retry', async () => {
    server.use(
      http.get('/api/stats/overview', () =>
        HttpResponse.json({ message: 'Stats are unavailable.' }, { status: 500 }),
      ),
    )

    const wrapper = await renderDashboard()

    expect(wrapper.text()).toContain('Stats are unavailable.')
    expect(wrapper.text()).toContain('Try again')
  })
})
