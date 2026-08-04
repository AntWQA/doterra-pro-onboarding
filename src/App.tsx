import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { DeviceFrame } from "./frame/DeviceFrame";
import { MeshGradientBackground } from "./ui/MeshGradientBackground";
import { Wordmark } from "./ui/Wordmark";
import { SystemBar } from "./ui/SystemBar";
import { Frame1Splash } from "./frames/Frame1Splash";
import { Frame2Login } from "./frames/Frame2Login";
import { Frame3Loading } from "./frames/Frame3Loading";
import { TourJourney } from "./journey/TourJourney";
import { Dashboard } from "./frames/Dashboard";
import { useJourneyMachine } from "./journey/useJourneyMachine";
import { usePureReducedMotion } from "./motion/useReducedMotion";
import { pageSwipe } from "./motion/transitions";
import { duration } from "./motion/motion.tokens";
import type { ExperienceStyle } from "./experienceStyle";

// Entering the welcome screen is a three-step handover, run in this order
// rather than all at once:
//   1. the splash/login card zooms down into its own centre until it's gone
//   2. only then does the gradient close in from full-bleed to the block
//   3. only then does Frame 3 mount and run its own entrance
// Steps 1 and 2 are timed here because the card belongs to the outgoing frame
// and the gradient belongs to App, so neither can drive the other.
const CARD_COLLAPSE_MS = duration.exit * 1000;
const GRADIENT_CLOSE_MS = duration.bubble * 1000;

function App() {
  const [experienceStyle, setExperienceStyle] = useState<ExperienceStyle>("reskin");

  return (
    <>
      <StyleToggle value={experienceStyle} onChange={setExperienceStyle} />
      {/* The key intentionally remounts the entire journey. Switching styles
          therefore always resets the prototype to the opening splash. */}
      <Prototype key={experienceStyle} experienceStyle={experienceStyle} />
    </>
  );
}

function Prototype({ experienceStyle }: { experienceStyle: ExperienceStyle }) {
  const { state, dispatch } = useJourneyMachine();
  const reduce = usePureReducedMotion();
  const [swiped, setSwiped] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [contained, setContained] = useState(false);
  const [wordmarkUp, setWordmarkUp] = useState(false);
  const timers = useRef<number[]>([]);

  const enterWelcome = useCallback(() => {
    if (collapsing) return; // ignore a second CTA press mid-handover
    setCollapsing(true);
    timers.current.push(
      window.setTimeout(() => setContained(true), CARD_COLLAPSE_MS),
      window.setTimeout(() => dispatch({ type: "GO_LOADING" }), CARD_COLLAPSE_MS + GRADIENT_CLOSE_MS),
    );
  }, [collapsing, dispatch]);

  const onWordmarkSettled = useCallback(() => setWordmarkUp(true), []);

  const finishTour = () => {
    // "Final Page Transition": the entire onboarding page swipes left as a
    // single unit, exposing the app beneath — not a fade to a placeholder.
    setSwiped(true);
    setTimeout(() => dispatch({ type: "SKIP" }), 500);
  };

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <DeviceFrame>
        <TourRoot key={reduce ? "reduced" : "full"}>
          {/* Base layer: the real dashboard, revealed once onboarding swipes away. */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Dashboard />
          </div>

          {/* Overlay: the onboarding page itself, slides off to reveal the base layer. */}
          <motion.div
            animate={{ x: swiped ? -393 : 0 }}
            transition={pageSwipe}
            // Opaque so the dashboard underneath stays hidden once the
            // gradient contracts and stops covering the full frame. This is
            // also the white page that Frame 3 and the tour frames sit on —
            // they no longer paint their own.
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: experienceStyle === "original" ? "#ffffff" : "transparent",
            }}
          >
            {/* One persistent gradient surface for every onboarding screen:
                full-bleed for Frames 1-2, closed in to the 381x530 block from
                Frame 3 onwards. Screens on top of it must leave their own
                backgrounds transparent. */}
            <MeshGradientBackground contained={contained} experienceStyle={experienceStyle} />

            <AnimatePresence mode="wait">
              {state.phase === "splash" && (
                <Frame1Splash
                  key="splash"
                  experienceStyle={experienceStyle}
                  collapsing={collapsing}
                  onLogin={() => dispatch({ type: "GO_LOGIN" })}
                  onTour={enterWelcome}
                />
              )}
              {state.phase === "login" && (
                <Frame2Login key="login" experienceStyle={experienceStyle} collapsing={collapsing} onLogin={enterWelcome} />
              )}
              {state.phase === "loading" && (
                <Frame3Loading
                  key="loading"
                  experienceStyle={experienceStyle}
                  onDone={() => dispatch({ type: "LOADING_DONE" })}
                  onSettled={onWordmarkSettled}
                />
              )}
              {state.phase === "tour" && (
                <TourJourney
                  key="tour"
                  experienceStyle={experienceStyle}
                  stepIndex={state.stepIndex}
                  onNext={state.stepIndex >= 4 ? finishTour : () => dispatch({ type: "NEXT" })}
                  onNavigate={(stepIndex) => dispatch({ type: "GO_TO_STEP", stepIndex })}
                  onSkip={finishTour}
                />
              )}
            </AnimatePresence>

            {/* Persistent chrome, deliberately OUTSIDE the AnimatePresence:
                the wordmark is one element from the greeting all the way
                through the tour, so crossing from Frame 3 into slide 4
                changes nothing about it. Rendered last so it sits above the
                stage, matching the z-index it had inside TourChrome. */}
            {(state.phase === "loading" || (experienceStyle === "original" && state.phase === "tour")) && (
              <Wordmark settled={wordmarkUp} />
            )}
          </motion.div>
        </TourRoot>

        {/* Native chrome is deliberately outside every animated page layer:
            it stays fixed while onboarding screens and the dashboard move. */}
        <SystemBar light={experienceStyle === "reskin" && state.phase !== "handoff"} />
      </DeviceFrame>
    </MotionConfig>
  );
}

function StyleToggle({ value, onChange }: { value: ExperienceStyle; onChange: (value: ExperienceStyle) => void }) {
  return (
    <div className="style-toggle" role="group" aria-label="Prototype style">
      {(["reskin", "original"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={value === option ? "style-toggle__option style-toggle__option--active" : "style-toggle__option"}
        >
          {option === "original" ? "V2" : "V1"}
        </button>
      ))}
    </div>
  );
}

// Forces already-mounted motion elements to re-evaluate shouldReduceMotion
// (captured at construction) when the reduced-motion setting flips.
function TourRoot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default App;
