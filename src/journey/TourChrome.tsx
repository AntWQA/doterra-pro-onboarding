import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type PanInfo } from "motion/react";
import { copyReveal } from "../motion/transitions";
import { PaginationDashes } from "./PaginationIndicator";
import type { ExperienceStyle } from "../experienceStyle";

// The stage state machines remain authored in the original 381px coordinate
// space. These wrappers move each intact animation into the reskin's lower
// demo region without changing its internal entrance/exit values.
const STAGE_LAYOUTS = [
  { left: 0, top: 252, scale: 1 },
  { left: 6, top: 280, scale: 1 },
  { left: 6, top: 289, scale: 1 },
  { left: 6, top: 258, scale: 1 },
  { left: 6, top: 277, scale: 1 },
] as const;

// Shared chrome across Frames 4-8: progress + Skip at the top of the white
// sheet, left-aligned copy beneath, demo content in the lower half, and the
// persistent FAB anchored to the bottom-right.
export function TourChrome({
  experienceStyle,
  stepIndex,
  shownStepIndex,
  stepCount,
  eyebrow,
  headline,
  body,
  stage,
  isLastStep,
  copyExiting,
  copyExitDelayMs,
  nextPulseDelayMs,
  pulseKey,
  onNext,
  onNavigate,
  onSkip,
}: {
  experienceStyle: ExperienceStyle;
  stepIndex: number;
  shownStepIndex: number;
  stepCount: number;
  eyebrow: string;
  headline: ReactNode;
  body: ReactNode;
  stage: ReactNode;
  isLastStep: boolean;
  copyExiting: boolean;
  copyExitDelayMs: number;
  nextPulseDelayMs: number;
  pulseKey: number;
  onNext: () => void;
  onNavigate: (stepIndex: number) => void;
  onSkip: () => void;
}) {
  const [nextPulse, setNextPulse] = useState(0);
  const firstPulseTimer = useRef<number | null>(null);
  const repeatingPulseTimer = useRef<number | null>(null);
  const reskin = experienceStyle === "reskin";
  const stageLayout = STAGE_LAYOUTS[shownStepIndex];

  const stopNextPulse = useCallback(() => {
    if (firstPulseTimer.current !== null) window.clearTimeout(firstPulseTimer.current);
    if (repeatingPulseTimer.current !== null) window.clearInterval(repeatingPulseTimer.current);
    firstPulseTimer.current = null;
    repeatingPulseTimer.current = null;
  }, []);

  useEffect(() => {
    stopNextPulse();
    if (copyExiting) return;

    firstPulseTimer.current = window.setTimeout(() => {
      setNextPulse((pulse) => pulse + 1);
      firstPulseTimer.current = null;
      repeatingPulseTimer.current = window.setInterval(
        () => setNextPulse((pulse) => pulse + 1),
        2000,
      );
    }, nextPulseDelayMs);

    return stopNextPulse;
  }, [copyExiting, nextPulseDelayMs, pulseKey, stopNextPulse]);

  const handleNext = () => {
    stopNextPulse();
    onNext();
  };

  const navigate = (targetStep: number) => {
    if (!copyExiting && targetStep !== stepIndex) onNavigate(targetStep);
  };

  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (copyExiting) return;
    const passedDistance = Math.abs(info.offset.x) >= 48;
    const passedVelocity = Math.abs(info.velocity.x) >= 500;
    if (!passedDistance && !passedVelocity) return;

    if (info.offset.x < 0) {
      if (stepIndex < stepCount - 1) navigate(stepIndex + 1);
      else onNext();
    }
    if (info.offset.x > 0 && stepIndex > 0) navigate(stepIndex - 1);
  };

  return (
    // The tour page is plain WHITE with the gradient confined to the stage
    // box — verified by sampling Figma's own render of Frame 5 (16145:84088):
    // every point outside the box reads #FFFFFF. Neither is drawn here: the
    // white is App's overlay and the block is App's persistent gradient
    // surface, which closed in to exactly this rect back on Frame 3 and stays
    // put for the rest of the journey.
    <motion.div
      drag={copyExiting ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleSwipe}
      style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
    >
      {reskin ? (
        <>
          <div style={{ position: "absolute", top: 93, right: 22, zIndex: 5 }}>
            <SkipButton onSkip={onSkip} />
          </div>
          <div
            style={{
              position: "absolute",
              left: stageLayout.left,
              top: stageLayout.top,
              width: 381,
              height: 852,
              zIndex: 1,
              transform: `scale(${stageLayout.scale})`,
              transformOrigin: "0 0",
            }}
          >
            {stage}
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 0, top: 6, width: 393, height: 530, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 6, top: 0, width: 381, height: 530 }}>
            <div style={{ position: "absolute", top: 59, right: 16, zIndex: 5 }}>
              <SkipButton onSkip={onSkip} />
            </div>
            {stage}
          </div>
        </div>
      )}

      {reskin && shownStepIndex === 3 && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 731,
            width: 393,
            height: 121,
            zIndex: 2,
            pointerEvents: "none",
            background: "linear-gradient(to bottom, rgba(255,255,255,0), #ffffff 55%)",
          }}
        />
      )}

      {/* "Copy Reveal": headline and supporting description fade in together
          while translating up 8-12px, 300ms Ease Out. On the way out they are
          part of the page transition, so they fade and continue upwards —
          Frame 4's annotation makes the copy the last element in its 0.2s
          cascade, which is what copyExitDelayMs carries. */}
      <motion.div
        key={String(headline)}
        initial={{ opacity: 0, y: 10 }}
        animate={copyExiting ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
        transition={copyExiting ? { ...copyReveal, delay: copyExitDelayMs / 1000 } : copyReveal}
        style={{
          position: "absolute",
          left: reskin ? 20 : 6,
          top: reskin ? 162 : 556,
          width: reskin ? 353 : 381,
          boxSizing: "border-box",
          padding: reskin ? 0 : "0 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: reskin ? 12 : 6,
          textAlign: "left",
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-family-base)",
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: 3.33,
            textTransform: "uppercase",
            color: reskin ? "#384250" : "var(--color-text-secondary)",
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontFamily: "var(--font-family-base)",
            fontWeight: 600,
            fontSize: reskin ? 32 : 24,
            lineHeight: reskin ? "40px" : "32px",
            letterSpacing: -0.33,
            color: "var(--color-bluegray-900)",
          }}
        >
          {headline}
        </span>
        <span
          style={{
            fontFamily: "var(--font-family-base)",
            fontWeight: reskin ? 400 : 500,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: -0.33,
            color: reskin ? "var(--color-bluegray-900)" : "var(--color-bluegray-700)",
          }}
        >
          {body}
        </span>
      </motion.div>

      <PaginationDashes experienceStyle={experienceStyle} stepIndex={stepIndex} stepCount={stepCount} onSelect={navigate} />

      <NextFab experienceStyle={experienceStyle} isLastStep={isLastStep} onPress={handleNext} pulse={nextPulse} />
    </motion.div>
  );
}

