<script setup lang="ts">
import { dateShort } from '@/lib/format'
defineProps<{ entries: { text: string; at: string }[] }>()
</script>

<template>
  <p v-if="!entries.length" class="text-body-2 text-medium-emphasis">No activity yet.</p>
  <ol v-else class="tl">
    <li v-for="(e, i) in entries" :key="i">
      <span class="text-body-2 font-weight-medium">{{ e.text }}</span>
      <span class="text-caption text-medium-emphasis">{{ dateShort(e.at) }}</span>
    </li>
  </ol>
</template>

<style scoped>
.tl { list-style: none; margin: 0; padding: 0 0 0 14px; border-left: 2px solid rgba(var(--v-theme-on-surface), 0.14); }
li { display: flex; flex-direction: column; padding: 0 0 14px 14px; position: relative; }
li::before { content: ''; position: absolute; left: -22px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: rgb(var(--v-theme-primary)); }
</style>
