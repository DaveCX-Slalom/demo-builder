<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { mdiAccountCircleOutline, mdiChartBoxOutline, mdiChevronDown, mdiPresentation, mdiTuneVariant, mdiViewDashboardOutline, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
import { useWorkspace } from '@/composables/useWorkspace'
import { useToast } from '@/composables/useToast'
import { usePresentation } from '@/composables/usePresentation'
import PresentBar from '@/components/present/PresentBar.vue'
import { mix } from '@/lib/color'
import { isHexColor } from '@/lib/validate'

const { state, persona, selectPersona, notice, dismissNotice } = useWorkspace()
const theme = useTheme()
const { message: toastMessage, open: toastOpen } = useToast()
const { presenting, steps, start } = usePresentation()

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
    <v-app-bar flat color="surface" border density="comfortable" class="global-header">
      <img v-if="state.config.brand.logo" :src="state.config.brand.logo" alt="" class="logo" />
      <span v-else class="app-tile" aria-hidden="true"><v-icon :icon="mdiChartBoxOutline" size="20" /></span>
      <v-app-bar-title class="title">
        <RouterLink :to="{ name: 'start' }" class="brand-link" aria-label="Start screen">
          <span class="font-weight-bold">{{ state.config.brand.product }}</span>
          <span class="org d-none d-md-inline"> · {{ state.config.brand.organization }}</span>
        </RouterLink>
      </v-app-bar-title>
      <nav v-if="!presenting" aria-label="Main" class="d-flex">
        <!-- Phone: icon-only so the product name has room. -->
        <v-btn :to="{ name: 'studio' }" :icon="mdiTuneVariant" class="d-sm-none" size="small" variant="text" aria-label="Studio" />
        <v-btn :to="{ name: 'dashboard' }" :icon="mdiViewDashboardOutline" class="d-sm-none" size="small" variant="text" aria-label="Dashboard" />
        <v-btn :to="{ name: 'studio' }" variant="text" size="small" class="px-2 d-none d-sm-flex">Studio</v-btn>
        <v-btn :to="{ name: 'dashboard' }" variant="text" size="small" class="px-2 d-none d-sm-flex">Dashboard</v-btn>
      </nav>
      <v-btn
        v-if="!presenting" :disabled="!steps.length" variant="text" size="small" :prepend-icon="mdiPresentation" class="d-none d-sm-flex"
        :title="steps.length ? 'Present the walkthrough' : 'Add walkthrough steps in Studio first'" @click="start"
      >Present</v-btn>
      <v-btn
        v-if="!presenting" :disabled="!steps.length" :icon="mdiPresentation" variant="text" size="small" class="d-sm-none"
        aria-label="Present the walkthrough" @click="start"
      />
      <v-menu v-if="!presenting">
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
      <div v-if="presenting" class="present-space" aria-hidden="true" />
    </v-main>
    <PresentBar />
    <v-snackbar v-model="toastOpen" timeout="4000" role="status" :location="presenting ? 'top' : 'bottom'">{{ toastMessage }}</v-snackbar>
    <v-snackbar v-model="noticeOpen" :location="presenting ? 'top' : 'bottom'" multi-line timeout="-1" color="warning" role="alert">
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
.brand-link { color: inherit; text-decoration: none; }
.brand-link:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; border-radius: 4px; }
.present-space { height: 110px; }
.app-tile { display: grid; place-items: center; width: 32px; height: 32px; margin-inline-start: 16px; border-radius: 4px; background: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary)); flex: none; }
/* Active tab: Lightning marks the current nav item with a blue underline. */
/* Phone: drop the tile so the product name has room. */
@media (max-width: 599px) { .app-tile { display: none; } }
.global-header nav .v-btn { border-radius: 0; height: 100% !important; border-bottom: 3px solid transparent; }
.global-header nav .v-btn.v-btn--active { border-bottom-color: rgb(var(--v-theme-secondary)); }
.global-header nav .v-btn.v-btn--active :deep(.v-btn__overlay) { opacity: 0; }
.logo { height: 28px; max-width: 120px; object-fit: contain; margin-inline-start: 16px; }
</style>
