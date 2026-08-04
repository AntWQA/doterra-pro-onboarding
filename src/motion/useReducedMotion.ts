import { useSyncExternalStore } from "react";

// Motion's own useReducedMotion() is `useState(prefersReducedMotion.current)`
// with no matchMedia subscription — it will not react to the user toggling
// system settings mid-session despite its JSDoc claiming otherwise. This hook
// subscribes properly, fails safe (server snapshot = true, so first paint
// never emits motion it shouldn't), and layers in an app-level override and
// the ?reducedMotion=1 query param the browser-automation gate relies on
// because there is no way to emulate prefers-reduced-motion via the harness.

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return true;
}

function readQueryParamOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("reducedMotion") === "1") return true;
  if (params.get("reducedMotion") === "0") return false;
  return null;
}

let appLevelOverride: boolean | null = null;

export function setAppReducedMotionOverride(value: boolean | null) {
  appLevelOverride = value;
}

export function usePureReducedMotion(explicit?: boolean): boolean {
  const osPrefers = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const queryOverride = readQueryParamOverride();

  if (explicit !== undefined) return explicit;
  if (queryOverride !== null) return queryOverride;
  if (appLevelOverride !== null) return appLevelOverride;
  return osPrefers;
}
