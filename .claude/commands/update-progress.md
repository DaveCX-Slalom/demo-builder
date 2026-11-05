---
description: Record what was just done in docs/context after a step
---

After finishing a step:

1. Add what was built or changed to `docs/context/progress.md`, ticking items that are done and listing what remains.
2. Add any decision that is not obvious from the code to `docs/context/decisions.md`, with the reason.
3. Add new domain terms to `docs/context/glossary.md`.
4. If the change alters scope, design tokens or behaviour, update `BRIEF.md` so it still matches the build.
5. Run `npm run build` and report whether it passes.
