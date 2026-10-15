// app.js — the hero and the boot sequence (BUILD-PLAN.md §4). v4.0 removed the theme layer
// entirely (one dark theme, no toggle, no clock-driven switch) and gave the page a hero: the
// number first, then who it is about, then the bars and what is coming.
import {
  hktDateParts, hktDateString, weeksLived, percentLifeSpent, displayWeek,
  upcomingMilestones, commas, LIFE_WEEKS_TOTAL, LIFE_PEOPLE,
} from "./lib.mjs";
import { initWeeks, refreshWeeksIfStale, setWeeksPerson } from "./weeks.js";

// Epigraph pool (v4.1) -- curated paraphrases, same calm voice, person-independent.
// Attribution only ("— after …"), never excerpts; zero quotation-mark glyphs (invariant 2).
// One line shows at a time; initEpigraph() rotates with crossfade (see styles.css).
const EPIGRAPH = [
  { text: "An average human life is about four thousand weeks.", attr: "— after Oliver Burkeman" },
  { text: "Life is long, if you know how to spend it.", attr: "— after Seneca" },
  { text: "It is not that we have a short time to live, but that we waste much of it.", attr: "— after Seneca" },
  { text: "How we spend our days is how we spend our lives.", attr: "— after Annie Dillard" },
  { text: "Begin at once to live, and count each separate day as a full life.", attr: "— after Seneca" },
  { text: "The days are long, but the years are short.", attr: "— after Gretchen Rubin" },
  { text: "Lost time is never found again.", attr: "— after Benjamin Franklin" },
  { text: "You act like mortality is a rumour that applies to other people.", attr: "— after Seneca" },
  { text: "We reach the future at sixty minutes an hour, no matter who we are.", attr: "— after C.S. Lewis" },
  { text: "A person who dares to waste one hour of time has not discovered the value of life.", attr: "— after Charles Darwin" },
];

const EPIGRAPH_DWELL_MS = 16000;
const EPIGRAPH_DWELL_REDUCED_MS = 28000;
const EPIGRAPH_FADE_MS = 700;

const PEOPLE = LIFE_PEOPLE.map((p) => p.id);
let selected = "J";
let hero = null; // the live nodes renderHero() repaints

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

const birthOf = (id) => LIFE_PEOPLE.find((p) => p.id === id).birthMonthHKT;

function initDateLine() {
  const p = hktDateParts(new Date());
  document.getElementById("date-line").textContent =
    `${p.weekday} · ${p.day} ${p.month} ${p.year}`.toUpperCase();
}

// figure.js reads its colours off attributes; --pulse is read from the CSS once at boot rather
// than duplicated as a JS constant that could drift from styles.css (v1.29 pattern, kept).
function syncFigureColor() {
  const figure = document.getElementById("figure");
  if (!figure) return;
  const pulse = getComputedStyle(document.documentElement).getPropertyValue("--pulse").trim();
  if (!pulse) return;
  figure.setAttribute("color", pulse);
  figure.setAttribute("glow", pulse);
}

// Every number below comes from lib.mjs, never a literal -- the hero, the bars and the canvas
// are three renderings of the same two functions.
function fillEpigraphSlot(slot, line) {
  slot.textContent = "";
  slot.append(document.createTextNode(line.text + " "), el("span", "epigraph-attr", line.attr));
}

