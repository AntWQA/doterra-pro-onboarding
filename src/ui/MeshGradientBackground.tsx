import { motion } from "motion/react";
import { duration, easing } from "../motion/motion.tokens";
import lavenderBackground from "../assets/exports/lavender-background.jpg";
import fullBleedGradient from "../assets/exports/mesh-gradient.jpg";
import containedGradient from "../assets/exports/loading-gradient-block.jpg";
import type { ExperienceStyle } from "../experienceStyle";

const ORIGINAL_FULL_BLEED = { left: 0, top: 0, width: 393, height: 852, borderRadius: 16.723 };
const ORIGINAL_CONTAINED = { left: 6, top: 6, width: 381, height: 530, borderRadius: 16.723 };

// The reskin keeps one photographic surface mounted for the whole onboarding
// journey. After the splash/login card collapses, the white content sheet
// rises to the Figma resting position at y=53 and remains there through the
// loading and tour screens.
export function MeshGradientBackground({
  contained,
  experienceStyle,
}: {
  contained: boolean;
  experienceStyle: ExperienceStyle;
}) {
  if (experienceStyle === "original") {
    return (
      <motion.div
        initial={false}
        animate={contained ? ORIGINAL_CONTAINED : ORIGINAL_FULL_BLEED}
        transition={{ duration: duration.bubble, ease: easing.easeInOut }}
        style={{ position: "absolute", overflow: "hidden", background: "#f4f6fb" }}
      >
        <GradientImage src={fullBleedGradient} visible={!contained} />
        <GradientImage src={containedGradient} visible={contained} />
      </motion.div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#edf4f8" }}>
      <img
        src={lavenderBackground}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          userSelect: "none",
        }}
      />
      <motion.div
        initial={false}
        animate={
          contained
            ? { top: 53, height: 799 }
            : { top: 852, height: 0 }
        }
        transition={{ duration: duration.bubble, ease: easing.easeInOut }}
        style={{
          position: "absolute",
          left: 0,
          width: 393,
          borderRadius: "32px 32px 0 0",
          background: "#ffffff",
          border: "1px solid var(--color-border-light)",
          boxSizing: "border-box",
          opacity: 1,
          boxShadow: "0 4px 6px rgba(16,24,40,0.02), 0 12px 10px rgba(16,24,40,0.04)",
        }}
      />
    </div>
  );
}

function GradientImage({ src, visible }: { src: string; visible: boolean }) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: duration.bubble, ease: easing.easeInOut }}
      draggable={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "fill",
        display: "block",
        userSelect: "none",
      }}
    />
  );
}
