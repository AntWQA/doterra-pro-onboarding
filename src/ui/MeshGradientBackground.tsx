import { motion } from "motion/react";
import { duration, easing } from "../motion/motion.tokens";
import fullBleedGradient from "../assets/exports/mesh-gradient.jpg";
import containedGradient from "../assets/exports/loading-gradient-block.jpg";

// The mesh gradient is ONE persistent surface for the whole journey, not a
// full-bleed image on Frames 1-2 and a separate block from Frame 3 onwards.
// Frame 3's annotation asks for exactly that: "the full background of the
// landing screen should close in to form the new contained component where we
// will display our graphics" — so it has to be the same element changing
// shape, not a crossfade between two.
//
// Use the two exact Figma raster exports rather than approximating the mesh
// with CSS radial gradients. They crossfade while this persistent surface
// changes shape, leaving the full-bleed and contained resting states pixel-
// accurate to their respective designs.
const FULL_BLEED = { left: 0, top: 0, width: 393, height: 852, borderRadius: 16.723 };
const CONTAINED = { left: 6, top: 6, width: 381, height: 530, borderRadius: 16.723 };

export function MeshGradientBackground({ contained }: { contained: boolean }) {
  return (
    <motion.div
      // No entry animation — on first paint it must already be full-bleed,
      // or the splash screen would animate in from nothing.
      initial={false}
      animate={contained ? CONTAINED : FULL_BLEED}
      transition={{ duration: duration.bubble, ease: easing.easeInOut }}
      style={{ position: "absolute", overflow: "hidden", background: "#f4f6fb" }}
    >
      <GradientImage src={fullBleedGradient} visible={!contained} />
      <GradientImage src={containedGradient} visible={contained} />
    </motion.div>
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
