<script setup lang="ts">
import { computed } from 'vue'
import { money, monthShort, percent } from '@/lib/format'
import type { TrendPoint } from '@/types'

const props = defineProps<{ points: TrendPoint[]; highlightMonth: string; priorAverage: number; deltaVsAverage: number }>()

const W = 480, H = 240, L = 44, R = 16, T = 24, B = 30
const plotW = W - L - R, plotH = H - T - B

const yMax = computed(() => Math.max(2e6, Math.ceil(Math.max(...props.points.map(p => p.fundedVolume), 0) / 2e6) * 2e6))
const x = (i: number) => L + (props.points.length > 1 ? (i / (props.points.length - 1)) * plotW : plotW / 2)
const y = (v: number) => T + plotH - (v / yMax.value) * plotH
const coords = computed(() => props.points.map((p, i) => ({ ...p, cx: x(i), cy: y(p.fundedVolume) })))
const line = computed(() => coords.value.map((c, i) => `${i ? 'L' : 'M'}${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(' '))
const area = computed(() => coords.value.length
  ? `${line.value} L${coords.value.at(-1)!.cx},${T + plotH} L${coords.value[0].cx},${T + plotH} Z` : '')
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: yMax.value * f, y: y(yMax.value * f) })))
const last = computed(() => coords.value.find(c => c.month === props.highlightMonth))

const summary = computed(() => {
  const l = last.value
  if (!l) return 'No funding trend data.'
  const dir = props.deltaVsAverage >= 0 ? 'above' : 'below'
  return `Monthly funded volume for ${props.points.length} months. ${monthShort(l.month)} is ${money(l.fundedVolume)}, ` +
    `${percent(Math.abs(props.deltaVsAverage))} ${dir} the prior average of ${money(props.priorAverage)}.`
})
</script>

<template>
  <div>
    <p class="text-body-2 mb-2">{{ summary }}</p>
    <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="summary" class="chart">
      <g v-for="t in ticks" :key="t.v">
        <line :x1="L" :x2="W - R" :y1="t.y" :y2="t.y" class="grid" />
        <text :x="L - 6" :y="t.y + 4" text-anchor="end" class="axis">{{ t.v === 0 ? '$0' : money(t.v) }}</text>
      </g>
      <path :d="area" class="area" />
      <path :d="line" class="line" />
      <g v-for="c in coords" :key="c.month">
        <circle :cx="c.cx" :cy="c.cy" :r="c.month === highlightMonth ? 5 : 2.5" :class="c.month === highlightMonth ? 'dot hi' : 'dot'" />
        <text :x="c.cx" :y="H - 8" text-anchor="middle" class="axis">{{ monthShort(c.month) }}</text>
      </g>
      <text v-if="last" :x="last.cx" :y="last.cy - 10" text-anchor="end" class="callout">{{ money(last.fundedVolume) }}</text>
    </svg>
    <details class="mt-2">
      <summary class="text-body-2">View data as a table</summary>
      <table class="data">
        <thead><tr><th>Month</th><th class="num">Funded</th><th class="num">New pipeline</th></tr></thead>
        <tbody>
          <tr v-for="p in points" :key="p.month">
            <td>{{ monthShort(p.month) }} {{ p.month.slice(0, 4) }}</td><td class="num">{{ money(p.fundedVolume) }}</td><td class="num">{{ money(p.newPipeline) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.chart { width: 100%; height: auto; display: block; }
.grid { stroke: rgba(var(--v-border-color), 0.14); stroke-width: 1; }
.axis { fill: rgba(var(--v-theme-on-surface), 0.72); font-size: 11px; font-variant-numeric: tabular-nums; }
.area { fill: rgba(var(--v-theme-secondary), 0.2); }
.line { fill: none; stroke: rgb(var(--v-theme-primary)); stroke-width: 2.5; stroke-linejoin: round; }
.dot { fill: rgb(var(--v-theme-surface)); stroke: rgb(var(--v-theme-primary)); stroke-width: 2; }
.dot.hi { fill: rgb(var(--v-theme-secondary)); stroke: rgb(var(--v-theme-primary)); }
.callout { fill: rgb(var(--v-theme-on-surface)); font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
