<script setup lang="ts">
const { lines = 1, class: className = '' } = defineProps<{ lines?: number; class?: string }>()
</script>

<template>
  <div class="space-y-2" role="status" aria-live="polite">
    <span class="sr-only">Loading…</span>
    <div
      v-for="line in lines"
      :key="line"
      class="h-4 animate-pulse rounded bg-[var(--color-surface-muted)]"
      :class="[className, lines > 1 && line === lines ? 'w-2/3' : 'w-full']"
      aria-hidden="true"
    />
  </div>
</template>
