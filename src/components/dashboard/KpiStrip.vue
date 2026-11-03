<script setup lang="ts">
import { computed } from 'vue'
import MetricCard from './MetricCard.vue'
import { money, percent, plural } from '@/lib/format'
import type { Kpis } from '@/lib/derive'

const props = defineProps<{ kpis: Kpis; quarter: string }>()

const pace = computed(() => {
  const r = props.kpis.forecastVsTarget
  if (props.kpis.target === 0) return { tone: 'neutral' as const, text: 'No target set' }
  if (r >= 1) return { tone: 'good' as const, text: 'On pace, at or above target' }
  if (r >= 0.95) return { tone: 'good' as const, text: 'On pace' }
  if (r >= 0.85) return { tone: 'warn' as const, text: 'Slightly behind pace' }
  return { tone: 'bad' as const, text: 'Behind pace' }
})
</script>

<template>
  <div class="strip" role="group" :aria-label="`Key numbers for ${quarter}`">
    <MetricCard label="Open pipeline" :value="money(kpis.openPipeline)" hint="All open deals in scope" />
    <MetricCard label="Funded to date" :value="money(kpis.fundedToDate)" :hint="quarter" />
    <MetricCard label="Quarter forecast" :value="money(kpis.quarterForecast)" :hint="`Target ${money(kpis.target)}`" />
    <MetricCard label="Forecast vs target" :value="percent(kpis.forecastVsTarget)" :tone="pace.tone" :delta="pace.text" />
    <MetricCard
      label="Stalled deals" :value="String(kpis.stalledCount)"
      :tone="kpis.stalledCount ? 'bad' : 'good'"
      :delta="kpis.stalledCount ? `${plural(kpis.stalledCount, 'deal')} past time limit` : 'None past time limit'"
      :hint="kpis.stalledCount ? `${money(kpis.stalledWeighted)} weighted value at stake` : undefined"
    />
  </div>
</template>

<style scoped>
.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
</style>
