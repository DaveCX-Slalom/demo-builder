<script setup lang="ts">
import { ref } from 'vue'
import { mdiDeleteOutline, mdiPlus } from '@mdi/js'
import { useWorkspace, slugId } from '@/composables/useWorkspace'
import CommitField from '@/components/common/CommitField.vue'
import type { Persona } from '@/types'

const { state, upsertPersona, removePersona, selectPersona } = useWorkspace()
const error = ref('')

const rms = () => state.relationshipManagers.map(r => ({ title: `${r.name} (${r.region})`, value: r.id }))
const required = (v: string) => !!v?.trim() || 'Required'

function patch(p: Persona, change: Partial<Persona>) {
  const next = { ...p, ...change }
  if (next.scope === 'own' && !next.rmId) next.rmId = state.relationshipManagers[0]?.id
  if (next.scope === 'all') delete next.rmId
  upsertPersona(next)
}
function add() {
  error.value = ''
  const id = slugId('persona', state.config.personas.map(p => p.id), 'persona')
  upsertPersona({ id, name: 'New persona', title: 'Role', scope: 'all', focus: 'What does this person need to know first?', questions: [] })
  selectPersona(id)
}
function remove(p: Persona) {
  const res = removePersona(p.id)
  error.value = res.ok ? '' : res.errors[0]
}
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Say who the dashboard is for and what they need to know. Use “View as” in the header to see each one.</p>
  <v-alert v-if="error" type="warning" variant="tonal" density="compact" class="mb-3" closable @click:close="error = ''">{{ error }}</v-alert>

  <ul class="list">
    <li v-for="p in state.config.personas" :key="p.id">
      <div class="top">
        <CommitField :model-value="p.name" label="Name" :rule="required" @commit="patch(p, { name: $event })" />
        <v-btn :icon="mdiDeleteOutline" size="small" variant="text" :aria-label="`Remove ${p.name}`" @click="remove(p)" />
      </div>
      <v-text-field :model-value="p.title" label="Role" density="compact" variant="outlined" hide-details class="mt-2" @update:model-value="patch(p, { title: $event })" />
      <v-select
        :model-value="p.scope" :items="[{ title: 'All deals', value: 'all' }, { title: 'Only their own deals', value: 'own' }]"
        label="Sees" density="compact" variant="outlined" hide-details class="mt-2" @update:model-value="patch(p, { scope: $event })"
      />
      <v-select
        v-if="p.scope === 'own'" :model-value="p.rmId" :items="rms()" label="Relationship manager"
        density="compact" variant="outlined" hide-details class="mt-2" @update:model-value="patch(p, { rmId: $event })"
      />
      <v-textarea :model-value="p.focus" label="What they need first" rows="2" auto-grow density="compact" variant="outlined" hide-details class="mt-2" @update:model-value="patch(p, { focus: $event })" />
      <v-textarea
        :model-value="p.questions.join('\n')" label="Questions they ask (one per line)" rows="3" auto-grow density="compact"
        variant="outlined" hide-details class="mt-2" @update:model-value="patch(p, { questions: $event.split('\n') })"
      />
    </li>
  </ul>
  <v-btn :prepend-icon="mdiPlus" variant="tonal" class="mt-3" @click="add">Add persona</v-btn>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
li { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px; padding: 12px; }
.top { display: grid; grid-template-columns: 1fr auto; gap: 4px; align-items: start; }
</style>
