// weeks.js -- the grid: one life in weeks, one person at a time. v4.0 replaced the v1.23
// combined two-person grid (every cell split pink/blue) and its +/- zoom with a person switch
// (owned by app.js's hero) and three named views -- Life, Decade, Year. The quiet-past rule is
// the whole point: the selected person's lived weeks are solid, the other person is present
// only as a faint lead band and a hairline outline on their own current week, so "now" is the
// one thing on screen that draws the eye. Canvas for the cells, one DOM overlay for the
// breathing now-marker (a CSS animation is cheaper and smoother than repainting a halo).
import {
  hktDateString, weeksLived, weekProgress, displayWeek, commas,
  LIFE_WEEKS_TOTAL, LIFE_WEEKS_PER_ROW, LIFE_PEOPLE,
} from "./lib.mjs";

const DPR_CAP = 2;
const DOT_FRACTION = 0.7; // dot size as a fraction of the cell pitch; remainder is gap
const MIN_PITCH = 4;
const BAND_ALPHA = 0.35; // the other person's already-lived lead, readable but quiet
const OTHER_MARK_ALPHA = 0.6; // the other person's own current-week outline
const ROW_RULE_ALPHA = 0.35;
const DECADE_TINT = "rgba(255,255,255,0.03)";

// The three views (item 5). cols/rows are the grid's shape; zoom multiplies the width-fitted
// pitch, which is what makes Decade scroll horizontally instead of shrinking to fit.
const VIEWS = {
  life: { id: "life", label: "Life", cols: 52, count: LIFE_WEEKS_TOTAL, zoom: 1 },
  decade: { id: "decade", label: "Decade", cols: 52, count: 520, zoom: 2 },
  year: { id: "year", label: "Year", cols: 13, count: 52, zoom: 1 },
};
const VIEW_ORDER = ["life", "decade", "year"];
const YEAR_GUTTER = ["wk 1", "wk 14", "wk 27", "wk 40"];

function themeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const birthOf = (id) => LIFE_PEOPLE.find((p) => p.id === id).birthMonthHKT;

let built = false;
let viewId = "life";
let personId = "J";
let lastDrawnDateHKT = null;
let chart = null; // { canvas, ctx, scroller, gutter, marker, tabs }

// The window of week indices this view shows. Decade/Year follow the selected person's own
// current week; past the clamp they pin to the last full window rather than running off the
// end of the grid (real, though unreachable before ~2079).
function windowFor(view, lived) {
  if (view.id === "life") return 0;
  const span = view.count;
  return Math.min(Math.floor(lived / span) * span, LIFE_WEEKS_TOTAL - span);
}

function fitPitch(view) {
  const w = chart.scroller.clientWidth || chart.scroller.parentElement.clientWidth;
  return Math.max(MIN_PITCH, (w / view.cols) * view.zoom);
}

