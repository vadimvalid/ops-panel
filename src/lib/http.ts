import axios, { AxiosError, type AxiosInstance } from 'axios'

/** Where the access token lives. Swapped for an httpOnly cookie once a real
 *  backend is in place; kept behind these helpers so callers never touch it. */
const TOKEN_KEY = 'ops-panel.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* private mode or blocked storage: the session simply won't persist */
  }
}

/** Shape every failed request is normalised into, so views can render an
 *  error state without knowing about axios. */
export interface ApiError {
  status: number
  message: string
  /** Field-level messages from a 422, keyed by field name. */
  fields?: Record<string, string>
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'status' in value && 'message' in value
}

const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'Network unavailable. Check your connection and try again.',
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  422: 'Please correct the highlighted fields.',
  429: 'Too many requests. Please slow down.',
  500: 'Something went wrong on our side. Please try again.',
}

export const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data

    const apiError: ApiError = {
      status,
      message: body?.message ?? FALLBACK_MESSAGES[status] ?? 'Unexpected error.',
      fields: body?.errors,
    }

    // A rejected token is dead weight; drop it so the guard redirects to login.
    if (status === 401) setToken(null)

    return Promise.reject(apiError)
  },
)
