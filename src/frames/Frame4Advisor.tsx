import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { containerReveal, avatarEntrance, bubbleReveal } from "../motion/transitions";
import { delay as delayToken, duration, easing, stagger } from "../motion/motion.tokens";
import type { StageProps } from "../journey/stageProps";
import proAdvisor1 from "../assets/exports/pro-advisor-1.png";
import proAdvisor3 from "../assets/exports/pro-advisor-3.png";
import proAdvisor4 from "../assets/exports/pro-advisor-4.png";
import bubbleImg from "../assets/exports/pro-advisor-2-bubble.png";
import avatarImg from "../assets/exports/pro-advisor-2-avatar.png";

type Beat = "container" | "avatar" | "userTyping" | "bubble" | "thinking" | "response";

const WELCOME_TOP = 583;
const PROMPT_TOP = 625;
const RESPONSE_BOX = { left: 178, top: 430, width: 180.3 };

// The reskin orders the response above the input and user prompt, so the stack
// no longer needs to translate upward when the reply arrives. The welcome
// card still fades on that beat, preserving the existing focus transition.
const SCROLL_UP = 0;

// The welcome card sits still at its natural Figma position (133 — not
// "high", that's the design's own spec) for the whole time the conversation
// is opening, then exits with a small upward drift once the response
// arrives. The updated card is substantially taller, so it now joins the
// conversation stack and travels upward with it when the reply begins.

// How long the "Meet Pro Advisor" card and input hold before the conversation
// starts. Its body is ~25 words, which needs about four seconds at a normal
// reading pace — at the previous 2s the question prompt appeared while people
// were still on the first line. Every later beat is derived from this, so the
// rhythm of the conversation itself is unchanged and only the reading window
// moves if this is retuned.
const READ_WELCOME_MS = 4500;
const BEATS = {
  avatar: READ_WELCOME_MS - 2000,
  userTyping: READ_WELCOME_MS - 1500,
  bubble: READ_WELCOME_MS + 500,
  thinking: READ_WELCOME_MS + 1800,
  response: READ_WELCOME_MS + 2800,
} as const;
// The response is the final entrance beat. TourChrome waits a further two
// seconds after this animation completes before hinting the Next button.
export const ADVISOR_ENTRANCE_MS = BEATS.response + 400;
const INPUT_ENTRANCE_DELAY = 0.1;

// The stage box is 381 wide, so anything full-width in it centres on 190.5.
// Positions used to carry a hand-applied offset compensating for the old
// chroma-keyed crops; those crops are gone (exports now match their node
// bounds exactly), so the offsets were just pushing content off-centre —
// the welcome card sat at 37 with only 14px to its right. Figma has that
// node at x=25, which is centring it, so that is what it does now.
const WELCOME_WIDTH = 246;
const BUBBLE_LEFT = 211;
const BUBBLE_WIDTH = 167.3;

// Beat 7, "Page Transition": every visible element exits in sequence, each
// preceded by a subtle anticipation bounce opposite to its direction of
// travel — easeInBack's own negative lobe provides that.
//
// Everything leaves along a FLAT HORIZONTAL path, straight out to the left,
// matching the direction of the page-swipe finale. Two separate things had
// made this read as angled: the travel was upwards, and — less obviously —
// each exit target omitted the transform properties its own entrance had
// animated, so Motion fell back towards `initial` and dragged them along for
// the ride. The avatar rotated back to -25deg and slid +40px right on its way
// out; the bubble and response card shrank back towards 0.9/0.85. So every
// exit target pins y/rotate/scale explicitly and only x actually moves.
const EXIT_ORDER = { avatar: 0, bubble: 1, response: 2, input: 3 } as const;
const EXIT_STEPS = 4;
const EXIT_TRAVEL_X = -220;

// How long the whole cascade runs, so TourJourney knows when this frame is
// actually finished leaving.
export const ADVISOR_EXIT_MS = (EXIT_STEPS - 1) * stagger.exitCascade * 1000 + duration.exit * 1000;

const exitTo = { x: EXIT_TRAVEL_X, y: 0, rotate: 0, scale: 1, opacity: 0 };
const exitWith = (order: number) => ({
  duration: duration.exit,
  ease: easing.easeInBack,
  delay: order * stagger.exitCascade,
});

