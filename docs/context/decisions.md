# Decisions

See SDD §17 (ADR-1 to ADR-7). Additions:

- **Vuetify pinned to ^3.** `npm i vuetify` now installs v4; the SDD specifies v3.
- **`/` redirects to `/studio`** until the Start screen (Phase 3) exists.
- **`@mdi/js`** for icons (tree-shakeable SVG paths; no font download).
- **Accent teal fails text contrast.** `#12A59A` on white is 3.1:1 (needs 4.5:1). Use teal for fills, bars and icons only; never for text. Navy `#0B3D6B` is 11.1:1.
- **Quarter filter** options come from the data (deal funded/expected-close dates plus the current quarter). Sample data gives Q4 2026 and Q1 2027.
- **Terminal stage is fixed.** The last stage (Funded) cannot be removed or reordered; new stages insert before it. At least two open stages must remain.
- **Region follows the RM.** `upsertDeal` overwrites `deal.region` from the RM so the table can't create inconsistent rows.
- **Layout uses CSS grid + container queries, not Vuetify breakpoints.** The canvas and each widget respond to their own width, so the narrow Studio preview reflows correctly at any viewport size. Spans: full 12, wide 7, half 6, narrow 5 (tablet: wide 12, half/narrow 6; phone: all 12).
- **Icons:** Vuetify is set up with the `mdi-svg` icon set so `@mdi/js` path strings render.
- **Stage bars are buttons, not SVG,** so they are keyboard operable and `aria-pressed`. Trend chart is SVG with a text summary and a data-table alternative.
- **"Behind pace" flag** on a region: funded share is under 75% of the share of the quarter already elapsed (Northeast: 14% vs about 30% elapsed).
- **Stage filter** affects Needs attention only; KPIs are not narrowed by it.
- **Amber darkened for text.** BRIEF amber `#B26A00` is 4.2:1 on white. Light-theme warning is `#955700` (5.8:1 on white, 4.9:1 on its tint). Red `#C62828` and green `#2E7D32` pass. Body text uses BRIEF `#14202E`.
- **CommitField.** Studio inputs that validate (colours, stage numbers, names) keep a local draft and show the rule message; a field bound straight to the store would silently snap back on invalid input (found by browser test).
- **Dark mode header** uses the dark surface colour, not the lightened brand colour, so white header text passes contrast.
- **Verification tooling** (not in the repo): `playwright-core` driving the installed Chrome, plus `axe-core`, run from the scratchpad against `npm run preview`.
