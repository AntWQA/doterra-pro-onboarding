import type { ReactNode } from "react";

const WIDTH = 393;
const HEIGHT = 852;
const CORNER_RADIUS = 16.723;

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        position: "relative",
        overflow: "hidden",
        borderRadius: CORNER_RADIUS,
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        fontFamily: "var(--font-family-base)",
        background: "#ffffff",
      }}
    >
      {children}
    </div>
  );
}
