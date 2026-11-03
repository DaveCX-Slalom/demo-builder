<script setup lang="ts">
import { computed } from 'vue'
import { mdiArrowDown, mdiArrowUp, mdiDeleteOutline, mdiPlus } from '@mdi/js'
import { useWorkspace, slugId } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'
import { plural } from '@/lib/format'
import CommitField from '@/components/common/CommitField.vue'
import type { Stage } from '@/types'

const { state, upsertStage, moveStage, removeStage, setThreshold } = useWorkspace()
const { toast } = useToast()

const open = computed(() => state.stages.slice(0, -1))
const final = computed(() => state.stages[state.stages.length - 1])
const atRiskPct = computed(() => Math.round(state.config.thresholds.atRiskRatio * 100))

const required = (v: string) => !!v?.trim() || 'Required'
const wholeDays = (v: string) => (Number.isInteger(Number(v)) && Number(v) >= 1) || 'Whole days, 1 or more'
const percentRule = (v: string) => (v !== '' && Number(v) >= 0 && Number(v) <= 100) || '0 to 100'

function rename(s: Stage, v: string) { if (v.trim()) upsertStage({ ...s, name: v }) }
function setDays(s: Stage, v: string) { if (wholeDays(v) === true) upsertStage({ ...s, slaDays: Number(v) }) }
function setProb(s: Stage, v: string) { if (percentRule(v) === true) upsertStage({ ...s, probability: Number(v) / 100 }) }

function add() {
  const id = slugId('new stage', state.stages.map(s => s.id), 'stage')
  upsertStage({ id, name: 'New stage', probability: 0.5, slaDays: 14 })
  toast('Stage added before Funded. Rename it and set its time limit.')
}
function remove(s: Stage) {
  const res = removeStage(s.id)
  if (!res.ok) return void toast(res.errors[0])
  toast(res.moved ? `${plural(res.moved, 'deal')} moved to ${res.to}.` : 'Stage removed. No deals were on it.')
}
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Name the stages a deal moves through, how long each may take, and when to warn.</p>

  <v-slider
    :model-value="atRiskPct" :min="50" :max="100" :step="5" thumb-label color="primary" hide-details class="mb-1"
    label="Mark a deal as at risk after" @update:model-value="setThreshold($event / 100)"
  />
  <p class="text-caption text-medium-emphasis mb-4">
    Warn once a deal has used {{ atRiskPct }}% of the days allowed in its stage. Past 100% it is marked stalled.
  </p>

  <ul class="list">
    <li v-for="(s, i) in open" :key="s.id">
      <div class="top">
        <CommitField :model-value="s.name" label="Stage name" :rule="required" @commit="rename(s, $event)" />
        <div class="actions">
          <v-btn :icon="mdiArrowUp" size="small" variant="text" :disabled="i === 0" :aria-label="`Move ${s.name} earlier`" @click="moveStage(s.id, -1)" />
          <v-btn :icon="mdiArrowDown" size="small" variant="text" :disabled="i === open.length - 1" :aria-label="`Move ${s.name} later`" @click="moveStage(s.id, 1)" />
          <v-btn :icon="mdiDeleteOutline" size="small" variant="text" :disabled="open.length <= 2" :aria-label="`Remove ${s.name}`" @click="remove(s)" />
        </div>
      </div>
      <div class="pair">
        <CommitField :model-value="s.slaDays" label="Days allowed" type="number" min="1" :rule="wholeDays" @commit="setDays(s, $event)" />
        <CommitField :model-value="Math.round(s.probability * 100)" label="Chance of winning (%)" type="number" min="0" max="100" :rule="percentRule" @commit="setProb(s, $event)" />
      </div>
    </li>
    <li class="final">
      <CommitField :model-value="final.name" label="Final stage name" :rule="required" @commit="rename(final, $event)" />
      <p class="text-caption text-medium-emphasis mt-1 mb-0">Deals that reach this stage count as funded. It stays last and cannot be removed.</p>
    </li>
  </ul>
  <v-btn :prepend-icon="mdiPlus" variant="tonal" class="mt-3" @click="add">Add stage</v-btn>
  <p v-if="open.length <= 2" class="text-caption text-medium-emphasis mt-2 mb-0">Keep at least two open stages.</p>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
li { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px; padding: 12px; }
li.final { background: rgba(var(--v-theme-on-surface), 0.04); }
.top { display: grid; grid-template-columns: 1fr auto; gap: 4px; align-items: start; }
.actions { display: flex; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
</style>
