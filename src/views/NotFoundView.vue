<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
    <p class="text-sm font-medium text-brand-600">404</p>
    <h1 class="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
    <p class="mt-2 text-sm text-[var(--color-ink-muted)]">
      The page you are looking for does not exist or has been moved.
    </p>
    <RouterLink
      to="/"
      class="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
    >
      Back to dashboard
    </RouterLink>
  </main>
</template>
