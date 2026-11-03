<script setup lang="ts">
import { computed } from 'vue'
import { mdiAlertOutline } from '@mdi/js'
import { money, plural } from '@/lib/format'
import type { StageSummary } from '@/lib/derive'

const props = defineProps<{ rows: StageSummary[]; active?: string | null }>()
const emit = defineEmits<{ toggle: [stageId: string] }>()
const max = computed(() => Math.max(1, ...props.rows.map(r => r.value)))
</script>

<template>
  <div>
    <ul class="bars" aria-label="Open pipeline by stage. Select a stage to filter Needs attention.">
      <li v-for="r in rows" :key="r.stage.id">
        <button
          class="plain-btn row" :class="{ on: active === r.stage.id }" :aria-pressed="active === r.stage.id"
          @click="emit('toggle', r.stage.id)"
        >
          <span class="name">{{ r.stage.name }}</span>
          <span class="track" aria-hidden="true"><span class="fill" :style="{ width: `${(r.value / max) * 100}%` }" /></span>
          <span class="val num">{{ money(r.value) }} <span class="text-medium-emphasis">· {{ plural(r.count, 'deal') }}</span></span>
          <span v-if="r.stalled" class="warn text-error">
            <v-icon :icon="mdiAlertOutline" size="16" aria-hidden="true" /> {{ r.stalled }} stalled
          </span>
        </button>
      </li>
    </ul>
    <p class="text-caption text-medium-emphasis mt-2 mb-0">Select a stage to filter Needs attention. Select it again to clear.</p>
  </div>
</template>

<style scoped>
.bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.row {
  display: grid; grid-template-columns: 110px 1fr; grid-template-areas: 'name track' '. val' '. warn';
  gap: 2px 12px; width: 100%; padding: 8px; align-items: center; border: 2px solid transparent;
}
.row:hover { background: rgba(var(--v-theme-on-surface), 0.04); }
.row.on { border-color: rgb(var(--v-theme-secondary)); background: rgba(var(--v-theme-secondary), 0.08); }
.name { grid-area: name; font-weight: 600; font-size: 0.875rem; }
.track { grid-area: track; height: 14px; border-radius: 7px; background: rgba(var(--v-theme-on-surface), 0.08); overflow: hidden; }
.fill { display: block; height: 100%; border-radius: 7px; background: rgb(var(--v-theme-primary)); }
.val { grid-area: val; font-size: 0.8125rem; font-variant-numeric: tabular-nums; }
.warn { grid-area: warn; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
</style>
