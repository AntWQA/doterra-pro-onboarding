import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { DeviceFrame } from "./frame/DeviceFrame";
import { MeshGradientBackground } from "./ui/MeshGradientBackground";
import { Wordmark } from "./ui/Wordmark";
import { SystemBar } from "./ui/SystemBar";
import { Frame1Splash } from "./frames/Frame1Splash";
import { SplashIntro } from "./frames/SplashIntro";
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

const EXPERIENCE_STYLE: ExperienceStyle = "reskin";

// The two versions differ only in how the opening intro is staged, so the
// toggle always restarts with the intro playing — otherwise picking a version
// would show you the one screen where they are identical.
export type Version = "v1" | "v2";

function App() {
  const [version, setVersion] = useState<Version>("v1");
  // Bumped on every refresh so the key below remounts the journey; withIntro
  // decides whether that fresh run replays the animated splash intro first.
  const [run, setRun] = useState<{ id: number; withIntro: boolean }>({ id: 0, withIntro: false });

  const refresh = (withIntro: boolean) => setRun((prev) => ({ id: prev.id + 1, withIntro }));

  const changeVersion = (next: Version) => {
    setVersion(next);
    refresh(true);
  };

  return (
    <>
      <DemoControls version={version} onVersionChange={changeVersion} onRefresh={refresh} />
      {/* The key intentionally remounts the entire journey, so refreshing
          always resets the prototype to the opening splash. */}
      <Prototype key={run.id} experienceStyle={EXPERIENCE_STYLE} version={version} withIntro={run.withIntro} />
    </>
  );
}

