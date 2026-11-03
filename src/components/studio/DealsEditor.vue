<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { mdiClose, mdiDeleteOutline, mdiPlus } from '@mdi/js'
import { useWorkspace } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'
import type { Deal } from '@/types'

const open = defineModel<boolean>({ default: false })
const { state, upsertDeal, removeDeal, newDealId } = useWorkspace()
const { toast } = useToast()

// Edit a working copy; a row is saved to the store only when it is valid, so bad values never reach the dashboard.
const rows = ref<Deal[]>([])
const errors = reactive<Record<string, Record<string, string>>>({})
watch(open, o => {
  if (!o) return
  rows.value = JSON.parse(JSON.stringify(state.deals))
  for (const k of Object.keys(errors)) delete errors[k]
})

const labels: Record<string, string> = {
  name: 'Name', amount: 'Amount', stage: 'Stage', rmId: 'Relationship manager',
  daysInStage: 'Days in stage', expectedClose: 'Expected close', fundedDate: 'Funded date',
}
const err = (row: Deal, field: string) => errors[row.id]?.[field] ? [`${labels[field]} ${errors[row.id][field]}`] : []

function commit(row: Deal) {
  const res = upsertDeal({ ...row })
  if (res.ok) {
    delete errors[row.id]
    const saved = state.deals.find(d => d.id === row.id)
    if (saved) Object.assign(row, { region: saved.region, fundedDate: saved.fundedDate, daysInStage: saved.daysInStage })
  } else errors[row.id] = res.fields ?? {}
}
const edit = <K extends keyof Deal>(row: Deal, key: K, value: Deal[K]) => { row[key] = value; commit(row) }
const num = (v: string) => (v === '' ? NaN : Number(v))

function setClient(row: Deal, clientId: string) {
  row.clientId = clientId
  row.rmId = state.clients.find(c => c.id === clientId)?.rmId ?? row.rmId
  commit(row)
}

function add() {
  const client = state.clients[0]
  const row: Deal = {
    id: newDealId(), name: 'New deal', clientId: client.id, rmId: client.rmId, region: client.region, product: 'Term Loan',
    amount: 500000, stage: state.stages[0].id, daysInStage: 0, openedDate: state.meta.asOf,
    expectedClose: state.meta.quarterEnd, fundedDate: null,
  }
  commit(row)
  rows.value.push(row)
  toast('Deal added at the bottom of the table.')
}
function remove(row: Deal) {
  removeDeal(row.id)
  rows.value = rows.value.filter(r => r.id !== row.id)
  delete errors[row.id]
  toast(`Removed ${row.name}.`)
}
</script>

<template>
  <v-dialog v-model="open" fullscreen scrollable>
    <v-card>
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title>Edit deals</v-toolbar-title>
        <v-btn :icon="mdiClose" aria-label="Close deal editor" @click="open = false" />
      </v-toolbar>
      <v-card-text>
        <p class="text-body-2 mb-3">Changes save automatically when every field in a row is valid. Rows with a message are not saved yet. Moving a deal to the final stage marks it funded.</p>
        <div class="scroll">
          <table class="data ed">
            <thead>
              <tr>
                <th>Deal</th><th>Client</th><th>Relationship manager</th><th>Stage</th>
                <th class="num">Amount ($)</th><th class="num">Days in stage</th><th>Expected close</th><th><span class="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id" :class="{ bad: errors[r.id] }">
                <td>
                  <v-text-field :model-value="r.name" :aria-label="`Name of ${r.id}`" :error-messages="err(r, 'name')" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'name', $event)" />
                  <span class="text-caption text-medium-emphasis">{{ r.id }}</span>
                </td>
                <td>
                  <v-select :model-value="r.clientId" :items="state.clients.map(c => ({ title: c.name, value: c.id }))" :aria-label="`Client of ${r.id}`" density="compact" variant="underlined" hide-details @update:model-value="setClient(r, $event)" />
                </td>
                <td>
                  <v-select :model-value="r.rmId" :items="state.relationshipManagers.map(m => ({ title: m.name, value: m.id }))" :error-messages="err(r, 'rmId')" :aria-label="`Relationship manager of ${r.id}`" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'rmId', $event)" />
                </td>
                <td>
                  <v-select :model-value="r.stage" :items="state.stages.map(s => ({ title: s.name, value: s.id }))" :error-messages="err(r, 'stage')" :aria-label="`Stage of ${r.id}`" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'stage', $event)" />
                </td>
                <td class="num">
                  <v-text-field :model-value="r.amount" type="number" min="1" :error-messages="err(r, 'amount')" :aria-label="`Amount of ${r.id}`" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'amount', num($event))" />
                </td>
                <td class="num">
                  <v-text-field :model-value="r.daysInStage" type="number" min="0" :error-messages="err(r, 'daysInStage')" :disabled="!!r.fundedDate" :aria-label="`Days in stage of ${r.id}`" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'daysInStage', num($event))" />
                </td>
                <td>
                  <v-text-field :model-value="r.expectedClose" type="date" :error-messages="err(r, 'expectedClose')" :aria-label="`Expected close of ${r.id}`" density="compact" variant="underlined" hide-details="auto" @update:model-value="edit(r, 'expectedClose', $event)" />
                </td>
                <td><v-btn :icon="mdiDeleteOutline" size="small" variant="text" :aria-label="`Remove ${r.name}`" @click="remove(r)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <v-btn :prepend-icon="mdiPlus" variant="tonal" class="mt-4" @click="add">Add deal</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.scroll { overflow-x: auto; }
table.ed { min-width: 980px; }
table.ed td { vertical-align: top; padding: 4px 8px; }
tr.bad td { background: rgba(var(--v-theme-error), 0.06); }
</style>
