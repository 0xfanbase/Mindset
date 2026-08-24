// weeks.js -- the Weeks section: one combined "life in weeks" grid for J and B, canvas-
// rendered, zoomable, with a hover/tap highlight per person. BUILD-PLAN.md v1.23 (v1.22
// shipped two separate grids; this redesign combines them -- see audits/decisions.md for the
// cell-state model). Built at boot (v1.39) -- its container is part of the single-page layout,
// visible from load, so (like figure.js's always-visible element) there's a real size to
// measure the first time build() runs.
import {
  hktDateString, weeksLived, percentLifeSpent, commas,
  LIFE_WEEKS_TOTAL, LIFE_WEEKS_PER_ROW, LIFE_WEEKS_YEARS, LIFE_PEOPLE,
} from "./lib.mjs";

const DPR_CAP = 2;
const ZOOM_MULT = [1, 2, 3]; // multipliers of the dynamically-fit base pitch
const DOT_FRACTION = 0.7; // dot size as a fraction of the cell pitch; remainder is gap
const MIN_PITCH = 4;
const PALE_ALPHA = 0.25; // focus-mode de-emphasis for the non-focused person
// v1.24: the epigraph (fact, then reminder) -- top of the section, real display weight, per
// live feedback. One treatment for both lines: one thought ~2,000 years apart, no hierarchy.
// Seneca's line is an ORIGINAL paraphrase, not a lifted translation -- the published
// rendering (Penguin/Costa's own subtitle) says "if you know how to USE it"; "spend" was
// chosen deliberately as this section's own vocabulary (percent spent, squares = spent weeks).
const EPIGRAPH = [
  { text: "An average human life is about four thousand weeks.", attr: "— after Oliver Burkeman" },
  { text: "Life is long, if you know how to spend it.", attr: "— after Seneca" },
];

function themeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgbArr(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgbArr(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const jBirth = LIFE_PEOPLE.find((p) => p.id === "J").birthMonthHKT;
const bBirth = LIFE_PEOPLE.find((p) => p.id === "B").birthMonthHKT;

let built = false;
let zoomIndex = 0;
let lastDrawnDateHKT = null;
let stickyFocus = null; // "J" | "B" | null -- set by click/tap, persists until toggled off
let hoverFocus = null; // "J" | "B" | null -- set by real mouse hover only, transient
let zoomOutBtn = null;
let zoomInBtn = null;
let jStat = null;
let bStat = null;
let chart = null; // { canvas, ctx, scroller, gutter }
let jGlowSprite = null;
let bGlowSprite = null;

function effectiveFocus() {
  return hoverFocus || stickyFocus;
}

function fitPitch(scroller) {
  const w = scroller.clientWidth || scroller.parentElement.clientWidth;
  return Math.max(MIN_PITCH, w / LIFE_WEEKS_PER_ROW);
}

function sizeCanvas(canvas, ctx, pitch) {
  const cssW = LIFE_WEEKS_PER_ROW * pitch;
  const cssH = LIFE_WEEKS_YEARS * pitch;
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// A soft radial-gradient sprite, generated once per person and reused -- the same offscreen-
// sprite technique figure.js uses for its glow (never per-frame shadowBlur). Person colors
// were theme-scoped v1.29-v1.39 (redrawWeeksForTheme() nulled both sprites on a theme change
// to force regeneration in the new theme's colors); v2.0 fixed them to single constants (the
// Weeks section no longer follows the page theme at all -- see styles.css's --weeks-* token
// comment), so a theme toggle no longer actually changes anything here. The null-and-redraw
// still runs (cheap, and keeps this wired the same way figure.js's own theme refresh is) --
// see redrawWeeksForTheme()'s own comment below.
function makeGlowSprite(hex) {
  const [r, g, b] = hexToRgbArr(hex);
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const gctx = c.getContext("2d");
  const grad = gctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  // Peak alpha 0.28, not 0.55 -- the glow paints OVER an outline whose point is an unfilled
  // center (v1.34: corrected from "UNDER" -- stampGlow runs after strokeRect); a strong glow
  // visibly refilled that center and bled into neighboring cells (tested live).
  grad.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, size, size);
  return c;
}
function jGlow() { return jGlowSprite || (jGlowSprite = makeGlowSprite(themeColor("--person-j"))); }
function bGlow() { return bGlowSprite || (bGlowSprite = makeGlowSprite(themeColor("--person-b"))); }
function stampGlow(ctx, sprite, cx, cy, pitch) {
  const size = pitch * 1.35; // reads as glowing, not just tinted (Fable's UX audit); the
  // neighbor-bleed fix that actually mattered was the alpha drop, not size.
  ctx.drawImage(sprite, cx - size / 2, cy - size / 2, size, size);
}

// The removed legend (v1.24 -- see audits/decisions.md) explained the solid-blue "lead band"
// as "only B, so far"; that information still needs to survive for a screen-reader user even
// though the visible key is gone, so it's folded into the one label that was already dynamic.
function ariaLabelFor(Jw, Bw, total, focus) {
  const base = `Life in weeks: J ${commas(Jw)} of ${commas(total)}, B ${commas(Bw)} of ${commas(total)}. B has about a 13-month head start on J.`;
  if (focus === "J") return `${base} Highlighting J.`;
  if (focus === "B") return `${base} Highlighting B.`;
  return base;
}

// Combined-grid cell model (see audits/decisions.md for the full rationale): row/col = weeks
// since each person's OWN birth (age, not calendar time). B is always older, so for any age-
// week index w: w < Jw means both have lived it (split cell, half pink / half blue); Jw <= w <
// Bw means only B has (solid blue -- there is structurally no "J-only" case, ever); w >= Bw
// means neither has (faint). Jw and Bw themselves get an outline marker instead of a fill.
// Cells are drawn in batched fillStyle passes (future / blue / split-J / split-B), not
// per-cell style switches -- style changes, not fillRect calls, are what's expensive on canvas.
function drawGrid(pitch) {
  const { canvas, ctx } = chart;
  sizeCanvas(canvas, ctx, pitch);
  const dot = Math.max(1, pitch * DOT_FRACTION);
  const offset = (pitch - dot) / 2;
  const total = LIFE_WEEKS_TOTAL;
  const now = new Date();
  const Jw = weeksLived(jBirth, now);
  const Bw = weeksLived(bBirth, now);

  const focus = effectiveFocus();
  const jColor = focus === "B" ? hexToRgba(themeColor("--person-j"), PALE_ALPHA) : themeColor("--person-j");
  const bColor = focus === "J" ? hexToRgba(themeColor("--person-b"), PALE_ALPHA) : themeColor("--person-b");
  const futureColor = themeColor("--week-future");

  function xy(w) {
    const row = Math.floor(w / LIFE_WEEKS_PER_ROW), col = w % LIFE_WEEKS_PER_ROW;
    return [col * pitch + offset, row * pitch + offset];
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = futureColor;
  for (let w = Bw + 1; w < total; w++) { const [x, y] = xy(w); ctx.fillRect(x, y, dot, dot); }
  if (Bw < total) { const [x, y] = xy(Bw); ctx.fillRect(x, y, dot, dot); } // base under B's outline

  ctx.fillStyle = bColor;
  for (let w = Jw + 1; w < Bw; w++) { const [x, y] = xy(w); ctx.fillRect(x, y, dot, dot); }
  if (Jw < total) { const [x, y] = xy(Jw); ctx.fillRect(x + dot / 2, y, dot / 2, dot); } // B's right half at J's current week
  for (let w = 0; w < Jw; w++) { const [x, y] = xy(w); ctx.fillRect(x + dot / 2, y, dot / 2, dot); }

  ctx.fillStyle = jColor;
  for (let w = 0; w < Jw; w++) { const [x, y] = xy(w); ctx.fillRect(x, y, dot / 2, dot); }

  // J's current-week outline spans the FULL cell (matching B's), not just her half -- the
  // half-width sliver read as a glitch and implied her week counted for less (Fable's UX
  // audit, from the rendered grid). B's blue right-half fill stays visible under it.
  const lw = Math.max(1, pitch * 0.08);
  if (Jw < total) {
    const [x, y] = xy(Jw);
    ctx.strokeStyle = jColor;
    ctx.lineWidth = lw;
    ctx.strokeRect(x + lw / 2, y + lw / 2, Math.max(0, dot - lw), Math.max(0, dot - lw));
    stampGlow(ctx, jGlow(), x + dot / 2, y + dot / 2, pitch);
  }
  if (Bw < total) {
    const [x, y] = xy(Bw);
    ctx.strokeStyle = bColor;
    ctx.lineWidth = lw;
    ctx.strokeRect(x + lw / 2, y + lw / 2, Math.max(0, dot - lw), Math.max(0, dot - lw));
    stampGlow(ctx, bGlow(), x + dot / 2, y + dot / 2, pitch);
  }

  canvas.setAttribute("aria-label", ariaLabelFor(Jw, Bw, total, focus));
}

// aria-label on a <button> replaces its visible children as the accessible name -- a static
// label was erasing the section's own headline stat for screen readers (confirmed via a real
// accessibility-tree snapshot). Folding the live figures in, regenerated on every redraw,
// keeps label and visible text in sync.
// The DISPLAYED week is 1-indexed, so at weeksLived()'s clamp weeks+1 would read "week 4,681
// of 4,680" -- cap the display at the same total (real, though unreachable before ~2079).
function displayWeek(weeks) {
  return Math.min(weeks + 1, LIFE_WEEKS_TOTAL);
}

// v2.0: weeks-left/pct-left folded into the accessible name too, now that the visible card
// shows both (the progress bar + "N weeks left" + "NN.N% left") -- keeps the aria-label in
// sync with what's actually on screen, same principle as this function's own pre-existing
// comment above (folding the live figures in on every redraw).
function statLabel(id, weeks, pct) {
  const left = LIFE_WEEKS_TOTAL - displayWeek(weeks);
  return `${id}, week ${commas(displayWeek(weeks))} of ${commas(LIFE_WEEKS_TOTAL)}, ${commas(left)} weeks left, ${pct.toFixed(1)}% of life lived. Highlight ${id}'s weeks.`;
}

// Values only -- no new computation. weeksLived()/percentLifeSpent() are the same lib.mjs
// functions the canvas grid itself uses, so the bar fill, the header stat, and the actual
// squares can never visibly disagree.
function paintStat(stat, id, weeks, pct) {
  const left = LIFE_WEEKS_TOTAL - displayWeek(weeks);
  const pctStr = pct.toFixed(1);
  const leftPctStr = Math.max(0, 100 - pct).toFixed(1);
  stat.meta.textContent = `${id} · week ${commas(displayWeek(weeks))} of ${commas(LIFE_WEEKS_TOTAL)}`;
  stat.left.textContent = `${commas(left)} weeks left`;
  stat.fill.style.width = `${pctStr}%`;
  stat.lived.textContent = `${pctStr}% lived`;
  stat.leftPct.textContent = `${leftPctStr}% left`;
  stat.btn.setAttribute("aria-label", statLabel(id, weeks, pct));
}

function updateStats() {
  const now = new Date();
  paintStat(jStat, "J", weeksLived(jBirth, now), percentLifeSpent(jBirth, now));
  paintStat(bStat, "B", weeksLived(bBirth, now), percentLifeSpent(bBirth, now));
}

function syncFocusUI() {
  const eff = effectiveFocus();
  for (const s of [jStat, bStat]) {
    s.btn.setAttribute("aria-pressed", String(s.id === stickyFocus));
    s.btn.classList.toggle("is-active", s.id === eff);
  }
}

// Defensive: a canvas reporting zero client width (container not yet laid out, or a
// ResizeObserver firing mid-reflow) would draw at MIN_PITCH and stamp a wrong
// lastDrawnDateHKT, which would make refreshIfStale() skip the real redraw once real width
// is available. No longer the tab-activation guard it was before v1.39 -- kept as a general
// safety net (found in pre-merge audit).
function redrawAll() {
  if (!chart || chart.scroller.clientWidth === 0) return;
  const pitch = fitPitch(chart.scroller) * ZOOM_MULT[zoomIndex];
  drawGrid(pitch);
  chart.gutter.style.setProperty("--pitch", `${pitch}px`);
  updateStats();
  lastDrawnDateHKT = hktDateString(new Date());
  if (zoomOutBtn) {
    zoomOutBtn.disabled = zoomIndex === 0;
    zoomInBtn.disabled = zoomIndex === ZOOM_MULT.length - 1;
  }
}

// Discrete steps (not continuous/pinch) keep the scroll-anchor math tractable and each state
// a clean "big picture" / "individual dots" read -- see audits/decisions.md.
function setZoom(newIndex) {
  newIndex = Math.max(0, Math.min(ZOOM_MULT.length - 1, newIndex));
  if (newIndex === zoomIndex || !chart) return;
  const ratio = ZOOM_MULT[newIndex] / ZOOM_MULT[zoomIndex];
  zoomIndex = newIndex;
  const cw = chart.scroller.clientWidth;
  const pending = Math.max(0, (chart.scroller.scrollLeft + cw / 2) * ratio - cw / 2);
  redrawAll();
  chart.scroller.scrollLeft = pending;
}

// v2.0: replaces the old bare meta+pct pair with the design's row / progress-bar / lived-left
// row. Still exactly one interactive element (the button itself) -- every child here is purely
// visual, painted by paintStat() on every redraw; the button's own aria-label (statLabel())
// remains the sole accessible name, same pattern as before (see the button's own comment).
function buildStatButton(person) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "weeks-stat";
  btn.dataset.person = person.id;
  btn.setAttribute("aria-pressed", "false");
  // No static aria-label here -- updateStats() sets the real one (folding in the live
  // week/percent figures) immediately after build(), before first paint.
  const row = document.createElement("div");
  row.className = "weeks-stat-row";
  const meta = document.createElement("span");
  meta.className = "weeks-stat-meta";
  const left = document.createElement("span");
  left.className = "weeks-stat-left";
  row.append(meta, left);

  const track = document.createElement("div");
  track.className = "weeks-bar-track";
  const fill = document.createElement("div");
  fill.className = "weeks-bar-fill";
  const shine = document.createElement("div");
  shine.className = "weeks-bar-shine";
  fill.appendChild(shine);
  track.appendChild(fill);

  const pctRow = document.createElement("div");
  pctRow.className = "weeks-stat-pctrow";
  const lived = document.createElement("span");
  const leftPct = document.createElement("span");
  pctRow.append(lived, leftPct);

  btn.append(row, track, pctRow);

  btn.addEventListener("click", () => {
    stickyFocus = stickyFocus === person.id ? null : person.id;
    // Sync hoverFocus too: un-toggling via a second click with the pointer never leaving
    // (so no mouseleave fires) left effectiveFocus() returning the stale hoverFocus until
    // the pointer moved (found in audit). Later mouseenter/mouseleave still work normally.
    hoverFocus = stickyFocus;
    syncFocusUI();
    redrawAll();
  });
  // Hover is a desktop-only preview, gated behind the same media-feature test the stylesheet
  // already uses for :hover rules -- an unconditionally-bound mouseenter fires on iOS's first
  // tap (WebKit's hover-before-click emulation), which would turn tap-to-toggle into a
  // broken tap-to-preview/tap-to-toggle two-step on the app's primary platform.
  if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    btn.addEventListener("mouseenter", () => { hoverFocus = person.id; syncFocusUI(); redrawAll(); });
    btn.addEventListener("mouseleave", () => { hoverFocus = null; syncFocusUI(); redrawAll(); });
  }
  return { btn, meta, left, fill, lived, leftPct, id: person.id };
}

function build() {
  const root = document.getElementById("weeks-root");
  root.className = "weeks-root";

  // v2.0: heading first (design's "WHERE WE ARE, WHAT'S LEFT"), new -- the section previously
  // had no title of its own here, just the epigraph.
  const heading = document.createElement("div");
  heading.className = "weeks-heading";
  heading.textContent = "WHERE WE ARE, WHAT'S LEFT";
  root.appendChild(heading);

  const statsRow = document.createElement("div");
  statsRow.className = "weeks-stats";
  jStat = buildStatButton(LIFE_PEOPLE.find((p) => p.id === "J"));
  bStat = buildStatButton(LIFE_PEOPLE.find((p) => p.id === "B"));
  statsRow.append(jStat.btn, bStat.btn);
  root.appendChild(statsRow);

  const zoomRow = document.createElement("div");
  zoomRow.className = "weeks-zoom-row";
  const zoomWrap = document.createElement("div");
  zoomWrap.className = "weeks-zoom";
  zoomOutBtn = document.createElement("button");
  zoomOutBtn.type = "button";
  zoomOutBtn.className = "weeks-zoom-btn";
  zoomOutBtn.setAttribute("aria-label", "Zoom out");
  zoomOutBtn.textContent = "−";
  zoomInBtn = document.createElement("button");
  zoomInBtn.type = "button";
  zoomInBtn.className = "weeks-zoom-btn";
  zoomInBtn.setAttribute("aria-label", "Zoom in");
  zoomInBtn.textContent = "+";
  zoomOutBtn.addEventListener("click", () => setZoom(zoomIndex - 1));
  zoomInBtn.addEventListener("click", () => setZoom(zoomIndex + 1));
  zoomWrap.append(zoomOutBtn, zoomInBtn);
  zoomRow.appendChild(zoomWrap);
  root.appendChild(zoomRow);

  const card = document.createElement("div");
  card.className = "card weeks-card";
  const frame = document.createElement("div");
  frame.className = "weeks-frame";

  const gutter = document.createElement("div");
  gutter.className = "weeks-gutter";
  gutter.setAttribute("aria-hidden", "true");
  for (let row = 0; row < LIFE_WEEKS_YEARS; row++) {
    const slot = document.createElement("div");
    slot.className = "weeks-yr";
    if (row % 5 === 0) slot.textContent = String(row);
    gutter.appendChild(slot);
  }

  const scroller = document.createElement("div");
  scroller.className = "weeks-scroll";
  scroller.tabIndex = 0;
  scroller.setAttribute("role", "group");
  scroller.setAttribute("aria-label", "Life in weeks for J and B, scrollable");

  const revealWrap = document.createElement("div");
  revealWrap.className = "weeks-reveal-wrap";
  const canvas = document.createElement("canvas");
  canvas.className = "weeks-canvas-clip";
  canvas.setAttribute("role", "img");
  const scanline = document.createElement("div");
  scanline.className = "weeks-scanline";
  scanline.setAttribute("aria-hidden", "true");
  revealWrap.append(canvas, scanline);
  scroller.appendChild(revealWrap);

  frame.append(gutter, scroller);
  card.appendChild(frame);
  root.appendChild(card);

  // Epigraph last (v2.0 -- reversed from v1.24's top placement to match the imported design's
  // closing-thought order: stats/bars -> grid -> reflective quote; see the CSS comment on
  // .weeks-epigraph for the full trail). The divider moves with it, now separating the grid
  // from the quote rather than the quote from the stats.
  const divider = document.createElement("div");
  divider.className = "weeks-divider";
  divider.setAttribute("aria-hidden", "true");
  root.appendChild(divider);

  const epigraph = document.createElement("div");
  epigraph.className = "weeks-epigraph";
  for (const line of EPIGRAPH) {
    const p = document.createElement("p");
    p.textContent = `${line.text} `;
    const attr = document.createElement("span");
    attr.className = "weeks-epigraph-attr";
    attr.textContent = line.attr;
    p.appendChild(attr);
    epigraph.appendChild(p);
  }
  root.appendChild(epigraph);

  chart = { canvas, ctx: canvas.getContext("2d"), scroller, gutter };

  redrawAll();

  if (window.ResizeObserver) {
    const onResize = debounce(() => redrawAll(), 120);
    new ResizeObserver(onResize).observe(frame);
  }
}

function refreshIfStale() {
  if (hktDateString(new Date()) !== lastDrawnDateHKT) redrawAll();
}

// Called once from app.js's boot() -- builds once, then just checks whether the HKT date has
// advanced since the last paint (idempotent, cheap; a defensive guard against a future second
// call, now that there's no tab-activation gate to rely on for that).
export function initWeeks() {
  if (!built) { build(); built = true; }
  refreshIfStale();
}

// Called from app.js's visibilitychange handler, which already exists to catch installed-
// iOS-PWA background freezes (v1.16) -- a week boundary can cross while backgrounded same as
// a day boundary can. No-ops if Weeks was never built (e.g. initWeeks() threw during boot).
export function refreshWeeksIfStale() {
  if (built) refreshIfStale();
}

// Called from app.js on every theme change. Pre-v2.0, grid colors were theme-scoped, so the
// memoized glow sprites had to be dropped here or the current-week markers would keep glowing
// in the PREVIOUS theme's colors after a toggle. v2.0 fixed person colors to single constants
// (Weeks no longer follows the page theme), so this is now a harmless no-visible-op kept for
// wiring symmetry rather than a functional necessity -- see makeGlowSprite()'s own comment
// above. No-ops if never built.
export function redrawWeeksForTheme() {
  jGlowSprite = null;
  bGlowSprite = null;
  if (built) redrawAll();
}
