<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatsStore } from '@/stores/stats'
import { formatMoney, formatNumber } from '@/lib/format'
import AppCard from '@/components/ui/AppCard.vue'
import AppStatTile from '@/components/ui/AppStatTile.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import AppErrorState from '@/components/ui/AppErrorState.vue'
// Chart.js is ~150 kB and the KPI row is useful without it, so the charts load
// as their own chunk rather than blocking the first screen after sign-in.
const RevenueTrendChart = defineAsyncComponent(
  () => import('@/components/charts/RevenueTrendChart.vue'),
)
const PlanBreakdownChart = defineAsyncComponent(
  () => import('@/components/charts/PlanBreakdownChart.vue'),
)

const store = useStatsStore()
const { overview, loading, error } = storeToRefs(store)

onMounted(() => store.fetchOverview())

/** Percentage change between the last two completed months. */
function trailingDelta(points: readonly { total: number }[] | undefined): number | null {
  if (!points || points.length < 2) return null

  const previous = points[points.length - 2]!.total
  const latest = points[points.length - 1]!.total
  // A jump from zero has no meaningful percentage.
  if (previous === 0) return null

  return ((latest - previous) / previous) * 100
}

const revenueDelta = computed(() => trailingDelta(overview.value?.revenue))
const signupDelta = computed(() => trailingDelta(overview.value?.signups))
</script>

<template>
  <div class="space-y-4">
    <AppErrorState v-if="error" :error="error" :retrying="loading" @retry="store.fetchOverview()" />

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AppStatTile
          label="Monthly recurring revenue"
          :value="overview ? formatMoney(overview.mrr, overview.currency) : '—'"
          :delta="revenueDelta"
          :loading="loading"
        />
        <AppStatTile
          label="Active users"
          :value="overview ? formatNumber(overview.activeUsers) : '—'"
          :delta="signupDelta"
          :loading="loading"
        />
        <AppStatTile
          label="Active subscriptions"
          :value="overview ? formatNumber(overview.activeSubscriptions) : '—'"
          :loading="loading"
        />
        <AppStatTile
          label="Past due"
          :value="overview ? formatNumber(overview.pastDueSubscriptions) : '—'"
          :loading="loading"
          :tone="overview && overview.pastDueSubscriptions > 0 ? 'critical' : undefined"
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <AppCard title="Revenue, last 12 months" class="lg:col-span-2">
          <AppSkeleton v-if="loading || !overview" :lines="6" class="h-8" />
          <RevenueTrendChart v-else :points="overview.revenue" :currency="overview.currency" />
        </AppCard>

        <AppCard title="Users per plan">
          <AppSkeleton v-if="loading || !overview" :lines="5" class="h-8" />
          <PlanBreakdownChart v-else :items="overview.planBreakdown" />
        </AppCard>
      </div>
    </template>
  </div>
</template>
