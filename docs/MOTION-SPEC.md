# Motion Spec — asset-based rebuild (current architecture)

Supersedes the earlier version of this file, which documented a functional-component approach that was abandoned mid-session. See `DS-INTEGRATION.md` for why.

## Source of truth

Every choreography beat below comes directly from designer-authored Figma annotations (`data-motion-annotations` on each frame), not inference from static geometry. The user pasted the annotation text for Frames 3–8 directly; Frames 1–2 have no annotation (intentionally the plainest, least-animated screens).

## The 8 frames

| # | Figma node | File | Notes |
|---|---|---|---|
| 1 | `16145:83920` "1 - Splash" | `frames/Frame1Splash.tsx` | Mesh gradient bg, floating fully-rounded card, no hero photo |
| 2 | `16145:83877` "2 - Login" | `frames/Frame2Login.tsx` | Same background treatment, plain form, no annotation |
| 3 | `16169:2894` "3 - Three second loading state" | `frames/Frame3Loading.tsx` | Wordmark + greeting fade in, skeleton bars shimmer, wordmark moves up into its Frame-4-onward resting position (86px) as it settles |
| 4 | `16179:29705` "4 - Onboarding 1" | `frames/Frame4Advisor.tsx` | 7-beat sequence: container reveal → avatar entrance → bubble (clip-path typewriter) → input reveal → thinking ellipsis |
| 5 | `16145:84088` "5 - Onboarding 2" | `frames/Frame5Tracking.tsx` | 3 cards enter from right at an angle, settle upright, float gently |
| 6 | `16145:84167` "6 - Onboarding 3" | `frames/Frame6Insights.tsx` | Insight card enters **first** and pulses; Sub-Insight card enters 250ms later and sits **behind** it — reverse of what the raw geometry alone would suggest |
| 7 | `16145:84218` "7 - Onboarding 4" | `frames/Frame7MyTeam.tsx` | Card slides up, rows stagger 200ms, then the middle row **auto-swipes** to reveal the star action as part of the entrance — not a separate idle-hint loop |
| 8 | `16145:84321` "8 - Onboarding 5" | `frames/Frame8Tasks.tsx` | Tile drops+shakes, pulses, menu appears, both cross-scale into the Task-created toast from a shared centre point, then the whole page swipes left (`App.tsx`) to reveal the app |

Shared chrome (wordmark, stage box, Skip, headline/eyebrow/body, progress dots, FAB) lives in `journey/TourChrome.tsx`, used by Frames 4–8.

## Real bugs found and fixed during build (not just plan execution)

- **TourChrome wordmark invisible**: rendered before the opaque stage box in DOM order, so the box painted over it. Fixed by z-indexing the wordmark above the box.
- **Frame 1 headline/subtitle permanently invisible**: a mid-level stagger-relay `motion.div` had `hidden: { opacity: 0 }` but `reveal` never set `opacity: 1`, so Motion held it at 0 forever. The fix: stagger-relay wrappers must have `hidden: {}` (no properties), only real content nodes should carry opacity variants.
- **Frame 3 skeleton bars invisible**: nested inside the clipped 530px-tall stage box using their absolute-frame (852px-relative) coordinates, which put them below the box's own clip boundary. Figma's own layer tree has them as top-level siblings of the stage box, not children — fixed by matching that structure exactly.
- **`useJourneyMachine` `NEXT` permanently blocked**: an earlier `status: "entering"` was set on `LOADING_DONE` with nothing to ever reset it to `"settled"`, and `NEXT`'s guard checked `status !== "settled"`. Removed the vestigial settle-gating entirely once the simpler beat-based per-frame sequencing replaced it — the guard no longer served a purpose and was actively wrong.

## Reduced motion

