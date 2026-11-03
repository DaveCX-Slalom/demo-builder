<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiContentCopy, mdiDownload, mdiRestore, mdiUpload } from '@mdi/js'
import { useWorkspace } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'

const { state, exportJson, importJson, resetToSample } = useWorkspace()
const { toast } = useToast()

const exported = computed(() => exportJson())
const incoming = ref('')
const problems = ref<string[]>([])
const confirmReset = ref(false)

async function copy() {
  try { await navigator.clipboard.writeText(exported.value); toast('Copied the workspace JSON.') }
  catch { toast('Copy is blocked in this browser. Use Download instead.') }
}
function download() {
  const url = URL.createObjectURL(new Blob([exported.value], { type: 'application/json' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'pulse-studio-workspace.json' })
  a.click()
  URL.revokeObjectURL(url)
}
async function onFile(files: File | File[] | null) {
  const f = Array.isArray(files) ? files[0] : files
  if (f) incoming.value = await f.text()
}
function doImport() {
  const res = importJson(incoming.value)
  if (res.ok) { problems.value = []; incoming.value = ''; toast('Workspace imported.') }
  else problems.value = res.errors
}
function doReset() { resetToSample(); confirmReset.value = false; problems.value = []; toast('Reset to the sample workspace.') }
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Save your whole workspace (settings and deals) as JSON, load one back, or start again from the sample.</p>

  <h3 class="text-subtitle-2 mb-1">Export</h3>
  <v-textarea :model-value="exported" readonly rows="4" density="compact" variant="outlined" hide-details label="Workspace JSON" class="mono mb-2" />
  <div class="d-flex flex-wrap ga-2 mb-5">
    <v-btn size="small" variant="tonal" :prepend-icon="mdiContentCopy" @click="copy">Copy</v-btn>
    <v-btn size="small" variant="tonal" :prepend-icon="mdiDownload" @click="download">Download</v-btn>
  </div>

  <h3 class="text-subtitle-2 mb-1">Import</h3>
  <v-file-input label="Choose a .json file" accept=".json,application/json" density="compact" variant="outlined" hide-details prepend-icon="" class="mb-2" @update:model-value="onFile" />
  <v-textarea v-model="incoming" rows="4" density="compact" variant="outlined" hide-details label="Or paste workspace JSON" class="mono mb-2" />
  <v-alert v-if="problems.length" type="error" variant="tonal" density="compact" class="mb-2">
    <p class="mb-1 font-weight-medium">Nothing was imported. Fix these and try again:</p>
    <ul class="pl-4"><li v-for="p in problems.slice(0, 6)" :key="p">{{ p }}</li></ul>
    <p v-if="problems.length > 6" class="mb-0 mt-1">…and {{ problems.length - 6 }} more.</p>
  </v-alert>
  <v-btn size="small" color="primary" :prepend-icon="mdiUpload" :disabled="!incoming.trim()" class="mb-5" @click="doImport">Import</v-btn>

  <h3 class="text-subtitle-2 mb-1">Start again</h3>
  <p class="text-body-2 text-medium-emphasis mb-2">Restores the Harborview sample: {{ state.deals.length }} deals now, 22 in the sample.</p>
  <v-btn size="small" color="error" variant="tonal" :prepend-icon="mdiRestore" @click="confirmReset = true">Reset to sample</v-btn>

  <v-dialog v-model="confirmReset" max-width="420">
    <v-card title="Reset to the sample?">
      <v-card-text>This replaces your brand, stages, widgets, personas and deals with the sample workspace. Export first if you want to keep your work.</v-card-text>
      <v-card-actions><v-spacer /><v-btn @click="confirmReset = false">Cancel</v-btn><v-btn color="error" variant="flat" @click="doReset">Reset</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mono :deep(textarea) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; }
</style>
