# SDD: Pulse Studio

**Status:** Draft 2.0 · **Date:** 2026-11-03
**Related:** [BRIEF](../BRIEF.md) · [PRD](PRD.md)

> Software design for the Pulse Studio case study. Data and company are fictional.

## 1. Overview

Pulse Studio is a client-side single-page app with two surfaces over one store: **Studio** (the builder) and **Dashboard** (the output). The dashboard is not hard-coded. It is rendered from a configuration through a widget registry, and every number is derived from raw data by pure functions. Studio edits the same configuration and data, so any change appears in the preview and the full dashboard.

```
 metrics.json ─┐                         ┌─> Studio panels (edit config + data)
 workspace.json ┴─> useWorkspace() ─────┤
        ▲          (reactive store)      ├─> DashboardCanvas ──> widgets (via registry)
        │                 │              │         ▲                 ▲
 localStorage <─ persist ─┘              │         │ used by         │ derived by
                                         └─> Deal detail   Studio preview, Dashboard, Present
                              derive.ts (pure functions: status, KPIs, rollups, forecast)
```

## 2. Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Vue 3 (`<script setup>`) | Course framework; reusable components |
| Build | Vite + TypeScript | Fast dev server; typed config and data |
| Routing | Vue Router | Deep links to dashboard, deals, Studio |
| UI | Vuetify 3 | Consistent, accessible components |
| State | Composable with `reactive` and `localStorage` | Small app; no Pinia (ADR-1) |
| Charts | Custom SVG and CSS components | Few chart types, no dependency (ADR-2) |
| Hosting | Vercel, training only, password protected | Course requirement |

## 3. Project structure

```
pulse-studio/
├── BRIEF.md  README.md  LICENSE  CLAUDE.md
├── .github/copilot-instructions.md
├── docs/ PRD.md  SDD.md  context/ (progress, decisions, glossary)
├── src/
│   ├── main.ts  App.vue
│   ├── router/index.ts
│   ├── plugins/vuetify.ts
│   ├── data/                 # metrics.json, workspace.json
│   ├── types/index.ts
│   ├── lib/
│   │   ├── derive.ts         # status, KPIs, rollups, forecast
│   │   ├── format.ts         # currency, dates, percent
│   │   ├── validate.ts       # config, data, and import validation
│   │   └── widgetRegistry.ts # widget type -> component + metadata
│   ├── composables/
│   │   ├── useWorkspace.ts   # store, persistence, actions
│   │   └── useFilters.ts
│   ├── components/
│   │   ├── dashboard/        # DashboardCanvas, MetricCard, KpiStrip, NeedsAttention,
│   │   │                     # ExceptionList, StageBars, TrendChart, RegionTable
│   │   ├── deal/             # StagePath, ActivityTimeline
│   │   ├── studio/           # AudiencePanel, BrandPanel, StagesPanel, WidgetsPanel,
│   │   │                     # DataPanel, SharePanel, WalkthroughPanel
│   │   └── common/           # StatusChip, EmptyState, FilterBar
│   └── views/                # StartView, StudioView, DashboardView, DealView
└── public/
```

## 4. Routes

| Path | View | Notes |
|---|---|---|
| `/` | StartView | Phase 3. Until then redirects to `/studio` |
| `/studio` | StudioView | Panels left, live preview right |
| `/dashboard` | DashboardView | Full-width output; Present mode lives here |
| `/deals/:id` | DealView | Not-found state for unknown ids |
| `*` | NotFound | Link back to Studio |

## 5. Data model

```ts
export type Severity = 'High' | 'Medium' | 'Low'
export type DealStatus = 'On track' | 'At risk' | 'Stalled' | 'Funded'
export type WidgetType = 'kpis' | 'needsAttention' | 'exceptions' | 'pipelineByStage' | 'fundingTrend' | 'regionalPerformance'
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
export interface Meta { bank: string; division: string; asOf: string; currency: string; quarter: string; quarterStart: string; quarterEnd: string; note: string }

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
```

## 6. Widget registry

`src/lib/widgetRegistry.ts` maps each `WidgetType` to a component, a display name, allowed spans, and the props it needs from derived data.

```ts
export const registry: Record<WidgetType, { name: string; component: Component; spans: WidgetSpan[] }>
```

`DashboardCanvas` receives the config and scoped data, filters `widgets` to `enabled`, and renders each through the registry in config order inside a Vuetify grid. Adding a new widget type means one registry entry and one component; Studio's Widgets panel reads the same registry, so the two never drift.

