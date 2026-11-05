# Copilot instructions: Pulse Studio

Read [BRIEF.md](../BRIEF.md) first, then [docs/PRD.md](../docs/PRD.md) and [docs/SDD.md](../docs/SDD.md). These are the same rules as [CLAUDE.md](../CLAUDE.md).

## Rules
- Fictional data only. No real client or employer names.
- The dashboard is rendered from config through `src/lib/widgetRegistry.ts`. Never hard-code widgets.
- All numbers are derived from raw data in `src/lib/derive.ts` (pure functions). Never store computed values.
- Studio and Dashboard share one store (`useWorkspace`). No Pinia, no chart library, no test runner or linter unless asked.
- Status is never colour alone: icon + label + colour.
- Currency is abbreviated on the dashboard ($40.5M) and full on deal detail. Use tabular numerals.
- Vuetify 3 (not 4). Responsive from 360 to 1920px, no horizontal page scroll.
- Visual style follows the Lightning-inspired tokens in BRIEF section 11. Do not use Salesforce logos, names or assets.

## Commands
`npm run dev` · `npm run build` (type-check + build)

## Context
Progress, decisions and glossary live in `docs/context/`. Update `progress.md` after each step.
