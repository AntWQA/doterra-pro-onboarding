import { motion } from "motion/react";
import { usePureReducedMotion } from "../motion/useReducedMotion";

// Shared geometry from Figma nodes 16294:52199 and 16294:52079. Five 40px
// dashes plus four 4px gaps resolve to the loading bar's exact 216px width.
const PAGINATION_POSITION = {
  left: 20.486,
  top: 768,
} as const;

const WIDTH = 216;
const HEIGHT = 4.1717529296875;
const GAP = 4;
const DASH_COUNT = 5;
const RADIUS = 100;

const blue = "var(--color-blue-700)";
const blueTrack = "var(--color-blue-100)";
const gray = "var(--color-gray-50)";

export function PaginationDashes({
  stepIndex,
  stepCount,
  onSelect,
}: {
  stepIndex: number;
  stepCount: number;
  onSelect: (stepIndex: number) => void;
}) {
  return (
    <div
      aria-label="Onboarding steps"
      style={{
        position: "absolute",
        ...PAGINATION_POSITION,
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        gap: GAP,
      }}
    >
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
            transform: "translateY(-20px)",
            position: "relative",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 20,
              height: HEIGHT,
              borderRadius: RADIUS,
              background: i === stepIndex ? blue : gray,
            }}
          />
        </button>
      ))}
    </div>
  );
}

export function LoadingPagination({ loaded, loadingMs, morphMs }: { loaded: boolean; loadingMs: number; morphMs: number }) {
  const reduceMotion = usePureReducedMotion();
  const morphSeconds = reduceMotion ? 0 : morphMs / 1000;

  return (
    <div
      role="progressbar"
      aria-label="Preparing your onboarding experience"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={loaded ? 100 : undefined}
      style={{
        position: "absolute",
        ...PAGINATION_POSITION,
        width: WIDTH,
        height: HEIGHT,
        borderRadius: RADIUS,
      }}
    >
      {/* The pale loading track disappears as the solid bar separates into
          pagination dashes, leaving the page visible through the new gaps. */}
      <motion.div
        initial={false}
        animate={{ backgroundColor: loaded ? "rgba(200, 222, 246, 0)" : blueTrack }}
        transition={{ duration: morphSeconds, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: RADIUS }}
      />

      <motion.div
        initial={{ scaleX: reduceMotion ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduceMotion ? 0 : loadingMs / 1000, ease: "linear" }}
        style={{ position: "absolute", inset: 0, transformOrigin: "0% 50%" }}
      >
        <motion.div
          initial={false}
          animate={{ gap: loaded ? GAP : 0 }}
          transition={{ duration: morphSeconds, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", display: "flex" }}
        >
          {Array.from({ length: DASH_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ backgroundColor: loaded && i > 0 ? gray : blue }}
              transition={{ duration: morphSeconds, ease: "easeOut" }}
              style={{ flex: 1, height: "100%", borderRadius: RADIUS }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
