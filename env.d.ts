/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MOCKS?: string
  /** Set by Vitest; used to skip artificial latency in mock handlers. */
  readonly VITEST?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
