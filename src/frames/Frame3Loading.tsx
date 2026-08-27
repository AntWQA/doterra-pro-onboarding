import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { copyReveal } from "../motion/transitions";
import { travel } from "../motion/motion.tokens";
import { LoadingPagination } from "../journey/PaginationIndicator";
import type { ExperienceStyle } from "../experienceStyle";

const LOADING_MS = 3000; // matches the frame's own name, "Three second loading state"
// Beat between the loading bar settling and the tour mounting. Previously
// this doubled as the bar's morph-into-dashes duration; there are no dashes
// now, but the pause itself still separates the two screens.
const HANDOFF_MS = 400;

// Frame 3 - "Three second loading state" (node 16169:2894). Per the live
// Figma frame, the coloured block is the mesh-gradient shader fill CONTAINED
// within the rounded stage box (left:6,top:6,381x530) — the base page
// underneath and around it is plain white, not the other way around. Both
// greeting lines ("Welcome," and the name) are genuine text — even "Welcome,"
// is only static in this one demo, not part of the design's own chrome — so
// neither is baked into the image — both render as real HTML text on top,
// matching the source's font/weight/colour exactly. Neither the block nor the
// white page belongs to this frame any more: App owns a single persistent
// gradient surface that has already closed in from full-bleed to the block by
// the time this mounts, and the white page is the overlay it sits on. That
// also removes a blink this frame used to cause, fading its own copy of the
// block out at the end of loading only for the tour to fade another one in.
export function Frame3Loading({ experienceStyle, guestTour = false, onDone, onSettled }: { experienceStyle: ExperienceStyle; guestTour?: boolean; onDone: () => void; onSettled: () => void }) {
  const [settled, setSettled] = useState(false);
  const reskin = experienceStyle === "reskin";

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), LOADING_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!settled) return;
    // The wordmark itself lives in App so it can survive into the tour; this
    // is the cue for it to move up into its resting position.
    onSettled();
    const t = setTimeout(onDone, HANDOFF_MS);
    return () => clearTimeout(t);
  }, [settled, onDone, onSettled]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Matches the source design's own greeting font exactly (Plus Jakarta
          Sans Bold, 40px, blue-700) — positions taken from the baked-in
          text's measured bounds before it was patched out.

          The annotation gives the greeting its own entrance, distinct from the
          logo's: "this will fade and move in from left to right" — so it
          travels on x, where the logo travels up on y. It was previously only
          fading, with no movement at all. */}
      <motion.div
        initial={{ opacity: 0, x: -travel.md }}
        animate={{ opacity: settled ? 0 : 1, x: 0 }}
        transition={copyReveal}
        style={{
          position: "absolute",
          // V1 bottom-anchors the greeting to the foot of the upper block
          // (17034:7145 puts its box at y443-475, above the block's 32px
          // bottom padding), so it reads as the last thing in the gradient
          // rather than floating near the screen edge.
          left: reskin ? 24 : 25,
          top: reskin ? undefined : 406,
          bottom: reskin ? 377 : undefined,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: "var(--font-family-base)",
          fontWeight: 700,
          fontSize: 40,
          lineHeight: "36px",
          color: "var(--color-blue-700)",
        }}
      >
        <span>Welcome,</span>
        <span>{guestTour ? "Member" : "Emma"}</span>
      </motion.div>

      {/* Skeleton bars are top-level siblings of the stage box in Figma
          (bottom-anchored to the full 852px frame), not nested inside it —
          nesting them clipped them via the stage box's overflow:hidden. */}
      <motion.div animate={{ opacity: settled ? 0 : 1 }} transition={{ duration: 0.3 }}>
        {reskin ? (
          <>
            {/* The lower block of the sheet, on the same 24px gutter and 32px
                top padding as the tour's copy, stacked with a 16px gap. */}
            <Skeleton left={24} top={539} width={154} height={14} />
            <Skeleton left={24} top={569} width={288} height={35} />
            <Skeleton left={24} top={620} width={328} height={70} />
          </>
        ) : (
          <>
            {/* Left-aligned on the greeting's own edge (x=25), matching the
                copy alignment change. They were centred — measured gaps of
                120/120, 53/53 and 33/33 — which read as a different column
                from the left-aligned text directly above them. Widths are
                unchanged, so the ragged right edge still reads as text. */}
            <Skeleton left={25} top={556} width={154} height={14} />
            <Skeleton left={25} top={578} width={288} height={35} />
            <Skeleton left={25} top={623} width={328} height={70} />
          </>
        )}
      </motion.div>

      <LoadingPagination experienceStyle={experienceStyle} loaded={settled} loadingMs={LOADING_MS} />
    </div>
  );
}

function Skeleton({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: "var(--radius-stage)",
        background: "var(--color-gray-25)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          animation: "shimmer-sweep var(--shimmer-duration) linear infinite",
        }}
      />
    </div>
  );
}
