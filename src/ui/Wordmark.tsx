import { motion } from "motion/react";
import { copyReveal } from "../motion/transitions";
import { travel } from "../motion/motion.tokens";
import type { ExperienceStyle } from "../experienceStyle";

// The "dōTERRA Pro" wordmark is a SINGLE element owned by App and mounted for
// the whole loading + tour run, not re-created per frame.
//
// Frame 3 and TourChrome each used to render their own copy at the same final
// spot, so crossing from the greeting into slide 4 unmounted one and mounted
// the other. Identical though they looked, that is a remount: the element
// replays its entrance and the UI visibly refreshes at the seam. Keeping one
// instance means nothing happens at that boundary at all.
//
// Frame 3's annotation gives it the only movement it ever makes: it fades in
// low and centred while the greeting is on screen, then "the logo will move up
// into its final position" as the loading settles — which is exactly the 86px
// resting spot the tour frames use.
const CENTRED_Y = 201.36;
const RESKIN_CENTRED_Y = 426;
const RESTING_Y = 86;

export function Wordmark({ experienceStyle, settled }: { experienceStyle: ExperienceStyle; settled: boolean }) {
  const reskin = experienceStyle === "reskin";
  return (
    <motion.div
      initial={{ opacity: 0, y: (reskin ? RESKIN_CENTRED_Y : CENTRED_Y) + travel.sm }}
      animate={{ opacity: reskin && settled ? 0 : 1, y: reskin ? RESKIN_CENTRED_Y : settled ? RESTING_Y : CENTRED_Y }}
      transition={settled ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] } : copyReveal}
      style={{
        position: "absolute",
        // `top` MUST be explicit. Without it the element falls back to its
        // static position, which depends on whatever sibling precedes it —
        // and Frame 3's root is in-flow and 852 tall, which pushed the
        // wordmark to y=1053, right off the device.
        top: 0,
        left: "50%",
        x: "-50%",
        translateY: "-50%",
        fontFamily: "var(--font-family-base)",
        fontWeight: 600,
        fontSize: 32,
        color: "var(--color-bluegray-900)",
        textAlign: "center",
        width: 264,
        zIndex: 10,
      }}
    >
      dōTERRA <span style={{ fontWeight: 400 }}>Pro</span>
    </motion.div>
  );
}
