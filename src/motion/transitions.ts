import type { Transition } from "motion/react";
import { duration, easing } from "./motion.tokens";

export const containerReveal: Transition = { duration: duration.entrance, ease: easing.easeOut };
export const avatarEntrance: Transition = { duration: duration.avatar, ease: easing.backOut };
export const bubbleReveal: Transition = { duration: duration.bubble, ease: easing.easeOut };
export const copyReveal: Transition = { duration: duration.standard, ease: easing.easeOut };
export const cardEntrance: Transition = { duration: duration.bubble, ease: easing.easeOut };
export const cardExit: Transition = { duration: duration.exit, ease: easing.easeInBack };
export const componentExit: Transition = { duration: duration.exit, ease: easing.easeInBack };
export const pageSwipe: Transition = { duration: duration.pageSwipe, ease: easing.easeInOut };
export const fast: Transition = { duration: duration.fast, ease: easing.easeOut };
