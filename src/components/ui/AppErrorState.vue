<script setup lang="ts">
import AppButton from './AppButton.vue'
import type { ApiError } from '@/lib/http'

const { error, retrying = false } = defineProps<{ error: ApiError; retrying?: boolean }>()
const emit = defineEmits<{ retry: [] }>()

// A 403 is a permission boundary, not a failure — retrying would just fail again.
const isForbidden = error.status === 403
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 text-center" role="alert">
    <svg
      class="size-10"
      :class="isForbidden ? 'text-amber-500' : 'text-red-500'"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        v-if="isForbidden"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
      <path
        v-else
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>

    <h3 class="mt-3 text-sm font-semibold text-[var(--color-ink)]">
      {{ isForbidden ? 'Access restricted' : 'Something went wrong' }}
    </h3>
    <p class="mt-1 max-w-sm text-sm text-[var(--color-ink-muted)]">{{ error.message }}</p>

    <AppButton
      v-if="!isForbidden"
      variant="secondary"
      size="sm"
      class="mt-4"
      :loading="retrying"
      @click="emit('retry')"
    >
      Try again
    </AppButton>
  </div>
</template>
