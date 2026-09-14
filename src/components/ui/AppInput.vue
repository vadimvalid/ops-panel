<script setup lang="ts">
import { computed, useId } from 'vue'

const {
  label,
  type = 'text',
  error,
  hint,
  required = false,
  disabled = false,
  placeholder,
  autocomplete,
} = defineProps<{
  label: string
  type?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  autocomplete?: string
}>()

const model = defineModel<string>({ default: '' })

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

// Point screen readers at whichever message is actually rendered.
const describedBy = computed(() => {
  const ids = [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
})
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-[var(--color-ink)]">
      {{ label }}
      <span v-if="required" class="text-red-600" aria-hidden="true">*</span>
    </label>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="mt-1.5 block min-h-11 w-full rounded-lg border-0 bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] ring-1 ring-inset transition-shadow placeholder:text-[var(--color-ink-muted)] focus:ring-2 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
      :class="
        error
          ? 'ring-red-500 focus:ring-red-500'
          : 'ring-[var(--color-line)] focus:ring-brand-500'
      "
    />

    <p v-if="error" :id="errorId" class="mt-1.5 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="mt-1.5 text-sm text-[var(--color-ink-muted)]">
      {{ hint }}
    </p>
  </div>
</template>