function initEpigraph(root, slotA, slotB) {
  if (EPIGRAPH.length === 0) return;
  let index = 0;
  let front = slotA;
  let back = slotB;
  fillEpigraphSlot(front, EPIGRAPH[0]);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer = null;
  let fading = false;
  let paused = false;

  function dwell() {
    return reduced.matches ? EPIGRAPH_DWELL_REDUCED_MS : EPIGRAPH_DWELL_MS;
  }

  function clearTimer() {
    if (timer !== null) { clearTimeout(timer); timer = null; }
  }

  function schedule() {
    clearTimer();
    if (paused || document.hidden || EPIGRAPH.length < 2) return;
    timer = setTimeout(advance, dwell());
  }

  function advance() {
    if (fading || paused || document.hidden || EPIGRAPH.length < 2) return;
    index = (index + 1) % EPIGRAPH.length;
    const next = EPIGRAPH[index];
    if (reduced.matches) {
      fillEpigraphSlot(front, next);
      schedule();
      return;
    }
    fading = true;
    fillEpigraphSlot(back, next);
    back.classList.add("is-active");
    back.removeAttribute("aria-hidden");
    front.classList.remove("is-active");
    front.setAttribute("aria-hidden", "true");
    const prev = front;
    front = back;
    back = prev;
    setTimeout(() => { fading = false; schedule(); }, EPIGRAPH_FADE_MS);
  }

  function syncPause() {
    paused = root.matches(":hover") || root.contains(document.activeElement);
    if (paused || document.hidden) clearTimer();
    else schedule();
  }

  root.addEventListener("mouseenter", syncPause);
  root.addEventListener("mouseleave", syncPause);
  root.addEventListener("focusin", syncPause);
  root.addEventListener("focusout", syncPause);
  document.addEventListener("visibilitychange", syncPause);
  reduced.addEventListener("change", () => { clearTimer(); schedule(); });
  schedule();
}

function renderHero(id) {
  const now = new Date();
  const lived = weeksLived(birthOf(id), now);
  const week = displayWeek(lived);
  const left = LIFE_WEEKS_TOTAL - week;
  const pct = percentLifeSpent(birthOf(id), now);
  const complete = lived >= LIFE_WEEKS_TOTAL;

  hero.figure.textContent = complete ? "0" : commas(left);
  hero.unit.textContent = "weeks left";
  hero.sub.textContent = complete
    ? `week ${commas(LIFE_WEEKS_TOTAL)} of ${commas(LIFE_WEEKS_TOTAL)} · every week from here is a bonus`
    : `week ${commas(week)} of ${commas(LIFE_WEEKS_TOTAL)} · ${pct.toFixed(1)}% lived`;

  for (const row of hero.bars) {
    const rLived = weeksLived(birthOf(row.id), now);
    const rPct = percentLifeSpent(birthOf(row.id), now);
    row.label.textContent = `${row.id} · ${rPct.toFixed(1)}% lived`;
    row.value.textContent = `${commas(LIFE_WEEKS_TOTAL - displayWeek(rLived))} left`;
    row.fill.style.width = `${rPct.toFixed(1)}%`;
    // The unselected row stays legible rather than dimmed: --muted label, neutral fill. Opacity
    // would have taken it under 4.5:1, which is not a trade this page makes (invariant 7).
    row.node.classList.toggle("is-selected", row.id === id);
  }

  hero.milestones.textContent = "";
  hero.milestones.setAttribute("aria-label", `Next milestones for ${id}`);
  const next = upcomingMilestones(birthOf(id), now, 3);
  if (next.length === 0) {
    const li = el("li", "milestone");
    li.append(el("span", "milestone-name", `${commas(LIFE_WEEKS_TOTAL)} weeks lived`),
      el("span", "milestone-when", "the grid is full"));
    hero.milestones.appendChild(li);
    return;
  }
  for (const m of next) {
    const li = el("li", "milestone" + (m.weeksUntil === 0 ? " is-now" : ""));
    li.append(el("span", "milestone-name", m.label),
      el("span", "milestone-when", m.weeksUntil === 0 ? "this week" : `in ${commas(m.weeksUntil)} weeks`));
    hero.milestones.appendChild(li);
  }
}

function selectPerson(id) {
  if (id === selected) return;
  selected = id;
  for (const b of hero.switchBtns) b.setAttribute("aria-checked", String(b.dataset.person === id));
  renderHero(id);
  setWeeksPerson(id);
}

// Radio-group keyboard pattern: arrows move the selection itself (not just focus), which is
// what a radiogroup is supposed to do.
function buildPersonSwitch() {
  const group = el("div", "person-switch");
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Whose weeks");
  const btns = PEOPLE.map((id) => {
    const b = el("button", "person-btn", id);
    b.type = "button";
    b.dataset.person = id;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(id === selected));
    b.addEventListener("click", () => selectPerson(id));
    group.appendChild(b);
    return b;
  });
  group.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const i = (PEOPLE.indexOf(selected) + step + PEOPLE.length) % PEOPLE.length;
    selectPerson(PEOPLE[i]);
    btns[i].focus();
  });
  return { group, btns };
}

