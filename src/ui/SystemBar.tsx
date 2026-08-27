import cap from "../assets/exports/status-cap.svg";
import wifi from "../assets/exports/status-wifi.svg";
import cellular from "../assets/exports/status-cellular.svg";

// How long the bar takes to change between dark and light icons. Deliberately
// unhurried: the flip used to be instant, which read as a glitch.
const TINT_MS = 900;

// Fixed native-style chrome from Figma node 16294:52261. This component is
// mounted once above the whole app, so it never participates in page motion.
//
// The two tints are rendered as two full stacked copies and cross-faded rather
// than transitioning colour and filter in place: `filter: none` -> `brightness(0)
// invert(1)` has no sensible interpolation, and a half-inverted icon greys out
// in the middle of the transition instead of passing through it.
export function SystemBar({ light = false }: { light?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 53,
        zIndex: 1000,
        pointerEvents: "none",
        background: "rgba(255,255,255,0)",
      }}
    >
      <SystemBarTint light={false} visible={!light} />
      <SystemBarTint light visible={light} />
    </div>
  );
}

function SystemBarTint({ light, visible }: { light: boolean; visible: boolean }) {
  const foreground = light ? "#ffffff" : "#282828";
  const iconFilter = light ? "brightness(0) invert(1)" : "none";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: `opacity ${TINT_MS}ms ease-in-out`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 21,
          top: 16,
          width: 54,
          height: 21,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16px",
          letterSpacing: -0.28,
          color: foreground,
        }}
      >
        9:41
      </div>

      <img src={cellular} alt="" style={{ position: "absolute", right: 74, top: 21.67, width: 17, height: 10.667, filter: iconFilter }} />
      <img src={wifi} alt="" style={{ position: "absolute", right: 53.67, top: 21.33, width: 15.333, height: 11, filter: iconFilter }} />

      <div
        style={{
          position: "absolute",
          right: 26.67,
          top: 21.33,
          width: 22,
          height: 11.333,
          boxSizing: "border-box",
          border: `1px solid ${light ? "rgba(255,255,255,0.6)" : "rgba(44,44,44,0.6)"}`,
          borderRadius: 2.667,
          opacity: 0.35,
        }}
      />
      <img src={cap} alt="" style={{ position: "absolute", right: 24.34, top: 25, width: 1.328, height: 4, filter: iconFilter }} />
      <div
        style={{
          position: "absolute",
          right: 28.67,
          top: 23.33,
          width: 18,
          height: 7.333,
          borderRadius: 1.333,
          background: foreground,
        }}
      />
    </div>
  );
}
