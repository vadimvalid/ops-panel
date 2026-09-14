import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { server } from '@/mocks/server'
import { useAuthStore } from '../auth'
import { getToken, setToken } from '@/lib/http'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  setActivePinia(createPinia())
  setToken(null)
})

describe('login', () => {
  it('stores the token and user on success', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('admin@example.com', 'admin')

    expect(ok).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.role).toBe('admin')
    expect(getToken()).toBeTruthy()
  })

  it('surfaces an error and stays signed out on bad credentials', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('admin@example.com', 'wrong')

    expect(ok).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error?.status).toBe(401)
    expect(getToken()).toBeNull()
  })

  it('reports field errors when input is missing', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('', '')

    expect(ok).toBe(false)
    expect(auth.error?.status).toBe(422)
    expect(auth.error?.fields).toMatchObject({ email: expect.any(String) })
  })

  it('clears loading once settled', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'admin')
    expect(auth.loading).toBe(false)
  })
})

describe('role checks', () => {
  it('grants a lower requirement to a higher role', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'admin')

    expect(auth.can('viewer')).toBe(true)
    expect(auth.can('admin')).toBe(true)
  })

  it('denies a higher requirement to a lower role', async () => {
    const auth = useAuthStore()
    await auth.login('viewer@example.com', 'viewer')

    expect(auth.can('viewer')).toBe(true)
    expect(auth.can('support')).toBe(false)
    expect(auth.can('admin')).toBe(false)
  })

  it('denies everything when signed out', () => {
    const auth = useAuthStore()
    expect(auth.can('viewer')).toBe(false)
  })
})

describe('session lifecycle', () => {
  it('restores a session from a stored token', async () => {
    const auth = useAuthStore()
    await auth.login('support@example.com', 'support')
    const token = getToken()

    setActivePinia(createPinia())
    const restored = useAuthStore()
    setToken(token)
    await restored.restore()

    expect(restored.user?.email).toBe('support@example.com')
    expect(restored.initialising).toBe(false)
  })

  it('stays signed out when no token is stored', async () => {
    const auth = useAuthStore()
    await auth.restore()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.initialising).toBe(false)
  })

  it('clears the token on logout', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'admin')
    await auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })
})
