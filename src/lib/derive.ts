// Pure derivations (SDD §7). Nothing here is stored: every number is computed from raw data.
// Only `import type` is used so this file runs in plain Node for quick checks.
import type { Deal, DealStatus, Exception, Persona, RelationshipManager, Stage, WorkspaceState } from '../types'

export interface Filters { region: string | null; quarter: string | null; stage: string | null }

export const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0)

// ---- dates and quarters ----------------------------------------------------

const DAY = 86_400_000
const toUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))

/** Whole days between a date and the as-of date (never negative). */
export function ageDays(date: string, asOf: string): number {
  return Math.max(0, Math.round((toUtc(asOf) - toUtc(date)) / DAY))
}

export function quarterLabel(date: string): string {
  return `Q${Math.floor((+date.slice(5, 7) - 1) / 3) + 1} ${date.slice(0, 4)}`
}

export function quarterRange(label: string): { start: string; end: string } {
  const [q, y] = label.replace('Q', '').split(' ').map(Number)
  const startMonth = 3 * (q - 1) + 1
  const pad = (n: number) => String(n).padStart(2, '0')
  const end = new Date(Date.UTC(y, 3 * q, 0)).toISOString().slice(0, 10)
  return { start: `${y}-${pad(startMonth)}-01`, end }
}

const quarterKey = (label: string) => { const [q, y] = label.replace('Q', '').split(' ').map(Number); return y * 10 + q }

/** Quarters that have any data, plus the current one, oldest first. */
export function availableQuarters(state: WorkspaceState): string[] {
  const set = new Set<string>([state.meta.quarter])
  for (const d of state.deals) {
    if (d.fundedDate) set.add(quarterLabel(d.fundedDate))
    else set.add(quarterLabel(d.expectedClose))
  }
  return [...set].sort((a, b) => quarterKey(a) - quarterKey(b))
}

const inRange = (date: string, r: { start: string; end: string }) => date >= r.start && date <= r.end

// ---- deal-level -----------------------------------------------------------

export const stageOf = (stages: Stage[], id: string) => stages.find(s => s.id === id)
export const isTerminal = (stages: Stage[], id: string) => stages[stages.length - 1]?.id === id
export const isOpen = (d: Deal) => d.fundedDate === null

export function statusOf(deal: Deal, stages: Stage[], atRiskRatio: number): DealStatus {
  const stage = stageOf(stages, deal.stage)
  if (!stage || stage.slaDays === null) return 'Funded'
  const ratio = deal.daysInStage / stage.slaDays
  if (ratio > 1) return 'Stalled'
  if (ratio >= atRiskRatio) return 'At risk'
  return 'On track'
}

export function weightedValue(deal: Deal, stages: Stage[]): number {
  return deal.amount * (stageOf(stages, deal.stage)?.probability ?? 0)
}

// ---- scope ----------------------------------------------------------------

export interface AttentionRow extends Deal {
  status: DealStatus; weighted: number
  clientName: string; rmName: string; stageName: string; slaDays: number | null
}

export interface Scoped {
  rms: RelationshipManager[]
  deals: Deal[]
  open: Deal[]
  /** Open deals with status, sorted stalled first then by weighted value (US-2). */
  attention: AttentionRow[]
}

/** Persona scope and region filter apply first; every value is computed from this. */
export function scopeOf(state: WorkspaceState, persona: Persona, filters: Filters): Scoped {
  const ratio = state.config.thresholds.atRiskRatio
  const rms = state.relationshipManagers.filter(r =>
    (persona.scope === 'all' || r.id === persona.rmId) && (!filters.region || r.region === filters.region))
  const rmIds = new Set(rms.map(r => r.id))
  const deals = state.deals.filter(d => rmIds.has(d.rmId))
  const open = deals.filter(isOpen)
  const rank = { Stalled: 0, 'At risk': 1, 'On track': 2, Funded: 3 } as const
  const attention = open
    .map(d => ({
      ...d,
      status: statusOf(d, state.stages, ratio),
      weighted: weightedValue(d, state.stages),
      clientName: state.clients.find(c => c.id === d.clientId)?.name ?? d.clientId,
      rmName: state.relationshipManagers.find(r => r.id === d.rmId)?.name ?? d.rmId,
      stageName: stageOf(state.stages, d.stage)?.name ?? d.stage,
      slaDays: stageOf(state.stages, d.stage)?.slaDays ?? null,
    }))
    .sort((a, b) => rank[a.status] - rank[b.status] || b.weighted - a.weighted)
  return { rms, deals, open, attention }
}

// ---- KPIs -----------------------------------------------------------------

export interface Kpis {
  openPipeline: number
  fundedToDate: number
  quarterForecast: number
  target: number
  forecastVsTarget: number
  stalledCount: number
  stalledWeighted: number
}

