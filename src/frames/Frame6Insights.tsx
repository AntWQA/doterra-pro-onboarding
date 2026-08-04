import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { delay as delayToken, duration, easing } from "../motion/motion.tokens";
import type { StageProps } from "../journey/stageProps";
import subInsightCard from "../assets/exports/insight-sub-card.png";
import subInsightCardPhone from "../assets/exports/insight-sub-card-phone.png";
import subInsightCardEmail from "../assets/exports/insight-sub-card-email.png";
import subInsightCardMessage from "../assets/exports/insight-sub-card-message.png";
import insightCard from "../assets/exports/insight-card.png";

type Beat = "center" | "pulse" | "settled";
type ContactHighlight = "default" | "phone" | "email" | "message";

const STAGE_WIDTH = 381;
const INSIGHT_WIDTH = 219.3;
const SUB_INSIGHT_WIDTH = 333;
const centreIn = (width: number) => (STAGE_WIDTH - width) / 2;

// Both cards centre on the stage's own axis (190.5). They previously sat at
// 90.86 and 36, which put 10-12px more space on their left than their right
// and read as visibly shunted rightwards inside the block.
const INSIGHT_FINAL = { left: centreIn(INSIGHT_WIDTH), top: 389.67 };
const INSIGHT_CENTER = { left: centreIn(INSIGHT_WIDTH), top: (530 - 130.67) / 2 };
const SUB_INSIGHT_LEFT = centreIn(SUB_INSIGHT_WIDTH);

// Frame 6 - Insights (stage-only). Reworked per direct feedback: the Insight
// card arrives centred and alone, holds for a couple of seconds so it can
// actually be read, performs the "tapped" pulse, THEN moves down into its
// resting position while the Sub-Insight/"User Profile" card enters and
// settles OVER it — the reverse z-order from the original annotation, which
// had Insight sitting in front throughout. Both cards are re-parented here
// from the Figma section root onto the frame (see FIGMA-DEFECTS.md — this
// frame ships empty in the source file).
// Beat 2, "Card Exit": both cards leave TOGETHER (no stagger), each doing a
// subtle anticipation bounce and then collapsing rapidly towards its OWN
// centre while fading — "as if collapsing neatly into themselves". Distinct
// from Frame 5, where the cards scale up past the viewer instead.
export const INSIGHTS_EXIT_MS = duration.exit * 1000;
// The contact card is the final element to arrive: it starts after the
// Insight card settles, then observes its own delay and entrance duration.
const CONTACT_CARD_ENTRANCE_MS = 2350 + delayToken.userProfileEnter * 1000 + duration.bubble * 1000;
const HIGHLIGHT_START_MS = CONTACT_CARD_ENTRANCE_MS + 1500;
const HIGHLIGHT_INTERVAL_MS = 1000;
const CONTACT_ICON_TOP = 246;
const CONTACT_ICON_SIZE = 32;
const CONTACT_HIGHLIGHTS = [
  { state: "phone", src: subInsightCardPhone, left: 39.5 },
  { state: "email", src: subInsightCardEmail, left: 150.5 },
  { state: "message", src: subInsightCardMessage, left: 261.5 },
] as const;
// The page is fully settled once all three actions have highlighted and the
// contact card has returned to its default state.
export const INSIGHTS_ENTRANCE_MS = HIGHLIGHT_START_MS + HIGHLIGHT_INTERVAL_MS * 3;
// easeInBack pops the scale just above 1 before it collapses, which is the
// "subtle anticipation bounce" — no extra keyframe needed.
const collapse = { scale: 0, opacity: 0 };
const collapseTransition = { duration: duration.exit, ease: easing.easeInBack };

