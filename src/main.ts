import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/** Mocks are opt-in and tree-shaken out of a production build. */
async function startMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'false') return

  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

startMocks().then(() => {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
})
