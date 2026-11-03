<script setup lang="ts">
import { mdiArrowDown, mdiArrowUp, mdiDeleteOutline, mdiPlus, mdiPresentation } from '@mdi/js'
import { useWorkspace } from '@/composables/useWorkspace'
import { usePresentation } from '@/composables/usePresentation'
import { useToast } from '@/composables/useToast'
import { registry } from '@/lib/widgetRegistry'
import type { GuidedStep } from '@/types'

const { state, addStep, updateStep, moveStep, removeStep } = useWorkspace()
const { start } = usePresentation()
const { toast } = useToast()

const screens = [{ title: 'Dashboard', value: 'dashboard' }, { title: 'Deal page', value: 'deal' }]
const spotItems = (s: GuidedStep) => s.screen === 'deal'
  ? [{ title: 'Advance stage button', value: 'advance' }]
  : state.config.widgets.map(w => ({ title: registry[w.type].name + (w.enabled ? '' : ' (turned off)'), value: w.id }))

function present() { if (!start()) toast('Add at least one step first.') }
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Script a short tour for Present mode: which screen to show, what to say, and which part to highlight.</p>
  <v-btn color="primary" :prepend-icon="mdiPresentation" :disabled="!state.config.guidedSteps.length" class="mb-4" @click="present">Present</v-btn>

  <p v-if="!state.config.guidedSteps.length" class="text-body-2 text-medium-emphasis">No steps yet. Add one to build a tour.</p>
  <ol class="list">
    <li v-for="(s, i) in state.config.guidedSteps" :key="i">
      <div class="top">
        <span class="font-weight-bold">Step {{ i + 1 }}</span>
        <div>
          <v-btn :icon="mdiArrowUp" size="small" variant="text" :disabled="i === 0" :aria-label="`Move step ${i + 1} up`" @click="moveStep(i, -1)" />
          <v-btn :icon="mdiArrowDown" size="small" variant="text" :disabled="i === state.config.guidedSteps.length - 1" :aria-label="`Move step ${i + 1} down`" @click="moveStep(i, 1)" />
          <v-btn :icon="mdiDeleteOutline" size="small" variant="text" :aria-label="`Remove step ${i + 1}`" @click="removeStep(i)" />
        </div>
      </div>
      <v-select :model-value="s.screen" :items="screens" label="Screen" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="updateStep(i, { screen: $event })" />
      <v-select :model-value="s.spotlight" :items="spotItems(s)" label="Highlight" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="updateStep(i, { spotlight: $event })" />
      <v-textarea :model-value="s.caption" label="What to say" rows="2" auto-grow density="compact" variant="outlined" hide-details @update:model-value="updateStep(i, { caption: $event })" />
    </li>
  </ol>
  <v-btn :prepend-icon="mdiPlus" variant="tonal" class="mt-3" @click="addStep">Add step</v-btn>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
li { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px; padding: 12px; }
.top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
</style>
