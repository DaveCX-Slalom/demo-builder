<script setup lang="ts">
import { computed, ref } from 'vue'
import StatusChip from '@/components/common/StatusChip.vue'
import { money } from '@/lib/format'
import type { AttentionRow } from '@/lib/derive'

const props = defineProps<{ deals: AttentionRow[]; stageFilter?: string | null }>()
const emit = defineEmits<{ select: [dealId: string]; clearStage: [] }>()

const LIMIT = 8
const showAll = ref(false)
const filtered = computed(() => props.stageFilter ? props.deals.filter(d => d.stage === props.stageFilter) : props.deals)
const rows = computed(() => showAll.value ? filtered.value : filtered.value.slice(0, LIMIT))
</script>

<template>
  <div>
    <p v-if="stageFilter && filtered.length" class="text-body-2 mb-2">
      Showing {{ filtered[0].stageName }} deals only.
      <button class="link-btn" @click="emit('clearStage')">Show all stages</button>
    </p>
    <p v-if="!filtered.length" class="text-body-2 text-medium-emphasis pa-3">
      {{ stageFilter ? 'No open deals in this stage.' : 'No open deals in scope.' }}
      <button v-if="stageFilter" class="link-btn" @click="emit('clearStage')">Show all stages</button>
    </p>
    <table v-else class="data stack">
      <thead>
        <tr><th>Deal</th><th>Stage</th><th class="num">Days in stage</th><th>Status</th><th class="num">Value</th></tr>
      </thead>
      <tbody>
        <tr v-for="d in rows" :key="d.id">
          <td class="cell-main">
            <button class="link-btn" :title="d.name" @click="emit('select', d.id)"><span class="clip">{{ d.name }}</span></button>
            <div class="text-caption text-medium-emphasis">{{ d.clientName }} · {{ d.rmName }}</div>
          </td>
          <td data-label="Stage">{{ d.stageName }}</td>
          <td class="num" data-label="Days in stage">{{ d.daysInStage }} of {{ d.slaDays }} days</td>
          <td data-label="Status"><StatusChip :status="d.status" /></td>
          <td class="num" data-label="Value">
            {{ money(d.amount) }}
            <div class="text-caption text-medium-emphasis">{{ money(d.weighted) }} weighted</div>
          </td>
        </tr>
      </tbody>
    </table>
    <v-btn v-if="filtered.length > LIMIT" variant="text" size="small" class="mt-2" @click="showAll = !showAll">
      {{ showAll ? 'Show fewer' : `Show all ${filtered.length} deals` }}
    </v-btn>
  </div>
</template>

<style scoped>
.clip { display: inline-block; max-width: 100%; text-align: left; }
</style>
