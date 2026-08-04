import { useReducer } from "react";

export type Phase = "splash" | "login" | "loading" | "tour" | "handoff";

export interface JourneyState {
  phase: Phase;
  stepIndex: number; // 0..4, maps to Frames 4-8
}

type Action =
  | { type: "GO_LOGIN" }
  | { type: "GO_LOADING" }
  | { type: "LOADING_DONE" }
  | { type: "NEXT" }
  | { type: "GO_TO_STEP"; stepIndex: number }
  | { type: "RESTART_TOUR" }
  | { type: "SKIP" };

const STEP_COUNT = 5;

export const initialJourneyState: JourneyState = {
  phase: "splash",
  stepIndex: 0,
};

function reducer(state: JourneyState, action: Action): JourneyState {
  switch (action.type) {
    case "GO_LOGIN":
      return { ...state, phase: "login" };

    case "GO_LOADING":
      return { ...state, phase: "loading" };

    case "LOADING_DONE":
      return { ...state, phase: "tour", stepIndex: 0 };

    case "NEXT": {
      // Advancing past the last step is NOT handled here — the page-swipe
      // finale (App.tsx's finishTour) must run first, then dispatch SKIP
      // once the swipe completes. Jumping phase to "handoff" directly from
      // this reducer (as an earlier version did) skipped the swipe entirely.
      if (state.stepIndex >= STEP_COUNT - 1) return state;
      return { ...state, stepIndex: state.stepIndex + 1 };
    }

    case "GO_TO_STEP":
      return {
        ...state,
        stepIndex: Math.max(0, Math.min(STEP_COUNT - 1, action.stepIndex)),
      };

    case "RESTART_TOUR":
      return { phase: "tour", stepIndex: 0 };

    case "SKIP":
      return { ...state, phase: "handoff" };

    default:
      return state;
  }
}

export function useJourneyMachine() {
  const [state, dispatch] = useReducer(reducer, initialJourneyState);
  return { state, dispatch, stepCount: STEP_COUNT };
}
