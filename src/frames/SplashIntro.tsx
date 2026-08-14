import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import type { AnimationItem } from "lottie-web";
import animationData from "../assets/splash-intro.json";

// First-open intro. The bottle builds, resolves into the dōTERRA Ō, then the
// mark scales up until its counter has swallowed the whole viewport.
//
// The reveal is NOT a crossfade. The Ō's counter is punched out of the pale
// lead-in as a live SVG mask, so what appears inside the letterform is the
// real MeshGradientBackground sitting underneath — the same element the splash
// card lands on a moment later. Nothing is duplicated and nothing has to line
// up by hand, so the handover to Frame 1 has no seam in it at all.
//
// A plain opacity fade was tried first and doesn't work here: the composition
// is 9:16 and the device is ~9:19.5, so cover-fitting leaves the mark short of
// the corners. Measured against the viewport border, the mark's widest moment
// (frame 104.5) still leaves 38% of that border uncovered — a global fade
// would bleed lavender in around the edges instead of only through the O.

// ---------------------------------------------------------------------------
// Values below are read straight out of splash-intro.json, not eyeballed.
// ---------------------------------------------------------------------------

const FRAME_RATE = 30; // json `fr`
const COMP_WIDTH = 1080; // json `w`
const COMP_HEIGHT = 1920; // json `h`

// The "Flattened-Logomark" layer's own scale track. It pops in at 72, holds,
// dips to 27.07 at 100-102 as anticipation, then blows out to 668.82 by 111.
// Frame 102 is therefore the last frame before the expansion, and by 111 the
// mark has left the viewport entirely.
const BUILD_END_FRAME = 102;
const FINAL_FRAME = 111;
const SCALE_AT_BUILD_END = 27.0746;
const SCALE_AT_FINAL = 668.8184;

// Layer transform for "Flattened-Logomark": ks.a (anchor) and ks.p (position).
const ANCHOR_X = 881.396;
const ANCHOR_Y = 881.2195;
const POSITION_X = 540;
const POSITION_Y = 960;

// Every keyframe on that track carries After Effects' default easy-ease
// handles (o.x/o.y 0.167, i.x/i.y 0.833), so one curve covers the segment.
const EASE = [0.167, 0.167, 0.833, 0.833] as const;

// The O's inner contour — "Path 3" inside Group 2, the even-odd counterform
// of the outer "Path 2". Converted from Lottie's v/i/o bezier arrays to SVG,
// and expressed in the layer's own coordinate space; TRANSFORM below puts it
// on screen.
const COUNTER_PATH =
  "M1120.47 1014.5C1120.47 973.3 1116.6 934.34 1108.82 897.63C1100.97 860.86 1088.14 828.71 1070.31 801.02C1052.44 773.39 1028.21 751.49 997.63 735.39C967.12 719.31 929.06 711.24 883.5 711.24C841.41 711.24 805.23 718.58 775.01 733.27C744.72 747.95 719.78 768.74 700.16 795.51C680.6 822.35 666.03 854.12 656.53 890.86C647.02 927.54 642.25 967.63 642.25 1011.11C642.25 1052.92 646.12 1092.19 653.96 1128.9C661.71 1165.61 674.68 1197.63 692.83 1225.04C711.01 1252.41 735.38 1274.18 765.92 1290.26C796.49 1306.37 834.49 1314.4 880.05 1314.4C921.54 1314.4 957.58 1307.09 988.13 1292.38C1018.7 1277.73 1043.77 1257.09 1063.39 1230.54C1082.98 1203.99 1097.36 1172.38 1106.61 1135.67C1115.83 1098.96 1120.47 1058.58 1120.47 1014.5C1120.47 1014.5 1120.47 1014.5 1120.47 1014.5Z";

// ---------------------------------------------------------------------------
// Device geometry
// ---------------------------------------------------------------------------

const DEVICE_WIDTH = 393;
const DEVICE_HEIGHT = 852;

// The composition is 9:16 against a ~9:19.5 device, so it is cover-fitted:
// height drives the scale and the extra width is cropped evenly.
const COVER_SCALE = DEVICE_HEIGHT / COMP_HEIGHT;
const COVER_WIDTH = COMP_WIDTH * COVER_SCALE;
const COVER_OFFSET_X = (DEVICE_WIDTH - COVER_WIDTH) / 2;

// Pale lead-in. Derived from the lavender photograph itself (mean #d2d0ea)
// lifted towards white, so the opening frame reads as the same world the
// background belongs to rather than a neutral grey card.
const PALE = "#efedf7";

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

// The build plays at the rate it was authored at. The expansion does not:
// natively it is 9 frames — 300ms — which is far too quick to read as the
// background "growing" through the mark, so it is stretched. Playback is
// stretched, not re-keyed, so the segment keeps its authored easing.
const BUILD_MS = (BUILD_END_FRAME / FRAME_RATE) * 1000;
const REVEAL_MS = 950;

// Stretching the segment evenly is not enough on its own. The mark travels
// 27% -> 669%, so almost all of its screen coverage arrives at the very end,
// and the only frames where you can actually READ a photograph sitting inside
// a letter O are the first two and a half — by frame 104.5 the O's outer edge
// has already passed the viewport. Played evenly, that beat gets ~250ms.
//
// Time is therefore warped across the segment: elapsed^REVEAL_WARP. Above 1
// this spends longer on the early frames and hurries the tail, which is dead
// runway anyway — by then the counter is bigger than the screen and all that
// is left is the mark clearing the top edge. 1.8 buys the readable beat ~500ms
// without the exit feeling truncated.
const REVEAL_WARP = 1.8;

