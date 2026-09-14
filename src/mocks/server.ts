import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Used by tests; the browser uses the service worker in ./browser.ts. */
export const server = setupServer(...handlers)
