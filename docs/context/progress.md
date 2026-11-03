# Progress

## 2026-11-03
- [x] Docs read; PRD and SDD moved to `docs/`.
- [x] Phase 0 scaffold: Vite, Vue 3, TS, Vuetify 3, Router, types, placeholder views.
- [x] Sample data (`metrics.json`, `workspace.json`, generated and verified): funded $9.14M, pipeline $40.45M, 4 stalled (D-1010 to D-1013), forecast $22.465M = 99.0% of $22.7M. Stalled D-1010 + D-1011 carry $5.0M weighted.
- [x] Phase 1 logic layer: `derive.ts`, `format.ts`, `validate.ts`, `useWorkspace`, `useFilters`. Checked in Node against the sample data; all brief numbers reproduce.
- [x] Phase 1 UI built: StatusChip, EmptyState, FilterBar, MetricCard, six widgets, registry, DashboardCanvas, DashboardView, DealView, persona switcher, light/dark toggle, brand theming. Checked by screenshot at 1440px and 375px (iframe): dashboard, deal page, region+stage filter, no-results state.
- [x] Phase 2 Studio: Widgets, Audience, Brand, Stages and thresholds, Data (full-screen deals editor), Share and reset (export, import, reset); live preview beside the panels; Edit/Preview toggle on narrow screens.
- [x] Verified in real Chrome (playwright-core, scratchpad only): 31 end-to-end checks pass covering US-1 to US-16 flows (toggle/reorder/width widgets, brand + contrast warning + invalid hex, stage limits and removal with deal reassignment, deal edit validation, reload persistence, export/import/reset, last-persona block, stage filter, deal drill-in, Advance stage, persona scope, not-found). No console errors.
- [x] Responsive: no horizontal scroll at 360, 375, 768, 1440, 1920 px, light and dark, on dashboard, Studio, deal, not-found, empty state.
- [x] Accessibility: axe-core (WCAG 2.1 AA) reports 0 violations on dashboard, Studio and deal page in light and dark.
- [ ] Not yet done: keyboard-only walkthrough by a human; undo for stage changes (open question, leaning yes); deploy to Vercel (password protected); Phase 3 (Start, Present).
