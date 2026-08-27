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

// Lead-in surface. Taken from the "Splash Load" frame in Figma (node
// 7883:2947): a vertical gradient from lavender at the top, through an almost
// white band at 23%, down to a pale blue at the foot — not a flat fill.
const LEAD_IN_STOPS = [
  { offset: "0%", color: "#d8d8f1" },
  { offset: "23.077%", color: "#f1f1f9" },
  { offset: "100%", color: "#e5eff9" },
] as const;

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

// The build plays at the rate it was authored at. The expansion does not:
// natively it is 9 frames — 300ms — which is far too quick to read as the
// background "growing" through the mark, so it is stretched. Playback is
// stretched, not re-keyed, so the segment keeps its authored easing.
const BUILD_MS = (BUILD_END_FRAME / FRAME_RATE) * 1000;
const REVEAL_MS = 950;

// V2's ending is not the expansion at all. The mark settles at its resting
// size (32.77%, held between frames 75 and 94 — frames 94-102 are the shrink
// that sets up the blow-up, and reading as a shrink before a fall is wrong),
// gathers itself with a short lift, then falls off the bottom of the screen.
const DROP_HOLD_FRAME = 94;
const DROP_BUILD_MS = (DROP_HOLD_FRAME / FRAME_RATE) * 1000;
const LIFT_PX = 26;
const LIFT_MS = 220;
const DROP_PX = 900; // comfortably past the bottom edge from centre screen
const DROP_MS = 400;
const DROP_EASE_POWER = 2.2;
// Once the mark is this far down it has cleared the viewport, so the splash
// card is free to pop up over what is now an empty screen — the two overlap
// exactly as the card and the expansion used to.
const DROP_CLEAR_PX = 520;
// When that happens, in milliseconds — the drop curve inverted. The progress
// bar needs it so it finishes exactly as the intro hands over rather than
// stopping short of full.
const DROP_CLEAR_T = Math.pow((DROP_CLEAR_PX + LIFT_PX) / (DROP_PX + LIFT_PX), 1 / DROP_EASE_POWER);
const DROP_TOTAL_MS = DROP_BUILD_MS + LIFT_MS + DROP_CLEAR_T * DROP_MS;

// ---------------------------------------------------------------------------
// Loading bar
// ---------------------------------------------------------------------------

