<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { mdiFilterVariant } from '@mdi/js'
import type { Filters } from '@/lib/derive'

const props = defineProps<{
  regions: string[]; quarters: string[]; defaultQuarter: string; modelValue: Filters; stageName?: string | null
}>()
const emit = defineEmits<{ 'update:modelValue': [Filters]; reset: [] }>()

const { xs } = useDisplay()
const open = ref(false)
const showControls = computed(() => !xs.value || open.value)

const quarter = computed(() => props.modelValue.quarter ?? props.defaultQuarter)
const chips = computed(() => {
  const f = props.modelValue
  return [
    f.region && { key: 'region' as const, label: `Region: ${f.region}` },
    f.quarter && f.quarter !== props.defaultQuarter && { key: 'quarter' as const, label: `Quarter: ${f.quarter}` },
    f.stage && { key: 'stage' as const, label: `Stage: ${props.stageName ?? f.stage}` },
  ].filter(Boolean) as { key: keyof Filters; label: string }[]
})

function set(patch: Partial<Filters>) { emit('update:modelValue', { ...props.modelValue, ...patch }) }
</script>

<template>
  <div class="bar" role="region" aria-label="Filters">
    <div class="row">
      <v-btn v-if="xs" variant="tonal" size="small" :prepend-icon="mdiFilterVariant" :aria-expanded="open" @click="open = !open">
        Filters<v-badge v-if="chips.length" :content="chips.length" inline color="primary" />
      </v-btn>
      <template v-if="showControls">
        <v-select
          :model-value="modelValue.region" :items="regions" label="Region" placeholder="All regions" clearable
          density="compact" variant="outlined" hide-details class="ctl" @update:model-value="set({ region: $event || null })"
        />
        <v-select
          :model-value="quarter" :items="quarters" label="Quarter" density="compact" variant="outlined" hide-details class="ctl"
          @update:model-value="set({ quarter: $event === defaultQuarter ? null : $event })"
        />
      </template>
    </div>
    <div v-if="chips.length" class="row chips" aria-live="polite">
      <v-chip v-for="c in chips" :key="c.key" size="small" closable label @click:close="set({ [c.key]: null })">{{ c.label }}</v-chip>
      <v-btn variant="text" size="small" @click="emit('reset')">Reset filters</v-btn>
    </div>
  </div>
</template>

<style scoped>
.bar {
  position: sticky; top: var(--v-layout-top, 56px); z-index: 5;
  background: rgb(var(--v-theme-background)); padding: 10px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; max-width: 1400px; margin: 0 auto; }
.chips { margin-top: 8px; }
.ctl { max-width: 220px; min-width: 150px; flex: 1 1 150px; }
</style>