function buildHero() {
  const root = document.getElementById("hero");
  const heading = el("h1", "hero-heading", "Where we are, what is left");
  heading.id = "hero-heading";
  root.appendChild(heading);

  const { group, btns } = buildPersonSwitch();
  root.appendChild(group);

  const number = el("div", "hero-number");
  number.setAttribute("aria-live", "polite");
  const figure = el("span", "hero-figure");
  const unit = el("span", "hero-unit");
  number.append(figure, unit);
  const sub = el("p", "hero-sub");
  root.append(number, sub);

  const epigraph = el("div", "epigraph");
  epigraph.setAttribute("role", "note");
  epigraph.setAttribute("aria-label", "Rotating reflections on time");
  // Two stacked lines for crossfade; only the active one's text is in the accessibility tree
  // via aria-hidden on the outgoing slot. No aria-live — rotations must not spam AT.
  const slotA = el("p", "epigraph-line is-active");
  const slotB = el("p", "epigraph-line");
  slotB.setAttribute("aria-hidden", "true");
  epigraph.append(slotA, slotB);
  root.appendChild(epigraph);
  initEpigraph(epigraph, slotA, slotB);

  const bars = el("div", "bars");
  const barRows = PEOPLE.map((id) => {
    const node = el("div", "bar-row");
    node.dataset.person = id;
    const top = el("div", "bar-head");
    const label = el("span", "bar-label");
    const value = el("span", "bar-value");
    top.append(label, value);
    const track = el("div", "bar-track");
    const fill = el("div", "bar-fill");
    track.appendChild(fill);
    node.append(top, track);
    bars.appendChild(node);
    return { id, node, label, value, fill };
  });
  root.appendChild(bars);

  const milestones = el("ul", "milestones");
  root.appendChild(milestones);

  hero = { figure, unit, sub, bars: barRows, milestones, switchBtns: btns };
  renderHero(selected);

  // The fills animate from 0 to their value: one frame at zero width, then the real width, so
  // the CSS transition has something to run from. Killed under reduced motion in styles.css.
  for (const row of barRows) {
    const target = row.fill.style.width;
    row.fill.style.width = "0%";
    requestAnimationFrame(() => requestAnimationFrame(() => { row.fill.style.width = target; }));
  }
}

// Weeks IS the page, so a build failure has to be visible -- there is no other content left to
// fall back to.
function renderWeeksError() {
  const root = document.getElementById("weeks-root");
  if (!root) return;
  root.className = "";
  root.textContent = "";
  const box = el("div", "weeks-error");
  box.append(el("div", "error-label", "NO GRID"),
    el("p", "error-msg", "Couldn't draw the weeks grid. Refresh, or try again later."));
  root.appendChild(box);
}

// v3.0: the 05:00 HKT content boundary retired with the daily pipeline -- nothing about the
// site is published on a schedule, so the only day boundary left is HKT midnight, which is
// what the date line, the hero number and the grid's fractional now-square all pivot on.
let paintedCalendarDateHKT = null;

function boot() {
  initDateLine();
  syncFigureColor();
  paintedCalendarDateHKT = hktDateString(new Date());
  try {
    buildHero();
    initWeeks(selected);
  } catch (e) {
    // Loud as well as visible: the error panel tells the user, the console tells whoever debugs.
    console.error("[mindset] initWeeks failed:", e);
    renderWeeksError();
  }
}

// Installed iOS PWAs freeze JS while backgrounded and resume the frozen render -- re-check the
// HKT calendar day on return (v1.28/v1.34; the theme boundary went with the theme in v4.0).
// Nothing is fetched here: the date line, the hero and the grid are all computed from the clock.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const now = new Date();
  if (hktDateString(now) !== paintedCalendarDateHKT) {
    paintedCalendarDateHKT = hktDateString(now);
    initDateLine();
    if (hero) renderHero(selected);
  }
  refreshWeeksIfStale();
});

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