Span to grid mapping at desktop: full = 12, wide = 7, half = 6, narrow = 5 columns. Tablet is 12 for full and wide, 6 for the rest. Phone is 12 for all.

## 7. Derived values

In `src/lib/derive.ts`, as pure functions with the as-of date and thresholds passed in.

| Value | Definition |
|---|---|
| `statusOf(deal)` | `Funded` if the stage has no SLA. Otherwise ratio = daysInStage / slaDays: `Stalled` if > 1, `At risk` if ≥ `atRiskRatio`, else `On track` |
| `weightedValue(deal)` | amount × stage probability |
| `fundedToDate` | Sum of amount for deals with `fundedDate` inside the quarter |
| `openPipeline` | Sum of amount for deals not funded |
| `quarterForecast` | `fundedToDate` + sum of `weightedValue` for open deals with `expectedClose` inside the quarter |
| `target` | Sum of `quarterlyFundingTarget` for RMs in scope |
| `forecastVsTarget` | `quarterForecast / target` |
| `stalledCount` | Open deals with status `Stalled` |
| `regionRollup(region)` | funded, target, percent, open pipeline, stalled count |
| `ageDays(date)` | Whole days between the date and `meta.asOf` |

Persona scope and region filters apply first. Every value is computed from the scoped list.

## 8. State management

`useWorkspace()` returns a module-level singleton.

- `state`: the `reactive` WorkspaceState.
- **Init:** read `localStorage['pulse-studio.v1']`, validate with `validate.ts`, fall back to bundled JSON on failure.
- **Persistence:** a debounced deep `watch` writes the state in try/catch. If storage fails, the app runs in memory and shows a notice.
- **Reader actions:** `advanceStage(dealId)`.
- **Studio actions:** `setBrand`, `setThreshold`, `upsertPersona`, `removePersona`, `upsertStage`, `moveStage`, `removeStage`, `setWidget` (enabled, span), `moveWidget`, `upsertDeal`, `removeDeal`, `exportJson`, `importJson(text)`, `resetToSample`.
- `useFilters()` keeps region, quarter, and stage filter in URL query params so views are shareable.

Studio and the full dashboard read the same store, so there is no separate "publish" step.

## 9. Components

| Component | Props | Emits | Notes |
|---|---|---|---|
| `DashboardCanvas` | `config`, `data`, `filters`, `persona` | `select-deal`, `toggle-stage` | Renders widgets via registry; used by Studio preview and Dashboard |
| `MetricCard` | `label`, `value`, `delta?`, `tone?`, `hint?` | none | Tabular figures; tone uses icon and text |
| `StatusChip` | `status` | none | Icon, label, color |
| `FilterBar` | `regions`, `modelValue` | `update:modelValue`, `reset` | Sticky; shows active filters |
| `NeedsAttention` | `deals`, `stageFilter?` | `select(dealId)` | Stalled first, then weighted value |
| `StageBars` | `stages`, `counts`, `values`, `stalledByStage`, `active?` | `toggle(stageId)` | SVG with text alternative |
| `TrendChart` | `points`, `highlightMonth` | none | Line and area SVG with `aria-label` summary |
| `RegionTable` | `rows` | `select(region)` | Expandable RM rows |
| `ExceptionList` | `items` | `select(dealId)` | High severity first |
| `StagePath` | `stages`, `current` | none | Deal detail |
| `ActivityTimeline` | `entries` | none | Deal detail |
| `AudiencePanel` etc. | store actions | none | One panel per Studio section; each shows a one-line explanation of what it changes |
| `EmptyState` | `title`, `body`, `actionLabel?` | `action` | All empty and not-found states |

## 10. Key flows

**Change a setting in Studio**

1. A panel calls a store action (for example `setWidget`).
2. The reactive store updates; `DashboardCanvas` in the preview re-renders from config.
3. The persistence watcher saves the state.

**Advance a deal**

1. `DealView` calls `advanceStage(id)`.
2. The store sets the next stage, resets `daysInStage`, sets `fundedDate` to the as-of date if the new stage is last, and appends an Activity entry.
3. Derived values recompute; the dashboard and deal page update.

**Remove a stage**

1. `removeStage(id)` finds the nearest remaining stage.
2. Deals on the removed stage move to it; the action returns the count.
3. A snackbar reports "N deals moved to <stage>".

**Import a workspace**