export function kpis(state: WorkspaceState, scope: Scoped, quarter: string): Kpis {
  const range = quarterRange(quarter)
  const fundedToDate = sum(scope.deals.filter(d => d.fundedDate && inRange(d.fundedDate, range)).map(d => d.amount))
  const expected = scope.open.filter(d => inRange(d.expectedClose, range))
  const quarterForecast = fundedToDate + sum(expected.map(d => weightedValue(d, state.stages)))
  const target = sum(scope.rms.map(r => r.quarterlyFundingTarget))
  const stalled = scope.attention.filter(d => d.status === 'Stalled')
  return {
    openPipeline: sum(scope.open.map(d => d.amount)),
    fundedToDate,
    quarterForecast,
    target,
    forecastVsTarget: target > 0 ? quarterForecast / target : 0,
    stalledCount: stalled.length,
    stalledWeighted: sum(stalled.map(d => d.weighted)),
  }
}

// ---- widgets --------------------------------------------------------------

export interface StageSummary { stage: Stage; count: number; value: number; stalled: number }

/** Open stages only (the terminal "Funded" stage is not part of the pipeline). */
export function stageSummary(state: WorkspaceState, scope: Scoped): StageSummary[] {
  return state.stages.slice(0, -1).map(stage => {
    const deals = scope.attention.filter(d => d.stage === stage.id)
    return { stage, count: deals.length, value: sum(deals.map(d => d.amount)),
      stalled: deals.filter(d => d.status === 'Stalled').length }
  })
}

export interface ExceptionRow extends Exception { dealName: string; age: number }

/** Exceptions on open deals in scope: High first, then oldest (US-3). */
export function exceptionRows(state: WorkspaceState, scope: Scoped): ExceptionRow[] {
  return exceptionRowsFor(state, scope.open)
}

export function exceptionRowsFor(state: WorkspaceState, deals: Deal[]): ExceptionRow[] {
  const byId = new Map(deals.map(d => [d.id, d]))
  const rank = { High: 0, Medium: 1, Low: 2 } as const
  return state.exceptions
    .filter(e => byId.has(e.dealId))
    .map(e => ({ ...e, dealName: byId.get(e.dealId)!.name, age: ageDays(e.openedDate, state.meta.asOf) }))
    .sort((a, b) => rank[a.severity] - rank[b.severity] || b.age - a.age)
}

export interface RegionRow {
  region: string; funded: number; target: number; percent: number; openPipeline: number; stalled: number
  rms: { rm: RelationshipManager; funded: number; percent: number }[]
}

export function regionRollup(state: WorkspaceState, scope: Scoped, quarter: string): RegionRow[] {
  const range = quarterRange(quarter)
  const fundedBy = (rmId: string) =>
    sum(scope.deals.filter(d => d.rmId === rmId && d.fundedDate && inRange(d.fundedDate, range)).map(d => d.amount))
  return state.regions
    .map(region => {
      const rms = scope.rms.filter(r => r.region === region)
      if (!rms.length) return null
      const ids = new Set(rms.map(r => r.id))
      const open = scope.attention.filter(d => ids.has(d.rmId))
      const rmRows = rms.map(rm => ({ rm, funded: fundedBy(rm.id),
        percent: rm.quarterlyFundingTarget > 0 ? fundedBy(rm.id) / rm.quarterlyFundingTarget : 0 }))
      const funded = sum(rmRows.map(r => r.funded))
      const target = sum(rms.map(r => r.quarterlyFundingTarget))
      return { region, funded, target, percent: target > 0 ? funded / target : 0,
        openPipeline: sum(open.map(d => d.amount)), stalled: open.filter(d => d.status === 'Stalled').length, rms: rmRows }
    })
    .filter((r): r is RegionRow => r !== null)
}

/** Monthly funded volume for the trend; the last point is the current month. */
export function trendSummary(state: WorkspaceState) {
  const pts = state.trend
  const last = pts[pts.length - 1]
  const prior = pts.slice(0, -1)
  const avg = prior.length ? sum(prior.map(p => p.fundedVolume)) / prior.length : 0
  return { points: pts, highlightMonth: last?.month ?? '', priorAverage: avg,
    deltaVsAverage: avg > 0 && last ? last.fundedVolume / avg - 1 : 0 }
}

/** Share of the quarter that has elapsed at the as-of date (0 to 1). Used to judge regional pace. */
export function quarterProgress(state: WorkspaceState, quarter: string): number {
  const r = quarterRange(quarter)
  const total = ageDays(r.start, r.end) + 1
  const asOf = state.meta.asOf
  if (asOf < r.start) return 0
  if (asOf > r.end) return 1
  return Math.min(1, (ageDays(r.start, asOf) + 1) / total)
}
