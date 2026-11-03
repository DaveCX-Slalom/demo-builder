import { computed, reactive, ref, watch } from 'vue'
import { sampleWorkspace } from '@/data'
import { validateDeal, validateWorkspace } from '@/lib/validate'
import { isTerminal } from '@/lib/derive'
import { templates } from '@/data/templates'
import type { Deal, GuidedStep, Persona, Stage, WidgetConfig, WorkspaceConfig, WorkspaceState } from '@/types'

const KEY = 'pulse-studio.v1'
const PERSONA_KEY = 'pulse-studio.persona'

type Result = { ok: true } | { ok: false; errors: string[] }

// ---- storage (never throws; falls back to memory) ---------------------------

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

const notice = ref<string | null>(null)
let storageWorks = true

function init(): WorkspaceState {
  try { localStorage.setItem('pulse-studio.probe', '1'); localStorage.removeItem('pulse-studio.probe') }
  catch { storageWorks = false; notice.value = 'Browser storage is unavailable, so changes will be lost when you close this tab.' }

  const raw = readStorage(KEY)
  if (!raw) return sampleWorkspace()
  try {
    const parsed = JSON.parse(raw)
    const errors = validateWorkspace(parsed)
    if (errors.length === 0) return parsed as WorkspaceState
  } catch { /* fall through */ }
  notice.value = 'Saved data could not be read, so the sample workspace was loaded.'
  return sampleWorkspace()
}

const state = reactive<WorkspaceState>(init())
const activePersonaId = ref<string>(readStorage(PERSONA_KEY) ?? '')

// Debounced persistence of the whole workspace (SDD §8).
let timer: ReturnType<typeof setTimeout> | undefined
watch(state, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (!storageWorks) return
    try { localStorage.setItem(KEY, JSON.stringify(state)) }
    catch { storageWorks = false; notice.value = 'Browser storage is full or unavailable, so changes will be lost when you close this tab.' }
  }, 250)
}, { deep: true })

watch(activePersonaId, id => { try { localStorage.setItem(PERSONA_KEY, id) } catch { /* ignore */ } })

// ---- helpers ----------------------------------------------------------------

function replaceState(next: WorkspaceState) {
  Object.assign(state, structuredClone(next))
}

function swap<T>(list: T[], i: number, j: number) {
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
}

export function slugId(name: string, taken: string[], fallback = 'item'): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback
  let id = base, n = 2
  while (taken.includes(id)) id = `${base}-${n++}`
  return id
}

// ---- the store --------------------------------------------------------------