function Prototype({
  experienceStyle,
  version,
  withIntro,
}: {
  experienceStyle: ExperienceStyle;
  version: Version;
  withIntro: boolean;
}) {
  const { state, dispatch } = useJourneyMachine();
  const reduce = usePureReducedMotion();
  const [swiped, setSwiped] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [contained, setContained] = useState(false);
  const [wordmarkUp, setWordmarkUp] = useState(false);
  const [backgroundFading, setBackgroundFading] = useState(false);
  const [isGuestTour, setIsGuestTour] = useState(false);
  // The animated intro opens the app on demand (and always in V3). Frame 1 is
  // held back until the mark has cleared the viewport, so the card never
  // animates in behind it; runs without the intro start past this gate.
  const playIntro = withIntro || experienceStyle === "hybrid";
  const [introDone, setIntroDone] = useState(!playIntro);
  const timers = useRef<number[]>([]);

  const enterWelcome = useCallback(() => {
    if (collapsing) return; // ignore a second CTA press mid-handover
    setCollapsing(true);
    timers.current.push(
      window.setTimeout(() => setContained(true), CARD_COLLAPSE_MS),
      window.setTimeout(() => dispatch({ type: "GO_LOADING" }), CARD_COLLAPSE_MS + GRADIENT_CLOSE_MS),
    );
  }, [collapsing, dispatch]);

  const startGuestTour = useCallback(() => {
    setIsGuestTour(true);
    enterWelcome();
  }, [enterWelcome]);

  const completeTourLogin = useCallback(() => {
    setSwiped(true);
    setTimeout(() => dispatch({ type: "SKIP" }), 500);
  }, [dispatch]);

  const enterLogin = useCallback(() => {
    if (experienceStyle === "original") {
      dispatch({ type: "GO_LOGIN" });
      return;
    }
    if (collapsing) return;
    // hybrid shares V1's collapse-then-navigate behaviour
    setCollapsing(true);
    timers.current.push(
      window.setTimeout(() => {
        setCollapsing(false);
        dispatch({ type: "GO_LOGIN" });
      }, CARD_COLLAPSE_MS),
    );
  }, [collapsing, dispatch, experienceStyle]);

  const onWordmarkSettled = useCallback(() => {
    setWordmarkUp(true);
    if (experienceStyle === "hybrid") setBackgroundFading(true);
  }, [experienceStyle]);

  const finishTour = () => {
    if (isGuestTour) {
      // Guest path: send back to login rather than exposing the dashboard.
      // Reset background and collapsing so the login card enters cleanly.
      setCollapsing(false);
      setContained(false);
      setBackgroundFading(false);
      dispatch({ type: "GO_LOGIN" });
    } else {
      // "Final Page Transition": the entire onboarding page swipes left as a
      // single unit, exposing the app beneath — not a fade to a placeholder.
      setSwiped(true);
      setTimeout(() => dispatch({ type: "SKIP" }), 500);
    }
  };

  const restartTour = () => {
    setIsGuestTour(false);
    setContained(true);
    setWordmarkUp(true);
    setBackgroundFading(false);
    setSwiped(false);
    dispatch({ type: "RESTART_TOUR" });
  };

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <DeviceFrame>
        <TourRoot key={reduce ? "reduced" : "full"}>
          {/* Base layer: the real dashboard, revealed once onboarding swipes away. */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Dashboard experienceStyle={experienceStyle} onRetakeTour={restartTour} />
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
              background: experienceStyle === "reskin" ? "transparent" : "#ffffff",
            }}
          >
            {/* One persistent gradient surface for every onboarding screen:
                full-bleed for Frames 1-2, closed in to the 381x530 block from
                Frame 3 onwards. Screens on top of it must leave their own
                backgrounds transparent. */}
            <MeshGradientBackground
              contained={contained}
              faded={experienceStyle === "hybrid" && (backgroundFading || state.phase === "tour")}
              experienceStyle={experienceStyle}
            />

            <AnimatePresence mode="wait">
              {state.phase === "splash" && introDone && (
                <Frame1Splash
                  key="splash"
                  experienceStyle={experienceStyle}
                  collapsing={collapsing}
                  onLogin={enterLogin}
                  onTour={startGuestTour}
                />
              )}
              {state.phase === "login" && (
                <Frame2Login
                  key="login"
                  experienceStyle={experienceStyle}
                  collapsing={collapsing}
                  onLogin={isGuestTour ? completeTourLogin : enterWelcome}
                />
              )}
              {state.phase === "loading" && (
                <Frame3Loading
                  key="loading"
                  experienceStyle={experienceStyle}
                  guestTour={isGuestTour}
                  onDone={() => dispatch({ type: "LOADING_DONE" })}
                  onSettled={onWordmarkSettled}
                />
              )}
              {state.phase === "tour" && (
                <TourJourney
                  key="tour"
                  experienceStyle={experienceStyle}
                  guestTour={isGuestTour}
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
            {state.phase === "loading" && <Wordmark experienceStyle={experienceStyle} settled={wordmarkUp} />}

            {/* Above everything in the overlay: the intro's pale surface has
                to cover the background it will later reveal through the Ō. */}
            {!introDone && (
              <SplashIntro
                reduced={reduce}
                backdrop={version === "v2" ? "photo" : "lead-in"}
                onComplete={() => setIntroDone(true)}
              />
            )}
          </motion.div>
        </TourRoot>

        {/* Native chrome is deliberately outside every animated page layer:
            it stays fixed while onboarding screens and the dashboard move. */}
        {/* The bar keeps dark icons for the whole intro — they would be
            invisible against its pale lead-in — and only crosses to light once
            the intro has finished and the lavender behind it is on screen.
            SystemBar eases between the two tints rather than cutting. V2 has
            no pale lead-in, so it wants light icons from the first frame. */}
        <SystemBar
          light={
            (experienceStyle === "reskin" || experienceStyle === "hybrid") &&
            state.phase !== "handoff" &&
            (introDone || version === "v2")
          }
        />
      </DeviceFrame>
    </MotionConfig>
  );
}

function DemoControls({
  version,
  onVersionChange,
  onRefresh,
}: {
  version: Version;
  onVersionChange: (version: Version) => void;
  onRefresh: (withIntro: boolean) => void;
}) {
  return (
    <div className="demo-controls">
      <div className="version-toggle" role="group" aria-label="Prototype version">
        {(["v1", "v2"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={version === option}
            onClick={() => onVersionChange(option)}
            className={
              version === option ? "version-toggle__option version-toggle__option--active" : "version-toggle__option"
            }
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      <RefreshButton label="Restart" onClick={() => onRefresh(false)} />
      <RefreshButton label="From intro" onClick={() => onRefresh(true)} />
    </div>
  );
}

function RefreshButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="refresh-button" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path
          d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M13.5 2.5V5.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

// Forces already-mounted motion elements to re-evaluate shouldReduceMotion
// (captured at construction) when the reduced-motion setting flips.
function TourRoot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default App;
