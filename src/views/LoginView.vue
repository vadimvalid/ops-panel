<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')

// Field errors come from the API's 422; the banner shows everything else.
const fieldErrors = computed(() => auth.error?.fields ?? {})
const bannerError = computed(() =>
  auth.error && auth.error.status !== 422 ? auth.error.message : null,
)

const DEMO_ACCOUNTS = [
  { email: 'admin@example.com', password: 'admin', role: 'Admin' },
  { email: 'support@example.com', password: 'support', role: 'Support' },
  { email: 'viewer@example.com', password: 'viewer', role: 'Viewer' },
]

function useDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
  email.value = account.email
  password.value = account.password
}

async function submit() {
  const ok = await auth.login(email.value, password.value)
  if (!ok) return

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.push(redirect)
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex items-center justify-center gap-2">
        <span class="grid size-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          OP
        </span>
        <span class="text-lg font-semibold tracking-tight">ops-panel</span>
      </div>

      <form
        class="rounded-card bg-[var(--color-surface)] p-6 ring-1 ring-[var(--color-line)]"
        novalidate
        @submit.prevent="submit"
      >
        <h1 class="text-base font-semibold">Sign in</h1>
        <p class="mt-1 text-sm text-[var(--color-ink-muted)]">
          Use one of the demo accounts below.
        </p>

        <p
          v-if="bannerError"
          class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
          role="alert"
        >
          {{ bannerError }}
        </p>

        <div class="mt-5 space-y-4">
          <AppInput
            v-model="email"
            label="Email"
            type="email"
            autocomplete="username"
            required
            :error="fieldErrors.email"
          />
          <AppInput
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            required
            :error="fieldErrors.password"
          />
        </div>

        <AppButton type="submit" block class="mt-6" :loading="auth.loading">
          {{ auth.loading ? 'Signing in…' : 'Sign in' }}
        </AppButton>
      </form>

      <div class="mt-4 rounded-card bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-line)]">
        <p class="text-xs font-medium text-[var(--color-ink-muted)]">Demo accounts</p>
        <ul class="mt-2 space-y-1">
          <li v-for="account in DEMO_ACCOUNTS" :key="account.email">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--color-surface-muted)]"
              @click="useDemo(account)"
            >
              <span class="text-[var(--color-ink)]">{{ account.email }}</span>
              <span class="text-xs text-[var(--color-ink-muted)]">{{ account.role }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>
