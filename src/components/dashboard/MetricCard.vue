<script setup lang="ts">
import { computed } from 'vue'
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiMinusCircleOutline } from '@mdi/js'

const props = defineProps<{ label: string; value: string; delta?: string; tone?: 'neutral' | 'good' | 'warn' | 'bad'; hint?: string }>()
// Tone uses icon + text + color, never color alone.
const look = computed(() => ({
  neutral: { icon: mdiMinusCircleOutline, cls: '' },
  good: { icon: mdiCheckCircleOutline, cls: 'text-success' },
  warn: { icon: mdiAlertOutline, cls: 'text-warning' },
  bad: { icon: mdiAlertOctagonOutline, cls: 'text-error' },
}[props.tone ?? 'neutral']))
</script>

<template>
  <v-card variant="flat" border class="metric pa-4">
    <div class="text-body-2 text-medium-emphasis">{{ label }}</div>
    <div class="value num">{{ value }}</div>
    <div v-if="delta" class="delta" :class="look.cls"><v-icon :icon="look.icon" size="16" aria-hidden="true" /> {{ delta }}</div>
    <div v-if="hint" class="text-caption text-medium-emphasis">{{ hint }}</div>
  </v-card>
</template>

<style scoped>
.metric { height: 100%; }
.value { font-size: 1.9rem; font-weight: 700; line-height: 1.2; margin: 4px 0; font-variant-numeric: tabular-nums; }
.delta { display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; font-weight: 600; }
</style>