// The counter opens from nothing, so a hard cut to a fully transparent hole
// pops. It fades in over the first stretch of the expansion instead, which
// reads as the photograph blooming inside the letterform.
const HOLE_FADE_PORTION = 0.28;

/** Cubic bezier easing solved by Newton-Raphson, matching the Lottie curve. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number, t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const slopeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 8; i += 1) {
    const dx = sampleX(u) - t;
    if (Math.abs(dx) < 1e-6) break;
    const d = slopeX(u);
    if (Math.abs(d) < 1e-6) break;
    u -= dx / d;
  }
  return ((ay * u + by) * u + cy) * u;
}

/** The logomark layer's scale, as a fraction, at a given frame. */
function scaleAtFrame(frame: number) {
  const t = (frame - BUILD_END_FRAME) / (FINAL_FRAME - BUILD_END_FRAME);
  const eased = cubicBezier(EASE[0], EASE[1], EASE[2], EASE[3], Math.min(1, Math.max(0, t)));
  return (SCALE_AT_BUILD_END + eased * (SCALE_AT_FINAL - SCALE_AT_BUILD_END)) / 100;
}

/**
 * Places the counter path on screen: layer space -> composition space (Lottie
 * scales about the layer anchor) -> device space (the cover fit).
 */
function counterTransform(scale: number) {
  return [
    `translate(${COVER_OFFSET_X} 0)`,
    `scale(${COVER_SCALE})`,
    `translate(${POSITION_X} ${POSITION_Y})`,
    `scale(${scale})`,
    `translate(${-ANCHOR_X} ${-ANCHOR_Y})`,
  ].join(" ");
}

export function SplashIntro({
  onComplete,
  onRevealStart,
  reduced,
}: {
  onComplete: () => void;
  /**
   * Fired as the expansion begins. The status bar rides on this: white icons
   * are invisible against the pale lead-in, so they stay dark until the mark's
   * ink takes the top of the screen — after which the ink, and then the
   * lavender behind it, both want light.
   */
  onRevealStart: () => void;
  reduced: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<SVGPathElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onRevealStartRef = useRef(onRevealStart);
  onRevealStartRef.current = onRevealStart;

  useEffect(() => {
    // Reduced motion gets the destination, not the journey: no build, no
    // expansion, just the splash it was on its way to.
    if (reduced) {
      onRevealStartRef.current();
      onCompleteRef.current();
      return;
    }

    const container = stageRef.current;
    const hole = holeRef.current;
    if (!container || !hole) return;

    const animation: AnimationItem = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });

    let raf = 0;
    let startedAt = 0;
    let done = false;
    let revealAnnounced = false;

    const draw = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      let frame: number;
      let revealProgress: number;
      if (elapsed < BUILD_MS) {
        frame = (elapsed / 1000) * FRAME_RATE;
        revealProgress = 0;
      } else {
        revealProgress = Math.min(1, (elapsed - BUILD_MS) / REVEAL_MS);
        const warped = Math.pow(revealProgress, REVEAL_WARP);
        frame = BUILD_END_FRAME + warped * (FINAL_FRAME - BUILD_END_FRAME);
        if (!revealAnnounced) {
          revealAnnounced = true;
          onRevealStartRef.current();
        }
      }

      animation.goToAndStop(frame, true);

      // Attributes are written directly rather than through state: this runs
      // every frame, and a re-render per frame is a cost with nothing to show
      // for it.
      hole.setAttribute("transform", counterTransform(scaleAtFrame(frame)));
      hole.setAttribute(
        "fill-opacity",
        String(Math.min(1, revealProgress / HOLE_FADE_PORTION)),
      );

      if (revealProgress >= 1) {
        if (!done) {
          done = true;
          onCompleteRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      animation.destroy();
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 40, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Pale lead-in with the counter punched out of it. Whatever App has
          mounted underneath — the lavender background — is what shows through
          the hole, which is the entire point of masking rather than fading. */}
      <svg
        width={DEVICE_WIDTH}
        height={DEVICE_HEIGHT}
        viewBox={`0 0 ${DEVICE_WIDTH} ${DEVICE_HEIGHT}`}
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <defs>
          <mask id="splash-intro-counter" maskUnits="userSpaceOnUse">
            <rect width={DEVICE_WIDTH} height={DEVICE_HEIGHT} fill="#ffffff" />
            <path ref={holeRef} d={COUNTER_PATH} fill="#000000" fillOpacity={0} />
          </mask>
        </defs>
        <rect
          width={DEVICE_WIDTH}
          height={DEVICE_HEIGHT}
          fill={PALE}
          mask="url(#splash-intro-counter)"
        />
      </svg>

      {/* The mark itself, cover-fitted over the device box and drawn above the
          pale so the ink stays solid while the counter opens beneath it. */}
      <div
        ref={stageRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: COVER_WIDTH,
          height: DEVICE_HEIGHT,
        }}
      />
    </div>
  );
}
