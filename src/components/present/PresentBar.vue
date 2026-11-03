<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowLeft, mdiArrowRight, mdiClose } from '@mdi/js'
import { usePresentation } from '@/composables/usePresentation'

/** Walkthrough bar (US-18): caption, Back/Next, Exit. Opens each step's screen and scrolls its spotlight into view. */
const { presenting, stepIndex, steps, step, featuredDealId, next, back, exit } = usePresentation()
const route = useRoute()
const router = useRouter()

async function show() {
  if (!presenting.value || !step.value) return
  const wantsDeal = step.value.screen === 'deal' && featuredDealId.value
  const here = wantsDeal ? route.name === 'deal' && route.params.id === featuredDealId.value : route.name === 'dashboard' && !Object.keys(route.query).length
  if (!here) await router.push(wantsDeal ? { name: 'deal', params: { id: featuredDealId.value! } } : { name: 'dashboard' })
  await nextTick()
  setTimeout(() => {
    const key = step.value?.spotlight
    const el = key === 'advance' ? document.querySelector('[data-spotlight="advance"]') : document.querySelector(`[data-widget-id="${key}"]`)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, 80)
}
watch([presenting, stepIndex], show, { immediate: true })
// Going to Studio ends the presentation.
watch(() => route.name, n => { if (presenting.value && n === 'studio') exit() })

function onKey(e: KeyboardEvent) {
  if (!presenting.value) return
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') back()
  else if (e.key === 'Escape') exit()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="presenting && step" class="bar" role="region" aria-label="Walkthrough">
    <div class="count text-caption">Step {{ stepIndex + 1 }} of {{ steps.length }}</div>
    <p class="caption" aria-live="polite">{{ step.caption }}</p>
    <div class="btns">
      <v-btn variant="text" :prepend-icon="mdiArrowLeft" :disabled="stepIndex === 0" @click="back">Back</v-btn>
      <v-btn color="secondary" variant="flat" :append-icon="mdiArrowRight" :disabled="stepIndex === steps.length - 1" @click="next">Next</v-btn>
      <v-btn variant="text" :prepend-icon="mdiClose" @click="exit">Exit</v-btn>
    </div>
  </div>
</template>

<style scoped>
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 2000; display: grid; grid-template-columns: auto 1fr auto; gap: 16px;
  align-items: center; padding: 12px 20px; background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface));
  border-top: 3px solid rgb(var(--v-theme-secondary)); box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
}
.count { white-space: nowrap; font-weight: 600; }
.caption { margin: 0; font-size: 1.05rem; font-weight: 500; }
.btns { display: flex; gap: 4px; }
@media (max-width: 700px) {
  .bar { grid-template-columns: 1fr; gap: 6px; padding: 10px 14px; }
  .btns { justify-content: space-between; flex-wrap: wrap; }
}
</style>
