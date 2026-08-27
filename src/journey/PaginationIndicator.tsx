import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePureReducedMotion } from "../motion/useReducedMotion";
import type { ExperienceStyle } from "../experienceStyle";

// Both styles now use the same progress bar: one continuous track with a
// proportional fill, rather than five separate dashes.
//
// Properties come from V2's reference component (node 16398:67817 on frame
// 16179:29705) and were confirmed against the rendered pixels, not inferred:
//   track   #e7e9eb  (color/background/light  -> --color-border-light)
//   fill    #0067dc  (color/background/info/extraBold -> --color-blue-700)
//   stroke  1px pure white, drawn OUTSIDE the box — the bar spans x 22..193
//           while x=21 and x=194 both read 255,255,255 against the gradient
//           page. A CSS `border` would eat into the box, so it is a
//           box-shadow spread.
//   ends    fully rounded, on the track and on the fill.
//
// Only the geometry differs between styles. V1 sits in the "progress + action"
// row the loading screen (17034:7145) and the tour (16923:10998) share: the
// row starts at y81 and is 21px tall, and the 10px bar is centred in it, which
// is also what lines it up with the Skip link beside it.
const GEOMETRY = {
  reskin: { left: 24, top: 86, width: 168, height: 10 },
  original: { left: 22, top: 70.5, width: 172, height: 10 },
  hybrid: { left: 22, top: 70.5, width: 172, height: 10 },
} as const;

const RADIUS = 100;
const STROKE = "0 0 0 1px #ffffff";
const FILL = "var(--color-blue-700)";
const TRACK = "var(--color-border-light)";

// The loading bar is its own meter and completes, as a loading bar should.
// The tour bar that replaces it is a different meter — "step 1 of 5" — so it
// starts at a fifth. To stop that reading as a glitch, the tour bar retracts
// from full on mount rather than snapping, which plays as the meter resetting
// for the tour rather than as the bar jumping backwards.
const LOADING_FILL = 1;
const TOUR_ENTRY_FILL = 1;

function ProgressTrack({
  experienceStyle,
  fill,
  from,
  transition,
  children,
}: {
  experienceStyle: ExperienceStyle;
  fill: number;
  from?: number;
  transition?: object;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...GEOMETRY[experienceStyle],
        borderRadius: RADIUS,
        background: TRACK,
        boxShadow: STROKE,
        boxSizing: "border-box",
      }}
    >
      <motion.div
        // `from` is only supplied by the loading bar, which has to sweep out
        // from empty on mount. The tour bar passes nothing and so starts at
        // its current value rather than replaying a fill on every step.
        initial={from === undefined ? false : { width: `${from * 100}%` }}
        animate={{ width: `${fill * 100}%` }}
        transition={transition ?? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          borderRadius: RADIUS,
          background: FILL,
        }}
      />
      {children}
    </div>
  );
}

export function PaginationDashes({
  stepIndex,
  stepCount,
  onSelect,
  experienceStyle,
}: {
  stepIndex: number;
  stepCount: number;
  onSelect: (stepIndex: number) => void;
  experienceStyle: ExperienceStyle;
}) {
  return (
    <div role="group" aria-label="Onboarding steps">
      <ProgressTrack
        experienceStyle={experienceStyle}
        // `from` applies only on mount, i.e. once when the tour opens; later
        // step changes animate from wherever the bar already is.
        from={TOUR_ENTRY_FILL}
        fill={(stepIndex + 1) / stepCount}
      >
        {/* The bar is one continuous shape now, but each step stays
            individually reachable — transparent hit areas sit over it so
            tapping a position still navigates, as the dashes allowed. */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {Array.from({ length: stepCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to onboarding step ${i + 1}`}
              aria-current={i === stepIndex ? "step" : undefined}
              onClick={() => onSelect(i)}
              style={{
                flex: 1,
                height: 44,
                minWidth: 0,
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: i === stepIndex ? "default" : "pointer",
                transform: "translateY(-17px)",
              }}
            />
          ))}
        </div>
      </ProgressTrack>
    </div>
  );
}

export function LoadingPagination({
  experienceStyle,
  loaded,
  loadingMs,
}: {
  experienceStyle: ExperienceStyle;
  loaded: boolean;
  loadingMs: number;
}) {
  const reduceMotion = usePureReducedMotion();

  return (
    <div
      role="progressbar"
      aria-label="Preparing your onboarding experience"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={loaded ? LOADING_FILL * 100 : undefined}
    >
      {/* Sweeps across the whole loading period, so it must not be gated on
          `loaded` — that only flips once loading has already finished. */}
      <ProgressTrack
        experienceStyle={experienceStyle}
        from={0}
        fill={LOADING_FILL}
        transition={{ duration: reduceMotion ? 0 : loadingMs / 1000, ease: "linear" }}
      />
    </div>
  );
}
