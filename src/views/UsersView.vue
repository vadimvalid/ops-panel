<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { useTableQuery } from '@/composables/useTableQuery'
import { formatDate, formatRelative } from '@/lib/format'
import { PLAN_IDS, ROLES, USER_STATUSES, type User, type UserStatus } from '@/types/domain'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable, { type Column } from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppErrorState from '@/components/ui/AppErrorState.vue'

const store = useUsersStore()
const { items, total, loading, error, initialLoad } = storeToRefs(store)

const query = useTableQuery({ filters: ['status', 'role', 'plan'] })

// Refetch whenever any part of the URL state changes.
watch(query.params, (params) => store.fetchList(params), { immediate: true, deep: true })

const columns: Column<User>[] = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'planId', label: 'Plan', sortable: true, hideOnMobile: true },
  { key: 'lastSeenAt', label: 'Last seen', sortable: true, hideOnMobile: true },
  { key: 'createdAt', label: 'Joined', sortable: true, hideOnMobile: true },
]

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value.replace(/^\w/, (c) => c.toUpperCase()) }))

const STATUS_TONES: Record<UserStatus, 'success' | 'info' | 'danger'> = {
  active: 'success',
  invited: 'info',
  suspended: 'danger',
}

const showEmpty = computed(() => !loading.value && !error.value && items.value.length === 0)
</script>

<template>
  <div class="space-y-4">
    <AppCard>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="sm:col-span-2 lg:col-span-1">
          <AppInput v-model="query.searchInput.value" label="Search" placeholder="Name or email" />
        </div>
        <AppSelect
          :model-value="query.activeFilters.value.status ?? ''"
          label="Status"
          :options="toOptions(USER_STATUSES)"
          @update:model-value="query.setFilter('status', $event)"
        />
        <AppSelect
          :model-value="query.activeFilters.value.role ?? ''"
          label="Role"
          :options="toOptions(ROLES)"
          @update:model-value="query.setFilter('role', $event)"
        />
        <AppSelect
          :model-value="query.activeFilters.value.plan ?? ''"
          label="Plan"
          :options="toOptions(PLAN_IDS)"
          @update:model-value="query.setFilter('plan', $event)"
        />
      </div>

      <div v-if="query.hasActiveFilters.value" class="mt-3 flex justify-end">
        <AppButton variant="ghost" size="sm" @click="query.clearFilters()">
          Clear filters
        </AppButton>
      </div>
    </AppCard>

    <AppCard :padded="false">
      <AppErrorState
        v-if="error"
        :error="error"
        :retrying="loading"
        @retry="store.fetchList(query.params.value)"
      />

      <template v-else>
        <AppTable
          :columns="columns"
          :rows="items"
          :loading="loading && initialLoad"
          :sort="query.sort.value"
          caption="Users"
          @sort="query.toggleSort($event)"
        >
          <template #[`cell:name`]="{ row }">
            <div class="min-w-0">
              <p class="truncate font-medium text-[var(--color-ink)]">{{ row.name }}</p>
              <p class="truncate text-xs text-[var(--color-ink-muted)]">{{ row.email }}</p>
            </div>
          </template>

          <template #[`cell:role`]="{ row }">
            <AppBadge :tone="row.role === 'admin' ? 'info' : 'neutral'">{{ row.role }}</AppBadge>
          </template>

          <template #[`cell:status`]="{ row }">
            <AppBadge :tone="STATUS_TONES[row.status]">{{ row.status }}</AppBadge>
          </template>

          <template #[`cell:planId`]="{ row }">
            <span class="text-[var(--color-ink-muted)]">{{ row.planId ?? '—' }}</span>
          </template>

          <template #[`cell:lastSeenAt`]="{ row }">
            <span class="text-[var(--color-ink-muted)]">{{ formatRelative(row.lastSeenAt) }}</span>
          </template>

          <template #[`cell:createdAt`]="{ row }">
            <span class="text-[var(--color-ink-muted)]">{{ formatDate(row.createdAt) }}</span>
          </template>
        </AppTable>

        <!-- "No results" and "nothing here yet" are different problems, and
             only the first one is fixed by clearing filters. -->
        <AppEmptyState
          v-if="showEmpty && query.hasActiveFilters.value"
          title="No users match these filters"
          description="Try a different search term or clear the filters to see everyone."
        >
          <AppButton variant="secondary" size="sm" @click="query.clearFilters()">
            Clear filters
          </AppButton>
        </AppEmptyState>

        <AppEmptyState
          v-else-if="showEmpty"
          title="No users yet"
          description="Users will appear here once they sign up."
        />

        <AppPagination
          v-else
          :page="query.page.value"
          :per-page="query.perPage"
          :total="total"
          @change="query.setPage($event)"
        />
      </template>
    </AppCard>
  </div>
</template>
