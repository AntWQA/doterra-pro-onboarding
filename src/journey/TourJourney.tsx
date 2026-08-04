import { useEffect, useState } from "react";
import { TourChrome } from "./TourChrome";
import { tourFrames } from "../data/copy";
import { Frame4AdvisorStage, ADVISOR_ENTRANCE_MS, ADVISOR_EXIT_MS } from "../frames/Frame4Advisor";
import { Frame5TrackingStage, TRACKING_ENTRANCE_MS, TRACKING_EXIT_MS } from "../frames/Frame5Tracking";
import { Frame6InsightsStage, INSIGHTS_ENTRANCE_MS, INSIGHTS_EXIT_MS } from "../frames/Frame6Insights";
import { Frame7MyTeamStage, MYTEAM_ENTRANCE_MS, MYTEAM_EXIT_MS } from "../frames/Frame7MyTeam";
import { Frame8TasksStage, TASKS_ENTRANCE_MS, TASKS_EXIT_MS } from "../frames/Frame8Tasks";

// Each frame's outro is its own, per the designer's annotations, so each one
// declares how long it needs to leave. `copyExitDelayMs` is when the headline
// block should join that outro: Frame 4's annotation puts every visible
// element in one 0.2s cascade, and the copy is the last of them, so it waits
// out the four stage elements first. The other frames animate their content
// out as a single gesture, so the copy simply goes with it.
const STAGES = [
  { Component: Frame4AdvisorStage, entranceMs: ADVISOR_ENTRANCE_MS, exitMs: ADVISOR_EXIT_MS, copyExitDelayMs: ADVISOR_EXIT_MS - 400 },
  { Component: Frame5TrackingStage, entranceMs: TRACKING_ENTRANCE_MS, exitMs: TRACKING_EXIT_MS, copyExitDelayMs: 0 },
  { Component: Frame6InsightsStage, entranceMs: INSIGHTS_ENTRANCE_MS, exitMs: INSIGHTS_EXIT_MS, copyExitDelayMs: 0 },
  { Component: Frame7MyTeamStage, entranceMs: MYTEAM_ENTRANCE_MS, exitMs: MYTEAM_EXIT_MS, copyExitDelayMs: 0 },
  { Component: Frame8TasksStage, entranceMs: TASKS_ENTRANCE_MS, exitMs: TASKS_EXIT_MS, copyExitDelayMs: 0 },
];
const STEP_COUNT = STAGES.length;

// Frame 4, beat 7: "After the final element has exited, leave a brief pause
// before introducing the next screen to create clear visual separation."
const SEPARATION_PAUSE_MS = 200;

// TourChrome is rendered ONCE here and persists across every step
// transition — Skip/FAB/progress dots/wordmark never remount or fade,
// exactly like the real app's chrome would stay fixed while content
// changes underneath it.
//
// The stage and the headline copy, though, are CONTENT, and the brief gives
// each frame a bespoke outro for them. So `stepIndex` (what the user has
// tapped to) is deliberately decoupled from `shown` (what is on screen):
// tapping Next flips the current stage into `exiting`, it plays its own
// annotated exit, and only then does `shown` catch up and the next frame run
// its entrance. Driving this with a held mount rather than AnimatePresence is
// deliberate — these stages animate via explicit beat state and inline
// `animate` objects, which stops Motion propagating variants to them, so an
// `exit` on a wrapper would never reach the individual elements.
export function TourJourney({
  stepIndex,
  onNext,
  onNavigate,
  onSkip,
}: {
  stepIndex: number;
  onNext: () => void;
  onNavigate: (stepIndex: number) => void;
  onSkip: () => void;
}) {
  const [shown, setShown] = useState(stepIndex);
  const exiting = stepIndex !== shown;

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => setShown(stepIndex), STAGES[shown].exitMs + SEPARATION_PAUSE_MS);
    return () => clearTimeout(t);
  }, [exiting, stepIndex, shown]);

  const { Component: Stage, entranceMs, copyExitDelayMs } = STAGES[shown];
  const frame = tourFrames[shown];

  return (
    <TourChrome
      // Progress dots track the tap, not the animation, so pressing Next is
      // acknowledged immediately while the outgoing frame is still leaving.
      stepIndex={stepIndex}
      shownStepIndex={shown}
      stepCount={STEP_COUNT}
      headline={frame.headline}
      body={
        "bodyBold" in frame ? (
          <>
            {frame.bodyPrefix}
            <strong>{frame.bodyBold}</strong>
            {frame.bodySuffix}
          </>
        ) : (
          frame.body
        )
      }
      copyExiting={exiting}
      copyExitDelayMs={copyExitDelayMs}
      nextPulseDelayMs={entranceMs + 2000}
      pulseKey={shown}
      isLastStep={stepIndex === STEP_COUNT - 1}
      onNext={onNext}
      onNavigate={onNavigate}
      onSkip={onSkip}
      stage={<Stage key={shown} exiting={exiting} />}
    />
  );
}
