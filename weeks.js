// weeks.js -- the Weeks tab: two "life in weeks" grids (J, B), canvas-rendered, zoomable.
// BUILD-PLAN.md v1.22. Lazily built on first tab activation, not at boot: a canvas inside a
// `hidden` panel has zero layout size at connect-time, so (unlike figure.js's always-visible
// element) there is no real size to retry-toward until the panel is actually shown.
import {
  hktDateString, weeksLived, percentLifeSpent,
  LIFE_WEEKS_TOTAL, LIFE_WEEKS_PER_ROW, LIFE_WEEKS_YEARS, LIFE_PEOPLE,
} from "./lib.mjs";

const DPR_CAP = 2;
const ZOOM_MULT = [1, 2, 3]; // multipliers of the dynamically-fit base pitch
const DOT_FRACTION = 0.7; // dot size as a fraction of the cell pitch; remainder is gap
const MIN_PITCH = 4;
const CAPTION = "An average human life is about four thousand weeks. Each square is one week — filled is spent, outlined is now. — after Oliver Burkeman";

function commas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function statLineText(id, weeks, pct) {
  return `${id} · week ${commas(weeks + 1)} of ${commas(LIFE_WEEKS_TOTAL)} · ${pct.toFixed(1)}%`;
}

function themeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

let built = false;
let zoomIndex = 0;
let lastDrawnDateHKT = null;
let zoomOutBtn = null;
let zoomInBtn = null;
const people = [];

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

// Cells are drawn in three batched passes (future / lived / current-week outline) rather
// than switching fillStyle per cell -- style changes, not fillRect calls, are what's
// actually expensive on canvas.
function drawGrid(person, pitch) {
  const { canvas, ctx } = person;
  sizeCanvas(canvas, ctx, pitch);
  const dot = Math.max(1, pitch * DOT_FRACTION);
  const offset = (pitch - dot) / 2;
  const weeks = weeksLived(person.birthMonthHKT, new Date());
  const total = LIFE_WEEKS_TOTAL;
  const personColor = themeColor(person.colorVar);
  const futureColor = themeColor("--week-future");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = futureColor;
  for (let w = weeks + 1; w < total; w++) {
    const row = Math.floor(w / LIFE_WEEKS_PER_ROW), col = w % LIFE_WEEKS_PER_ROW;
    ctx.fillRect(col * pitch + offset, row * pitch + offset, dot, dot);
  }

  ctx.fillStyle = personColor;
  for (let w = 0; w < weeks; w++) {
    const row = Math.floor(w / LIFE_WEEKS_PER_ROW), col = w % LIFE_WEEKS_PER_ROW;
    ctx.fillRect(col * pitch + offset, row * pitch + offset, dot, dot);
  }

  if (weeks < total) {
    const row = Math.floor(weeks / LIFE_WEEKS_PER_ROW), col = weeks % LIFE_WEEKS_PER_ROW;
    const lw = Math.max(1, pitch * 0.08);
    ctx.strokeStyle = personColor;
    ctx.lineWidth = lw;
    ctx.strokeRect(col * pitch + offset + lw / 2, row * pitch + offset + lw / 2, Math.max(0, dot - lw), Math.max(0, dot - lw));
  }

  canvas.setAttribute("aria-label", `${person.id} — life in weeks: ${commas(weeks)} of ${commas(total)} weeks filled`);
}

function redrawAll() {
  for (const p of people) {
    const pitch = fitPitch(p.scroller) * ZOOM_MULT[zoomIndex];
    drawGrid(p, pitch);
    p.gutter.style.setProperty("--pitch", `${pitch}px`);
    p.statEl.textContent = statLineText(p.id, weeksLived(p.birthMonthHKT, new Date()), percentLifeSpent(p.birthMonthHKT, new Date()));
  }
  lastDrawnDateHKT = hktDateString(new Date());
  if (zoomOutBtn) {
    zoomOutBtn.disabled = zoomIndex === 0;
    zoomInBtn.disabled = zoomIndex === ZOOM_MULT.length - 1;
  }
}

// Steps through 3 discrete levels (not continuous/pinch) -- keeps the scroll-anchor math
// tractable and each state a clean "big picture" / "individual dots" read, per the project-
// director pass this shipped from (see audits/decisions.md).
function setZoom(newIndex) {
  newIndex = Math.max(0, Math.min(ZOOM_MULT.length - 1, newIndex));
  if (newIndex === zoomIndex) return;
  const ratio = ZOOM_MULT[newIndex] / ZOOM_MULT[zoomIndex];
  zoomIndex = newIndex;
  const pending = people.map((p) => {
    const cw = p.scroller.clientWidth;
    return Math.max(0, (p.scroller.scrollLeft + cw / 2) * ratio - cw / 2);
  });
  redrawAll();
  people.forEach((p, i) => { p.scroller.scrollLeft = pending[i]; });
}

function build() {
  const root = document.getElementById("weeks-root");
  root.className = "weeks-root";

  const statsRow = document.createElement("div");
  statsRow.className = "weeks-stats";
  const statCol = document.createElement("div");
  statCol.className = "weeks-stat-col";

  const zoomRow = document.createElement("div");
  zoomRow.className = "weeks-zoom";
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
  zoomRow.append(zoomOutBtn, zoomInBtn);

  statsRow.append(statCol, zoomRow);
  root.appendChild(statsRow);

  const cardsWrap = document.createElement("div");
  cardsWrap.className = "weeks-cards";
  root.appendChild(cardsWrap);

  for (const person of LIFE_PEOPLE) {
    const colorVar = person.id === "J" ? "--person-j" : "--person-b";

    const statLine = document.createElement("div");
    statLine.className = "weeks-stat-line";
    statCol.appendChild(statLine);

    const card = document.createElement("div");
    card.className = "card weeks-card";

    const chip = document.createElement("div");
    chip.className = "card-chip";
    const swatch = document.createElement("span");
    swatch.className = "weeks-swatch";
    swatch.style.background = `var(${colorVar})`;
    swatch.setAttribute("aria-hidden", "true");
    chip.append(swatch, document.createTextNode(person.id));
    card.appendChild(chip);

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
    scroller.setAttribute("aria-label", `${person.id} life in weeks, scrollable`);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    scroller.appendChild(canvas);

    frame.append(gutter, scroller);
    card.appendChild(frame);
    cardsWrap.appendChild(card);

    people.push({
      id: person.id,
      birthMonthHKT: person.birthMonthHKT,
      colorVar,
      gutter, scroller, canvas,
      ctx: canvas.getContext("2d"),
      statEl: statLine,
    });
  }

  const caption = document.createElement("p");
  caption.className = "card-attr weeks-caption";
  caption.textContent = CAPTION;
  root.appendChild(caption);

  redrawAll();

  if (window.ResizeObserver) {
    const onResize = debounce(() => redrawAll(), 120);
    const ro = new ResizeObserver(onResize);
    people.forEach((p) => ro.observe(p.scroller.parentElement));
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
