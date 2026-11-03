<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiBankOutline, mdiFileOutline } from '@mdi/js'
import { templates, type Template } from '@/data/templates'
import { useWorkspace } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'

const { loadTemplate, hasSavedWork } = useWorkspace()
const { toast } = useToast()
const router = useRouter()

const saved = hasSavedWork()
const pending = ref<Template | null>(null)
const icons = { 'commercial-banking': mdiBankOutline, blank: mdiFileOutline }

function choose(t: Template) {
  // Replacing saved work needs a confirmation; a first visit does not.
  if (saved) pending.value = t
  else apply(t)
}
function apply(t: Template) {
  loadTemplate(t.id)
  pending.value = null
  toast(`Loaded “${t.name}”. Change anything in Studio and watch the preview.`)
  router.push({ name: 'studio' })
}
</script>

<template>
  <v-container class="start">
    <h1 class="text-h4 mb-2">Build an operational dashboard</h1>
    <p class="text-body-1 text-medium-emphasis mb-6 lead">
      Say who it is for, which questions it must answer and what the thresholds are. Pulse Studio turns that into a working dashboard. Start from a template or from nothing.
    </p>
    <div class="cards">
      <v-card v-for="t in templates" :key="t.id" variant="flat" border class="pa-5 card">
        <v-icon :icon="icons[t.id]" size="32" color="primary" class="mb-2" aria-hidden="true" />
        <h2 class="text-h6 mb-1">{{ t.name }}</h2>
        <p class="text-body-2 mb-3">{{ t.summary }}</p>
        <ul class="facts"><li v-for="f in t.facts" :key="f">{{ f }}</li></ul>
        <v-btn :color="t.id === 'blank' ? undefined : 'primary'" :variant="t.id === 'blank' ? 'tonal' : 'flat'" class="mt-4" @click="choose(t)">
          {{ t.id === 'blank' ? 'Start blank' : 'Use this template' }}
        </v-btn>
      </v-card>
    </div>
    <p v-if="saved" class="mt-6">
      <v-btn variant="text" :to="{ name: 'studio' }">Continue with your current workspace</v-btn>
    </p>

    <v-dialog :model-value="!!pending" max-width="440" @update:model-value="pending = null">
      <v-card title="Replace your current workspace?">
        <v-card-text>Loading “{{ pending?.name }}” replaces your brand, stages, widgets, personas and deals. Export from Studio first if you want to keep your work.</v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn @click="pending = null">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="pending && apply(pending)">Replace</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.start { max-width: 980px; padding: 32px 16px; }
.lead { max-width: 62ch; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.card { display: flex; flex-direction: column; align-items: flex-start; }
.facts { margin: 0; padding-left: 18px; font-size: 0.875rem; color: rgba(var(--v-theme-on-surface), 0.78); }
</style>
