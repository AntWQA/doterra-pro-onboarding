// Every tour stage owns its own outro, because the brief specifies a different
// one per frame (Frame 4 cascades element-by-element, Frame 5 throws each card
// past the viewer, Frame 6 collapses both cards into themselves, Frame 7 drops
// the whole component off the bottom). TourJourney drives them by flipping
// `exiting` and holding the stage mounted for that frame's own exit duration,
// rather than by AnimatePresence — these stages animate through explicit beat
// state and inline `animate` objects, which blocks variant propagation, so an
// exit prop on a wrapper would never reach them.
export interface StageProps {
  exiting: boolean;
  experienceStyle: ExperienceStyle;
}
import type { ExperienceStyle } from "../experienceStyle";
