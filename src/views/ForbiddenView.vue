<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppCard from '@/components/ui/AppCard.vue'
import AppErrorState from '@/components/ui/AppErrorState.vue'
</script>

<template>
  <AppCard>
    <AppErrorState
      :error="{ status: 403, message: 'You do not have permission to view this page.' }"
    />
    <div class="flex justify-center pb-4">
      <RouterLink to="/" class="text-sm font-medium text-brand-600 hover:text-brand-700">
        Back to dashboard
      </RouterLink>
    </div>
  </AppCard>
</template>
