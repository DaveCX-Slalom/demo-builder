# PRD: Pulse Studio

**Status:** Draft 2.0 · **Date:** 2026-11-03 · **Owner:** David Castrillon
**Related:** [BRIEF](../BRIEF.md) · [SDD](SDD.md)

> Fictional product for a training case study (P301). All data is invented.

## 1. Purpose

Define what Pulse Studio must do, for whom, and how we will know it works. The BRIEF explains the design intent; this document sets requirements and acceptance criteria the build is checked against.

## 2. Problem

Operations teams at Harborview Community Bank build leadership dashboards by hand. Three problems follow:

- **Slow to build.** An analyst spends days assembling spreadsheets and slides for each new audience, region, or request.
- **Late visibility.** Stalled deals and open exceptions surface only days before the close date.
- **Not reusable.** Each dashboard is a one-off. The next role or team starts from zero.

## 3. Product

Pulse Studio is a no-code builder for operational dashboards. The analyst configures audience, brand, stages, widgets, and data; the tool renders a working dashboard from that configuration. The reference output is a commercial banking pipeline dashboard.

## 4. Users

| Persona | Role | Uses the tool to | Context |
|---|---|---|---|
| Nadia Okafor | Operations Analyst | **Build** a dashboard for a role and keep it correct | Desktop, working sessions |
| Priyanka Desai | Regional Director | **Read** funding pace, stalled deals, and risk | Laptop, leadership meetings |
| Tom Brandt | Relationship Manager | **Read** his own deals and update them | Laptop or tablet between client meetings |

## 5. Goals and non-goals

**Goals**

1. Let an analyst produce a working operational dashboard for a role, without code, in one sitting.
2. Make the dashboard answer a defined set of questions for its audience, with problems shown before charts.
3. Keep the dashboard honest: every number is derived from the data, and every widget is controlled by the configuration.
4. Let a reader drill into a deal and act on it, with the dashboard updating immediately.

**Non-goals**

- Real data connections, APIs, or authentication.
- Credit decisioning or any regulated banking workflow.
- Native mobile apps.
- Server-side storage; state lives in the browser.
- AI generation in this release (documented as a future phase).

## 6. Success measures

| Measure | Target |
|---|---|
| Time for an analyst to configure the sample dashboard from the template | Under 10 minutes |
| Studio change reflected in the preview | Immediately, no reload |
| Time for the Director to answer "are we on pace?" | Under 60 seconds, no scrolling |
| Stalled deals visible without any filter or click | 100% |
| Stage advance reflected on the dashboard | Immediately, no reload |
| Usable at 375px and 1440px wide | No horizontal page scroll; all flows work |
| Review outcome | Approve on works, repo, and design |

## 7. User stories and acceptance criteria

### Dashboard (reader side), Phase 1

**US-1. See funding pace.**
As the Director, I want funded-to-date, forecast, and target on one strip.
- AC1: KPI cards show Open pipeline, Funded to date, Quarter forecast, Forecast vs target, and Stalled deals.
- AC2: Values are computed from data and update with filters and persona scope.

**US-2. Find stuck deals.**
- AC1: Each open deal shows On track, At risk (at or above the at-risk threshold, 80% of SLA by default), or Stalled (past SLA), with icon, label, and color.
- AC2: Sorted stalled first, then by weighted value.
- AC3: Rows show deal, client, RM, stage, days in stage, and SLA.

**US-3. See what could block closes.**
- AC1: Exceptions show type, deal, severity, age in days, and note.
- AC2: Sorted High first, then oldest.

**US-4. Understand the pipeline shape.**
- AC1: A bar per stage shows value and deal count.
- AC2: Stages with stalled deals show a warning marker.
- AC3: Clicking a stage filters Needs Attention; clicking again clears it.

**US-5. Compare regions.**
- AC1: A table shows funded, target, percent to target, open pipeline, and stalled count per region.
- AC2: Rows expand to show RMs.

**US-6. Filter.**
- AC1: Region and quarter filters sit in a sticky bar and apply to every widget.
- AC2: Active filters are always visible and reset in one click.
- AC3: A filter with no results shows an empty state with a reset action.

**US-7. Switch persona.**
- AC1: The Director sees all regions; the RM sees only their own deals.
- AC2: The header shows the persona's name, role, and focus line.

**US-8. Drill into a deal.**
- AC1: Selecting a deal opens a page with stage path, facts, exceptions, and activity.
- AC2: A direct link works on reload.
- AC3: An unknown deal id shows a not-found state with a link back.

**US-9. Advance a deal.**
- AC1: "Advance stage" moves the deal to the next stage, resets days in stage, and adds an activity entry.
- AC2: The dashboard reflects the change with no reload.
- AC3: A funded deal shows the action as completed and disabled.
- AC4: Changes persist after reload and can be reset to the sample data.

