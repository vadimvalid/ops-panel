<script setup lang="ts">
import { computed } from 'vue'

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  block = false,
} = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>()

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-ink)] ring-1 ring-inset ring-[var(--color-line)] hover:bg-[var(--color-surface-muted)]',
  ghost: 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

const SIZES = {
  // min-h keeps every button a comfortable tap target on touch screens.
  sm: 'min-h-9 px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-11 px-4 py-2 text-sm gap-2',
} as const

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  'disabled:cursor-not-allowed disabled:opacity-50',
  VARIANTS[variant],
  SIZES[size],
  block ? 'w-full' : '',
])

/** A loading button stays focusable but rejects clicks, so screen-reader
 *  users aren't stranded when focus sits on it. */
const isDisabled = computed(() => disabled || loading)
</script>

<template>
  <button :type="type" :class="classes" :disabled="isDisabled" :aria-busy="loading || undefined">
    <svg
      v-if="loading"
      class="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>
