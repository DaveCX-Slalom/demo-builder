<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'
import CommitField from '@/components/common/CommitField.vue'
import { contrastRatio, isHexColor } from '@/lib/validate'

const { state, setBrand } = useWorkspace()
const { toast } = useToast()
const brand = computed(() => state.config.brand)

const hex = (v: string) => (v.startsWith('#') ? v : `#${v}`).toUpperCase()
const required = (v: string) => !!v?.trim() || 'Required'
const hexRule = (v: string) => isHexColor(hex(v)) || 'Use a hex colour like #0B3D6B'

// Primary carries white text (app bar) and is used as link text on white; accent is only used for fills and highlights.
const primaryRatio = computed(() => isHexColor(brand.value.primary) ? contrastRatio(brand.value.primary, '#FFFFFF') : 21)
const accentRatio = computed(() => isHexColor(brand.value.accent) ? contrastRatio(brand.value.accent, '#FFFFFF') : 21)

function setColor(key: 'primary' | 'accent', v: string) { const h = hex(v); if (isHexColor(h)) setBrand({ [key]: h }) }
function setText(key: 'organization' | 'product', v: string) { if (v.trim()) setBrand({ [key]: v }) }

function onLogo(files: File | File[] | null) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  if (!file.type.startsWith('image/')) return void toast('That file is not an image.')
  if (file.size > 200_000) return void toast('Choose an image under 200 KB.')
  const reader = new FileReader()
  reader.onload = () => setBrand({ logo: String(reader.result) })
  reader.readAsDataURL(file)
}
</script>

<template>
  <p class="text-body-2 text-medium-emphasis mb-3">Set the names, logo and colours people see in the header and charts.</p>
  <CommitField :model-value="brand.organization" label="Organization name" :rule="required" class="mb-3" @commit="setText('organization', $event)" />
  <CommitField :model-value="brand.product" label="Product name" :rule="required" class="mb-3" @commit="setText('product', $event)" />

  <div class="logo mb-4">
    <v-file-input label="Logo (image under 200 KB)" accept="image/*" density="compact" variant="outlined" hide-details prepend-icon="" @update:model-value="onLogo" />
    <div v-if="brand.logo" class="d-flex align-center ga-3 mt-2">
      <img :src="brand.logo" alt="Current logo" class="preview" />
      <v-btn size="small" variant="text" @click="setBrand({ logo: '' })">Remove logo</v-btn>
    </div>
  </div>

  <div class="color">
    <input type="color" :value="brand.primary" aria-label="Pick primary colour" @input="setColor('primary', ($event.target as HTMLInputElement).value)" />
    <CommitField :model-value="brand.primary" label="Primary colour" :rule="hexRule" @commit="setColor('primary', $event)" />
  </div>
  <v-alert v-if="primaryRatio < 4.5" type="warning" variant="tonal" density="compact" class="mb-3">
    White text on this primary colour has a contrast of {{ primaryRatio.toFixed(1) }}:1. Aim for 4.5:1 or more so the header and links stay readable.
  </v-alert>

  <div class="color">
    <input type="color" :value="brand.accent" aria-label="Pick accent colour" @input="setColor('accent', ($event.target as HTMLInputElement).value)" />
    <CommitField :model-value="brand.accent" label="Accent colour" :rule="hexRule" @commit="setColor('accent', $event)" />
  </div>
  <v-alert v-if="accentRatio < 3" type="warning" variant="tonal" density="compact" class="mb-3">
    The accent has a contrast of {{ accentRatio.toFixed(1) }}:1 against white. It is used for highlights and fills, which need at least 3:1 to be seen.
  </v-alert>
  <p class="text-caption text-medium-emphasis">The accent is never used for text.</p>
</template>

<style scoped>
.color { display: grid; grid-template-columns: 44px 1fr; gap: 12px; align-items: start; margin-bottom: 12px; }
.color input[type='color'] { width: 44px; height: 40px; border: 1px solid rgba(var(--v-border-color), 0.4); border-radius: 6px; padding: 2px; background: transparent; cursor: pointer; }
.preview { height: 32px; max-width: 120px; object-fit: contain; border: 1px solid rgba(var(--v-border-color), 0.2); border-radius: 4px; padding: 2px; }
</style>
