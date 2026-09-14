<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)

// Navigating should never leave the mobile drawer covering the new page.
watch(() => route.fullPath, () => { sidebarOpen.value = false })

const NAV = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/users', label: 'Users', exact: false },
  { to: '/subscriptions', label: 'Subscriptions', exact: false },
  { to: '/payments', label: 'Payments', exact: false, minimum: 'support' as const },
]

async function signOut() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-[var(--color-canvas)]">
    <!-- Mobile drawer backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <aside
      id="app-sidebar"
      class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--color-line)] bg-[var(--color-surface)] transition-transform duration-200 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center gap-2 px-5">
        <span class="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          OP
        </span>
        <span class="font-semibold tracking-tight">ops-panel</span>
      </div>

      <nav class="px-3 py-2" aria-label="Main">
        <ul class="space-y-1">
          <li v-for="item in NAV" :key="item.to">
            <RouterLink
              v-if="!item.minimum || auth.can(item.minimum)"
              :to="item.to"
              class="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              active-class="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              :exact-active-class="item.exact ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : ''"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface)]/80 px-4 backdrop-blur sm:px-6"
      >
        <button
          type="button"
          class="-ml-1 grid size-10 place-items-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] lg:hidden"
          :aria-expanded="sidebarOpen"
          aria-controls="app-sidebar"
          aria-label="Toggle navigation"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <h1 class="text-sm font-semibold">{{ route.meta.title ?? '' }}</h1>

        <div class="ml-auto flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-medium leading-tight">{{ auth.user?.name }}</p>
            <p class="text-xs text-[var(--color-ink-muted)]">{{ auth.user?.email }}</p>
          </div>
          <AppBadge tone="info">{{ auth.user?.role }}</AppBadge>
          <AppButton variant="ghost" size="sm" @click="signOut">Sign out</AppButton>
        </div>
      </header>

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
