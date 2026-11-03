import { computed, ref, watch } from 'vue'
import { useWorkspace } from './useWorkspace'
import { useToast } from './useToast'
import { scopeOf } from '@/lib/derive'

const presenting = ref(false)
const stepIndex = ref(0)

/** Present mode state (SDD §10): the walkthrough steps, which one is showing, and what to spotlight. */
export function usePresentation() {
  const { state, persona } = useWorkspace()
  const toastState = useToast()
  const steps = computed(() => state.config.guidedSteps)
  const step = computed(() => steps.value[stepIndex.value])
  /** Widget id, or "advance" for the Advance stage button. Null when not presenting. */
  const spotlight = computed(() => (presenting.value ? step.value?.spotlight ?? null : null))
  /** The deal that "deal" steps open: the most urgent one in the current persona's scope. */
  const featuredDealId = computed(() =>
    scopeOf(state, persona.value, { region: null, quarter: null, stage: null }).attention[0]?.id ?? null)

  // Keep the index valid if steps are removed while presenting.
  watch(() => steps.value.length, n => {
    if (stepIndex.value > n - 1) stepIndex.value = Math.max(0, n - 1)
    if (n === 0) presenting.value = false
  })

  return {
    presenting, stepIndex, steps, step, spotlight, featuredDealId,
    start(): boolean { if (!steps.value.length) return false; stepIndex.value = 0; toastState.open.value = false; presenting.value = true; return true },
    next() { if (stepIndex.value < steps.value.length - 1) stepIndex.value++ },
    back() { if (stepIndex.value > 0) stepIndex.value-- },
    exit() { presenting.value = false },
  }
}
