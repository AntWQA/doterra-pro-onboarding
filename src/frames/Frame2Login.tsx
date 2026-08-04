import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/TextInput";
import { login } from "../data/copy";
import { containerReveal, copyReveal } from "../motion/transitions";
import { duration, easing, stagger, travel } from "../motion/motion.tokens";
import type { ExperienceStyle } from "../experienceStyle";

// Reskinned login: the form occupies a full-width bottom sheet while the
// lavender photograph remains visible as the compact hero above it.
export function Frame2Login({ experienceStyle, collapsing, onLogin }: { experienceStyle: ExperienceStyle; collapsing: boolean; onLogin: () => void }) {
  const reskin = experienceStyle === "reskin";
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
          left: reskin ? 0 : 21.5,
          top: reskin ? 310 : 165,
          width: reskin ? 393 : 350,
          height: reskin ? 542 : 522,
          borderRadius: reskin ? "32px 32px 0 0" : 32,
          background: "#ffffff",
          transformOrigin: "center",
          boxShadow: "0 4px 6px rgba(16,24,40,0.02), 0 12px 10px rgba(16,24,40,0.04)",
          border: reskin ? "1px solid var(--color-border-light)" : "none",
          padding: "48px 24px 56px",
          boxSizing: "border-box",
        }}
      >
        <motion.div
          initial="hidden"
          animate="reveal"
          variants={{ hidden: {}, reveal: { transition: { staggerChildren: stagger.contactRow } } }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: travel.sm }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <h1 style={{ margin: 0, fontFamily: "var(--font-family-base)", fontWeight: 700, fontSize: 24, color: "var(--color-bluegray-700)" }}>
              {login.title}
            </h1>
            <p style={{ margin: 0, fontFamily: "var(--font-family-base)", fontWeight: 500, fontSize: 16, color: "var(--color-bluegray-700)" }}>
              {login.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: travel.sm }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <TextInput label={login.emailLabel} placeholder={login.emailPlaceholder} />
            <TextInput label={login.passwordLabel} type="password" placeholder={login.passwordPlaceholder} />
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: travel.sm }, reveal: { opacity: 1, y: 0, transition: copyReveal } }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Button variant="primary" fullWidth onClick={onLogin}>
              {login.loginCta}
            </Button>
            <Button variant="secondary" fullWidth onClick={onLogin}>
              {login.faceIdCta}
            </Button>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, reveal: { opacity: 1, transition: copyReveal } }}>
            <Button variant="link">{login.forgotPassword}</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
