import { ref } from 'vue'
import { defineStore } from 'pinia'
import { http, isApiError, type ApiError } from '@/lib/http'
import type { StatsOverview } from '@/types/domain'

export const useStatsStore = defineStore('stats', () => {
  const overview = ref<StatsOverview | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function fetchOverview() {
    loading.value = true
    error.value = null

    try {
      const { data } = await http.get<StatsOverview>('/stats/overview')
      overview.value = data
    } catch (e) {
      error.value = isApiError(e) ? e : { status: 0, message: 'Unexpected error.' }
      overview.value = null
    } finally {
      loading.value = false
    }
  }

  return { overview, loading, error, fetchOverview }
})
