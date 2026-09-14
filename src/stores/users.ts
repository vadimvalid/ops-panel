import { ref } from 'vue'
import { defineStore } from 'pinia'
import { http, isApiError, type ApiError } from '@/lib/http'
import type { Paginated, User } from '@/types/domain'

export const useUsersStore = defineStore('users', () => {
  const items = ref<User[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  /** True only for the very first load, so filtering shows rows, not a skeleton. */
  const initialLoad = ref(true)

  /** Guards against a slow earlier response overwriting a newer one. */
  let requestId = 0

  async function fetchList(params: Record<string, string | number>) {
    const current = ++requestId
    loading.value = true
    error.value = null

    try {
      const { data } = await http.get<Paginated<User>>('/users', { params })
      if (current !== requestId) return

      items.value = data.items
      total.value = data.total
    } catch (e) {
      if (current !== requestId) return

      error.value = isApiError(e) ? e : { status: 0, message: 'Unexpected error.' }
      items.value = []
      total.value = 0
    } finally {
      if (current === requestId) {
        loading.value = false
        initialLoad.value = false
      }
    }
  }

  return { items, total, loading, error, initialLoad, fetchList }
})