// Frame 4 - the conversation sequence: container + input reveal -> early
// avatar entrance -> user typing indicator -> conversation begins (typewriter
// via clip-path, no real text needed) ->
// AI thinking bubble -> response card (node 16182:4572,
// "Pro Advisor 3") renders in where the thinking bubble was, in the gap
// between the conversation and the input field. This is the stage-only
// content — chrome (Skip/FAB/dots/wordmark/headline) is owned by TourChrome,
// rendered once by TourJourney rather than remounted per step.
export function Frame4AdvisorStage({ exiting }: StageProps) {
  const [beat, setBeat] = useState<Beat>("container");

  useEffect(() => {
    const timers = [
      setTimeout(() => setBeat("avatar"), BEATS.avatar),
      setTimeout(() => setBeat("userTyping"), BEATS.userTyping),
      setTimeout(() => setBeat("bubble"), BEATS.bubble),
      setTimeout(() => setBeat("thinking"), BEATS.thinking),
      setTimeout(() => setBeat("response"), BEATS.response),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const order: Beat[] = ["container", "avatar", "userTyping", "bubble", "thinking", "response"];
  const beatIndex = order.indexOf(beat);
  const avatarIn = beatIndex >= 1;
  const userTyping = beat === "userTyping";
  const bubbleIn = beatIndex >= 3;
  const thinking = beat === "thinking";
  const responded = beat === "response";
  // Once the AI actually has something to say, the live conversation shifts
  // up to give the full-height response card room to clear the input field.
  const scrolled = thinking || responded;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Beat 1: Container Reveal — scale from centre + subtle vertical reveal.
          Holds still at its natural position through the whole conversation
          opening, then exits with a small upward drift once there's a
          response. */}
      {/* The complete conversation stack shifts together when the reply starts:
          the welcome card leads, with the user prompt and response beneath it. */}
      <motion.div
        animate={{ y: scrolled ? -SCROLL_UP : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <motion.img
          src={proAdvisor1}
          alt=""
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={exiting ? exitTo : { opacity: scrolled ? 0 : 1, scale: 1, y: 0 }}
          transition={exiting ? exitWith(EXIT_ORDER.avatar) : beat === "container" ? containerReveal : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            left: 16,
            top: WELCOME_TOP,
            width: WELCOME_WIDTH,
            borderRadius: 16.7,
            boxShadow: "0 4px 3px rgba(16,24,40,0.03), 0 12px 8px rgba(16,24,40,0.08)",
            transformOrigin: "center",
          }}
        />

        {/* Beat 2: Avatar Entrance — slide from right, rotate clockwise, fade in, bounce */}
        <motion.img
          src={avatarImg}
          alt=""
          initial={{ opacity: 0, x: 40, rotate: -25 }}
          animate={exiting ? exitTo : avatarIn ? { opacity: 1, x: 0, rotate: 0 } : {}}
          transition={exiting ? exitWith(EXIT_ORDER.avatar) : avatarEntrance}
          style={{
            position: "absolute",
            left: BUBBLE_LEFT + BUBBLE_WIDTH - 48,
            top: PROMPT_TOP - 55,
            width: 48,
            height: 48,
            borderRadius: "50%",
          }}
        />

        {/* The user arrives before their message. Reuse the same three-dot
            loop as the AI thinking state, right-aligned beside the avatar,
            until the full prompt bubble replaces it. */}
        <AnimatePresence>
          {userTyping && (
            <TypingBubble
              key="user-typing"
              left={BUBBLE_LEFT + BUBBLE_WIDTH - 72}
              top={PROMPT_TOP + 4}
            />
          )}
        </AnimatePresence>

        {/* Beat 3: Conversation Begins — bubble expands, typewriter via clip-path reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={exiting ? exitTo : bubbleIn ? { opacity: 1, scale: 1 } : {}}
          transition={exiting ? exitWith(EXIT_ORDER.bubble) : bubbleReveal}
          style={{ position: "absolute", left: BUBBLE_LEFT, top: PROMPT_TOP, width: BUBBLE_WIDTH, transformOrigin: "right center" }}
        >
          <motion.img
            src={bubbleImg}
            alt=""
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={bubbleIn ? { clipPath: "inset(0 0% 0 0)" } : {}}
            transition={bubbleReveal}
            style={{ width: "100%", display: "block", borderRadius: 14, boxShadow: "0 2px 4px rgba(16,24,40,0.05)" }}
          />
        </motion.div>

        {/* Beat 5/6: thinking bubble, ABOVE the input, in its own bubble — then
            replaced by the real response card (Pro Advisor 3) rendering in at
            the same spot. This was previously missing entirely: the response
            asset was imported but never rendered. */}
        <AnimatePresence mode="wait">
          {thinking && <TypingBubble key="thinking" left={RESPONSE_BOX.left} top={RESPONSE_BOX.top} />}
          {responded && (
            <motion.img
              key="response"
              src={proAdvisor3}
              alt=""
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={exiting ? exitTo : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={exiting ? exitWith(EXIT_ORDER.response) : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                left: RESPONSE_BOX.left,
                top: RESPONSE_BOX.top,
                width: RESPONSE_BOX.width,
                borderRadius: 24,
                boxShadow: "0 4px 6px -1.4px rgba(16,24,40,0.03), 0 12px 16px -2.8px rgba(16,24,40,0.08)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Input Field Reveal — enters with the welcome card, offset by only a
          minor delay. It stays fixed outside the scrolling conversation group
          since it is anchored to the bottom rather than message history. */}
      <motion.img
        src={proAdvisor4}
        alt=""
        initial={{ opacity: 0, x: 40 }}
        animate={exiting ? exitTo : { opacity: 1, x: 0 }}
        transition={
          exiting
            ? exitWith(EXIT_ORDER.input)
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: INPUT_ENTRANCE_DELAY }
        }
        style={{
          position: "absolute",
          left: 27,
          top: 484,
          width: 329,
          borderRadius: 100,
          boxShadow: "0 4px 12px -2px rgba(16,24,40,0.06)",
        }}
      />
    </div>
  );
}

// Beat 5: "Loop Interval: 800-1000ms, Easing: Linear" — that interval is the
// full . -> .. -> ... cycle, so each step is a third of it. Was hardcoded at
// 350ms per step (a ~1050ms cycle), which overran the top of the range.
const THINKING_STEP_MS = (delayToken.thinkingLoop * 1000) / 3;

function TypingBubble({ left, top }: { left: number; top: number }) {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), THINKING_STEP_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: "absolute",
        left,
        top,
        width: 72,
        height: 40,
        borderRadius: 20,
        background: "var(--color-gray-25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-text-muted)",
            opacity: i < dots ? 1 : 0.25,
          }}
        />
      ))}
    </motion.div>
  );
}
