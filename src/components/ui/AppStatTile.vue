<script setup lang="ts">
import { computed } from 'vue'
import AppSkeleton from './AppSkeleton.vue'

const { label, value, delta, loading = false, tone } = defineProps<{
  label: string
  value: string
  /** Percentage change against the previous period. */
  delta?: number | null
  loading?: boolean
  tone?: 'good' | 'critical'
}>()

// Text never wears a data colour; a status tone is the one exception, and it
// ships with a direction word rather than colour alone.
const deltaTone = computed(() => {
  if (delta === undefined || delta === null || delta === 0) return 'text-[var(--color-ink-muted)]'
  return delta > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
})

const deltaLabel = computed(() => {
  if (delta === undefined || delta === null) return null
  if (delta === 0) return 'no change'
  return `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta).toFixed(1)}%`
})

const valueTone = computed(() =>
  tone === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-[var(--color-ink)]',
)
</script>

<template>
  <div class="rounded-card bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-line)]">
    <p class="text-xs font-medium text-[var(--color-ink-muted)]">{{ label }}</p>

    <AppSkeleton v-if="loading" class="mt-2 h-8" />
    <template v-else>
      <p class="mt-1 text-2xl font-semibold tabular-nums" :class="valueTone">{{ value }}</p>
      <p v-if="deltaLabel" class="mt-1 text-xs" :class="deltaTone">
        {{ deltaLabel }}
        <span class="text-[var(--color-ink-muted)]">vs. previous month</span>
      </p>
    </template>
  </div>
</template>
