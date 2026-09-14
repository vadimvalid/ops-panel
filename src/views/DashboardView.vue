<script setup lang="ts">
import AppCard from '@/components/ui/AppCard.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="space-y-4">
    <AppCard title="Welcome">
      <p class="text-sm text-[var(--color-ink-muted)]">
        Signed in as {{ auth.user?.name }} ({{ auth.user?.role }}). Dashboard widgets arrive with
        the next feature.
      </p>
    </AppCard>
  </div>
</template>
