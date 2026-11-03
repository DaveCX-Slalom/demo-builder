import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Filters } from '@/lib/derive'

const KEYS = ['region', 'quarter', 'stage'] as const

/**
 * Region, quarter and stage filters.
 * Dashboard mode keeps them in URL query params so views are shareable and reload-safe (ADR-4).
 * Local mode (Studio preview) keeps them in memory so the preview never rewrites the Studio URL.
 */
export function useFilters(options: { local?: boolean } = {}) {
  if (options.local) {
    const filters = reactive<Filters>({ region: null, quarter: null, stage: null })
    return build(filters, patch => Object.assign(filters, patch), () => Object.assign(filters, { region: null, quarter: null, stage: null }))
  }

  const route = useRoute()
  const router = useRouter()
  const filters = computed<Filters>(() => {
    const get = (k: string) => (typeof route.query[k] === 'string' && route.query[k] ? (route.query[k] as string) : null)
    return { region: get('region'), quarter: get('quarter'), stage: get('stage') }
  })
  const update = (patch: Partial<Filters>) => {
    const query = { ...route.query }
    for (const k of KEYS) if (k in patch) { const v = patch[k]; if (v) query[k] = v; else delete query[k] }
    router.replace({ query })
  }
  const reset = () => {
    const query = { ...route.query }
    for (const k of KEYS) delete query[k]
    router.replace({ query })
  }
  return build(filters, update, reset)
}

function build(source: Filters | { value: Filters }, update: (p: Partial<Filters>) => void, reset: () => void) {
  const filters = computed<Filters>(() => ('value' in source ? source.value : { ...source }))
  const active = computed(() => KEYS.filter(k => filters.value[k]).map(k => ({ key: k, value: filters.value[k] as string })))
  return {
    filters,
    active,
    setRegion: (region: string | null) => update({ region }),
    setQuarter: (quarter: string | null) => update({ quarter }),
    toggleStage: (stage: string) => update({ stage: filters.value.stage === stage ? null : stage }),
    clearStage: () => update({ stage: null }),
    reset,
  }
}
