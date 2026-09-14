<script setup lang="ts">
const { title, padded = true } = defineProps<{ title?: string; padded?: boolean }>()
</script>

<template>
  <section
    class="rounded-card bg-[var(--color-surface)] ring-1 ring-[var(--color-line)]"
    :class="padded ? 'p-4 sm:p-5' : ''"
  >
    <header v-if="title || $slots.actions" class="mb-4 flex items-center justify-between gap-3">
      <h2 v-if="title" class="text-sm font-semibold text-[var(--color-ink)]">{{ title }}</h2>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>
