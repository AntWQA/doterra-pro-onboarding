import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { splash } from "../data/copy";
import { containerReveal, copyReveal } from "../motion/transitions";
import { duration, easing, stagger, travel } from "../motion/motion.tokens";
import logomark from "../assets/exports/logomark.png";

// Reskinned splash: lavender photography remains visible above a full-width
// bottom sheet. The existing card entrance/collapse choreography is retained.
export function Frame1Splash({ collapsing, onLogin, onTour }: { collapsing: boolean; onLogin: () => void; onTour: () => void }) {
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        // "The modal should zoom out into its centre point until it's no
        // longer visible" — scale straight down to nothing about its own
        // centre, on the same Ease In Back the other exits use, so it dips
        // very slightly larger first. Only once this is done does App close
        // the gradient in behind it.
        animate={collapsing ? { opacity: 0, scale: 0, y: 0 } : { opacity: 1, y: 0 }}
        transition={collapsing ? { duration: duration.exit, ease: easing.easeInBack } : containerReveal}
        style={{
          position: "absolute",
          left: 0,
          top: 372,
          width: 393,
          height: 480,
          borderRadius: "32px 32px 0 0",
          background: "#ffffff",
          transformOrigin: "center",
          border: "1px solid var(--color-border-light)",
          boxShadow: "0 4px 6px rgba(16,24,40,0.02), 0 12px 10px rgba(16,24,40,0.04)",
          padding: "56px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <motion.div
          initial="hidden"
          animate="reveal"
          variants={{ hidden: {}, reveal: { transition: { staggerChildren: stagger.contactRow } } }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
        >
          <motion.img
            src={logomark}
            alt=""
            variants={{ hidden: { opacity: 0, y: travel.md }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}
            style={{ height: 48, width: "auto" }}
          />
          <motion.div
            variants={{ hidden: {}, reveal: { transition: { staggerChildren: 0.06 } } }}
            style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, x: -travel.md }, reveal: { opacity: 1, x: 0, transition: copyReveal } }}
              style={{ margin: 0, fontFamily: "var(--font-family-base)", fontWeight: 600, fontSize: 32, color: "var(--color-bluegray-900)" }}
            >
              dōTERRA <span style={{ fontWeight: 400 }}>Pro</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, x: -travel.md }, reveal: { opacity: 1, x: 0, transition: copyReveal } }}
              style={{ margin: 0, fontFamily: "var(--font-family-base)", fontWeight: 500, fontSize: 20, color: "var(--color-bluegray-700)", width: 264 }}
            >
              {splash.subtitle}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="reveal"
          variants={{ hidden: {}, reveal: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
          style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: travel.sm }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}>
            <Button variant="primary" fullWidth onClick={onLogin}>
              {splash.primaryCta}
            </Button>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: travel.sm }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}>
            <Button variant="secondary" fullWidth onClick={onTour}>
              {splash.secondaryCta}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
