# CLAUDE.md — Pulse Studio

Read [BRIEF.md](BRIEF.md) first, then [docs/PRD.md](docs/PRD.md) and [docs/SDD.md](docs/SDD.md). If a change alters scope, update the BRIEF.

## Rules
- Fictional data only. No real client or employer names.
- Scope: Phases 1 and 2 are the submission; Phase 3 is optional (keep hooks, don't build unless asked).
- The dashboard is rendered from config via `src/lib/widgetRegistry.ts`. Never hard-code widgets.
- All numbers are derived from raw data in `src/lib/derive.ts` (pure functions). Never store computed values.
- Studio and Dashboard share one store (`useWorkspace`). No Pinia, no chart library, no test runner/linter unless asked.
- Status is never color alone: icon + label + color.
- Currency abbreviated on the dashboard ($40.5M), full on deal detail. Tabular numerals.
- Vuetify 3 (not 4). Responsive 360–1920px, no horizontal page scroll.

## Commands
`npm run dev` · `npm run build` (type-check + build)

## Context
Progress, decisions and glossary live in `docs/context/`. Update `progress.md` after each step.
