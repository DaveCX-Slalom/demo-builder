<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardCanvas from '@/components/dashboard/DashboardCanvas.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { useFilters } from '@/composables/useFilters'
import { availableQuarters, type Filters } from '@/lib/derive'

const { state, persona } = useWorkspace()
const { filters, setRegion, setQuarter, toggleStage, clearStage, reset } = useFilters()
const route = useRoute()
const router = useRouter()

const regions = computed(() => persona.value.scope === 'all'
  ? state.regions
  : state.regions.filter(r => state.relationshipManagers.some(m => m.id === persona.value.rmId && m.region === r)))
const quarters = computed(() => availableQuarters(state))
const stageName = computed(() => state.stages.find(s => s.id === filters.value.stage)?.name ?? null)

function onFilterBar(next: Filters) {
  if (next.region !== filters.value.region) setRegion(next.region)
  if (next.quarter !== filters.value.quarter) setQuarter(next.quarter)
  if (next.stage !== filters.value.stage && !next.stage) clearStage()
}
// Keep filters when opening a deal so "Back" returns to the same view.
const openDeal = (id: string) => router.push({ name: 'deal', params: { id }, query: route.query })
const onToggleStage = (id: string) => (id === filters.value.stage ? clearStage() : toggleStage(id))
</script>

<template>
  <FilterBar
    :regions="regions" :quarters="quarters" :default-quarter="state.meta.quarter"
    :model-value="filters" :stage-name="stageName" @update:model-value="onFilterBar" @reset="reset"
  />
  <v-container fluid class="page">
    <h1 class="sr-only">{{ state.config.brand.product }} dashboard</h1>
    <DashboardCanvas :state="state" :persona="persona" :filters="filters" @select-deal="openDeal" @toggle-stage="onToggleStage" @reset="reset" />
  </v-container>
</template>

<style scoped>
.page { max-width: 1400px; padding: 16px; }
</style>