// Straight from the "Splash Load" frame (node 7883:2947): same track, fill and
// geometry the storyboard shows under the wordmark on every intro frame. It
// runs the length of the intro, so it is a real progress bar rather than an
// indeterminate one.
const BAR = {
  left: 25.23,
  top: 775.57,
  width: 324.548,
  height: 8.182,
  radius: 4.091,
  track: "#c8def6",
  fill: "#0067dc",
} as const;

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
  reduced,
  backdrop = "lead-in",
}: {
  onComplete: () => void;
  reduced: boolean;
  /**
   * "lead-in" (V1) opens on the pale gradient surface and reveals the lavender
   * background through the Ō's counter. "photo" (V2) drops that surface
   * altogether: the lavender macro photograph is simply there from the first
   * frame and stays put, with the mark building and expanding on top of it.
   * With nothing to reveal, the counter mask has no work to do either.
   */
  backdrop?: "lead-in" | "photo";
}) {
  const overPhoto = backdrop === "photo";
  const stageRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<SVGPathElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reduced motion gets the destination, not the journey: no build, no
    // expansion, just the splash it was on its way to.
    if (reduced) {
      onCompleteRef.current();
      return;
    }

    const container = stageRef.current;
    const hole = holeRef.current;
    if (!container || (!hole && !overPhoto)) return;

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

    const drawDrop = (elapsed: number) => {
      // The build is frozen at its resting frame; everything after this is our
      // own motion on the stage, not the Lottie's.
      animation.goToAndStop(Math.min(DROP_HOLD_FRAME, (elapsed / 1000) * FRAME_RATE), true);
      if (elapsed < DROP_BUILD_MS) return false;

      const since = elapsed - DROP_BUILD_MS;
      let y: number;
      if (since < LIFT_MS) {
        // Anticipation: eases out into the top of the lift, so the mark looks
        // like it is gathering rather than being yanked.
        const t = since / LIFT_MS;
        y = -LIFT_PX * (1 - Math.pow(1 - t, 2));
      } else {
        // The fall accelerates; it should feel dropped, not animated down.
        const t = Math.min(1, (since - LIFT_MS) / DROP_MS);
        y = -LIFT_PX + (DROP_PX + LIFT_PX) * Math.pow(t, DROP_EASE_POWER);
      }

      if (dropRef.current) dropRef.current.style.transform = `translateY(${y}px)`;
      return y >= DROP_CLEAR_PX;
    };

    const totalMs = overPhoto ? DROP_TOTAL_MS : BUILD_MS + REVEAL_MS;

    const draw = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(1, elapsed / totalMs)})`;
      }

      if (overPhoto) {
        if (drawDrop(elapsed)) {
          if (!done) {
            done = true;
            onCompleteRef.current();
          }
          return;
        }
        raf = requestAnimationFrame(draw);
        return;
      }

      let frame: number;
      let revealProgress: number;
      if (elapsed < BUILD_MS) {
        frame = (elapsed / 1000) * FRAME_RATE;
        revealProgress = 0;
      } else {
        revealProgress = Math.min(1, (elapsed - BUILD_MS) / REVEAL_MS);
        const warped = Math.pow(revealProgress, REVEAL_WARP);
        frame = BUILD_END_FRAME + warped * (FINAL_FRAME - BUILD_END_FRAME);
      }

      animation.goToAndStop(frame, true);

      // Attributes are written directly rather than through state: this runs
      // every frame, and a re-render per frame is a cost with nothing to show
      // for it.
      if (hole) {
        hole.setAttribute("transform", counterTransform(scaleAtFrame(frame)));
        hole.setAttribute(
          "fill-opacity",
          String(Math.min(1, revealProgress / HOLE_FADE_PORTION)),
        );
      }

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
  }, [reduced, overPhoto]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 40, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Pale lead-in with the counter punched out of it. Whatever App has
          mounted underneath — the lavender background — is what shows through
          the hole, which is the entire point of masking rather than fading.
          V2 omits it entirely and lets that background stand on its own. */}
      {!overPhoto && (
      <svg
        width={DEVICE_WIDTH}
        height={DEVICE_HEIGHT}
        viewBox={`0 0 ${DEVICE_WIDTH} ${DEVICE_HEIGHT}`}
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <defs>
          <linearGradient id="splash-intro-lead-in" x1="0" y1="0" x2="0" y2={DEVICE_HEIGHT} gradientUnits="userSpaceOnUse">
            {LEAD_IN_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <mask id="splash-intro-counter" maskUnits="userSpaceOnUse">
            <rect width={DEVICE_WIDTH} height={DEVICE_HEIGHT} fill="#ffffff" />
            <path ref={holeRef} d={COUNTER_PATH} fill="#000000" fillOpacity={0} />
          </mask>
        </defs>
        <rect
          width={DEVICE_WIDTH}
          height={DEVICE_HEIGHT}
          fill="url(#splash-intro-lead-in)"
          mask="url(#splash-intro-counter)"
        />
      </svg>
      )}

      {/* The mark itself, cover-fitted over the device box and drawn above the
          pale so the ink stays solid while the counter opens beneath it. The
          outer element exists only to carry V2's lift-and-drop, so that motion
          never has to compose with the centring transform below it. */}
      {/* Loading bar. Outside the drop wrapper on purpose: it belongs to the
          screen, not to the mark, so V2's fall leaves it where it is. */}
      <div
        style={{
          position: "absolute",
          left: BAR.left,
          top: BAR.top,
          width: BAR.width,
          height: BAR.height,
          borderRadius: BAR.radius,
          background: BAR.track,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          ref={barRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: BAR.radius,
            background: BAR.fill,
            transform: "scaleX(0)",
            transformOrigin: "left center",
            willChange: "transform",
          }}
        />
      </div>

      <div ref={dropRef} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
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
    </div>
  );
}
