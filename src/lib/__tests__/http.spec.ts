import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getToken, setToken, isApiError } from '../http'

describe('token storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips a token', () => {
    setToken('abc')
    expect(getToken()).toBe('abc')
  })

  it('returns null when nothing is stored', () => {
    expect(getToken()).toBeNull()
  })

  it('clears the token when set to null', () => {
    setToken('abc')
    setToken(null)
    expect(getToken()).toBeNull()
  })

  describe('when storage is unavailable', () => {
    afterEach(() => vi.restoreAllMocks())

    it('reads as null instead of throwing', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      expect(getToken()).toBeNull()
    })

    it('swallows write failures', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked')
      })
      expect(() => setToken('abc')).not.toThrow()
    })
  })
})

describe('isApiError', () => {
  it('accepts a normalised error', () => {
    expect(isApiError({ status: 404, message: 'Not found' })).toBe(true)
  })

  it('rejects unrelated values', () => {
    expect(isApiError(new Error('boom'))).toBe(false)
    expect(isApiError(null)).toBe(false)
  })
})
