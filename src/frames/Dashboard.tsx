import dashboardAll from "../assets/exports/dashboard-all.png";
import dashboardFooter from "../assets/exports/dashboard-footer.png";
import type { ExperienceStyle } from "../experienceStyle";

const DASHBOARD_HEIGHT = 1691;
const FOOTER_HEIGHT = 90;
const SCROLLING_CONTENT_HEIGHT = DASHBOARD_HEIGHT - FOOTER_HEIGHT;

// Revealed once the onboarding page swipes away, per Frame 8's "Final Page
// Transition" annotation. This replaces the placeholder that stood in while
// no app screen existed for the demo.
//
// The export is 393x1554 — device width at 1x, but nearly twice the 852pt
// viewport, because it is the whole scrollable dashboard rather than one
// screenful. The dashboard owns its vertical scroll viewport while the
// DeviceFrame continues to clip the app to the phone silhouette.
export function Dashboard({ experienceStyle: _experienceStyle, onRetakeTour }: { experienceStyle: ExperienceStyle; onRetakeTour: () => void }) {

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        className="dashboard-scroll"
        style={{
          position: "absolute",
          inset: 0,
          overflowX: "hidden",
          overflowY: "auto",
          overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {/* The supplied long dashboard image already contains this menu in its
            final 90px. Clip that duplicate away, then reserve the same amount
            of scroll space so the last content clears the sticky footer. */}
        <div style={{ position: "relative", width: 393, height: SCROLLING_CONTENT_HEIGHT, overflow: "hidden" }}>
          <img src={dashboardAll} alt="" style={{ width: 393, height: "auto", display: "block" }} />
          <button
            type="button"
            aria-label="Retake onboarding tour"
            onClick={onRetakeTour}
            style={{
              position: "absolute",
              left: 16,
              top: 1334,
              width: 361,
              height: 101,
              padding: 0,
              border: 0,
              borderRadius: 24,
              background: "transparent",
              cursor: "pointer",
            }}
          />
        </div>
        <div aria-hidden style={{ height: FOOTER_HEIGHT }} />
      </div>

      <img
        src={dashboardFooter}
        alt=""
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 393,
          height: FOOTER_HEIGHT,
          display: "block",
          zIndex: 2,
        }}
      />
    </div>
  );
}