// Figma's "utility-secondary / xsmall" Skip button renders as plain text —
// no pill, border, or fill — so the DS chip styling this used to have was
// never part of the design.
//
// Both styles carry a trailing arrow. Its measurements come from the button's own
// variables (node 16398:67818): size/icon/button/sm = 16 for the glyph,
// size/padding/xs = 4 for the gap, colour/text/link/secondary/base = #0067dc
// for both text and icon. That is what widens the node from 31 to 51px.
function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        fontFamily: "var(--font-family-base)",
        fontWeight: 600,
        fontSize: 14,
        color: "var(--color-blue-700)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      Skip
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 8h9M9 4.5 12.5 8 9 11.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function NextFab({ experienceStyle, isLastStep, onPress, pulse }: { experienceStyle: ExperienceStyle; isLastStep: boolean; onPress: () => void; pulse: number }) {
  const reskin = experienceStyle === "reskin";
  const label = isLastStep ? "FINISH" : "NEXT";
  // Right-align to the same edge as the former square FAB (right: 20).
  const top = reskin ? 757 : 747;

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onPress}
      whileTap={{ scale: 0.94 }}
      style={{
        position: "absolute",
        right: 20,
        top,
        width: 140,
        height: 56,
        borderRadius: 100,
        background: "var(--color-blue-700)",
        color: "#fff",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
        zIndex: 6,
      }}
    >
      {pulse > 0 && (
        <motion.span
          key={pulse}
          aria-hidden
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.96, 1.12, 1.28] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 103,
            border: "2px solid var(--color-blue-700)",
            pointerEvents: "none",
          }}
        />
      )}
      <span
        style={{
          fontFamily: "var(--font-family-base)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}
