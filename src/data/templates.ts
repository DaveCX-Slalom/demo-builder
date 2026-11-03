import type { WorkspaceState } from '@/types'
import { quarterLabel, quarterRange } from '@/lib/derive'
import { sampleWorkspace } from './index'

export interface Template { id: 'commercial-banking' | 'blank'; name: string; summary: string; facts: string[]; build: () => WorkspaceState }

/** An empty but valid workspace: one team member, no deals, every widget on, dated today. */
function blankWorkspace(): WorkspaceState {
  const today = new Date().toISOString().slice(0, 10)
  const quarter = quarterLabel(today)
  const range = quarterRange(quarter)
  const month = (back: number) => {
    const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`)
    d.setUTCMonth(d.getUTCMonth() - back)
    return d.toISOString().slice(0, 7)
  }
  return {
    meta: { bank: 'Your organization', division: 'Your team', asOf: today, currency: 'USD', quarter, quarterStart: range.start, quarterEnd: range.end, note: 'Blank workspace.' },
    stages: [
      { id: 'new', name: 'New', probability: 0.2, slaDays: 14 },
      { id: 'in-progress', name: 'In progress', probability: 0.6, slaDays: 14 },
      { id: 'done', name: 'Done', probability: 1, slaDays: null },
    ],
    regions: ['Region A'],
    relationshipManagers: [{ id: 'rm-1', name: 'Team member', region: 'Region A', title: 'Owner', quarterlyFundingTarget: 1_000_000 }],
    clients: [{ id: 'c1', name: 'Sample client', industry: 'General', region: 'Region A', tier: 'Tier 1', annualRevenue: 10_000_000, rmId: 'rm-1' }],
    deals: [], exceptions: [], activity: [],
    trend: Array.from({ length: 12 }, (_, i) => ({ month: month(11 - i), fundedVolume: 0, newPipeline: 0 })),
    config: {
      brand: { organization: 'Your organization', product: 'Pulse Studio', logo: '', primary: '#0B5CAB', accent: '#0176D3' },
      thresholds: { atRiskRatio: 0.8 },
      personas: [{ id: 'p-viewer', name: 'Dashboard viewer', title: 'Who is this for?', scope: 'all', focus: 'What does this person need to know first?', questions: [] }],
      widgets: [
        { id: 'w-kpis', type: 'kpis', enabled: true, span: 'full', answers: 'Are we on pace?' },
        { id: 'w-attention', type: 'needsAttention', enabled: true, span: 'wide', answers: 'Which items are stuck?' },
        { id: 'w-exceptions', type: 'exceptions', enabled: true, span: 'narrow', answers: 'What could block progress?' },
        { id: 'w-stages', type: 'pipelineByStage', enabled: true, span: 'half', answers: 'Where is the work sitting?' },
        { id: 'w-trend', type: 'fundingTrend', enabled: true, span: 'half', answers: 'Is this a good period or a normal one?' },
        { id: 'w-regions', type: 'regionalPerformance', enabled: true, span: 'full', answers: 'Which area needs help?' },
      ],
      guidedSteps: [],
    },
  }
}

export const templates: Template[] = [
  {
    id: 'commercial-banking', name: 'Commercial Banking pipeline',
    summary: 'The reference dashboard for Harborview Community Bank: are we on pace for the quarter, and what is blocking the deals that will get us there?',
    facts: ['22 deals, 9 exceptions', '8 relationship managers in 4 regions', 'Director and RM personas', '3-step walkthrough'],
    build: sampleWorkspace,
  },
  {
    id: 'blank', name: 'Blank workspace',
    summary: 'Start from nothing. Add your own personas, stages and deals, then choose the widgets that answer your questions.',
    facts: ['No deals yet', 'One persona to edit', 'Three simple stages', 'All six widgets on'],
    build: blankWorkspace,
  },
]
