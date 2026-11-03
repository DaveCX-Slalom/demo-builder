<script setup lang="ts">
import { mdiCheck } from '@mdi/js'
import type { Stage } from '@/types'
defineProps<{ stages: Stage[]; current: string }>()
</script>

<template>
  <ol class="path" aria-label="Stage path">
    <li
      v-for="(s, i) in stages" :key="s.id"
      :class="{ done: i < stages.findIndex(x => x.id === current), now: s.id === current }"
      :aria-current="s.id === current ? 'step' : undefined"
    >
      <span class="dot">
        <v-icon v-if="i < stages.findIndex(x => x.id === current) || (s.id === current && i === stages.length - 1)" :icon="mdiCheck" size="16" aria-hidden="true" />
        <template v-else>{{ i + 1 }}</template>
      </span>
      <span class="label">{{ s.name }}</span>
      <span class="sr-only">{{ i < stages.findIndex(x => x.id === current) ? '(completed)' : s.id === current ? '(current)' : '(upcoming)' }}</span>
    </li>
  </ol>
</template>

<style scoped>
.path { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; flex-wrap: wrap; }
li { flex: 1 1 100px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; padding-top: 10px; border-top: 4px solid rgba(var(--v-theme-on-surface), 0.14); }
li.done { border-top-color: rgb(var(--v-theme-primary)); }
li.now { border-top-color: rgb(var(--v-theme-secondary)); }
.dot {
  width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 0.8125rem; font-weight: 700;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.4); color: rgba(var(--v-theme-on-surface), 0.8);
}
li.done .dot { background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-surface)); }
li.now .dot { border-color: rgb(var(--v-theme-secondary)); box-shadow: 0 0 0 3px rgba(var(--v-theme-secondary), 0.25); font-weight: 800; }
.label { font-size: 0.875rem; font-weight: 600; }
li:not(.done):not(.now) .label { font-weight: 500; color: rgba(var(--v-theme-on-surface), 0.72); }
</style>
