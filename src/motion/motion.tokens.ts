// Values taken directly from the designer's own motion annotations per frame
// (not an invented token scale) — see each frame component's header comment
// for which annotation beat each value maps to.

export const duration = {
  fast: 0.2, // generic quick UI feedback
  standard: 0.3, // "Copy Reveal" 300ms
  entrance: 0.35, // "Container Reveal" / card-entrance fallback 350ms
  avatar: 0.45, // "Avatar Entrance" 450ms
  bubble: 0.5, // "Conversation Begins" / most card entrances 500ms
  exit: 0.4, // most "Card Exit" / "Component Exit" beats 400ms
  exitFast: 0.35, // Frame 5 "Card Exit" is the one 350ms exit
  pageSwipe: 0.45, // "Final Page Transition" 450ms
} as const;

export const stagger = {
  contactRow: 0.2, // "Contact Stagger: 200ms"
  cardEntrance: 0.2, // Frame 5 card entrance stagger

  // The two EXIT staggers below deliberately depart from the annotations.
  // Built to the brief's own figures first (Frame 4 at 200ms, Frame 5 at
  // 500ms) and reviewed; the verdict was that both read as a slow trailing
  // queue rather than a transition, and that the elements should "leave
  // together with a minor delay between each". These are the tightened
  // values — the brief's originals are noted alongside so the change stays
  // visible rather than looking like a transcription error.
  cardExit: 0.1, // Frame 5 card exit stagger (brief: 500ms)
  exitCascade: 0.06, // Frame 4 page-transition cascade (brief: 200ms)
} as const;

export const delay = {
  userProfileEnter: 0.25, // Frame 6 "Delay: 250ms before the User Profile card enters"
  thinkingLoop: 0.9, // "AI Thinking State" loop interval, 800-1000ms midpoint
} as const;

// Named easings matching the designer's own vocabulary exactly.
export const easing = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeIn: [0.7, 0, 0.84, 0] as const,
  easeInOut: [0.65, 0, 0.35, 1] as const,
  easeInBack: [0.6, -0.28, 0.735, 0.045] as const,
  backOut: [0.34, 1.56, 0.64, 1] as const,
  linear: [0, 0, 1, 1] as const,
} as const;

// The brief pairs "a subtle anticipation bounce" with "Easing: Ease In Back"
// on every exit, and that is one instruction, not two: easeInBack's negative
// control point (y1 = -0.28) drives the value backwards ~10% before it
// travels, which IS the bounce. Adding explicit anticipation keyframes on top
// double-counts it — measured -67px of lift on Frame 7 against a -12px
// keyframe. So exits are plain two-keyframe tweens on this curve.

export const travel = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;
