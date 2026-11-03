<script setup lang="ts">
import { ref } from 'vue'
import { mdiAlertOutline, mdiChevronDown, mdiChevronRight } from '@mdi/js'
import { money, percent } from '@/lib/format'
import type { RegionRow } from '@/lib/derive'

const props = defineProps<{ rows: RegionRow[]; pace: number }>()
const emit = defineEmits<{ select: [region: string] }>()
const open = ref<Set<string>>(new Set())

function toggle(region: string) {
  const next = new Set(open.value)
  if (next.has(region)) next.delete(region)
  else { next.add(region); emit('select', region) }
  open.value = next
}
// "Behind pace": funded share is under 75% of the share of the quarter already elapsed.
const behind = (r: RegionRow) => r.target > 0 && r.percent < props.pace * 0.75
</script>

<template>
  <p v-if="!rows.length" class="text-body-2 text-medium-emphasis pa-3">No regions in scope.</p>
  <table v-else class="data stack">
    <thead>
      <tr><th>Region</th><th class="num">Funded</th><th class="num">Target</th><th class="num">To target</th><th class="num">Open pipeline</th><th class="num">Stalled</th></tr>
    </thead>
    <tbody>
      <template v-for="r in rows" :key="r.region">
        <tr>
          <td class="cell-main">
            <button class="link-btn exp" :aria-expanded="open.has(r.region)" @click="toggle(r.region)">
              <v-icon :icon="open.has(r.region) ? mdiChevronDown : mdiChevronRight" size="18" aria-hidden="true" />{{ r.region }}
            </button>
            <span v-if="behind(r)" class="behind text-warning"><v-icon :icon="mdiAlertOutline" size="14" aria-hidden="true" /> Behind pace</span>
          </td>
          <td class="num" data-label="Funded">{{ money(r.funded) }}</td>
          <td class="num" data-label="Target">{{ money(r.target) }}</td>
          <td class="num" data-label="To target">{{ percent(r.percent) }}</td>
          <td class="num" data-label="Open pipeline">{{ money(r.openPipeline) }}</td>
          <td class="num" data-label="Stalled">{{ r.stalled }}</td>
        </tr>
        <tr v-for="m in open.has(r.region) ? r.rms : []" :key="m.rm.id" class="rm">
          <td class="cell-main text-body-2 pl-8">{{ m.rm.name }}</td>
          <td class="num" data-label="Funded">{{ money(m.funded) }}</td>
          <td class="num" data-label="Target">{{ money(m.rm.quarterlyFundingTarget) }}</td>
          <td class="num" data-label="To target">{{ percent(m.percent) }}</td>
          <td></td><td></td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
.exp { display: inline-flex; align-items: center; }
.behind { display: inline-flex; align-items: center; gap: 2px; margin-left: 10px; font-size: 0.75rem; font-weight: 600; }
.rm td { background: rgba(var(--v-theme-on-surface), 0.03); }
@container widget (max-width: 560px) { .rm td:empty { display: none; } }
</style>
