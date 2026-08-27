# dōTERRA Pro onboarding demo

An interactive, mobile-sized prototype of the dōTERRA Pro onboarding journey, from the first-open splash animation through the five-step tour to a dashboard stand-in. Every screen is built from assets exported out of the real Figma file and animated on top, inside a fixed 393 × 852 device frame.

This is a visual prototype for review and handover, not a production application. Nothing authenticates, no data is real, and the dashboard is a long image rather than a built screen.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open the URL Vite prints. To try it on a phone on the same network:

```bash
npm run dev -- --host
```

## The journey

The demo runs as one continuous sequence. Everything below happens inside the device frame; the dark surround and the controls in the corner are not part of the app.

### 1. Splash intro

The animated opening. A dōTERRA bottle builds, resolves into the Ō, and hands over to the splash card. A loading bar runs along the bottom for the whole sequence and lands on full exactly as the card arrives.

There are two versions of this moment, and they are the thing under review:

| | V1 | V2 |
|---|---|---|
| Opens on | A pale gradient, opaque over the app | The lavender photograph, visible from the first frame |
| Ending | The Ō scales up and its counter, used as a live mask, reveals the photograph through the letterform | The Ō lifts, then falls off the bottom edge |
| Duration | 4350 ms | 3668 ms |
| Status bar | Dark icons, crossfading to light at the end | Light icons throughout |

The intro is skipped entirely under `prefers-reduced-motion: reduce`, which lands straight on the splash card.

### 2. Splash card

"dōTERRA Pro" with two ways in: **Log in** goes to the login screen, **Take a Tour First** runs the guest path.

### 3. Login

A static form. Either button continues; nothing is validated or sent.

### 4. Loading and welcome

A three-second personalisation screen: progress bar, wordmark, a greeting that names the member, and skeleton rows standing in for content still loading. The greeting reads "Emma" on the authenticated path and "Member" on the guest path.

### 5. Onboarding tour

Five steps, each with an animated stage above and its copy below.

1. **Pro Advisor** — powerful pro business advice, powered by AI
2. **Pro Dashboard** — your progress, in one view
3. **AI Business Insights** — take action on AI insights
4. **My Team** — help your team grow
5. **My Tasks** — your business to-do list

Navigate with **Next**, by swiping left and right, or by tapping a position on the progress bar. **Skip** jumps to the end. Each stage runs its own entrance and exit; the chrome around them never remounts.

### 6. Dashboard

On finishing the tour the whole onboarding page swipes away to the left, revealing the dashboard beneath it. It scrolls, and the bottom navigation stays fixed. The "Retake tour" card is live and restarts the tour.

The guest path ends differently: rather than exposing the dashboard, it returns to the login screen.

## Demo controls

Fixed to the top right, outside the device frame. They are development chrome and are hidden from recordings.

- **V1 / V2** picks the splash intro version. Pressing either button restarts with the intro playing, since that is the only place the two versions differ.
- **Restart** returns to the splash card without the intro.
- **From intro** replays the current version's intro from its first frame.

## Recording

```bash
npm run record
```

Drives the prototype with Playwright and writes one video per version to `recordings/`. By default each clip covers the intro and stops once the splash card has landed. Add `--full` to carry on through login, loading, the tour and the dashboard, or `--pace 1.5` to slow everything down for reviewing motion.

Output is `.webm`. If a system `ffmpeg` is present the script also writes an `.mp4` alongside each one.

## Checks

```bash
npm run build
```

```bash
npm run lint
```

## Layout of the code

| Path | What lives there |
|---|---|
| `src/App.tsx` | Phase state machine, version selection, the page-swipe finale, and the demo controls |
| `src/frames/` | One file per screen: `SplashIntro`, `Frame1Splash` through `Frame8Tasks`, and `Dashboard` |
| `src/journey/` | Tour chrome, stage layout, progress bar, and the journey reducer |
| `src/motion/` | Duration, easing and travel tokens, shared transitions, reduced-motion hook |
| `src/ui/` | Persistent chrome: background, status bar, wordmark, form primitives |
| `src/data/copy.ts` | Every string, sourced from the Figma frames |
| `src/assets/` | Exported images and Lottie files |
| `scripts/record-journey.mjs` | The recording script |
| `docs/` | Motion spec, copy notes, Figma defects log, design-system integration notes |

`src/assets/splash-intro-v2.json` is V2 packaged as a single self-contained Lottie for handover to engineering. The prototype does not use it; it computes the same motion in code.

## Stack

React 19, TypeScript, Vite, Motion for React, lottie-web, Playwright for recording.

## Known constraints

- Only one splash version ships. When that decision is made, the losing version and its branch in `SplashIntro` should be deleted rather than left in.
- The dashboard is a single tall PNG with one invisible hotspot over the retake-tour card. Anything else on it is not tappable.
- Screens are images, so text on them cannot be selected, translated or read by a screen reader. That is a deliberate trade for fidelity to the Figma source, and it means this prototype is not a basis for accessibility review.
