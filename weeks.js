// weeks.js -- the Weeks tab: one combined "life in weeks" grid for J and B, canvas-rendered,
// zoomable, with a hover/tap highlight per person. BUILD-PLAN.md v1.23 (v1.22 shipped two
// separate grids; this redesign combines them -- see audits/decisions.md for the cell-state
// model). Lazily built on first tab activation, not at boot: a canvas inside a `hidden` panel
// has zero layout size at connect-time, so (unlike figure.js's always-visible element) there
// is no real size to retry-toward until the panel is actually shown.
import {
  hktDateString, weeksLived, percentLifeSpent,
  LIFE_WEEKS_TOTAL, LIFE_WEEKS_PER_ROW, LIFE_WEEKS_YEARS, LIFE_PEOPLE,
} from "./lib.mjs";

const DPR_CAP = 2;
const ZOOM_MULT = [1, 2, 3]; // multipliers of the dynamically-fit base pitch
const DOT_FRACTION = 0.7; // dot size as a fraction of the cell pitch; remainder is gap
const MIN_PITCH = 4;
const PALE_ALPHA = 0.25; // focus-mode de-emphasis for the non-focused person
// v1.24: the epigraph (fact, then reminder) -- moved to the top of the panel and given real
// display weight per live feedback. Both lines share one treatment (see styles.css) rather
// than being differentiated; they're one thought, ~2,000 years apart, not a hierarchy.
// Seneca's line is an ORIGINAL paraphrase, not a lifted translation -- the commonly published
// English rendering (Penguin/Costa; it's literally that edition's own subtitle) says "if you
// know how to USE it," confirmed via source lookup before landing here. "Spend" was chosen
// deliberately over "use": it's this tab's own established vocabulary (percent spent, filled
// squares = spent weeks), tying the epigraph and the instrument below it into one language.
const EPIGRAPH = [
  { text: "An average human life is about four thousand weeks.", attr: "— after Oliver Burkeman" },
  { text: "Life is long, if you know how to spend it.", attr: "— after Seneca" },
];

