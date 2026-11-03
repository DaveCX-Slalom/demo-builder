import type { Deal, WidgetSpan, WidgetType, WorkspaceState } from '../types'

export const WIDGET_TYPES: WidgetType[] = ['kpis', 'needsAttention', 'exceptions', 'pipelineByStage', 'fundingTrend', 'regionalPerformance']
export const WIDGET_SPANS: WidgetSpan[] = ['full', 'wide', 'half', 'narrow']

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isIsoDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))
const isHex = (v: unknown) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)

/** Validates a whole workspace (storage load and JSON import). Returns a list of problems; empty means valid. */
export function validateWorkspace(input: unknown): string[] {
  const errors: string[] = []
  if (!isObj(input)) return ['The workspace must be a JSON object.']
  const arrays = ['stages', 'regions', 'relationshipManagers', 'clients', 'deals', 'exceptions', 'trend', 'activity'] as const
  for (const k of arrays) if (!Array.isArray(input[k])) errors.push(`"${k}" must be a list.`)
  if (!isObj(input.meta)) errors.push('"meta" is missing.')
  if (!isObj(input.config)) errors.push('"config" is missing.')
  if (errors.length) return errors

  const s = input as unknown as WorkspaceState
  const meta = s.meta
  for (const k of ['asOf', 'quarterStart', 'quarterEnd'] as const)
    if (!isIsoDate(meta[k])) errors.push(`meta.${k} must be a date (YYYY-MM-DD).`)
  if (typeof meta.quarter !== 'string' || !meta.quarter) errors.push('meta.quarter is missing.')

  if (s.stages.length < 3) errors.push('At least 3 stages are needed (two open stages and a final funded stage).')
  const stageIds = new Set<string>()
  s.stages.forEach((st, i) => {
    if (!st || typeof st.id !== 'string' || !st.id) return void errors.push(`Stage ${i + 1} has no id.`)
    if (stageIds.has(st.id)) errors.push(`Duplicate stage id "${st.id}".`)
    stageIds.add(st.id)
    if (typeof st.probability !== 'number' || st.probability < 0 || st.probability > 1)
      errors.push(`Stage "${st.name}": win probability must be between 0 and 1.`)
    const last = i === s.stages.length - 1
    if (last && st.slaDays !== null) errors.push('The final stage must have no days limit.')
    if (!last && (typeof st.slaDays !== 'number' || st.slaDays <= 0))
      errors.push(`Stage "${st.name}": days allowed must be a positive number.`)
  })

  const rmIds = new Set(s.relationshipManagers.map(r => r.id))
  const clientIds = new Set(s.clients.map(c => c.id))
  const dealIds = new Set<string>()
  for (const d of s.deals) {
    if (dealIds.has(d.id)) errors.push(`Duplicate deal id "${d.id}".`)
    dealIds.add(d.id)
    for (const [field, msg] of Object.entries(validateDeal(d, s))) errors.push(`Deal ${d.id}: ${field} ${msg}`)
    if (!clientIds.has(d.clientId)) errors.push(`Deal ${d.id}: unknown client "${d.clientId}".`)
  }
  for (const r of s.relationshipManagers)
    if (!s.regions.includes(r.region)) errors.push(`RM ${r.name}: unknown region "${r.region}".`)
  for (const e of s.exceptions) if (!dealIds.has(e.dealId)) errors.push(`Exception ${e.id}: unknown deal "${e.dealId}".`)

  const c = s.config
  if (!isObj(c.brand) || !isHex(c.brand.primary) || !isHex(c.brand.accent)) errors.push('Brand colors must be hex values like #0B3D6B.')
  if (!isObj(c.thresholds) || typeof c.thresholds.atRiskRatio !== 'number' || c.thresholds.atRiskRatio <= 0 || c.thresholds.atRiskRatio > 1)
    errors.push('The at-risk threshold must be between 0 and 1.')
  if (!Array.isArray(c.personas) || c.personas.length < 1) errors.push('At least one persona is required.')
  else for (const p of c.personas) {
    if (p.scope !== 'all' && p.scope !== 'own') errors.push(`Persona ${p.name}: scope must be "all" or "own".`)
    if (p.scope === 'own' && (!p.rmId || !rmIds.has(p.rmId))) errors.push(`Persona ${p.name}: choose a valid relationship manager.`)
  }
  if (!Array.isArray(c.widgets)) errors.push('"config.widgets" must be a list.')
  else for (const w of c.widgets) {
    if (!WIDGET_TYPES.includes(w.type)) errors.push(`Widget ${w.id}: unknown type "${w.type}".`)
    if (!WIDGET_SPANS.includes(w.span)) errors.push(`Widget ${w.id}: unknown width "${w.span}".`)
  }
  if (!Array.isArray(c.guidedSteps)) errors.push('"config.guidedSteps" must be a list.')
  else c.guidedSteps.forEach((g, i) => {
    if (g.screen !== 'dashboard' && g.screen !== 'deal') errors.push(`Walkthrough step ${i + 1}: screen must be "dashboard" or "deal".`)
    if (typeof g.caption !== 'string') errors.push(`Walkthrough step ${i + 1}: caption is missing.`)
  })
  return errors
}

/** Field-level checks for the deal table. Returns { field: message }; empty means valid. */
export function validateDeal(d: Deal, s: Pick<WorkspaceState, 'stages' | 'relationshipManagers'>): Record<string, string> {
  const e: Record<string, string> = {}
  if (!d.name || !String(d.name).trim()) e.name = 'is required.'
  if (typeof d.amount !== 'number' || !Number.isFinite(d.amount) || d.amount <= 0) e.amount = 'must be greater than zero.'
  if (!s.stages.some(st => st.id === d.stage)) e.stage = 'is not a known stage.'
  if (!s.relationshipManagers.some(r => r.id === d.rmId)) e.rmId = 'is not a known relationship manager.'
  if (!Number.isInteger(d.daysInStage) || d.daysInStage < 0) e.daysInStage = 'must be a whole number, zero or more.'
  if (!isIsoDate(d.expectedClose)) e.expectedClose = 'must be a date (YYYY-MM-DD).'
  if (d.fundedDate !== null && !isIsoDate(d.fundedDate)) e.fundedDate = 'must be a date (YYYY-MM-DD).'
  return e
}

// ---- contrast (US-11 AC3) ---------------------------------------------------

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const isHexColor = isHex
