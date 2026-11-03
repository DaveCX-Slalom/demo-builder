<script setup lang="ts">
import { mdiInboxOutline } from '@mdi/js'
defineProps<{ title: string; body?: string; actionLabel?: string }>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty" role="status">
    <v-icon :icon="mdiInboxOutline" size="40" class="mb-2" aria-hidden="true" />
    <p class="text-subtitle-1 font-weight-medium mb-1">{{ title }}</p>
    <p v-if="body" class="text-body-2 text-medium-emphasis mb-3">{{ body }}</p>
    <v-btn v-if="actionLabel" color="primary" variant="tonal" @click="emit('action')">{{ actionLabel }}</v-btn>
  </div>
</template>

<style scoped>
.empty { text-align: center; padding: 32px 16px; color: rgba(var(--v-theme-on-surface), 0.8); }
</style>
