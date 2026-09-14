<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { chartInk, trendColor } from '@/lib/chart-theme'
import { formatMoney, formatMonth } from '@/lib/format'
import type { MonthlyPoint } from '@/types/domain'

// Legend is deliberately absent: a single series is named by the card title,
// so a one-swatch legend box would only restate it.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const { points, currency = 'EUR' } = defineProps<{
  points: readonly MonthlyPoint[]
  currency?: string
}>()

const ink = chartInk()
const color = trendColor()

const data = computed(() => ({
  labels: points.map((p) => formatMonth(p.month)),
  datasets: [
    {
      data: points.map((p) => p.total / 100),
      borderColor: color,
      // A wash, not a saturated block.
      backgroundColor: `${color}1a`,
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: ink.surface,
      pointHoverBackgroundColor: color,
    },
  ],
}))

const options = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (item) => formatMoney(Number(item.raw) * 100, currency),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { color: ink.grid },
      ticks: { color: ink.axis, maxRotation: 0, autoSkipPadding: 16 },
    },
    y: {
      beginAtZero: true,
      grid: { color: ink.grid },
      border: { display: false },
      ticks: {
        color: ink.axis,
        callback: (value) => formatMoney(Number(value) * 100, currency),
        maxTicksLimit: 5,
      },
    },
  },
}))
</script>

<template>
  <div class="h-64">
    <Line :data="data" :options="options" aria-label="Monthly revenue trend" role="img" />
  </div>
</template>
