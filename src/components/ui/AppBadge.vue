<script setup lang="ts">
import { computed } from 'vue'

const { tone = 'neutral' } = defineProps<{
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}>()

const TONES = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
} as const

const classes = computed(() => [
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  TONES[tone],
])
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