### Studio (builder side), Phase 2

**US-10. Define the audience.**
- AC1: The analyst can add, edit, and remove personas with name, role, scope (all or own), focus line, and questions.
- AC2: At least one persona must remain.
- AC3: Persona changes show immediately in the preview header.

**US-11. Set the brand.**
- AC1: The analyst can set organization name, product name, logo, primary color, and accent color.
- AC2: Changes show immediately in the app bar and charts.
- AC3: Color pairs that fail text contrast show a warning.

**US-12. Set stages and thresholds.**
- AC1: The analyst can rename, reorder, add, and remove stages, and set win probability and days allowed per stage.
- AC2: The at-risk threshold is adjustable.
- AC3: Deals on a removed stage move to the nearest stage, with a notice stating the count.

**US-13. Choose and arrange widgets.**
- AC1: Each widget can be turned on or off, reordered, and set to a width (full, wide, half, narrow).
- AC2: The layout reflows without gaps, in the preview and on the dashboard.
- AC3: Each widget shows the question it answers.

**US-14. Edit the data.**
- AC1: Deals appear in an editable table with add and remove.
- AC2: Edits change dashboard numbers immediately.
- AC3: Invalid values (negative amounts, unknown stage) are blocked with an inline message.

**US-15. See changes live.**
- AC1: A preview beside the panels renders the same dashboard component as the full view.
- AC2: On narrow screens the preview is reachable with one tap.

**US-16. Save and restore.**
- AC1: The analyst can export the full workspace (config and data) as JSON text and import it back.
- AC2: Invalid JSON shows a clear message and changes nothing.
- AC3: "Reset to sample" restores the defaults after confirmation.

### Start and Present, Phase 3 (optional for submission)

**US-17. Start from a template.**
- AC1: A start screen offers the Commercial Banking template and a blank workspace.
- AC2: Choosing one loads its config and data and opens Studio.

**US-18. Present.**
- AC1: The analyst can add, reorder, and remove walkthrough steps (screen, caption, spotlight).
- AC2: Present mode hides Studio and shows a walkthrough bar with Back and Next.
- AC3: Each step opens its screen and highlights its widget; animation is off under reduced motion.

## 8. Functional requirements

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| FR-1 | Compute KPIs, deal status, and rollups from raw data | P0 | 1 |
| FR-2 | Render the dashboard from a widget configuration through a widget registry | P0 | 1 |
| FR-3 | Region and quarter filters | P0 | 1 |
| FR-4 | Deal detail route with advance stage | P0 | 1 |
| FR-5 | Persona switch with scoped data | P0 | 1 |
| FR-6 | Empty and not-found states | P0 | 1 |
| FR-7 | Persist state in the browser with reset | P0 | 1 |
| FR-8 | Studio panels: audience, brand, stages and thresholds, widgets | P0 | 2 |
| FR-9 | Deal data editor | P0 | 2 |
| FR-10 | Live preview beside panels | P0 | 2 |
| FR-11 | JSON export and import with validation | P1 | 2 |
| FR-12 | Start screen with templates | P2 | 3 |
| FR-13 | Walkthrough builder and Present mode | P2 | 3 |
| FR-14 | Print-friendly summary | P3 | Later |

## 9. Non-functional requirements

- **Responsive:** 360px to 1920px wide, no horizontal page scroll.
- **Accessibility:** keyboard operable, visible focus, 4.5:1 text contrast, status never by color alone, charts have text alternatives.
- **Performance:** first load under 2 seconds on a typical laptop connection; interactions are instant.
- **Resilience:** corrupt or missing browser storage falls back to sample data; imports are validated.
- **Privacy:** no network calls with user data; all data is fictional and local.

## 10. Release plan

| Release | Contents | Exit check |
|---|---|---|
| R1 | Phase 1 | US-1 to US-9 pass the manual checklist |
| R2 | Phase 2 | US-10 to US-16 pass; **this is the submission** |
| R3 | Phase 3 | US-17 and US-18 pass (optional) |

Each release is committed and deployed before the next starts.

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Studio grows beyond the time available | Incomplete flows fail "does it work" | R1 and R2 are the submission; R3 is optional |
| AI assistant drifts from the BRIEF | Build and BRIEF disagree | Review each change against the BRIEF; update the BRIEF if scope changes |
| Config and data become inconsistent after edits | Wrong numbers or crashes | Derive from raw data; validate on edit and import |
| Browser storage unavailable | Lost edits | In-memory fallback with a notice |
| Reviewer sees only the dashboard, not the tool | Tool value is missed | Land on Start or Studio first; the README states the two flows |

## 12. Open questions

- Should stage changes be undoable? (Leaning yes in R2.)
- Is a quarter filter useful beyond Q4 2026? (The trend supports earlier quarters; deals do not.)