1. `importJson(text)` parses, then `validate()` checks shape, referential integrity, and widget types.
2. On failure it returns an error list and leaves state untouched.
3. On success it replaces state and confirms.

**Walkthrough (Phase 3)**

1. Present mode sets `presenting` and `stepIndex`.
2. Each step routes to its screen and sets a `spotlight` key (a widget id or `advance`).
3. The matching widget applies a highlight class; animation is skipped under `prefers-reduced-motion`.

## 11. Layout and responsive design

- Vuetify grid with breakpoints: xs under 600, sm 600 to 959, md 960 to 1263, lg 1264 and up.
- **Studio** desktop: panels in a 380px column, preview in the remaining width. Below 960px the preview sits above the panels with a Preview/Edit toggle.
- **Dashboard:** widget spans per section 6. Phone order follows config order, which defaults to priority order.
- Tables convert to stacked cards under 600px. The page never scrolls horizontally; wide content scrolls inside its own container.
- Filter bar collapses to a single "Filters" button with a summary chip on phones.

## 12. Theming

Vuetify theme from BRIEF tokens, light and dark. Brand colors from Studio override `primary` and `secondary` at runtime. The Brand panel computes contrast for text on the chosen colors and warns below 4.5:1. Numeric elements use `font-variant-numeric: tabular-nums`.

## 13. Empty, error, and edge states

| Situation | Behavior |
|---|---|
| Filter returns no deals | EmptyState with reset |
| No exceptions in scope | "No open exceptions" confirmation |
| All widgets turned off | Canvas shows a message pointing to the Widgets panel |
| Unknown deal id | Not-found state with link back |
| Corrupt storage | Fall back to sample data; notice |
| Storage unavailable | Run in memory; notice once |
| Invalid import or edit | Inline errors; no state change |
| Last persona removed | Blocked with an inline message |
| Removed stage with deals on it | Deals move to the nearest stage; notice states the count |
| Persona with no deals in scope | Dashboard shows zeros and an explanation |
| Very long names | Truncate with tooltip in lists; wrap in detail |

## 14. Accessibility

- Landmarks: header, nav, main; Studio panels are labeled regions.
- Every chart has a text summary and a keyboard-reachable data table alternative.
- Focus order follows reading order; visible focus ring on all controls.
- Status uses icon, label, and color together.
- Spotlight highlight has a non-animated style as well.
- Reorder controls have buttons as well as any drag behavior.

## 15. Verification

The course scaffold excludes a test runner, so verification is a manual checklist before each deploy:

1. KPI numbers match a hand calculation on the sample data (funded $9.14M, pipeline $40.45M, four stalled deals).
2. Each acceptance criterion in the PRD for the current phase passes.
3. Studio round trip: change brand, a stage, a widget, and a deal; preview and dashboard both reflect it; reload keeps it; reset restores the sample.
4. Screens checked at 375, 768, and 1440px, light and dark.
5. Keyboard-only pass through Studio, filters, a deal, and advance stage.
6. `npm run build` succeeds; deployed URL loads behind the password.

## 16. Deployment

- GitHub is the source. Vercel builds with `npm run build`, output `dist/`.
- Training use only; password protection on; no client or employer data.
- SPA fallback rewrite to `index.html` so deep links work.

## 17. Architecture decisions

| ADR | Decision | Reason | Trade-off |
|---|---|---|---|
| 1 | Composable store, no Pinia | Course scaffold excludes it; small state | Less tooling |
| 2 | Custom SVG charts, no library | Few chart types; control of accessibility | More code |
| 3 | Derive all numbers from raw data | Edits flow through every widget | Slight extra computation |
| 4 | Filters in URL query | Shareable, reload-safe | Needs care to keep URLs clean |
| 5 | Render the dashboard from config via a widget registry | The tool and its output cannot drift; new widgets are one entry | Registry adds a layer to learn |
| 6 | Studio and Dashboard share one store | No publish step; preview is the real thing | Studio edits change live data |
| 7 | Phase 1 and 2 are the submission | A complete tool beats a broad unfinished one | Phase 3 may be cut |

## 18. Traceability

| PRD item | Design section |
|---|---|
| US-1 to US-6 | §7, §9, §11 |
| US-7 | §8, §7 |
| US-8, US-9 | §4, §10 |
| US-10 to US-14 | §6, §8, §9, §13 |
| US-15 | §6, §10, §11 |
| US-16 | §8, §10 |
| US-17, US-18 | §10 |
| NFRs | §11 to §16 |