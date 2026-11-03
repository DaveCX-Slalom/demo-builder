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
      <v-icon v-if="i < stages.findIndex(x => x.id === current) || (s.id === current && i === stages.length - 1)" :icon="mdiCheck" size="16" aria-hidden="true" />
      <span class="label">{{ s.name }}</span>
      <span class="sr-only">{{ i < stages.findIndex(x => x.id === current) ? '(completed)' : s.id === current ? '(current)' : '(upcoming)' }}</span>
    </li>
  </ol>
</template>

<style scoped>
/* Lightning "Path": chevron steps. Complete = green + check, current = blue, upcoming = grey. Name and (sr-only) state are always text. */
.path { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; row-gap: 8px; }
li {
  flex: 1 1 110px; min-width: 0; position: relative; display: flex; align-items: center; justify-content: center; gap: 4px;
  min-height: 36px; padding: 6px 22px 6px 26px; margin-inline-end: -10px; text-align: center;
  background: rgba(var(--v-theme-on-surface), 0.1); color: rgb(var(--v-theme-on-surface));
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%);
}
li:first-child { padding-inline-start: 16px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%); border-radius: 4px 0 0 4px; }
li:last-child { margin-inline-end: 0; padding-inline-end: 16px; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%); border-radius: 0 4px 4px 0; }
li:first-child:last-child { clip-path: none; border-radius: 4px; }
li.done { background: rgb(var(--v-theme-success)); color: rgb(var(--v-theme-on-success)); }
li.now { background: rgb(var(--v-theme-secondary)); color: rgb(var(--v-theme-on-secondary)); }
/* The lightened dark-theme accent needs dark text (white is only 3.1:1 on it). */
.v-theme--dark li.now { color: rgb(var(--v-theme-background)); }
.label { font-size: 0.875rem; font-weight: 600; overflow-wrap: anywhere; }
</style>
