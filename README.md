# Pulse Studio

A no-code builder for operational dashboards. An analyst says who the dashboard is for, which questions it must answer, and what data and thresholds it uses. Pulse Studio turns that into a working dashboard.

The reference build is a **commercial banking pipeline dashboard** for Harborview Community Bank: *are we on pace to hit this quarter's funding target, and what is blocking the deals that will get us there?*

> Training case study P301. All names, companies and numbers are invented. No real client or employer information is used.

![Dashboard](docs/screenshots/dashboard.png)

## Three ways in

**Start (`/`):** choose the Commercial Banking template or a blank workspace.

![Start](docs/screenshots/start.png)

**Build (analyst, `/studio`):** settings panels on the left, live preview on the right. Every change shows up in the preview at once.

![Studio](docs/screenshots/studio.png)

**Read (director or relationship manager, `/dashboard`):** read the KPI strip, see what needs attention, open a deal, advance it, and watch the dashboard update. Use **View as** in the header to switch between the Director (all regions) and the RM (own deals only).

![Deal detail](docs/screenshots/deal.png)

## What you can configure in Studio

| Panel | What it changes |
|---|---|
| Widgets | Turn sections on or off, reorder them, set width, edit the question each answers |
| Audience | Personas: name, role, scope (all or own deals), focus line, questions |
| Brand | Organization and product name, logo, primary and accent colours (with contrast warnings) |
| Stages and thresholds | Stage names, order, days allowed, win chance, and when a deal counts as at risk |
| Data | Edit, add and remove deals; invalid values are blocked inline |
| Walkthrough | A scripted tour for Present mode: screen, caption and highlight for each step |
| Share and reset | Export or import the whole workspace as JSON; reset to the sample |

**Present mode** runs the walkthrough full screen: it hides Studio, shows a bar with the caption and Back/Next (arrow keys work, Esc exits), opens each step's screen and highlights the widget being discussed.

![Present mode](docs/screenshots/present.png)

Everything on the dashboard is **derived from the data**, and the dashboard itself is **rendered from the configuration** through a widget registry. Nothing is hard-coded, so anything you see can be changed in Studio.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
```

State lives in the browser (`localStorage`). There is no backend and no sign-in. **Reset to sample** in Studio restores the defaults.

## Stack

Vue 3 (`<script setup>`), Vite, TypeScript, Vue Router, Vuetify 3. Charts are small SVG and CSS components, with no chart library. State is a single composable, with no Pinia.

## Project docs

- [BRIEF](BRIEF.md): design intent and scope
- [PRD](docs/PRD.md): requirements and acceptance criteria
- [SDD](docs/SDD.md): software design
- [Context](docs/context/): progress, decisions, glossary

## Quality

Checked in Chrome against the acceptance criteria for Phases 1 to 3: browser-driven flows for building and reading, no horizontal scroll from 360 to 1920 px, light and dark themes, and an automated WCAG 2.1 AA scan with no violations.

| Phone dashboard | Phone Studio | Dark mode |
|---|---|---|
| ![](docs/screenshots/phone-dashboard.png) | ![](docs/screenshots/phone-studio.png) | ![](docs/screenshots/dashboard-dark.png) |

## Deploying

Vercel builds with `npm run build` and serves `dist/`. [vercel.json](vercel.json) rewrites every path to `index.html` so deep links such as `/deals/D-1010` work. This site is for training only: turn on password protection in the Vercel project settings.