export function Frame6InsightsStage({ exiting }: StageProps) {
  const [beat, setBeat] = useState<Beat>("center");
  const [contactHighlight, setContactHighlight] = useState<ContactHighlight>("default");

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat("pulse"), 2000),
      setTimeout(() => setBeat("settled"), 2350),
      setTimeout(() => setContactHighlight("phone"), HIGHLIGHT_START_MS),
      setTimeout(() => setContactHighlight("email"), HIGHLIGHT_START_MS + HIGHLIGHT_INTERVAL_MS),
      setTimeout(() => setContactHighlight("message"), HIGHLIGHT_START_MS + HIGHLIGHT_INTERVAL_MS * 2),
      setTimeout(() => setContactHighlight("default"), HIGHLIGHT_START_MS + HIGHLIGHT_INTERVAL_MS * 3),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const settled = beat === "settled";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Insight card — arrives centred and alone, holds so it can be read,
          pulses once (tapped), then moves down to its resting spot behind
          the contact card. */}
      <motion.img
        src={insightCard}
        alt=""
        initial={{ opacity: 0, y: INSIGHT_CENTER.top + 60, x: INSIGHT_CENTER.left }}
        animate={
          exiting
            ? { x: INSIGHT_FINAL.left, y: INSIGHT_FINAL.top, ...collapse }
            : {
                opacity: 1,
                x: settled ? INSIGHT_FINAL.left : INSIGHT_CENTER.left,
                y: settled ? INSIGHT_FINAL.top : INSIGHT_CENTER.top,
                scale: beat === "pulse" ? [1, 1.04, 1] : 1,
              }
        }
        transition={
          exiting
            ? collapseTransition
            : beat === "pulse"
              ? { scale: { duration: 0.3, ease: "easeInOut" } }
              : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: INSIGHT_WIDTH,
          zIndex: 1,
          borderRadius: 16,
          boxShadow: "0 4px 6px rgba(16,24,40,0.05)",
        }}
      />

      {/* Sub-Insight ("User Profile") / contact card — enters once the
          Insight card has settled, landing on top of it. Shadow is a real CSS
          box-shadow instead of baked into the PNG.

          Was 50/140 at 297.3 wide, against an asset the chroma-key had eaten
          the outer white margin off entirely (892x817 for a node that is
          333x295, i.e. 999x885 at 3x — it also swallowed the card's rounded
          corners and its whole bottom divider row). Re-exported at full node
          bounds; the offset back to the same on-screen position was measured
          off the red "193 days overdue" pill, which lands 42px right and 72px
          down in the new export — 14 and 24 at 1x. */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        // Brief: "Delay: 250ms before the User Profile card enters" — was 0.15.
        animate={exiting ? { y: 0, ...collapse } : settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={
          exiting
            ? collapseTransition
            : { duration: duration.bubble, ease: easing.easeOut, delay: delayToken.userProfileEnter }
        }
        style={{
          position: "absolute",
          left: SUB_INSIGHT_LEFT,
          top: 116,
          width: SUB_INSIGHT_WIDTH,
          height: 295,
          zIndex: 2,
          borderRadius: "32px 8px 32px 8px",
          overflow: "hidden",
          boxShadow: "0 8px 16px -4px rgba(16,24,40,0.1), 0 4px 6px -2px rgba(16,24,40,0.05)",
        }}
      >
        {/* Keep the complete default card fixed so swapping states cannot
            flicker. Each highlighted export is revealed only through a small
            crop around its changed icon, which also gets the tiny bounce. */}
        <img
          src={subInsightCard}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
        {CONTACT_HIGHLIGHTS.map(({ state, src, left }) => {
          const active = contactHighlight === state;
          return (
            <motion.div
              key={state}
              initial={false}
              animate={active ? { opacity: 1, scale: [0.92, 1.07, 1] } : { opacity: 0, scale: 0.96 }}
              transition={active ? { duration: 0.28, ease: "easeOut" } : { duration: 0.08, ease: "easeOut" }}
              style={{
                position: "absolute",
                left,
                top: CONTACT_ICON_TOP,
                width: CONTACT_ICON_SIZE,
                height: CONTACT_ICON_SIZE,
                overflow: "hidden",
                transformOrigin: "center",
              }}
            >
              <img
                src={src}
                alt=""
                style={{
                  position: "absolute",
                  left: -left,
                  top: -CONTACT_ICON_TOP,
                  width: SUB_INSIGHT_WIDTH,
                  height: 295,
                  display: "block",
                  maxWidth: "none",
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
