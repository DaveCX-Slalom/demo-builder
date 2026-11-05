# Requirements coverage

How each requirement in the [PRD](PRD.md), [SDD](SDD.md) and [BRIEF](../BRIEF.md) is met, and how it was checked. Last verified 2026-11-05 on commit `81c2944` against the production build, locally and at https://demo-builder-xi.vercel.app/.

**Method.** Automated browser checks (Playwright driving Chrome) run against the built app, one check per acceptance criterion, plus an axe-core WCAG 2.1 AA scan. The scripts are not in the repo, because the project rules exclude a test runner. Totals: 73 acceptance checks (0 failures, locally and live), 31 builder and reader flow checks, 34 Phase 3 checks, an overflow sweep of 2 themes × 5 widths × 5 routes, and 0 axe violations on the dashboard, Studio, deal, Start and Present screens in light and dark. A human keyboard-only pass has not been done; the automated one is listed under NFRs.

## Phase 1: Dashboard (US-1 to US-9)

| Story | What was checked | Result |
|---|---|---|
| US-1 Funding pace | All five KPI cards present; $40.5M open, $9.14M funded, $22.5M forecast, 99% of target, 4 stalled match the hand calculation; values change with region, quarter and persona | Pass |
| US-2 Stuck deals | Every open deal has icon + label + colour; at risk at 80% of SLA by default; sorted stalled, at risk, on track, then by weighted value; rows show deal, client, RM, stage, days in stage against SLA | Pass |
| US-3 Exceptions | Severity, type, deal, age and note shown; High first, then oldest (H26 H19 H8, M20 M14 M6 M2, L11 L4) | Pass |
| US-4 Pipeline shape | Bar per stage with value and count; stalled marker; click filters Needs attention and click again clears | Pass |
| US-5 Regions | Funded, target, percent, open pipeline, stalled per region; rows expand to show RMs | Pass |
| US-6 Filter | Sticky bar; region and quarter apply to every widget; active chips visible and reset in one click; empty state with reset | Pass |
| US-7 Persona | Director sees all regions; Tom Brandt sees only his deals (target $3.2M); header shows name, role and focus line | Pass |
| US-8 Deal detail | Stage path, facts, exceptions and activity; direct link survives reload; unknown id shows not-found with a link back | Pass |
| US-9 Advance | Next stage, days reset, activity entry; dashboard updates with no reload; funded deal shows a disabled completed action; survives reload; reset restores sample | Pass |

## Phase 2: Studio (US-10 to US-16)

| Story | What was checked | Result |
|---|---|---|
| US-10 Audience | Add, edit (name, role, scope, relationship manager, focus, questions) and remove personas; last persona cannot be removed; preview header updates at once | Pass |
| US-11 Brand | Organization, product, logo upload, primary and accent colours reach the app bar and charts immediately; low-contrast pairs warn | Pass |
| US-12 Stages | Rename, reorder, add, remove; win probability and days allowed; at-risk slider changes statuses (3 to 4 at 50%); removing a stage moves its deals and reports the count | Pass |
| US-13 Widgets | On/off, reorder, four widths; layout reflows with no vertical gaps; each widget shows the question it answers, in Studio and on the dashboard | Pass |
| US-14 Data | Editable deal table with add and remove; edits change KPIs at once; empty name, negative amount and negative days blocked inline; an unknown stage is rejected on import | Pass |
| US-15 Live preview | Preview uses the same `DashboardCanvas` as the full dashboard (identical numbers); on a phone the preview is one tap away | Pass |
| US-16 Save and restore | Export and import the whole workspace; invalid JSON and invalid content show a message and change nothing; reset asks for confirmation | Pass |

## Phase 3: Start and Present (US-17, US-18, optional)

| Story | What was checked | Result |
|---|---|---|
| US-17 Templates | Start offers Commercial Banking and Blank; choosing one loads its data and opens Studio; confirms before replacing saved work | Pass |
| US-18 Present | Add, reorder, remove steps; Present hides Studio and shows Back/Next (arrow keys, Esc); each step opens its screen and spotlights its widget; animation off under reduced motion | Pass |

## Functional requirements

| ID | Status | Where |
|---|---|---|
| FR-1 Derived numbers | Built | `src/lib/derive.ts`, pure functions, nothing stored |
| FR-2 Config-rendered dashboard | Built | `DashboardCanvas` + `src/lib/widgetRegistry.ts` |
| FR-3 Filters | Built | Region, quarter and stage, kept in URL query params |
| FR-4 Deal detail and advance | Built | `/deals/:id` |
| FR-5 Persona scope | Built | View as menu |
| FR-6 Empty and not-found states | Built | Filters, no exceptions, all widgets off, unknown deal, 404 |
| FR-7 Persist with reset | Built | `localStorage`; corrupt or blocked storage falls back with a notice |
| FR-8 Studio panels | Built | Widgets, Audience, Brand, Stages and thresholds |
| FR-9 Deal editor | Built | Data panel |
| FR-10 Live preview | Built | Beside the panels, Edit/Preview toggle on narrow screens |
| FR-11 JSON export and import | Built | Share and reset panel, validated |
| FR-12 Start screen | Built | `/` |
| FR-13 Walkthrough and Present | Built | Walkthrough panel and Present bar |
| FR-14 Print-friendly summary | **Not built** | Priority P3, marked "Later" in the PRD |

## Non-functional requirements

| Requirement | Result |
|---|---|
| Responsive 360 to 1920px, no horizontal scroll | Pass at 360, 375, 768, 1440 and 1920 on Start, dashboard, Studio and deal pages, light and dark |
| Keyboard operable, visible focus | Automated keyboard-only run: tab to a deal, open it and advance its stage with Enter; a visible focus indicator on every tab stop reached; Studio panels open from the keyboard |
| 4.5:1 text contrast | axe-core: 0 violations on every screen, light and dark. Amber was darkened to `#955700` and primary text blue is `#0B5CAB` for this reason |
| Status never colour alone | Icon + label + colour on every status |
| Charts have text alternatives | Trend chart has a text summary and a data table; stage bars are buttons |
| Performance, first load under 2 s | Dashboard interactive in about 0.6 to 0.8 s on the live site, about 200 KB transferred |
| Resilience | Corrupt storage falls back to sample data; blocked storage runs in memory; imports are validated |
| Privacy | No third-party requests and no POST or PUT during a session; all data is invented |

## BRIEF checks

- **Six morning questions** map to six widgets, and each widget carries its question.
- **Data:** 22 deals (13 open, 9 funded), 8 RMs, 12 clients, 9 exceptions, as-of 2026-10-28, four stalled deals, funded $9.14M, forecast about 99% of the $22.7M target.
- **Screens:** Start, Studio, Dashboard, Deal detail and Present are all built.
- **Interactions 1 to 9** in BRIEF section 10 are all covered above.
- **Stack:** Vue 3, Vite, TypeScript, Vue Router, Vuetify 3, no Pinia, no chart library, no test runner or linter.

## Not built, on purpose

- **Phase 4, AI-assisted setup:** design only, as the BRIEF specifies.
- **FR-14 print summary and the BRIEF nice-to-haves:** a second template, saved views, undo for stage changes.
- **Password protection:** the BRIEF and SDD asked for it. The owner chose to keep the site public because all data is invented. The docs now say so.
