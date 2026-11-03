# BRIEF.md: Pulse Studio

**Case study:** P301 Operational dashboard
**Industry:** Financial Services (commercial banking)
**Reference client:** Harborview Community Bank (fictional)
**Version:** 2.0, 2026-11-03
**Related docs:** [PRD](docs/PRD.md) · [SDD](docs/SDD.md) · [Context](docs/context/)

> All names, companies, and numbers in this project are invented for training. No real client or employer information is used.

---

## 1. Summary

**Pulse Studio is a no-code builder for operational dashboards.** An operations analyst defines who the dashboard is for, which questions it must answer, and what data and thresholds it uses. Pulse Studio turns that into a working dashboard that the audience opens every morning.

The reference build is a **commercial banking pipeline dashboard** for Harborview Community Bank. It answers one question for the Regional Director: **are we on pace to hit this quarter's funding target, and what is blocking the deals that will get us there?**

The tool exists because of what happens today. When a director needs a new view, an analyst spends days assembling spreadsheets and slides. When another region, role, or team wants the same thing, the work starts over. Pulse Studio makes the dashboard a configuration instead of a project.

## 2. Users

| User | Role | Relationship to the tool | What they need |
|---|---|---|---|
| **Nadia Okafor** (primary) | Operations Analyst, Commercial Banking Operations | **Builds** dashboards in Pulse Studio | Set up a dashboard for a role in an afternoon, with no developer, and keep it correct as the data changes |
| **Priyanka Desai** | Regional Director, Commercial Banking | **Reads** the dashboard | A 60-second view of funding pace, stalled deals, and risk across four regions |
| **Tom Brandt** | Relationship Manager, Northeast | **Reads** the dashboard (own deals) | Which of his deals are late, and what to do next |

The analyst is the user of the tool. The director and RM are the audience of what it produces. Both experiences are core and both are reviewed.

## 3. The two core flows

**Build flow (Nadia):**
Start from the Commercial Banking template or a blank workspace → define the audience (persona, scope, questions) → set brand → set stages and thresholds → choose and order widgets → review or edit data → watch the live preview → open the full dashboard or present it.

**Read flow (Priyanka):**
Open the dashboard → read the KPI strip → see what needs attention → open a deal → advance it → watch the dashboard update.

## 4. The morning questions (reference dashboard)

Every widget answers one of these. A widget that answers none is cut. In the tool, each widget carries the question it answers.

| # | Question | Widget |
|---|---|---|
| 1 | Are we on pace for the quarter? | KPI strip |
| 2 | Which deals are stuck? | Needs Attention |
| 3 | What could block a close? | Exceptions |
| 4 | Where is the pipeline sitting? | Pipeline by stage |
| 5 | Is this a good quarter or a normal one? | Funding trend |
| 6 | Which region needs help? | Regional performance |

## 5. Design

### Direction

Calm, trustworthy, data-forward. Two surfaces with different jobs:

- **The dashboard** is for scanning. It leads with status, puts problems before charts, and avoids decoration.
- **The Studio** is for making decisions. It is a quiet working surface: settings on the left, live preview on the right, so every change has a visible result.

### Decisions

- **Attention first.** Needs Attention sits directly under the KPI strip, above the charts. A director should see what is wrong before she sees how things are going.
- **Preview beside the controls.** The analyst never edits blind; every setting change shows up in the preview at once.
- **The dashboard is rendered from configuration.** The reference dashboard is not hard-coded. It is the output of the same config the analyst edits. This keeps the tool honest: anything the dashboard shows can be changed in Studio.
- **Status is never color alone.** Every status uses icon, label, and color (On track, At risk, Stalled).
- **Navy and teal.** Navy for structure and trust, teal as the single accent. Red and amber are for risk only. Brand colors are editable in Studio.
- **Numbers are the hero.** Large tabular figures. Currency abbreviated ($40.5M) on the dashboard and shown in full on the deal page.
- **Medium density.** Readable in a meeting room.
- **Plain-language setup.** Studio labels describe the outcome ("Mark a deal as stalled after") and avoid system terms.

### Screens

1. **Start**: choose Commercial Banking template or blank workspace.
2. **Studio**: settings panels with live preview.
3. **Dashboard**: the full-width output (KPI strip, Needs Attention, Exceptions, Pipeline by stage, Funding trend, Regional performance).
4. **Deal detail**: stage path, facts, exceptions, activity, **Advance stage**.
5. **Present mode**: full-screen dashboard with a walkthrough bar.

## 6. What the analyst can configure

