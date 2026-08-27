/**
 * Records the onboarding journey end to end, one video per version.
 *
 * Boots the Vite dev server, drives the prototype with Playwright at a pace
 * that leaves every transition legible, and writes a video per style to
 * recordings/. Playwright captures .webm; if its bundled ffmpeg is present the
 * script also writes an .mp4 alongside it for sharing.
 *
 *   node scripts/record-journey.mjs              # both versions, intro only
 *   node scripts/record-journey.mjs v1           # one version
 *   node scripts/record-journey.mjs --full       # carry on through the whole journey
 *   node scripts/record-journey.mjs --pace 1.5   # 1.5x slower, for reviewing motion
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "recordings");
const TMP_DIR = path.join(OUT_DIR, ".raw");
const PORT = 5199;
const BASE_URL = `http://localhost:${PORT}`;

// The recording is sized to the device frame plus a small margin for its drop
// shadow — nothing else on the page is worth filming. RENDER_SCALE draws the
// page at 2x so text and the 1px borders stay crisp: a CSS transform on <body>
// (rather than deviceScaleFactor, which the screencast ignores) makes Chromium
// rasterise at the scaled size. The demo's centring is overridden to top-left
// so the scale origin and the viewport agree.
const FRAME = { width: 393, height: 852 };
const MARGIN = 12;
const RENDER_SCALE = 2;
const VIEWPORT = {
  width: (FRAME.width + MARGIN * 2) * RENDER_SCALE,
  height: (FRAME.height + MARGIN * 2) * RENDER_SCALE,
};
// Injected before the app's first paint, so the video never opens on an
// unstaged flash. The page starts transparent and is revealed once the version
// is selected — recording starts with the context, and the demo controls are
// dev chrome that should not appear in the film. Blanking uses opacity rather than
// visibility so Playwright still counts the controls as clickable underneath.
const STAGE_CSS = `
  .demo-controls { display: none !important; }
  #root {
    display: block !important;
    min-height: 0 !important;
    padding: ${MARGIN}px !important;
  }
  body {
    transform: scale(${RENDER_SCALE});
    transform-origin: 0 0;
    opacity: 0;
  }
`;
const REVEAL_CSS = `body { opacity: 1 !important; }`;

// Reading time added AFTER a screen has finished animating, at 1x pace. The
// settle time itself is never guessed — for the tour it comes from the app's
// own exported timings (see readStageTimings), so a stage that gets slower in
// code automatically gets a longer hold here.
const READ = {
  splash: 1800, // read the two CTAs
  login: 2000, // read the form
  tourStep: 2000, // read the headline and body once the stage has played out
  dashboard: 3000, // page swipe finishes, then hold on the real app
};

// Entrance staggers the frames run on mount, which no exported constant covers.
const SETTLE = {
  splash: 1200, // hero + card entrance, then delayChildren 200ms + 2x 60ms stagger + 300ms reveal
  login: 1400, // V1 collapses the splash card (400ms) before the login card enters
};

// TourJourney holds a 200ms gap between one stage leaving and the next mounting.
const STAGE_SEPARATION_MS = 200;

// Pressing a version button always remounts the journey and replays the
// animated splash intro, including when that version is already selected. Both
// videos therefore start with a press, so both open on the intro's first frame
// — which is the whole difference between the two versions.
const STYLES = {
  v1: {
    key: "v1",
    toggles: ["V1"],
    label: "V1 (pale lead-in, counter reveal)",
  },
  v2: { key: "v2", toggles: ["V2"], label: "V2 (photo backdrop, drop ending)" },
};

const args = process.argv.slice(2);
const paceFlag = args.indexOf("--pace");
const PACE = paceFlag === -1 ? 1 : Number(args[paceFlag + 1]) || 1;
// By default the film stops once the splash card has landed — that is where
// the two versions differ, and the rest of the journey is identical in both.
const FULL_JOURNEY = args.includes("--full");
const requested = args.filter((a) => STYLES[a.toLowerCase()]).map((a) => a.toLowerCase());
const targets = (requested.length ? requested : ["v1", "v2"]).map((k) => STYLES[k]);

const hold = (page, ms) => page.waitForTimeout(Math.round(ms * PACE));

async function startDevServer() {
  const proc = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stderr.on("data", (d) => process.stderr.write(`[vite] ${d}`));

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return proc;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  proc.kill();
  throw new Error(`Dev server did not come up on ${BASE_URL} within 60s`);
}

// Each tour stage exports how long it needs to enter and to leave, and
// TourJourney drives the sequence from those numbers. Rather than copy them
// (they are derived from the motion tokens, so a copy would rot), pull them out
// of the dev server's own module graph: Vite serves the sources as ESM, so the
// page can just import them.
async function readStageTimings(page) {
  return page.evaluate(async () => {
    const modules = await Promise.all([
      import("/src/frames/Frame4Advisor.tsx"),
      import("/src/frames/Frame5Tracking.tsx"),
      import("/src/frames/Frame6Insights.tsx"),
      import("/src/frames/Frame7MyTeam.tsx"),
      import("/src/frames/Frame8Tasks.tsx"),
    ]);
    const pick = (mod, suffix) => Object.entries(mod).find(([k]) => k.endsWith(suffix))[1];
    return modules.map((mod) => ({
      entranceMs: pick(mod, "_ENTRANCE_MS"),
      exitMs: pick(mod, "_EXIT_MS"),
    }));
  });
}

async function recordStyle(browser, style, timings) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: TMP_DIR, size: VIEWPORT },
    // The prototype honours prefers-reduced-motion; force full motion so the
    // recording shows the transitions regardless of the host's OS setting.
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  // Init scripts can run before <html> exists, so the injection is deferred to
  // whenever there is somewhere to put it.
  await page.addInitScript((css) => {
    const inject = () => {
      const style = document.createElement("style");
      style.textContent = css;
      (document.head ?? document.documentElement).append(style);
    };
    if (document.head || document.documentElement) inject();
    else document.addEventListener("DOMContentLoaded", inject, { once: true });
  }, STAGE_CSS);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  // The toggle is hidden by the staging CSS, so drive it from the DOM rather
  // than as a user click, then reveal the staged frame.
  await page.getByRole("button", { name: "Take a Tour First" }).waitFor();
  for (const label of style.toggles) {
    await page.evaluate((name) => {
      const button = [...document.querySelectorAll(".version-toggle button")].find(
        (b) => b.textContent.trim() === name,
      );
      button?.click();
    }, label);
  }
  await page.addStyleTag({ content: REVEAL_CSS });

  // Frame 1 — splash. Waiting on the CTA is what proves the intro has finished
  // and the card has mounted; the hold covers its entrance plus reading time.
  await page.getByRole("button", { name: "Take a Tour First" }).waitFor();
  await hold(page, SETTLE.splash + READ.splash);

  if (FULL_JOURNEY) {
    await page.getByRole("button", { name: "Log in", exact: true }).click();

    // Frame 2 — login. Waiting on Face ID confirms the frame has mounted before
    // the hold, so the hold is viewing time rather than load time.
    await page.getByRole("button", { name: "Use Face ID" }).waitFor();
    await hold(page, SETTLE.login + READ.login);
    await page.getByRole("button", { name: "Log in", exact: true }).click();

    // Frame 3 — welcome/loading. Self-timed: a 3s loading state plus a 400ms
    // handoff, and in V1 a card collapse and gradient close before it even
    // mounts. It needs no hold of its own — it advances when it is finished, and
    // the FAB appearing is proof the tour has taken over.
    await page.getByRole("button", { name: "NEXT" }).waitFor({ timeout: 20_000 });

    // Frames 4-8 — the five tour stages, each held for as long as it says it
    // needs. The stage mounts only after the previous one has finished leaving,
    // so that outgoing exit counts towards this step's wait. The last FAB is
    // labelled "FINISH".
    for (let step = 0; step < timings.length; step += 1) {
      const isLast = step === timings.length - 1;
      const fab = page.getByRole("button", {
        name: isLast ? "FINISH" : "NEXT",
      });
      await fab.waitFor();
      const previousExit = step === 0 ? 0 : timings[step - 1].exitMs + STAGE_SEPARATION_MS;
      await hold(page, previousExit + timings[step].entranceMs + READ.tourStep);
      await fab.click();
    }

    // Dashboard, revealed by the page swipe.
    await hold(page, timings.at(-1).exitMs + READ.dashboard);
  }

  const video = page.video();
  await context.close(); // flushes the video file
  const target = path.join(OUT_DIR, `onboarding-${style.key}.webm`);
  await video.saveAs(target);
  return target;
}

// Playwright ships its own ffmpeg, but that build is webm-only — it has no mp4
// muxer — so mp4 output needs a system ffmpeg (`brew install ffmpeg`).
function findFfmpeg() {
  const which = spawnSync("which", ["ffmpeg"], { encoding: "utf8" });
  const bin = which.stdout.trim();
  return which.status === 0 && bin ? bin : null;
}

function toMp4(ffmpeg, webm) {
  const mp4 = webm.replace(/\.webm$/, ".mp4");
  const res = spawnSync(ffmpeg, [
    "-y",
    "-i",
    webm,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "20",
    mp4,
  ]);
  return res.status === 0 ? mp4 : null;
}

const server = await startDevServer();
mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const written = [];
try {
  // One un-recorded page, purely to read the stage timings out of the app.
  // Only the full journey plays the tour, so only it needs them.
  let timings = [];
  if (FULL_JOURNEY) {
    const probe = await browser.newPage();
    await probe.goto(BASE_URL, { waitUntil: "networkidle" });
    timings = await readStageTimings(probe);
    await probe.close();
    console.log(
      `Stage timings (ms): ${timings.map((t, i) => `F${i + 4} in ${t.entranceMs}/out ${t.exitMs}`).join(", ")}`,
    );
  }

  for (const style of targets) {
    console.log(`Recording ${style.label}…`);
    written.push(await recordStyle(browser, style, timings));
  }
} finally {
  await browser.close();
  server.kill();
  rmSync(TMP_DIR, { recursive: true, force: true });
}

const ffmpeg = findFfmpeg();
for (const webm of written) {
  const mp4 = ffmpeg ? toMp4(ffmpeg, webm) : null;
  console.log(`  ${path.relative(ROOT, webm)}${mp4 ? ` + ${path.relative(ROOT, mp4)}` : ""}`);
}
if (!ffmpeg) console.log("(no system ffmpeg — .webm only; `brew install ffmpeg` to also get .mp4)");
