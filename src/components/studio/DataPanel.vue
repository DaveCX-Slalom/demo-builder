<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiTableEdit } from '@mdi/js'
import DealsEditor from './DealsEditor.vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { money } from '@/lib/format'

const { state } = useWorkspace()
const editing = ref(false)
const open = computed(() => state.deals.filter(d => !d.fundedDate))
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">The deals behind every number. Edit them here and the dashboard recalculates.</p>
  <dl class="stats">
    <div><dt>Deals</dt><dd class="num">{{ state.deals.length }}</dd></div>
    <div><dt>Open</dt><dd class="num">{{ open.length }}</dd></div>
    <div><dt>Open value</dt><dd class="num">{{ money(open.reduce((s, d) => s + d.amount, 0)) }}</dd></div>
  </dl>
  <v-btn color="primary" :prepend-icon="mdiTableEdit" @click="editing = true">Edit deals</v-btn>
  <DealsEditor v-model="editing" />
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0 0 16px; }
.stats div { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px; padding: 8px 12px; }
dt { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.72); }
dd { margin: 0; font-size: 1.25rem; font-weight: 700; }
</style>
