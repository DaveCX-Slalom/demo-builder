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
- **Phase 3 built.** `/` is now the Start screen (was a redirect to Studio). Present mode state lives in `usePresentation`; `PresentBar` is mounted once in `App.vue` and drives navigation. Deal steps open the most urgent deal in the persona's scope. Going to Studio ends a tour. Toasts move to the top while presenting so they never cover the caption.
- **Blank template** uses today's date for the as-of date and quarter, has one team member and one persona, three stages and no deals.
- **Lightning-inspired restyle (Option 1 of three offered).** Visual style only: light global header with an app tile and blue underline on the active tab, flat bordered cards, 4px radius, sentence-case buttons, system font stack, and a chevron Path on the deal page with a record header (icon tile, "Deal" eyebrow). Layout, Studio and data model are unchanged. Palette: primary `#0B5CAB` (6:1 on the grey page, so safe as link text), accent `#0176D3` (4.6:1 on white; fills, focus ring, current stage), page `#F3F3F3`. Teal is gone; the BRIEF palette table was updated. Sample and blank-template brand defaults changed to match. We do not use Salesforce logos, names or assets, and do not claim Salesforce Sans.
- **Path colours.** Complete = green with a check icon, current = blue, upcoming = grey; the state is also in sr-only text. In dark mode the current step uses dark text because white on the lightened blue is 3.1:1.
- **Global header is a light surface in both themes** (was brand-coloured in light). The brand primary now shows on the app tile, buttons and links, so the Studio brand test checks the tile.
- **No password protection (owner decision, 2026-11-05).** BRIEF and SDD originally asked for a password-protected Vercel site. The owner chose to leave it public because every name and number is invented. Docs were updated to say so, and the README states it plainly. Local-only branch `salesforce-style` was merged and deleted.
