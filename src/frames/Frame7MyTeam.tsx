import { useEffect } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { duration, easing, stagger } from "../motion/motion.tokens";
import type { StageProps } from "../journey/stageProps";
// Derived from the current my-team-card.png source with an exact pixel crop:
// x:15, y:0, width:1062, height:496. Regenerate this asset whenever the main
// card is replaced so the header cannot retain stale edge or corner pixels.
import teamHeader from "../assets/exports/my-team-header.png";
import teamHeaderAuthenticated from "../assets/exports/my-team-header-authenticated.png";
import rowThompson from "../assets/exports/my-team-row-thompson.png";
import rowWilliams from "../assets/exports/my-team-row-williams.png";
import rowWilson from "../assets/exports/my-team-row-wilson.png";
import starPill from "../assets/exports/my-team-star-pill.png";

// Row spans x:[12.5, 359.5]; the star pill sits at x:[225, 358.65]. The row
// must clear the star's left edge (225) to reveal it in full, not just its
// trailing sliver — -76 left roughly half the pill still covered.
const OPEN_OFFSET = -140;
const CARD_LEFT = 8.5;
const CARD_TOP = 145;
const CARD_WIDTH = 364;
const CARD_HEIGHT = 435;

// Frame 7 - My Team (stage-only). Per annotation: whole card slides up as
// one unit, header stays pinned, rows stagger in 0.2s apart, THEN the
// middle row auto-swipes to reveal the star action as part of the entrance
// sequence — not a separate idle-hint loop that cancels on touch, unlike
// the earlier build.
// Beat 2, "Component Exit": the whole card leaves as ONE unit — no per-row
// stagger on the way out, unlike the entrance. A subtle upward anticipation
// bounce, then it slides down off-screen while fading "slightly" (so it is
// still partly visible as it clears the bottom, rather than dissolving).
export const MYTEAM_EXIT_MS = duration.exit * 1000;
const ROWS_SETTLED_MS = 500 + 2 * stagger.contactRow * 1000 + 500;
const SWIPE_DURATION_MS = 350;
const SWIPE_HOLD_MS = 2000;
// The final entrance action is the middle row's automatic swipe reveal,
// two-second hold, and return swipe that hides the action again.
export const MYTEAM_ENTRANCE_MS =
  ROWS_SETTLED_MS + SWIPE_DURATION_MS + SWIPE_HOLD_MS + SWIPE_DURATION_MS;
const EXIT_DROP = 560; // clears the stage's bottom clip at y=536 from top:145

export function Frame7MyTeamStage({ exiting, guestTour = false }: StageProps) {
  const rowX = useMotionValue(0);

  useEffect(() => {
    const openTimer = setTimeout(() => {
      animate(rowX, OPEN_OFFSET, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    }, ROWS_SETTLED_MS);
    const closeTimer = setTimeout(() => {
      animate(rowX, 0, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    }, ROWS_SETTLED_MS + SWIPE_DURATION_MS + SWIPE_HOLD_MS);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [rowX]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={
        exiting
          ? { y: EXIT_DROP, opacity: 0.4 }
          : { opacity: 1, y: 0 }
      }
      transition={
        exiting
          ? { duration: duration.exit, ease: easing.easeInBack }
          : { duration: duration.bubble, ease: easing.easeOut }
      }
      style={{
        position: "absolute",
        left: CARD_LEFT,
        top: CARD_TOP,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 24px 48px -12px rgba(16,24,40,0.18)",
        overflow: "hidden",
      }}
    >
      <img src={guestTour ? teamHeader : teamHeaderAuthenticated} alt="" style={{ position: "absolute", left: 5.8, top: 4.5, width: 353.7, display: "block" }} />

      <RowReveal delay={0} left={12.5} top={180.5} src={rowThompson} />

      <div style={{ position: "absolute", left: 0, top: 255.9, width: CARD_WIDTH }}>
        <motion.img
          src={starPill}
          alt="Mark as starred"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: stagger.contactRow + 0.5 }}
          style={{ position: "absolute", left: 225, top: 15.5, width: 133.65 }}
        />
        <motion.img
          src={rowWilliams}
          alt=""
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: "absolute", left: 12.5, top: 0, width: 347, x: rowX }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: stagger.contactRow }}
        />
      </div>

      <RowReveal delay={stagger.contactRow * 2} left={12.5} top={330.96} src={rowWilson} />
    </motion.div>
  );
}

function RowReveal({ delay, left, top, src }: { delay: number; left: number; top: number; src: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ position: "absolute", left, top, width: 347 }}
    />
  );
}
