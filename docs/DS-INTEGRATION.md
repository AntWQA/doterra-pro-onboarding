# DS Integration — superseded

**This document described the original plan: integrate the real dōTERRA design system (Path A) or vendor its compiled Storybook output (Path B), and rebuild every screen as functional, DS-connected components.**

That approach was abandoned mid-build. The user's direction changed to: treat every screen as a frozen visual reference exported directly from Figma (PNG, 3x scale), and animate those exports with Motion for React — no functional DS components, no interactivity beyond the demo's own navigation. See `MOTION-SPEC.md` for the current architecture.

## What's still true from the original investigation

- `git.doterra.net` is genuinely unreachable from this environment (DNS NXDOMAIN) — Path A was never viable here regardless of the later pivot.
- The public Storybook (`storybook.supernova.io/design-systems/233927/...`) is real and reachable — useful for future reference if a functional rebuild is ever revisited.

## What changed

- **Font**: the Figma design file's own text layers specify **Plus Jakarta Sans** throughout (`font-['Plus_Jakarta_Sans:*']` on every text style). This is unrelated to the earlier finding that the DS's shipped Storybook code components only bundle Rawline — that finding was specific to consuming the DS's component library, which this build no longer does. Self-hosted the canonical Plus Jakarta Sans variable font from the `google/fonts` GitHub repo.
- **Assets**: every card/illustration is a `download_assets` PNG export at 3x scale from the real Figma file (`GKwuxiWOb5BEKilF2Qojkj`, branch `JjpP6MD9RudzUL2Q8im5Cz`) — see `src/assets/exports/`. PNG was chosen over SVG after direct testing: whole-node SVG exports carry large ancestor-bleed artifacts (thousands of px of unrelated background geometry from ancestor blur effects), while PNG exports are cleanly cropped to the node's own bounds plus natural shadow bleed.
- **Mesh gradient**: the splash/login background is a genuine multi-point Figma mesh gradient, not a CSS-expressible linear/radial gradient — confirmed by inspecting the raw export (Tailwind conversion flattens it to a wrong flat colour). Exported as a PNG, same as every other visual.
