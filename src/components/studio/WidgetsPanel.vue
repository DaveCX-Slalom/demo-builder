<script setup lang="ts">
import { mdiArrowDown, mdiArrowUp } from '@mdi/js'
import { registry } from '@/lib/widgetRegistry'
import { useWorkspace } from '@/composables/useWorkspace'
import type { WidgetSpan } from '@/types'

const { state, setWidget, moveWidget } = useWorkspace()
const label: Record<WidgetSpan, string> = { full: 'Full width', wide: 'Wide', half: 'Half', narrow: 'Narrow' }
const spans = (type: keyof typeof registry) => registry[type].spans.map(v => ({ title: label[v], value: v }))
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Choose which sections the dashboard shows, in what order, and how wide. Each one should answer a question.</p>
  <ul class="list">
    <li v-for="(w, i) in state.config.widgets" :key="w.id" :class="{ off: !w.enabled }">
      <div class="top">
        <v-switch
          :model-value="w.enabled" :label="registry[w.type].name" color="primary" density="compact" hide-details
          @update:model-value="setWidget(w.id, { enabled: !!$event })"
        />
        <div class="moves">
          <v-btn :icon="mdiArrowUp" size="small" variant="text" :disabled="i === 0" :aria-label="`Move ${registry[w.type].name} up`" @click="moveWidget(w.id, -1)" />
          <v-btn :icon="mdiArrowDown" size="small" variant="text" :disabled="i === state.config.widgets.length - 1" :aria-label="`Move ${registry[w.type].name} down`" @click="moveWidget(w.id, 1)" />
        </div>
      </div>
      <v-select
        :model-value="w.span" :items="spans(w.type)" label="Width" density="compact" variant="outlined" hide-details
        :disabled="registry[w.type].spans.length === 1" class="mb-2" @update:model-value="setWidget(w.id, { span: $event })"
      />
      <v-text-field
        :model-value="w.answers" label="Question this answers" density="compact" variant="outlined" hide-details
        @update:model-value="setWidget(w.id, { answers: $event })"
      />
    </li>
  </ul>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
li { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 8px; padding: 4px 12px 12px; }
li.off { background: rgba(var(--v-theme-on-surface), 0.04); }
.top { display: flex; align-items: center; justify-content: space-between; }
.moves { display: flex; }
</style>