function create() {
  const persona = computed<Persona>(() =>
    state.config.personas.find(p => p.id === activePersonaId.value) ?? state.config.personas[0])

  function selectPersona(id: string) {
    if (state.config.personas.some(p => p.id === id)) activePersonaId.value = id
  }

  // Reader actions -------------------------------------------------------
  function advanceStage(dealId: string): Deal | undefined {
    const deal = state.deals.find(d => d.id === dealId)
    if (!deal || deal.fundedDate) return undefined
    const i = state.stages.findIndex(s => s.id === deal.stage)
    const next = state.stages[i + 1]
    if (!next) return undefined
    deal.stage = next.id
    deal.daysInStage = 0
    if (isTerminal(state.stages, next.id)) deal.fundedDate = state.meta.asOf
    state.activity.push({ dealId, text: isTerminal(state.stages, next.id) ? 'Funded' : `Moved to ${next.name}`, at: state.meta.asOf })
    return deal
  }

  // Studio: brand and thresholds ---------------------------------------
  function setBrand(patch: Partial<WorkspaceConfig['brand']>) { Object.assign(state.config.brand, patch) }
  function setThreshold(atRiskRatio: number) { state.config.thresholds.atRiskRatio = atRiskRatio }

  // Studio: personas -----------------------------------------------------
  function upsertPersona(p: Persona) {
    const i = state.config.personas.findIndex(x => x.id === p.id)
    if (i >= 0) state.config.personas[i] = p
    else state.config.personas.push(p)
  }
  function removePersona(id: string): Result {
    if (state.config.personas.length <= 1) return { ok: false, errors: ['At least one persona must remain.'] }
    state.config.personas = state.config.personas.filter(p => p.id !== id)
    return { ok: true }
  }

  // Studio: stages ---------------------------------------------------------
  /** New stages are inserted before the final "Funded" stage, which stays last. */
  function upsertStage(stage: Stage) {
    const i = state.stages.findIndex(s => s.id === stage.id)
    if (i >= 0) { state.stages[i] = stage; return }
    state.stages.splice(state.stages.length - 1, 0, stage)
  }
  function moveStage(id: string, dir: -1 | 1) {
    const i = state.stages.findIndex(s => s.id === id)
    const j = i + dir
    if (i < 0 || isTerminal(state.stages, id) || j < 0 || isTerminal(state.stages, state.stages[j]?.id ?? '')) return
    swap(state.stages, i, j)
  }
  /** Moves deals on the removed stage to the nearest remaining open stage and reports how many. */
  function removeStage(id: string): { ok: true; moved: number; to: string } | { ok: false; errors: string[] } {
    const i = state.stages.findIndex(s => s.id === id)
    if (i < 0) return { ok: false, errors: ['Stage not found.'] }
    if (isTerminal(state.stages, id)) return { ok: false, errors: ['The final stage cannot be removed.'] }
    const openStages = state.stages.slice(0, -1)
    if (openStages.length <= 2) return { ok: false, errors: ['Keep at least two open stages.'] }
    const target = openStages[i - 1] ?? openStages[i + 1]
    const affected = state.deals.filter(d => d.stage === id)
    affected.forEach(d => { d.stage = target.id })
    state.stages.splice(i, 1)
    return { ok: true, moved: affected.length, to: target.name }
  }

  // Studio: widgets --------------------------------------------------------
  function setWidget(id: string, patch: Partial<Pick<WidgetConfig, 'enabled' | 'span' | 'answers'>>) {
    const w = state.config.widgets.find(x => x.id === id)
    if (w) Object.assign(w, patch)
  }
  function moveWidget(id: string, dir: -1 | 1) {
    const i = state.config.widgets.findIndex(w => w.id === id)
    if (i >= 0) swap(state.config.widgets, i, i + dir)
  }

  // Studio: deals ----------------------------------------------------------
  /** Validates, then saves. Region follows the relationship manager; the final stage implies funded. */
  function upsertDeal(deal: Deal): Result & { fields?: Record<string, string> } {
    const fields = validateDeal(deal, state)
    if (Object.keys(fields).length) return { ok: false, errors: Object.entries(fields).map(([k, m]) => `${k} ${m}`), fields }
    const rm = state.relationshipManagers.find(r => r.id === deal.rmId)!
    // Keep stage and funded date consistent: the final stage means funded, any other stage means open.
    const funded = isTerminal(state.stages, deal.stage)
    const next: Deal = {
      ...deal, region: rm.region,
      fundedDate: funded ? (deal.fundedDate ?? state.meta.asOf) : null,
      daysInStage: funded ? 0 : deal.daysInStage,
    }
    const i = state.deals.findIndex(d => d.id === deal.id)
    if (i >= 0) state.deals[i] = next
    else state.deals.push(next)
    return { ok: true }
  }
  function removeDeal(id: string) {
    state.deals = state.deals.filter(d => d.id !== id)
    state.exceptions = state.exceptions.filter(e => e.dealId !== id)
    state.activity = state.activity.filter(a => a.dealId !== id)
  }
  function newDealId(): string {
    const nums = state.deals.map(d => Number(d.id.replace(/\D/g, ''))).filter(Number.isFinite)
    return `D-${Math.max(1000, ...nums) + 1}`
  }

  // Studio: share ----------------------------------------------------------
  function exportJson(): string { return JSON.stringify(state, null, 2) }
  function importJson(text: string): Result {
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { return { ok: false, errors: ['That is not valid JSON.'] } }
    const errors = validateWorkspace(parsed)
    if (errors.length) return { ok: false, errors }
    replaceState(parsed as WorkspaceState)
    return { ok: true }
  }
  function resetToSample() { replaceState(sampleWorkspace()); activePersonaId.value = '' }
  function dismissNotice() { notice.value = null }
  function loadTemplate(id: string): boolean {
    const t = templates.find(x => x.id === id)
    if (!t) return false
    replaceState(t.build())
    activePersonaId.value = ''
    return true
  }
  /** True once the user has saved a workspace in this browser. */
  function hasSavedWork(): boolean { return readStorage(KEY) !== null }

  // Studio: walkthrough steps (Phase 3) -------------------------------------
  function addStep(): GuidedStep {
    const step: GuidedStep = { screen: 'dashboard', caption: 'New step', spotlight: state.config.widgets[0]?.id ?? '' }
    state.config.guidedSteps.push(step)
    return step
  }
  /** Changing the screen resets the spotlight to something that exists on that screen. */
  function updateStep(i: number, patch: Partial<GuidedStep>) {
    const step = state.config.guidedSteps[i]
    if (!step) return
    const before = step.screen
    Object.assign(step, patch)
    if (patch.screen && patch.screen !== before) {
      step.spotlight = patch.screen === 'deal' ? 'advance' : (state.config.widgets[0]?.id ?? '')
    }
  }
  function moveStep(i: number, dir: -1 | 1) { swap(state.config.guidedSteps, i, i + dir) }
  function removeStep(i: number) { state.config.guidedSteps.splice(i, 1) }

  return {
    state, persona, notice, selectPersona,
    advanceStage,
    setBrand, setThreshold, upsertPersona, removePersona,
    upsertStage, moveStage, removeStage, setWidget, moveWidget,
    upsertDeal, removeDeal, newDealId,
    exportJson, importJson, resetToSample, dismissNotice, loadTemplate, hasSavedWork,
    addStep, updateStep, moveStep, removeStep,
  }
}

let instance: ReturnType<typeof create> | undefined
/** Module-level singleton: Studio and Dashboard read the same store (ADR-6). */
export function useWorkspace() { return (instance ??= create()) }
