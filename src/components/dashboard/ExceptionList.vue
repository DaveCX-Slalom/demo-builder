<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiInformationOutline } from '@mdi/js'
import type { ExceptionRow } from '@/lib/derive'

const props = withDefaults(defineProps<{ items: ExceptionRow[]; showDeal?: boolean }>(), { showDeal: true })
const emit = defineEmits<{ select: [dealId: string] }>()

const LIMIT = 5
const showAll = ref(false)
const rows = computed(() => showAll.value ? props.items : props.items.slice(0, LIMIT))

const look = {
  High: { icon: mdiAlertOctagonOutline, color: 'error' },
  Medium: { icon: mdiAlertOutline, color: 'warning' },
  Low: { icon: mdiInformationOutline, color: 'primary' },
} as const
</script>

<template>
  <p v-if="!items.length" class="text-body-2 text-medium-emphasis pa-3">
    <v-icon :icon="look.Low.icon" size="18" aria-hidden="true" /> No open exceptions.
  </p>
  <ul v-else class="list">
    <li v-for="e in rows" :key="e.id">
      <div class="top">
        <v-chip :color="look[e.severity].color" :prepend-icon="look[e.severity].icon" size="small" variant="tonal" label>{{ e.severity }}</v-chip>
        <span class="font-weight-medium type">{{ e.type }}</span>
        <span class="age num text-caption text-medium-emphasis">{{ e.age }}d old</span>
      </div>
      <button v-if="showDeal" class="link-btn deal" @click="emit('select', e.dealId)">{{ e.dealName }}</button>
      <p class="note text-body-2 text-medium-emphasis">{{ e.note }}</p>
    </li>
  </ul>
  <v-btn v-if="items.length > LIMIT" variant="text" size="small" class="mt-1" @click="showAll = !showAll">
    {{ showAll ? 'Show fewer' : `Show all ${items.length} exceptions` }}
  </v-btn>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; }
li { padding: 10px 0; border-bottom: 1px solid rgba(var(--v-border-color), 0.12); }
li:last-child { border-bottom: 0; }
.top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.type { flex: 1 1 auto; min-width: 0; }
.age { margin-left: auto; }
.deal { display: block; margin-top: 4px; font-size: 0.875rem; }
.note { margin: 2px 0 0; }
</style>
