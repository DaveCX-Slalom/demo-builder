import type { Component } from 'vue'
import KpiStrip from '@/components/dashboard/KpiStrip.vue'
import NeedsAttention from '@/components/dashboard/NeedsAttention.vue'
import ExceptionList from '@/components/dashboard/ExceptionList.vue'
import StageBars from '@/components/dashboard/StageBars.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import RegionTable from '@/components/dashboard/RegionTable.vue'
import type { ExceptionRow, Filters, Kpis, RegionRow, Scoped, StageSummary } from '@/lib/derive'
import type { WidgetSpan, WidgetType, WorkspaceState } from '@/types'

/** Everything derived once per render and handed to each widget's prop mapper. */
export interface WidgetContext {
  state: WorkspaceState
  scope: Scoped
  filters: Filters
  quarter: string
  kpis: Kpis
  stages: StageSummary[]
  exceptions: ExceptionRow[]
  regions: RegionRow[]
  pace: number
  trend: { points: WorkspaceState['trend']; highlightMonth: string; priorAverage: number; deltaVsAverage: number }
}

export interface WidgetEntry {
  name: string
  component: Component
  spans: WidgetSpan[]
  /** Rendered without a surrounding card (the KPI strip is already a row of cards). */
  bare?: boolean
  props: (c: WidgetContext) => Record<string, unknown>
}

const ALL: WidgetSpan[] = ['full', 'wide', 'half', 'narrow']

// One entry per widget type. Adding a widget = one entry + one component; Studio's Widgets panel reads this too (ADR-5).
export const registry: Record<WidgetType, WidgetEntry> = {
  kpis: { name: 'Key numbers', component: KpiStrip, spans: ['full'], bare: true,
    props: c => ({ kpis: c.kpis, quarter: c.quarter }) },
  needsAttention: { name: 'Needs attention', component: NeedsAttention, spans: ['full', 'wide'],
    props: c => ({ deals: c.scope.attention, stageFilter: c.filters.stage }) },
  exceptions: { name: 'Exceptions', component: ExceptionList, spans: ALL,
    props: c => ({ items: c.exceptions }) },
  pipelineByStage: { name: 'Pipeline by stage', component: StageBars, spans: ALL,
    props: c => ({ rows: c.stages, active: c.filters.stage }) },
  fundingTrend: { name: 'Funding trend', component: TrendChart, spans: ALL,
    props: c => ({ ...c.trend }) },
  regionalPerformance: { name: 'Regional performance', component: RegionTable, spans: ['full', 'wide', 'half'],
    props: c => ({ rows: c.regions, pace: c.pace }) },
}
