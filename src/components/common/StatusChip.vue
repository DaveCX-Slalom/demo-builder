<script setup lang="ts">
import { computed } from 'vue'
import { mdiAlertOctagonOutline, mdiAlertOutline, mdiCashCheck, mdiCheckCircleOutline } from '@mdi/js'
import type { DealStatus } from '@/types'

// Status is never color alone: icon + label + color (BRIEF §5).
const props = defineProps<{ status: DealStatus }>()
const look = computed(() => ({
  'On track': { icon: mdiCheckCircleOutline, color: 'success' },
  'At risk': { icon: mdiAlertOutline, color: 'warning' },
  Stalled: { icon: mdiAlertOctagonOutline, color: 'error' },
  Funded: { icon: mdiCashCheck, color: 'primary' },
}[props.status]))
</script>

<template>
  <v-chip :color="look.color" :prepend-icon="look.icon" size="small" variant="tonal" label>{{ status }}</v-chip>
</template>
