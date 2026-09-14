<script setup lang="ts" generic="T extends { id: string }">
import AppSkeleton from './AppSkeleton.vue'

export interface Column<Row> {
  key: string
  label: string
  sortable?: boolean
  /** Hide below sm; use for columns that aren't essential on a phone. */
  hideOnMobile?: boolean
  align?: 'left' | 'right'
  field?: (row: Row) => unknown
}

const {
  columns,
  rows,
  loading = false,
  skeletonRows = 5,
  sort = '',
  caption,
} = defineProps<{
  columns: readonly Column<T>[]
  rows: readonly T[]
  loading?: boolean
  skeletonRows?: number
  sort?: string
  caption?: string
}>()

const emit = defineEmits<{ sort: [field: string] }>()

function sortState(key: string): 'ascending' | 'descending' | 'none' {
  if (sort === key) return 'ascending'
  if (sort === `-${key}`) return 'descending'
  return 'none'
}
</script>

<template>
  <!-- The wrapper scrolls rather than the page, so narrow screens keep the
       rest of the layout intact. -->
  <div class="overflow-x-auto">
    <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <thead class="border-b border-[var(--color-line)] text-xs text-[var(--color-ink-muted)]">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-4 py-3 font-medium whitespace-nowrap"
            :class="[
              column.align === 'right' ? 'text-right' : 'text-left',
              column.hideOnMobile ? 'hidden sm:table-cell' : '',
            ]"
            :aria-sort="column.sortable ? sortState(column.key) : undefined"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="inline-flex items-center gap-1 rounded hover:text-[var(--color-ink)]"
              @click="emit('sort', column.key)"
            >
              {{ column.label }}
              <span aria-hidden="true" class="text-[10px]">
                {{ sortState(column.key) === 'ascending' ? '▲' : sortState(column.key) === 'descending' ? '▼' : '↕' }}
              </span>
            </button>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-[var(--color-line)]">
        <template v-if="loading">
          <tr v-for="row in skeletonRows" :key="`skeleton-${row}`">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3"
              :class="column.hideOnMobile ? 'hidden sm:table-cell' : ''"
            >
              <AppSkeleton />
            </td>
          </tr>
        </template>

        <tr
          v-for="row in rows"
          v-else
          :key="row.id"
          class="transition-colors hover:bg-[var(--color-surface-muted)]"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 align-middle"
            :class="[
              column.align === 'right' ? 'text-right' : '',
              column.hideOnMobile ? 'hidden sm:table-cell' : '',
            ]"
          >
            <slot :name="`cell:${column.key}`" :row="row">
              {{ column.field ? column.field(row) : '' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
