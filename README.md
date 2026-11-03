# Pulse Studio

A no-code builder for operational dashboards. Reference build: a commercial banking pipeline dashboard for Harborview Community Bank (fictional).

> Training case study P301. All names, companies and numbers are invented.

## Two flows
- **Build (analyst):** `/studio` — settings panels on the left, live preview on the right.
- **Read (director / RM):** `/dashboard` — KPI strip, needs attention, exceptions, charts; open a deal and advance its stage.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Docs
[BRIEF](BRIEF.md) · [PRD](docs/PRD.md) · [SDD](docs/SDD.md) · [Context](docs/context/)

## Stack
Vue 3, Vite, TypeScript, Vue Router, Vuetify 3. No backend; state lives in `localStorage`.
