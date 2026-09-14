<script setup lang="ts">
import { useId } from 'vue'

const { label, options, placeholder = 'All', disabled = false } = defineProps<{
  label: string
  options: readonly { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="block text-xs font-medium text-[var(--color-ink-muted)]">
      {{ label }}
    </label>
    <select
      :id="id"
      v-model="model"
      :disabled="disabled"
      class="mt-1 block min-h-10 w-full rounded-lg border-0 bg-[var(--color-surface)] py-2 pl-3 pr-8 text-sm text-[var(--color-ink)] ring-1 ring-inset ring-[var(--color-line)] focus:ring-2 focus:ring-inset focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
