<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { mdiAccountCircleOutline, mdiChevronDown, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
import { useWorkspace } from '@/composables/useWorkspace'
import { mix } from '@/lib/color'
import { isHexColor } from '@/lib/validate'

const { state, persona, selectPersona, notice, dismissNotice } = useWorkspace()
const theme = useTheme()

// Brand colours from Studio override the theme at runtime. Dark mode uses lightened versions for contrast.
watch(() => state.config.brand, b => {
  const { light, dark } = theme.themes.value
  if (isHexColor(b.primary)) { light.colors.primary = b.primary; dark.colors.primary = mix(b.primary, '#FFFFFF', 0.55) }
  if (isHexColor(b.accent)) { light.colors.secondary = b.accent; dark.colors.secondary = mix(b.accent, '#FFFFFF', 0.25) }
}, { immediate: true, deep: true })

// Theme preference: remembered if storage works, otherwise follow the system.
const THEME_KEY = 'pulse-studio.theme'
function initialTheme(): 'light' | 'dark' {
  try { const t = localStorage.getItem(THEME_KEY); if (t === 'light' || t === 'dark') return t } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
theme.global.name.value = initialTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
  try { localStorage.setItem(THEME_KEY, theme.global.name.value) } catch { /* ignore */ }
}

const noticeOpen = ref(false)
watch(notice, n => { noticeOpen.value = !!n }, { immediate: true })
watch(noticeOpen, o => { if (!o) dismissNotice() })
</script>

<template>
  <v-app>
    <v-app-bar flat color="primary" density="comfortable">
      <v-app-bar-title class="title">
        <span class="font-weight-bold">{{ state.config.brand.product }}</span>
        <span class="org d-none d-md-inline"> · {{ state.config.brand.organization }}</span>
      </v-app-bar-title>
      <nav aria-label="Main" class="d-flex">
        <v-btn :to="{ name: 'studio' }" variant="text" size="small" class="px-2">Studio</v-btn>
        <v-btn :to="{ name: 'dashboard' }" variant="text" size="small" class="px-2">Dashboard</v-btn>
      </nav>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" size="small" :aria-label="`Viewing as ${persona.name}. Change persona.`">
            <v-icon :icon="mdiAccountCircleOutline" class="start-icon" /><span class="d-none d-sm-inline persona-name">{{ persona.name }}</span>
            <v-icon :icon="mdiChevronDown" end class="d-none d-sm-inline-flex" />
          </v-btn>
        </template>
        <v-list aria-label="View as" density="comfortable" min-width="260">
          <v-list-subheader>View as</v-list-subheader>
          <v-list-item
            v-for="p in state.config.personas" :key="p.id" :active="p.id === persona.id" :title="p.name" :subtitle="p.title"
            @click="selectPersona(p.id)"
          />
        </v-list>
      </v-menu>
      <v-btn
        :icon="isDark ? mdiWhiteBalanceSunny : mdiWeatherNight" variant="text" size="small"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme"
      />
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
    <v-snackbar v-model="noticeOpen" multi-line timeout="-1" color="warning" role="alert">
      {{ notice }}
      <template #actions><v-btn variant="text" @click="noticeOpen = false">Dismiss</v-btn></template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.persona-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
.title { min-width: 0; flex-shrink: 0; }
.start-icon { margin-inline-end: 0; }
@media (min-width: 600px) { .start-icon { margin-inline-end: 8px; } }
.org { font-weight: 400; opacity: 0.9; }
</style>
