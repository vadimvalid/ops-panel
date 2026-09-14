<script setup lang="ts">
import { computed } from 'vue'
import AppButton from './AppButton.vue'

const { page, perPage, total } = defineProps<{ page: number; perPage: number; total: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(total / perPage)))
const from = computed(() => (total === 0 ? 0 : (page - 1) * perPage + 1))
const to = computed(() => Math.min(page * perPage, total))
</script>

<template>
  <nav
    v-if="total > 0"
    class="flex flex-col items-center justify-between gap-3 border-t border-[var(--color-line)] px-4 py-3 sm:flex-row"
    aria-label="Pagination"
  >
    <p class="text-sm text-[var(--color-ink-muted)]">
      Showing <span class="font-medium text-[var(--color-ink)]">{{ from }}</span>–<span
        class="font-medium text-[var(--color-ink)]"
        >{{ to }}</span
      >
      of <span class="font-medium text-[var(--color-ink)]">{{ total }}</span>
    </p>

    <div class="flex items-center gap-2">
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="page <= 1"
        @click="emit('change', page - 1)"
      >
        Previous
      </AppButton>
      <span class="px-1 text-sm text-[var(--color-ink-muted)]">
        Page {{ page }} of {{ totalPages }}
      </span>
      <AppButton
        variant="secondary"
        size="sm"
        :disabled="page >= totalPages"
        @click="emit('change', page + 1)"
      >
        Next
      </AppButton>
    </div>
  </nav>
</template>
