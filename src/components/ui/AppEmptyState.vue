<script setup lang="ts">
const { title, description } = defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 text-center">
    <svg
      class="size-10 text-[var(--color-ink-muted)]"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11v6m4-6v6M5.25 7.5h13.5"
      />
    </svg>
    <h3 class="mt-3 text-sm font-semibold text-[var(--color-ink)]">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-[var(--color-ink-muted)]">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