function sizeCanvas(canvas, ctx, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// The removed legend (v1.24) explained the lead band as "only B, so far"; that information
// still has to survive for a screen-reader user, so it's folded into the one label that was
// already dynamic -- now with which person the grid is actually showing (v4.0).
function ariaLabelFor(Jw, Bw) {
  return `Life in weeks: J ${commas(displayWeek(Jw))} of ${commas(LIFE_WEEKS_TOTAL)}, ` +
    `B ${commas(displayWeek(Bw))} of ${commas(LIFE_WEEKS_TOTAL)}. Showing ${personId}. ` +
    `B has about a 13-month head start on J.`;
}

// Cells are drawn in batched fillStyle passes (future / lived / lead band, then the two
// markers), not per-cell style switches -- style changes, not fillRect calls, are what costs
// on canvas. The passes are disjoint on purpose: the band is a translucent colour, so painting
// it over a future cell rather than instead of one would composite into a third shade.
function drawGrid(view, pitch) {
  const { canvas, ctx } = chart;
  const now = new Date();
  const other = personId === "J" ? "B" : "J";
  const Pw = weeksLived(birthOf(personId), now);
  const Qw = weeksLived(birthOf(other), now);
  const prog = weekProgress(birthOf(personId), now);
  const start = windowFor(view, Pw);
  const cols = view.cols;
  const rows = view.count / cols;

  sizeCanvas(canvas, ctx, cols * pitch, rows * pitch);
  const dot = Math.max(1, pitch * DOT_FRACTION);
  const offset = (pitch - dot) / 2;
  const pColor = themeColor(personId === "J" ? "--person-j" : "--person-b");
  const qColor = themeColor(other === "J" ? "--person-j" : "--person-b");
  const futureColor = themeColor("--week-future");
  const inWindow = (w) => w >= start && w < start + view.count;
  // The band only exists when the other person is AHEAD -- B is always older, so it shows for
  // J and never for B. Structurally there is no "J-only lived" case, ever.
  const bandLo = Pw + 1, bandHi = Qw;
  const hasBand = Qw > Pw;

  function xy(w) {
    const i = w - start;
    return [(i % cols) * pitch + offset, Math.floor(i / cols) * pitch + offset];
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Structure (item 4): the current decade tinted, then decade rules, then the current row.
  if (view.id === "life" || view.id === "decade") {
    const decadeRow = Math.floor(Pw / (LIFE_WEEKS_PER_ROW * 10)) * 10 - start / cols;
    if (decadeRow >= 0 && decadeRow < rows) {
      ctx.fillStyle = DECADE_TINT;
      ctx.fillRect(0, decadeRow * pitch, cols * pitch, Math.min(10, rows - decadeRow) * pitch);
    }
    ctx.fillStyle = themeColor("--hairline");
    for (let r = 10; r < rows; r += 10) ctx.fillRect(0, Math.round(r * pitch) - 0.5, cols * pitch, 1);
  }

  ctx.fillStyle = futureColor;
  for (let w = start; w < start + view.count; w++) {
    if (w < Pw || w === Pw) continue;
    if (hasBand && w >= bandLo && w < bandHi) continue;
    const [x, y] = xy(w);
    ctx.fillRect(x, y, dot, dot);
  }

  ctx.fillStyle = pColor;
  for (let w = start; w < Math.min(Pw, start + view.count); w++) {
    const [x, y] = xy(w);
    ctx.fillRect(x, y, dot, dot);
  }

  if (hasBand) {
    ctx.fillStyle = hexToRgba(qColor, BAND_ALPHA);
    for (let w = Math.max(start, bandLo); w < Math.min(bandHi, start + view.count); w++) {
      const [x, y] = xy(w);
      ctx.fillRect(x, y, dot, dot);
    }
  }

  // The now cell (item 2): a future-coloured square filled bottom-up by the fraction of the
  // week already lived, then outlined. Bottom-up because the week fills the way a glass does.
  const showNow = !prog.complete && inWindow(Pw);
  if (showNow) {
    const [x, y] = xy(Pw);
    ctx.fillStyle = futureColor;
    ctx.fillRect(x, y, dot, dot);
    const h = Math.max(1, dot * prog.fraction);
    ctx.fillStyle = pColor;
    ctx.fillRect(x, y + dot - h, dot, h);
    ctx.strokeStyle = pColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, Math.max(1, dot - 1), Math.max(1, dot - 1));
    // The current row, underlined in the person's own colour.
    const row = Math.floor((Pw - start) / cols);
    ctx.fillStyle = hexToRgba(pColor, ROW_RULE_ALPHA);
    ctx.fillRect(0, Math.round((row + 1) * pitch) - 0.5, cols * pitch, 1);
  }
  if (Qw !== Pw && Qw < LIFE_WEEKS_TOTAL && inWindow(Qw)) {
    const [x, y] = xy(Qw);
    ctx.strokeStyle = hexToRgba(qColor, OTHER_MARK_ALPHA);
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, Math.max(1, dot - 1), Math.max(1, dot - 1));
  }

  canvas.setAttribute("aria-label", ariaLabelFor(
    weeksLived(birthOf("J"), now), weeksLived(birthOf("B"), now)
  ));

  return { start, cols, rows, pitch, dot, offset, Pw, showNow, color: pColor };
}

// The halo is a DOM element, not canvas paint: one CSS @keyframes breathing at figure.js's own
// 7s cycle costs nothing per frame and stops dead under prefers-reduced-motion, which a
// canvas-drawn glow would need its own rAF loop to do.
function placeMarker(geo) {
  const { marker } = chart;
  if (!geo.showNow) { marker.hidden = true; return; }
  const i = geo.Pw - geo.start;
  marker.hidden = false;
  marker.style.color = geo.color;
  marker.style.left = `${(i % geo.cols) * geo.pitch + geo.offset}px`;
  marker.style.top = `${Math.floor(i / geo.cols) * geo.pitch + geo.offset}px`;
  marker.style.width = `${geo.dot}px`;
  marker.style.height = `${geo.dot}px`;
}

// Gutter labels are the view's own scale (item 4): decade ages in Life, every age in Decade,
// week-of-year markers in Year. The selected person's current row is labelled "now" in their
// own colour -- the one place the gutter stops being a ruler and starts being a pointer.
function paintGutter(view, geo) {
  const { gutter } = chart;
  gutter.textContent = "";
  gutter.style.setProperty("--pitch", `${geo.pitch}px`);
  const nowRow = geo.showNow ? Math.floor((geo.Pw - geo.start) / geo.cols) : -1;
  for (let r = 0; r < geo.rows; r++) {
    const slot = document.createElement("div");
    slot.className = "weeks-yr";
    if (view.id === "year") {
      slot.textContent = YEAR_GUTTER[r] || "";
    } else if (r === nowRow) {
      slot.textContent = "now";
      slot.classList.add("is-now");
      slot.style.color = themeColor(personId === "J" ? "--person-j" : "--person-b");
    } else if (view.id === "decade" || r % 10 === 0) {
      slot.textContent = String(geo.start / geo.cols + r);
    }
    gutter.appendChild(slot);
  }
}

