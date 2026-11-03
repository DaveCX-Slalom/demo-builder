export type Severity = 'High' | 'Medium' | 'Low'
export type DealStatus = 'On track' | 'At risk' | 'Stalled' | 'Funded'
export type WidgetType =
  | 'kpis'
  | 'needsAttention'
  | 'exceptions'
  | 'pipelineByStage'
  | 'fundingTrend'
  | 'regionalPerformance'
export type WidgetSpan = 'full' | 'wide' | 'half' | 'narrow'

export interface Stage { id: string; name: string; probability: number; slaDays: number | null }
export interface RelationshipManager { id: string; name: string; region: string; title: string; quarterlyFundingTarget: number }
export interface Client { id: string; name: string; industry: string; region: string; tier: string; annualRevenue: number; rmId: string }
export interface Deal {
  id: string; name: string; clientId: string; rmId: string; region: string; product: string
  amount: number; stage: string; daysInStage: number
  openedDate: string; expectedClose: string; fundedDate: string | null
}
export interface Exception { id: string; dealId: string; type: string; severity: Severity; openedDate: string; note: string }
export interface TrendPoint { month: string; fundedVolume: number; newPipeline: number }
export interface Meta {
  bank: string; division: string; asOf: string; currency: string
  quarter: string; quarterStart: string; quarterEnd: string; note: string
}

export interface Persona { id: string; name: string; title: string; scope: 'all' | 'own'; rmId?: string; focus: string; questions: string[] }
export interface WidgetConfig { id: string; type: WidgetType; enabled: boolean; span: WidgetSpan; answers: string }
export interface GuidedStep { screen: 'dashboard' | 'deal'; caption: string; spotlight: string }
export interface WorkspaceConfig {
  brand: { organization: string; product: string; logo: string; primary: string; accent: string }
  thresholds: { atRiskRatio: number }
  personas: Persona[]
  widgets: WidgetConfig[]
  guidedSteps: GuidedStep[]
}
export interface Activity { dealId: string; text: string; at: string }

export interface WorkspaceState {
  meta: Meta; stages: Stage[]; regions: string[]; relationshipManagers: RelationshipManager[]
  clients: Client[]; deals: Deal[]; exceptions: Exception[]; trend: TrendPoint[]
  config: WorkspaceConfig; activity: Activity[]
}
