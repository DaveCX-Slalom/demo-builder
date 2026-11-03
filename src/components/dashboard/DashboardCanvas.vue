<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { registry, type WidgetContext } from '@/lib/widgetRegistry'
import { exceptionRows, kpis as computeKpis, quarterProgress, regionRollup, scopeOf, stageSummary, trendSummary, type Filters } from '@/lib/derive'
import type { Persona, WidgetConfig, WorkspaceState } from '@/types'

/** Renders the dashboard from config through the registry. Used by Dashboard, Studio preview and (later) Present. */
const props = defineProps<{ state: WorkspaceState; persona: Persona; filters: Filters }>()
const emit = defineEmits<{ 'select-deal': [dealId: string]; 'toggle-stage': [stageId: string]; reset: [] }>()

const ctx = computed<WidgetContext>(() => {
  const quarter = props.filters.quarter ?? props.state.meta.quarter
  const scope = scopeOf(props.state, props.persona, props.filters)
  return {
    state: props.state, scope, filters: props.filters, quarter,
    kpis: computeKpis(props.state, scope, quarter),
    stages: stageSummary(props.state, scope),
    exceptions: exceptionRows(props.state, scope),
    regions: regionRollup(props.state, scope, quarter),
    pace: quarterProgress(props.state, quarter),
    trend: trendSummary(props.state),
  }
})

const widgets = computed(() => props.state.config.widgets.filter(w => w.enabled && registry[w.type]))
const filtersActive = computed(() => !!(props.filters.region || props.filters.stage || (props.filters.quarter && props.filters.quarter !== props.state.meta.quarter)))
const noDeals = computed(() => ctx.value.scope.deals.length === 0)

function listeners(w: WidgetConfig) {
  switch (w.type) {
    case 'needsAttention': return { select: (id: string) => emit('select-deal', id), clearStage: () => emit('toggle-stage', props.filters.stage ?? '') }
    case 'exceptions': return { select: (id: string) => emit('select-deal', id) }
    case 'pipelineByStage': return { toggle: (id: string) => emit('toggle-stage', id) }
    default: return {}
  }
}
const titleId = (w: WidgetConfig) => `wt-${w.id}`
</script>

<template>
  <div class="canvas">
    <header class="persona">
      <h2 class="text-h6 mb-0">{{ persona.name }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-1">{{ persona.title }}</p>
      <p class="focus text-body-1 mb-0">{{ persona.focus }}</p>
    </header>

    <EmptyState
      v-if="noDeals && filtersActive" title="No deals match these filters"
      body="Try a different region or quarter, or clear the filters." action-label="Reset filters" @action="emit('reset')"
    />
    <template v-else>
      <p v-if="noDeals" class="text-body-2 text-medium-emphasis mb-3" role="status">
        {{ persona.name }} has no deals in scope yet, so every figure is zero. Check the audience scope in Studio.
      </p>
      <EmptyState
        v-if="!widgets.length" title="Every widget is turned off"
        body="Turn on at least one widget in the Widgets panel in Studio to see the dashboard."
      />
      <div v-else class="grid">
        <section
          v-for="w in widgets" :key="w.id" :class="['span-' + w.span, { widget: !registry[w.type].bare }]"
          :data-widget-id="w.id" :aria-labelledby="titleId(w)"
        >
          <template v-if="registry[w.type].bare">
            <h3 :id="titleId(w)" class="sr-only">{{ registry[w.type].name }}: {{ w.answers }}</h3>
            <component :is="registry[w.type].component" v-bind="registry[w.type].props(ctx)" v-on="listeners(w)" />
          </template>
          <v-card v-else variant="flat" border class="card">
            <div class="head">
              <h3 :id="titleId(w)" class="text-subtitle-1 font-weight-bold">{{ registry[w.type].name }}</h3>
              <p v-if="w.answers" class="text-caption text-medium-emphasis mb-0">{{ w.answers }}</p>
            </div>
            <div class="body"><component :is="registry[w.type].component" v-bind="registry[w.type].props(ctx)" v-on="listeners(w)" /></div>
          </v-card>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.canvas { container-type: inline-size; container-name: canvas; }
.persona { margin-bottom: 16px; }
.focus { max-width: 70ch; }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; grid-auto-flow: row dense; }
.grid > * { min-width: 0; }
.span-full { grid-column: span 12; }
.span-wide { grid-column: span 7; }
.span-half { grid-column: span 6; }
.span-narrow { grid-column: span 5; }
.card { height: 100%; }
.head { padding: 14px 16px 0; }
.body { padding: 8px 16px 16px; }
/* Tablet: full and wide take the row, the rest sit two across. Phone: one column in config order. */
@container canvas (max-width: 899px) {
  .span-wide { grid-column: span 12; }
  .span-half, .span-narrow { grid-column: span 6; }
}
@container canvas (max-width: 599px) {
  .grid > * { grid-column: span 12; }
}
</style>