`MotionConfig reducedMotion={reduce ? "always" : "never"}` driven by `motion/useReducedMotion.ts` (subscribes to `matchMedia` properly, unlike Motion's own unwrapped hook; also reads `?reducedMotion=1` for the browser-automation verification path used throughout this build). Verified on Frames 1 and 4: both reach their fully composed end state immediately, no elements stuck at `opacity: 0` or off-stage. The per-frame `setTimeout`-driven beat sequences (used in Frames 3, 4, 8) are unaffected by reduced motion — they still fire on schedule — but each individual Motion transition inside them gets snapped instantly by `MotionConfig`, so the sequence still reaches its correct end state, just without the intermediate motion.

## Known simplifications (scope-controlled, not accidental)

- ~~**Exit choreography** between tour steps is a generic fade+slide unit transition~~ — **no longer true; the annotated outros are now built.** Every frame has its own, per the brief, and each is verified by sampling the live DOM through the transition rather than by eye (the browser tooling's round-trip is slower than a 400ms exit, so screenshots can't catch these):

| frame | annotated outro | measured |
|---|---|---|
| 4 | all elements cascade out, anticipation bounce, pause before next screen | flat horizontal exit, **y=0 and rot=0 throughout**; starts ~60ms apart; clear by 614; next frame mounts after a 200ms pause |
| 5 | each card scales *towards the viewport* and fades, 350ms, Ease In Back | **reverse entrance order** — boost finishes t≈366, fast-start 488, min-qual 610; ~100ms apart; scale up to 2.35 |
| 6 | both cards together, anticipation then collapse into their own centres, 400ms | identical scale on both: peak 1.092, then 0 at t≈450 |
| 7 | whole component as one unit, upward anticipation then slides down off-screen fading slightly, 400ms | lifts to −51px, drops to 560, opacity → 0.40, done at t≈450 |
| 8 | no per-element outro — whole page swipes left, 450ms, Ease In Out | already correct in `App.tsx` (`pageSwipe`) |

  Three of these deliberately depart from the annotations, on review of the as-briefed build. **Frame 4** travels horizontally rather than upwards, and its cascade is 60ms rather than the annotated 200ms. **Frame 5** exits in reverse entrance order at 100ms rather than in order at 500ms — as briefed, the three cards read as a slow trailing queue rather than one movement. **Frame 8** keeps the insight card on screen when the confirmation lands and only removes the action menu; the annotation had both collapsing into a shared centre, which discarded the very thing the task was created from. The brief's original figures are kept alongside the current ones in `motion.tokens.ts` so these read as decisions rather than transcription errors.

  A subtler cause of Frame 4 reading as "angled": each element's exit target omitted transform properties its *entrance* had animated, so Motion fell back towards `initial` and dragged them along — the avatar rotated back to −25° and slid +40px right on its way out. Exit targets must pin every transform property the entrance touches, not just the ones being changed.

  Two things learned building these. First, **the anticipation bounce and Ease In Back are one instruction, not two** — that curve's negative control point (y1 = −0.28) drives the value backwards ~10% before it travels, which *is* the bounce. Adding explicit anticipation keyframes on top double-counts it (measured −67px of lift on Frame 7 against a −12px keyframe), so exits are plain two-keyframe tweens on the curve. Second, exits are driven by an `exiting` prop and a held mount in `TourJourney`, **not** `AnimatePresence`: these stages animate through explicit beat state and inline `animate` objects, which stops Motion propagating variants into them, so an `exit` on a wrapper would never reach the individual elements.
- **Frame 8's mid-sequence beats** (drop/shake/pulse/menu) were verified by code review and by confirming the correct end state renders — the animation reuses the same `useState` + `setTimeout` beat pattern already proven working in Frames 4 and 6, but a live mid-animation screenshot wasn't captured (the ~2s sequence is shorter than this tooling's round-trip latency).
- Real drag interactivity on Frame 7's swipe row was not added — the annotation only calls for a scripted auto-swipe as part of the entrance, which is what's implemented.

## Defects reproduced deliberately from the source file

See `FIGMA-DEFECTS.md`. The duplicate "Michael Thompson" on Frame 7's swiped row and the "1136 of 500" progress-bar mismatch on Frame 5 are both still present in the Figma file today and are reproduced as-is, per the "preserve exactly" instruction — not silently fixed.