function commas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
// sprite technique figure.js uses for its glow (never per-frame shadowBlur). Person colors are
// fixed across themes, so these never need regenerating.
function makeGlowSprite(hex) {
  const [r, g, b] = hexToRgbArr(hex);
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const gctx = c.getContext("2d");
  const grad = gctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  // Peak alpha 0.28, not a near-solid 0.55 -- this glow sits UNDER an outline whose whole
  // point is a transparent, unfilled center ("this week isn't done yet"); found during
  // testing that a strong/wide glow visibly refilled that center and bled a full extra cell
  // into the split-grid's neighboring "both lived" cells, muddying their pure split colors.
  grad.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, size, size);
  return c;
}
function jGlow() { return jGlowSprite || (jGlowSprite = makeGlowSprite(themeColor("--person-j"))); }
function bGlow() { return bGlowSprite || (bGlowSprite = makeGlowSprite(themeColor("--person-b"))); }
function stampGlow(ctx, sprite, cx, cy, pitch) {
  const size = pitch * 1.35; // wide enough to read as glowing, not just tinted (Fable's UX
  // audit); still far from the original 2.2x that caused visible neighbor bleed, since the
  // fix that actually mattered was the alpha drop (0.55 -> 0.28), not the size alone.
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

  // J's current-week outline spans the FULL cell (matching B's), not just her half -- a
  // half-width sliver read as a rendering glitch next to B's full square (Fable's UX audit,
  // caught only by actually looking at the rendered grid, not by reading the code) and
  // silently implied her current week counted for less. The blue right-half fill (drawn
  // above, since B already lived that age-week) stays visible under the outline's right side.
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

// aria-label on a <button> replaces its visible children entirely for the accessible name --
// a screen-reader user hears ONLY the label, never the 34px percent or the week count next to
// it (confirmed via a real accessibility-tree snapshot during audit: the static "Highlight
// J's weeks" label was erasing the tab's own headline stat). Folding the live figures into
// the label itself, regenerated on every redraw alongside the visible text, keeps both in
// sync and makes the number the primary accessible content, not a skippable description.
// weeksLived() clamps to at most LIFE_WEEKS_TOTAL (a life that outruns the 90-year grid just
// stops advancing), but the DISPLAYED week is 1-indexed ("week N" means "N-1 fully complete,
// currently living the Nth") -- so at the clamp itself, weeks+1 reads "week 4,681 of 4,680",
// which is wrong on its face. Cap the display at the same total (found in code-correctness
// audit; unreachable before ~2079/2080 given the stored birth months, but a real bug, not a
// hypothetical one -- weeksLived(..., farFutureDate) genuinely returns exactly the clamp).
function displayWeek(weeks) {
  return Math.min(weeks + 1, LIFE_WEEKS_TOTAL);
}

function statLabel(id, weeks, pct) {
  return `${id}, week ${commas(displayWeek(weeks))} of ${commas(LIFE_WEEKS_TOTAL)}, ${pct.toFixed(1)}% of life. Highlight ${id}'s weeks.`;
}

function updateStats() {
  const now = new Date();
  const jW = weeksLived(jBirth, now), bW = weeksLived(bBirth, now);
  const jP = percentLifeSpent(jBirth, now), bP = percentLifeSpent(bBirth, now);
  jStat.meta.textContent = `J · week ${commas(displayWeek(jW))} of ${commas(LIFE_WEEKS_TOTAL)}`;
  jStat.pct.textContent = `${jP.toFixed(1)}%`;
  jStat.btn.setAttribute("aria-label", statLabel("J", jW, jP));
  bStat.meta.textContent = `B · week ${commas(displayWeek(bW))} of ${commas(LIFE_WEEKS_TOTAL)}`;
  bStat.pct.textContent = `${bP.toFixed(1)}%`;
  bStat.btn.setAttribute("aria-label", statLabel("B", bW, bP));
}

function syncFocusUI() {
  const eff = effectiveFocus();
  for (const s of [jStat, bStat]) {
    s.btn.setAttribute("aria-pressed", String(s.id === stickyFocus));
    s.btn.classList.toggle("is-active", s.id === eff);
  }
}

// A canvas inside a `display:none` (hidden-tab) ancestor reports zero client width -- bail
// out rather than size the grid down to MIN_PITCH and stamp a wrong lastDrawnDateHKT, which
// would otherwise make refreshIfStale() think it already redrew for today while hidden and
// skip the real redraw once the tab is actually shown again (found in pre-merge audit).
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

function buildStatButton(person, colorVar) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "weeks-stat";
  btn.dataset.person = person.id;
  btn.setAttribute("aria-pressed", "false");
  // No static aria-label here -- updateStats() sets the real one (folding in the live
  // week/percent figures) immediately after build(), before first paint.
  const meta = document.createElement("div");
  meta.className = "weeks-stat-meta";
  const pct = document.createElement("div");
  pct.className = "weeks-stat-pct";
  btn.append(meta, pct);

  btn.addEventListener("click", () => {
    stickyFocus = stickyFocus === person.id ? null : person.id;
    // Also sync hoverFocus to match -- without this, un-toggling by clicking a SECOND time
    // while the mouse is still sitting on the button (never left, so no mouseleave fires)
    // left stickyFocus correctly cleared but effectiveFocus() still returning the stale
    // hoverFocus, so the visual highlight (and aria-pressed's underlying reality) stuck
    // until the pointer physically moved away (found in code-correctness audit, reproduced
    // via two same-position clicks with no mouse movement between them). A real mouseenter/
    // mouseleave on this same button still updates hoverFocus independently afterward, so
    // this doesn't break the normal hover-preview-over-a-sticky-selection interaction.
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
  return { btn, meta, pct, id: person.id };
}

function build() {
  const root = document.getElementById("weeks-root");
  root.className = "weeks-root";

  // Epigraph first -- the frame you read before the instrument (v1.24: moved here from the
  // bottom, per live feedback that it needed to be seen up front, not discovered after
  // scrolling past the whole grid).
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

  const divider = document.createElement("div");
  divider.className = "weeks-divider";
  divider.setAttribute("aria-hidden", "true");
  root.appendChild(divider);

  const statsRow = document.createElement("div");
  statsRow.className = "weeks-stats";
  jStat = buildStatButton(LIFE_PEOPLE.find((p) => p.id === "J"), "--person-j");
  bStat = buildStatButton(LIFE_PEOPLE.find((p) => p.id === "B"), "--person-b");
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

// Called on every activation of the Weeks tab -- builds once, then just checks whether the
// HKT date has advanced since the last paint (idempotent, cheap).
export function initWeeksTab() {
  if (!built) { build(); built = true; }
  refreshIfStale();
}

// Called from app.js's visibilitychange handler, which already exists to catch installed-
// iOS-PWA background freezes (v1.16) -- a week boundary can cross while backgrounded same as
// a day boundary can. No-ops if the tab was never opened.
export function refreshWeeksIfStale() {
  if (built) refreshIfStale();
}

// Called from app.js's theme toggle -- future-cell fill and year labels follow the active
// theme's ink/muted tones; person colors (J pink, B blue) never do. No-ops if never built.
export function redrawWeeksForTheme() {
  if (built) redrawAll();
}