| Panel | Controls |
|---|---|
| Audience | Personas: name, role, scope (all or own deals), focus line, questions |
| Brand | Organization name, product name, logo, primary and accent colors |
| Stages and thresholds | Stage names, order, win probability, days allowed per stage, "at risk" threshold |
| Widgets | Turn each widget on or off, reorder, set width (full, wide, half, narrow) |
| Data | Edit deals in a table, add and remove rows, import and export JSON, reset to sample |
| Walkthrough | Steps with screen, caption, and spotlight (Phase 3) |

## 7. Data

A fictional dataset in `src/data/metrics.json`, with the default Studio configuration in `src/data/workspace.json`.

- **Shape:** meta, stages (probability, SLA days), regions, relationship managers (with quarterly funding targets), clients, deals, exceptions, 12-month trend.
- **Size:** 8 RMs, 12 clients, 22 deals (13 open, 9 funded this quarter), 9 exceptions.
- **As-of date:** 2026-10-28, Q4 2026.
- **Realism rules:**
  - Amounts range from $180K to $8.2M, typical of middle-market commercial lending.
  - Stage SLAs: Prospect 14, Discovery 21, Credit Review 14, Proposal 10 days. Four open deals are past SLA.
  - Funded to date ($9.14M) matches the current month in the trend.
  - Forecast = funded to date + probability-weighted open deals expected to close this quarter. With the sample data this is about 99% of the $22.7M target, so the dashboard has a real story: on pace, but two stalled deals carry about $5M of weighted value.
- **Derived, not stored:** deal status, KPIs, and rollups are computed from raw data, so edits in Studio and stage changes flow everywhere.

## 8. Layout

- **Studio:** left column of collapsible panels (about 380px), right column live preview. On narrow screens the preview moves above the panels with a toggle.
- **Dashboard:** sticky app bar with product name, persona switcher, and Present button; sticky filter bar; 12-column grid by widget width. Tablet is two columns; phone is one column in priority order.

## 9. Tech

- Vue 3, Vite, TypeScript, Vue Router
- Vuetify 3
- Shared state through a Vue composable and `localStorage`. No Pinia, test runner, or linter at first.
- A widget registry maps widget types to components; the dashboard renders whatever the config lists.
- Charts built from small SVG and CSS components. No chart library.
- Deployed to Vercel for training only, password protected. No backend, no real authentication.

## 10. Interactions

Reader:
1. Filter by region and quarter; every widget updates.
2. Click a stage bar to filter Needs Attention to that stage.
3. Open a deal; **Advance stage** updates the dashboard.
4. Switch persona: Director sees all, RM sees own deals.

Builder:
5. Any Studio change updates the preview immediately.
6. Reorder widgets and change widths.
7. Edit deals in the data table.
8. Export and import the whole workspace as JSON; reset to sample.
9. Present with walkthrough steps (Phase 3).

## 11. Style

| Token | Value |
|---|---|
| Navy (primary) | `#0B3D6B` |
| Teal (accent) | `#12A59A` |
| Surface | `#FFFFFF` on a `#F4F6F9` page |
| Text | `#14202E` primary, `#4A5A6B` secondary |
| Risk | red `#C62828`, amber `#B26A00` |
| Positive | green `#2E7D32` |
| Typeface | Inter or system sans, tabular numbers for all figures |
| Radius and spacing | 8px radius, 8px grid |

## 12. Build phases

| Phase | Scope | Status for submission |
|---|---|---|
| **1. Dashboard from config** | Config-driven dashboard, filters, deal detail, advance stage, persona switch, responsive, empty states | Required |
| **2. Studio** | Audience, brand, stages and thresholds, widgets, data editor, import and export, live preview | Required (this is the tool) |
| **3. Start and Present** | Start screen with templates, walkthrough builder, Present mode | Optional |
| **4. AI-assisted setup** | Generate a first configuration from a description or process script | Design only, not built in this course |

Phases 1 and 2 together are the submission. If Phase 3 is not built, the Start and Present screens and the walkthrough panel are removed from this BRIEF before submitting, so the BRIEF matches the build.

## 13. Nice to haves

- A second template (retail branch operations).
- Saved dashboard views.
- Undo for stage changes.
- Print-friendly leadership summary.

## 14. Constraints

- Fictional data only. No client or employer names, logos, or information.
- Vercel is used for learning only; the site is password protected.
- Responsive web app, not native.

## 15. How this meets the review

| Review area | Where to look |
|---|---|
| Does it work? | Build flow and read flow in section 3 |
| Is the repo set up right? | README, LICENSE, this BRIEF, PRD, SDD, `CLAUDE.md`, `docs/context/` |
| Does it look right and show thinking? | Section 5 decisions, matching what is built |

## 16. Open questions

- Should "forecast" count only deals expected to close in the quarter? (Current answer: yes.)
- How much data editing belongs in the table versus import? (Current answer: table for small edits, JSON for bulk.)