// Defensive: a scroller reporting zero client width (container not yet laid out, or a
// ResizeObserver firing mid-reflow) would draw at MIN_PITCH and stamp a wrong lastDrawnDateHKT,
// which would make refreshIfStale() skip the real redraw once real width is available.
function redrawAll(centerNow = false) {
  if (!chart || chart.scroller.clientWidth === 0) return;
  const view = VIEWS[viewId];
  const geo = drawGrid(view, fitPitch(view));
  paintGutter(view, geo);
  placeMarker(geo);
  lastDrawnDateHKT = hktDateString(new Date());
  if (centerNow && geo.showNow) {
    const x = ((geo.Pw - geo.start) % geo.cols) * geo.pitch;
    chart.scroller.scrollLeft = Math.max(0, x - chart.scroller.clientWidth / 2);
  }
}

function syncTabs() {
  for (const t of chart.tabs) {
    const on = t.dataset.view === viewId;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    t.classList.toggle("is-active", on);
  }
}

function setView(next) {
  if (!VIEWS[next] || next === viewId) return;
  viewId = next;
  syncTabs();
  redrawAll(next === "decade");
}

function buildViewSwitch(root) {
  const bar = document.createElement("div");
  bar.className = "view-switch";
  bar.setAttribute("role", "tablist");
  bar.setAttribute("aria-label", "Grid view");
  const tabs = VIEW_ORDER.map((id) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "view-tab";
    b.dataset.view = id;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(id === viewId));
    b.tabIndex = id === viewId ? 0 : -1;
    b.textContent = VIEWS[id].label;
    b.addEventListener("click", () => setView(id));
    bar.appendChild(b);
    return b;
  });
  // Roving-tabindex arrow keys: the tablist is one stop, arrows move within it.
  bar.addEventListener("keydown", (e) => {
    const i = VIEW_ORDER.indexOf(viewId);
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % VIEW_ORDER.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i + VIEW_ORDER.length - 1) % VIEW_ORDER.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VIEW_ORDER.length - 1;
    if (next === null) return;
    e.preventDefault();
    setView(VIEW_ORDER[next]);
    tabs[next].focus();
  });
  root.appendChild(bar);
  return tabs;
}

function build() {
  const root = document.getElementById("weeks-root");
  root.className = "weeks-root";

  const tabs = buildViewSwitch(root);

  const card = document.createElement("div");
  card.className = "weeks-card";
  card.setAttribute("role", "tabpanel");
  card.setAttribute("aria-label", "Life in weeks");
  const frame = document.createElement("div");
  frame.className = "weeks-frame";

  const gutter = document.createElement("div");
  gutter.className = "weeks-gutter";
  gutter.setAttribute("aria-hidden", "true");

  const scroller = document.createElement("div");
  scroller.className = "weeks-scroll";
  scroller.tabIndex = 0;
  scroller.setAttribute("role", "group");
  scroller.setAttribute("aria-label", "Life in weeks, scrollable");

  const revealWrap = document.createElement("div");
  revealWrap.className = "weeks-reveal-wrap";
  const canvas = document.createElement("canvas");
  canvas.className = "weeks-canvas-clip";
  canvas.setAttribute("role", "img");
  const scanline = document.createElement("div");
  scanline.className = "weeks-scanline";
  scanline.setAttribute("aria-hidden", "true");
  const marker = document.createElement("div");
  marker.className = "now-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.hidden = true;
  revealWrap.append(canvas, scanline, marker);
  scroller.appendChild(revealWrap);

  frame.append(gutter, scroller);
  card.appendChild(frame);
  root.appendChild(card);

  chart = { canvas, ctx: canvas.getContext("2d"), scroller, gutter, marker, tabs };
  syncTabs();
  redrawAll();

  if (window.ResizeObserver) {
    new ResizeObserver(debounce(() => redrawAll(), 120)).observe(frame);
  }
}

function refreshIfStale() {
  // The now square's fill changes every HKT day, not every week -- the daily check is what
  // keeps a backgrounded PWA from showing yesterday's fraction.
  if (hktDateString(new Date()) !== lastDrawnDateHKT) redrawAll();
}

export function initWeeks(person) {
  if (person) personId = person;
  if (!built) { build(); built = true; }
  refreshIfStale();
}

// Called by app.js's person switch: the grid is the same grid, re-aimed at the other life.
export function setWeeksPerson(person) {
  personId = person;
  if (built) redrawAll(viewId === "decade");
}

// Called from app.js's visibilitychange handler, which already exists to catch installed-
// iOS-PWA background freezes (v1.16). No-ops if Weeks was never built (e.g. initWeeks() threw
// during boot, which app.js paints as an error state).
export function refreshWeeksIfStale() {
  if (built) refreshIfStale();
}
