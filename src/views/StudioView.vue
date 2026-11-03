<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { mdiOpenInNew } from '@mdi/js'
import DashboardCanvas from '@/components/dashboard/DashboardCanvas.vue'
import AudiencePanel from '@/components/studio/AudiencePanel.vue'
import BrandPanel from '@/components/studio/BrandPanel.vue'
import StagesPanel from '@/components/studio/StagesPanel.vue'
import WidgetsPanel from '@/components/studio/WidgetsPanel.vue'
import DataPanel from '@/components/studio/DataPanel.vue'
import SharePanel from '@/components/studio/SharePanel.vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { useFilters } from '@/composables/useFilters'

const { state, persona } = useWorkspace()
const { filters, toggleStage, clearStage, reset } = useFilters({ local: true })
const router = useRouter()
const { mdAndUp } = useDisplay()

// On narrow screens the preview is one tap away instead of beside the panels.
const view = ref<'edit' | 'preview'>('edit')
const open = ref<number[]>([0])

const panels = [
  { title: 'Widgets', hint: 'What the dashboard shows', comp: WidgetsPanel },
  { title: 'Audience', hint: 'Who it is for', comp: AudiencePanel },
  { title: 'Brand', hint: 'Names, logo and colours', comp: BrandPanel },
  { title: 'Stages and thresholds', hint: 'How deals progress', comp: StagesPanel },
  { title: 'Data', hint: 'The deals behind the numbers', comp: DataPanel },
  { title: 'Share and reset', hint: 'Export, import, start again', comp: SharePanel },
]
const onStage = (id: string) => (id === filters.value.stage ? clearStage() : toggleStage(id))
</script>

<template>
  <h1 class="sr-only">Studio</h1>
  <div v-if="!mdAndUp" class="switch">
    <v-btn-toggle v-model="view" mandatory divided color="primary" density="comfortable" aria-label="Studio view">
      <v-btn value="edit">Edit</v-btn>
      <v-btn value="preview">Preview</v-btn>
    </v-btn-toggle>
  </div>

  <div class="studio">
    <section v-show="mdAndUp || view === 'edit'" class="panels" aria-label="Settings">
      <v-expansion-panels v-model="open" multiple variant="accordion" elevation="0">
        <v-expansion-panel v-for="p in panels" :key="p.title" :title="p.title" :aria-label="p.title">
          <template #title>
            <div><div class="font-weight-bold">{{ p.title }}</div><div class="text-caption text-medium-emphasis">{{ p.hint }}</div></div>
          </template>
          <template #text><component :is="p.comp" /></template>
        </v-expansion-panel>
      </v-expansion-panels>
    </section>

    <section v-show="mdAndUp || view === 'preview'" class="preview" aria-label="Live preview">
      <div class="bar">
        <span class="text-body-2 font-weight-medium">Live preview</span>
        <span class="text-caption text-medium-emphasis">as {{ persona.name }}</span>
        <v-btn size="small" variant="text" :append-icon="mdiOpenInNew" class="ml-auto" @click="router.push({ name: 'dashboard' })">Open full dashboard</v-btn>
      </div>
      <div class="canvas-wrap">
        <DashboardCanvas
          :state="state" :persona="persona" :filters="filters"
          @select-deal="id => router.push({ name: 'deal', params: { id } })" @toggle-stage="onStage" @reset="reset"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.switch { padding: 12px 16px 0; }
.studio { display: block; }
.panels { padding: 12px 16px; }
.preview { padding: 0 16px 16px; }
.bar { display: flex; align-items: center; gap: 8px; padding: 8px 0; flex-wrap: wrap; }
.canvas-wrap { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 8px; padding: 16px; background: rgb(var(--v-theme-background)); }
@media (min-width: 960px) {
  .studio { display: grid; grid-template-columns: 380px minmax(0, 1fr); height: calc(100dvh - var(--v-layout-top, 56px)); }
  .panels, .preview { overflow-y: auto; height: 100%; }
  .panels { border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding: 12px; }
  .preview { padding: 0 16px 16px; }
}
</style>
