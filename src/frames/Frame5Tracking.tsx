import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { stagger, duration, easing } from "../motion/motion.tokens";
import type { StageProps } from "../journey/stageProps";
import minQual from "../assets/exports/tracking-min-qual.png";
import fastStart from "../assets/exports/tracking-fast-start.png";
import boostModule from "../assets/exports/tracking-boost-module.png";

// Frame 5 - Tracking (stage-only; chrome is owned by TourChrome/TourJourney).
// Cards enter from off-screen right at an angle, rotating upright as they
// settle, then float gently in place. Shadow is a real CSS box-shadow rather
// than baked into the PNG.
//
// All three assets are now the standalone COMPONENTS, at their full declared
// size, so each sits at its own Figma x/y and the stage's clip does the rest —
// which is what reproduces the design, since Minimum Qualification genuinely
// hangs off the left edge at x=-25.64 and the Boost module's member row runs
// off the right.
//
// They were previously exported from the placed INSTANCES inside Frame 5, so
// the frame had already cropped them: min-qual arrived 208.7 wide instead of
// 228.35 and boost 139 instead of 175, with the missing pixels simply absent.
// Those pre-cropped assets could not be positioned by their node coordinates
// (doing so hid a further 19.7px and rendered "Power of 3" as "r of 3"), so
// they carried hand-measured offsets instead. With complete components the
// offsets are gone and the metadata is the placement, exactly as authored.
const CARD_SHADOW = "0 8px 16px -4px rgba(16,24,40,0.1), 0 4px 6px -2px rgba(16,24,40,0.05)";
const CARDS = [
  { src: minQual, left: -25.64, top: 161.19, width: 228.35, radius: 16, z: 1, floatDelay: 0 },
  { src: fastStart, left: 112.04, top: 126, width: 202.98, radius: 16, z: 2, floatDelay: 0.3 },
  { src: boostModule, left: 248.29, top: 224.01, reskinTop: 179, width: 175, radius: 8, z: 3, floatDelay: 0.6 },
];

// Beat 2, "Card Exit": each card scales rapidly TOWARDS the viewport while
// fading — the brief's effect is the card moving past the user, so this
// scales up, not down (Frame 6 is the one that collapses inwards). The stage
// is only clipped at the device frame, so the cards genuinely fly off it.
//
// They leave in REVERSE entrance order — the boost module arrived last and
// goes first, back down to the Minimum Qualification card — and the gap
// between them is much tighter than the annotated 500ms, so they read as one
// movement rather than three separate departures. Both are direct feedback
// on the as-briefed version.
const EXIT_SCALE = 2.4;
const exitOrder = (i: number) => CARDS.length - 1 - i;
export const TRACKING_EXIT_MS =
  (CARDS.length - 1) * stagger.cardExit * 1000 + duration.exitFast * 1000;
export const TRACKING_ENTRANCE_MS =
  (CARDS.length - 1) * stagger.cardEntrance * 1000 + duration.bubble * 1000;

export function Frame5TrackingStage({ exiting, experienceStyle }: StageProps) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 500 + CARDS.length * stagger.cardEntrance * 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {CARDS.map((card, i) => (
        <motion.div
          key={card.src}
          initial={{ opacity: 0, x: 120, rotate: 12 }}
          animate={exiting ? { scale: EXIT_SCALE, opacity: 0 } : { opacity: 1, x: 0, rotate: 0 }}
          transition={
            exiting
              ? { duration: duration.exitFast, ease: easing.easeInBack, delay: exitOrder(i) * stagger.cardExit }
              : { duration: duration.bubble, ease: easing.easeOut, delay: i * stagger.cardEntrance }
          }
          style={{ position: "absolute", left: card.left, top: experienceStyle === "reskin" && "reskinTop" in card ? card.reskinTop : card.top, width: card.width, zIndex: card.z }}
        >
          <motion.img
            src={card.src}
            alt=""
            // The idle float has to stop on the way out, or it fights the
            // exit's own transform and the card wobbles as it flies past.
            animate={settled && !exiting ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: card.floatDelay }}
            style={{
              width: "100%",
              display: "block",
              borderRadius: card.radius,
              boxShadow: CARD_SHADOW,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
