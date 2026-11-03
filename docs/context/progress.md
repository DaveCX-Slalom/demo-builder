# Progress

## 2026-11-03
- [x] Docs read; PRD and SDD moved to `docs/`.
- [x] Phase 0 scaffold: Vite, Vue 3, TS, Vuetify 3, Router, types, placeholder views.
- [x] Sample data (`metrics.json`, `workspace.json`, generated and verified): funded $9.14M, pipeline $40.45M, 4 stalled (D-1010 to D-1013), forecast $22.465M = 99.0% of $22.7M. Stalled D-1010 + D-1011 carry $5.0M weighted.
- [x] Phase 1 logic layer: `derive.ts`, `format.ts`, `validate.ts`, `useWorkspace`, `useFilters`. Checked in Node against the sample data; all brief numbers reproduce.
- [x] Phase 1 UI built: StatusChip, EmptyState, FilterBar, MetricCard, six widgets, registry, DashboardCanvas, DashboardView, DealView, persona switcher, light/dark toggle, brand theming. Checked by screenshot at 1440px and 375px (iframe): dashboard, deal page, region+stage filter, no-results state.
- [ ] Phase 1 still to check by hand: Advance stage click, persona switch to Tom, stage-bar click, keyboard pass, dark mode, 768px, not-found for `/deals/nope` (screenshot taken, not reviewed).
- [ ] Phase 2: Studio panels.
