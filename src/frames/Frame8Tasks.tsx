import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { tasksFrame } from "../data/copy";
import type { StageProps } from "../journey/stageProps";
import advisorCard from "../assets/exports/tasks-advisor-card.png";
import dropdown from "../assets/exports/tasks-dropdown.png";
import dropdownPressed from "../assets/exports/tasks-dropdown-pressed.png";

// Stage box is 381 wide, so full-width content centres on 190.5.
const STAGE_WIDTH = 381;
const centreIn = (width: number) => (STAGE_WIDTH - width) / 2;

type Beat = "drop" | "shake" | "pulse" | "menu" | "pressed" | "collapsed";

// Frame 8 - Tasks (stage-only, final onboarding screen). Per annotation:
// tile drops from above with a shake, pulses (tap), menu scales in beneath
// it, then the Task Created confirmation appears. The annotation had BOTH
// the tile and the menu collapsing into a shared centre for the toast to
// grow out of; that was built and reviewed, and the tile is now kept on
// screen instead — see the layout note in the component body.
// The page-swipe-left final transition (this being the last screen) is
// handled in App.tsx, since it animates the whole page rather than this
// frame's stage.
// Beat 2, "Final Page Transition": this frame has no per-element outro by
// design — "no staggering between individual elements". The whole onboarding
// page swipes left as one unit, which App.tsx owns (`pageSwipe`, 450ms,
// Ease In Out) because it animates the page rather than this stage. So there
// is nothing for TourJourney to wait on here.
export const TASKS_EXIT_MS = 0;
// The confirmation toast is the final entrance beat (3750ms + 500ms).
export const TASKS_ENTRANCE_MS = 4250;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Frame8TasksStage(_props: StageProps) {
  const [beat, setBeat] = useState<Beat>("drop");

  useEffect(() => {
    // The tile's own copy ("Take 10 minutes today and write down three names
    // of people you actually like and trust") takes a moment to read — the
    // press/pulse used to fire just 200ms after the drop animation finished,
    // actioning the card before the user could register what it said.
    const timers = [
      setTimeout(() => setBeat("pulse"), 2200),
      setTimeout(() => setBeat("menu"), 2500),
      setTimeout(() => setBeat("pressed"), 3500),
      setTimeout(() => setBeat("collapsed"), 3750),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const menuVisible = beat === "menu" || beat === "pressed";
  const menuPressed = beat === "pressed";
  const collapsed = beat === "collapsed";

  // The insight card (the Pro Advisor tile) STAYS on screen when the
  // confirmation arrives — only the action menu goes. The annotation had both
  // of them collapsing into a shared centre point that the toast then grew
  // out of, but on review that threw away the very thing the task was created
  // from. So the sequence now reads insight -> action -> confirmation, with
  // the insight persisting underneath the whole way.
  //
  // Everything is centred on the stage's own axis (190.5) and laid out from
  // the card: Figma puts the dropdown at +67.68/+41.49 relative to it, and
  // the toast is 361 wide, which centres at exactly the x=10 its own node
  // declares. The toast sits BELOW the card now rather than on top of it,
  // since the card is no longer vacating that space.
  const cardBox = { left: centreIn(327.7), top: 170.33, width: 327.7, height: 196 };
  const dropdownBox = {
    left: cardBox.left + 67.68,
    top: cardBox.top + 41.49,
    width: 193,
    height: 114,
  };
  const toastBox = {
    left: centreIn(361),
    top: cardBox.top + cardBox.height + 16,
    width: 361,
    height: 96,
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* The insight. Drops in, shakes, pulses when "tapped" — and then just
          stays put. It is the thing the task was created from, so it remains
          visible behind the confirmation rather than collapsing away. */}
      <motion.img
        src={advisorCard}
        alt=""
        initial={{ opacity: 0, y: -60, rotate: 0 }}
        animate={
          beat === "drop"
            ? { opacity: 1, y: 0, rotate: [0, -2, 1.5, 0] }
            : beat === "pulse"
              ? { opacity: 1, y: 0, scale: [1, 1.05, 1] }
              : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          beat === "drop"
            ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.3, ease: "easeInOut" }
        }
        style={{
          position: "absolute",
          left: cardBox.left,
          top: cardBox.top,
          width: cardBox.width,
          borderRadius: 24,
          boxShadow: "0 8px 16px -4px rgba(16,24,40,0.15), 0 4px 6px -2px rgba(16,24,40,0.08)",
          transformOrigin: "center",
        }}
      />

      {/* The action. This is the one that leaves when the confirmation lands,
          collapsing into its own centre so the menu reads as being consumed by
          the task it just created. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={collapsed ? { opacity: 0, scale: 0.2 } : menuVisible ? { opacity: 1, scale: 1 } : {}}
        transition={collapsed ? { duration: 0.4, ease: [0.6, -0.28, 0.735, 0.045] } : { duration: 0.3, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: dropdownBox.left,
          top: dropdownBox.top,
          width: dropdownBox.width,
          borderRadius: 14.8,
          overflow: "hidden",
          boxShadow: "0 2px 4px -2px rgba(16,24,40,0.06), 0 4px 8px -2px rgba(16,24,40,0.1)",
          transformOrigin: "center",
        }}
      >
        {/* Exact transparent Figma exports: Tasks 2 (16188:4657) and its
            pressed state, Tasks 2a (16294:43887). Both are imported up front,
            so this swap is immediate and does not move the menu. */}
        <img
          src={menuPressed ? dropdownPressed : dropdown}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      </motion.div>

      {/* The confirmation. Grows from its own top edge, directly beneath the
          insight it belongs to, as the action menu above it collapses. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.2 }}
        animate={collapsed ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          left: toastBox.left,
          top: toastBox.top,
          width: toastBox.width,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 16,
          borderRadius: 16,
          background: "#ffffff",
          border: "1px solid var(--color-success-border)",
          boxShadow: "0 4px 3px rgba(16,24,40,0.03), 0 12px 8px rgba(16,24,40,0.08)",
          boxSizing: "border-box",
          transformOrigin: "50% 0%",
        }}
      >
        <span aria-hidden style={{ fontSize: 20 }}>
          ✅
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-family-base)", fontWeight: 600, fontSize: 14, color: "var(--color-bluegray-700)" }}>
            {tasksFrame.toastTitle}
          </span>
          <span style={{ fontFamily: "var(--font-family-base)", fontWeight: 500, fontSize: 14, color: "var(--color-bluegray-700)" }}>
            {tasksFrame.toastBody}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
