import { http, HttpResponse, delay } from 'msw'
import { credentials, payments, plans, subscriptions, users } from './data'
import type { User } from '@/types/domain'

const BASE = '/api'

/** Latency makes loading states visible in the browser, but only slows tests
 *  down — they assert on the settled result, not the wait. */
const ARTIFICIAL_LATENCY = !import.meta.env?.VITEST

function pause(ms: number) {
  return ARTIFICIAL_LATENCY ? delay(ms) : Promise.resolve()
}

/** Opaque token encoding the user id; good enough to fake a session. */
function issueToken(userId: string): string {
  return `mock.${btoa(userId)}.token`
}

function userFromRequest(request: Request): User | null {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null

  const parts = header.slice('Bearer '.length).split('.')
  if (parts.length !== 3 || parts[0] !== 'mock') return null

  try {
    const userId = atob(parts[1]!)
    return users.find((u) => u.id === userId) ?? null
  } catch {
    return null
  }
}

function unauthorized() {
  return HttpResponse.json({ message: 'Your session has expired. Please sign in again.' }, { status: 401 })
}

/** Slice a filtered collection into the paginated envelope. */
function paginate<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get('perPage') ?? 10)))
  const start = (page - 1) * perPage

  return HttpResponse.json({
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    perPage,
  })
}

function sortItems<T extends Record<string, unknown>>(items: T[], url: URL): T[] {
  const sort = url.searchParams.get('sort')
  if (!sort) return items

  const desc = sort.startsWith('-')
  const key = desc ? sort.slice(1) : sort

  return [...items].sort((a, b) => {
    const left = a[key]
    const right = b[key]
    if (left === right) return 0
    // Nulls sort last regardless of direction.
    if (left === null) return 1
    if (right === null) return -1
    const result = String(left).localeCompare(String(right), undefined, { numeric: true })
    return desc ? -result : result
  })
}

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await pause(600)
    const body = (await request.json()) as { email?: string; password?: string }

    const fields: Record<string, string> = {}
    if (!body.email) fields.email = 'Email is required.'
    if (!body.password) fields.password = 'Password is required.'
    if (Object.keys(fields).length > 0) {
      return HttpResponse.json({ message: 'Please correct the highlighted fields.', errors: fields }, { status: 422 })
    }

    const account = credentials[body.email!.toLowerCase().trim()]
    if (!account || account.password !== body.password) {
      return HttpResponse.json({ message: 'Incorrect email or password.' }, { status: 401 })
    }

    const user = users.find((u) => u.id === account.userId)!
    return HttpResponse.json({ token: issueToken(user.id), user })
  }),

  http.post(`${BASE}/auth/logout`, async () => {
    await pause(200)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/auth/me`, async ({ request }) => {
    await pause(300)
    const user = userFromRequest(request)
    return user ? HttpResponse.json(user) : unauthorized()
  }),

  http.get(`${BASE}/users`, async ({ request }) => {
    await pause(500)
    const actor = userFromRequest(request)
    if (!actor) return unauthorized()

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase().trim()
    const status = url.searchParams.get('status')
    const role = url.searchParams.get('role')
    const plan = url.searchParams.get('plan')

    let result: User[] = users
    if (search) {
      result = result.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
      )
    }
    if (status) result = result.filter((u) => u.status === status)
    if (role) result = result.filter((u) => u.role === role)
    if (plan) result = result.filter((u) => u.planId === plan)

    return paginate(sortItems(result as unknown as Record<string, unknown>[], url), url)
  }),

  http.get(`${BASE}/stats/overview`, async ({ request }) => {
    await pause(700)
    const actor = userFromRequest(request)
    if (!actor) return unauthorized()

    const activeUsers = users.filter((u) => u.status === 'active').length
    const activeSubs = subscriptions.filter((s) => s.status === 'active').length
    const pastDue = subscriptions.filter((s) => s.status === 'past_due').length

    const mrr = subscriptions
      .filter((s) => s.status === 'active' || s.status === 'trialing')
      .reduce((sum, s) => sum + (plans.find((p) => p.id === s.planId)?.priceMonthly ?? 0), 0)

    // Revenue for the last 12 months, oldest first.
    const now = new Date()
    const revenue = Array.from({ length: 12 }, (_, index) => {
      const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1))
      const key = month.toISOString().slice(0, 7)
      const total = payments
        .filter((p) => p.status === 'succeeded' && p.createdAt.startsWith(key))
        .reduce((sum, p) => sum + p.amount, 0)
      return { month: key, total }
    })

    const signups = Array.from({ length: 12 }, (_, index) => {
      const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1))
      const key = month.toISOString().slice(0, 7)
      return { month: key, total: users.filter((u) => u.createdAt.startsWith(key)).length }
    })

    return HttpResponse.json({
      activeUsers,
      activeSubscriptions: activeSubs,
      pastDueSubscriptions: pastDue,
      mrr,
      currency: 'EUR',
      revenue,
      signups,
      planBreakdown: plans.map((plan) => ({
        planId: plan.id,
        name: plan.name,
        count: users.filter((u) => u.planId === plan.id).length,
      })),
    })
  }),
]
