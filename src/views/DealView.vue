<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { mdiArrowLeft, mdiCheck } from '@mdi/js'
import StatusChip from '@/components/common/StatusChip.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StagePath from '@/components/deal/StagePath.vue'
import ActivityTimeline from '@/components/deal/ActivityTimeline.vue'
import ExceptionList from '@/components/dashboard/ExceptionList.vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { usePresentation } from '@/composables/usePresentation'
import { exceptionRowsFor, statusOf, weightedValue } from '@/lib/derive'
import { dateShort, money, percent } from '@/lib/format'

const props = defineProps<{ id: string }>()
const route = useRoute()
const { state, advanceStage } = useWorkspace()
const { spotlight, presenting } = usePresentation()

const deal = computed(() => state.deals.find(d => d.id === props.id))
const stage = computed(() => state.stages.find(s => s.id === deal.value?.stage))
const nextStage = computed(() => state.stages[state.stages.findIndex(s => s.id === deal.value?.stage) + 1])
const status = computed(() => deal.value ? statusOf(deal.value, state.stages, state.config.thresholds.atRiskRatio) : 'On track')
const client = computed(() => state.clients.find(c => c.id === deal.value?.clientId))
const rm = computed(() => state.relationshipManagers.find(r => r.id === deal.value?.rmId))
const exceptions = computed(() => deal.value ? exceptionRowsFor(state, [deal.value]) : [])
const activity = computed(() => {
  if (!deal.value) return []
  const items = state.activity.map((a, i) => ({ ...a, i })).filter(a => a.dealId === deal.value!.id)
  items.push({ dealId: deal.value.id, text: 'Deal opened', at: deal.value.openedDate, i: -1 })
  return items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : b.i - a.i))
})

const back = computed(() => ({ name: 'dashboard', query: route.query }))
const message = ref('')
const snack = ref(false)
function advance() {
  const d = advanceStage(props.id)
  if (d) { message.value = d.fundedDate ? 'Deal funded. The dashboard has been updated.' : `Moved to ${stage.value?.name}. The dashboard has been updated.`; snack.value = true }
}

const facts = computed(() => deal.value ? [
  ['Client', client.value?.name ?? deal.value.clientId],
  ['Relationship manager', rm.value?.name ?? deal.value.rmId],
  ['Region', deal.value.region],
  ['Product', deal.value.product],
  ['Amount', money(deal.value.amount, { full: true })],
  ['Weighted value', `${money(weightedValue(deal.value, state.stages), { full: true })} (${percent(stage.value?.probability ?? 0)} win probability)`],
  ['Days in stage', stage.value?.slaDays ? `${deal.value.daysInStage} of ${stage.value.slaDays} allowed` : 'Not applicable'],
  ['Opened', dateShort(deal.value.openedDate)],
  [deal.value.fundedDate ? 'Funded' : 'Expected close', dateShort(deal.value.fundedDate ?? deal.value.expectedClose)],
] : [])
</script>

<template>
  <v-container class="page">
    <template v-if="deal">
      <v-btn :to="back" variant="text" :prepend-icon="mdiArrowLeft" class="mb-2 ml-n3">Back to dashboard</v-btn>
      <header class="head">
        <div>
          <h1 class="text-h5 mb-1">{{ deal.name }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ deal.id }} · {{ client?.name }}</p>
        </div>
        <StatusChip :status="status" />
      </header>

      <v-card variant="flat" border class="pa-4 mb-4"><StagePath :stages="state.stages" :current="deal.stage" /></v-card>

      <div class="cols">
        <v-card variant="flat" border class="pa-4">
          <h2 class="text-subtitle-1 font-weight-bold mb-2">Facts</h2>
          <dl class="facts">
            <template v-for="[k, v] in facts" :key="k"><dt>{{ k }}</dt><dd class="num">{{ v }}</dd></template>
          </dl>
          <div class="mt-4 adv" :class="{ spot: spotlight === 'advance' }" data-spotlight="advance">
            <v-btn v-if="deal.fundedDate" disabled color="primary" :prepend-icon="mdiCheck">Funded on {{ dateShort(deal.fundedDate) }}</v-btn>
            <template v-else>
              <v-btn color="primary" size="large" @click="advance">Advance stage</v-btn>
              <p v-if="nextStage" class="text-caption text-medium-emphasis mt-2 mb-0">
                Moves this deal from {{ stage?.name }} to {{ nextStage.name }} and resets days in stage.
              </p>
            </template>
          </div>
        </v-card>
        <div class="stack-col">
          <v-card variant="flat" border class="pa-4">
            <h2 class="text-subtitle-1 font-weight-bold mb-1">Exceptions</h2>
            <ExceptionList :items="exceptions" :show-deal="false" />
          </v-card>
          <v-card variant="flat" border class="pa-4">
            <h2 class="text-subtitle-1 font-weight-bold mb-3">Activity</h2>
            <ActivityTimeline :entries="activity" />
          </v-card>
        </div>
      </div>
    </template>

    <EmptyState v-else title="Deal not found" :body="`There is no deal with the id “${id}”.`" action-label="Back to dashboard" @action="$router.push(back)" />

    <v-snackbar v-model="snack" timeout="3500" color="primary" role="status" :location="presenting ? 'top' : 'bottom'">{{ message }}</v-snackbar>
  </v-container>
</template>

<style scoped>
.page { max-width: 1100px; padding: 16px; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.stack-col { display: grid; gap: 16px; align-content: start; }
.adv { display: inline-block; padding: 6px; margin-left: -6px; }
.facts { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; margin: 0; }
.facts dt { color: rgba(var(--v-theme-on-surface), 0.72); font-size: 0.875rem; }
.facts dd { margin: 0; font-weight: 500; }
@media (max-width: 800px) { .cols { grid-template-columns: minmax(0, 1fr); } }
</style>
