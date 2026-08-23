// app.js — UI logic: theme, date, the day's card, staleness, Weeks boot (BUILD-PLAN.md §4/§6)
import { hktDateParts, hktDateString, hktHour, staleness, expectedDateHKT, pickToday, isDarkWindowHKT } from "./lib.mjs";
import { initWeeks, refreshWeeksIfStale, redrawWeeksForTheme } from "./weeks.js";

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.appendChild(c);
  return node;
}

// Theme follows the HKT clock (dark 17:00–06:00, blossom the rest — isDarkWindowHKT), never
// localStorage (v1.29 retired mindset.theme; the toggle is a session-only override). A tap
// sets manualOverride so the visibilitychange recheck stops re-applying the clock; ONLY a
// fresh page load resets it — that's what makes "reload returns to the cycle" always true.
let manualOverride = false;

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "blossom";
}

// Status-bar color tracks whatever --bg resolves to for the active theme right now,
// not a per-theme JS table that could drift from the CSS (v1.28).
function syncThemeColorMeta() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  if (bg) meta.setAttribute("content", bg);
}

function applyThemeSideEffects() {
  syncThemeColorMeta();
  const figure = document.getElementById("figure");
  if (figure) {
    // Read the CSS's own --pulse, same pattern as syncThemeColorMeta (v1.29; replaces a
    // hardcoded per-theme map that could silently drift from styles.css).
    const pulse = getComputedStyle(document.documentElement).getPropertyValue("--pulse").trim();
    figure.setAttribute("color", pulse);
    figure.setAttribute("glow", pulse);
  }
  redrawWeeksForTheme();
}

function applyTheme(theme) {
  const dark = theme === "dark";
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // The pre-paint snippet set an inline color-scheme (so browser chrome is right before CSS
  // loads); inline outranks the theme blocks' declarations, so it must move with the theme.
  root.style.colorScheme = dark ? "dark" : "light";
  const btn = document.getElementById("theme-toggle");
  // Calm-era glyphs kept, meanings repurposed (v1.29): ◐ = pink active, tap for dark;
  // ❀ = dark active, tap for pink. Action-named label, deliberately no aria-pressed.
  btn.textContent = dark ? "❀" : "◐";
  const label = dark ? "Switch to pink theme" : "Switch to dark theme";
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
  applyThemeSideEffects();
}

function initTheme() {
  applyTheme(isDarkWindowHKT(new Date()) ? "dark" : "blossom");
  document.getElementById("theme-toggle").addEventListener("click", () => {
    manualOverride = true;
    applyTheme(currentTheme() === "dark" ? "blossom" : "dark");
  });
}

function initDateLine() {
  const p = hktDateParts(new Date());
  document.getElementById("date-line").textContent =
    `${p.weekday} · ${p.day} ${p.month} ${p.year}`.toUpperCase();
}

function showChip(mode) {
  const chip = document.getElementById("staleness-chip");
  if (mode === "fresh") { chip.hidden = true; return; }
  chip.hidden = false;
  chip.className = "chip " + (mode === "yesterday" ? "amber" : "slate");
  chip.textContent = mode === "yesterday" ? "yesterday's cards" : "offline rotation";
}

function renderJournalCard(journal) {
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "JOURNAL" }),
    el("p", { class: "card-body", text: journal.prompt }),
  ]);
}

function renderErrorCard() {
  return el("article", { class: "card error-card" }, [
    el("div", { class: "error-label", text: "NO DATA" }),
    el("p", { class: "error-msg", text: "Couldn't load today's cards. Refresh, or check back tomorrow." }),
  ]);
}

const ARRIVAL_BEAT_S = 0.3;

function paintCards(nodes) {
  const host = document.getElementById("cards");
  host.textContent = "";
  nodes.forEach((n, i) => {
    n.style.animationDelay = `${ARRIVAL_BEAT_S + i * 0.09}s`;
    host.appendChild(n);
  });
}

// v1.34: bounded with a timeout -- fetch() has no default one, and an unbounded hang here left
// dailyRefetchInFlight (below) stuck true forever, permanently disabling the next day's
// refetch. Every caller already handles a rejection (boot's .catch(), the refetch's second
// .then() arg), so a timeout-triggered abort just becomes an ordinary handled failure.
async function fetchJSON(path, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(path, { cache: "no-store", signal: controller.signal });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

let paintedDateHKT = null;
// Raw HKT calendar date (v1.34), distinct from paintedDateHKT's CONTENT day (05:00 pivot) --
// initDateLine() pivots at midnight, a gap no trigger below used to cover.
let paintedCalendarDateHKT = null;
let bootedToday = null;

// Offline rotation must agree with the live path on which day is "current": expectedDateHKT
// flips at 05:00 HKT but pickToday's day number flips at midnight, so 00:00-05:00 the
// fallback ran a day ahead. Same shift-back arithmetic as expectedDateHKT (v1.28).
function offlinePickReference(now) {
  return hktHour(now) >= 5 ? now : new Date(now.getTime() - 86400000);
}

function renderToday(cardsData, dailyData) {
  const now = new Date();
  let staleMode = staleness(dailyData && dailyData.dateHKT, now);

  let journal;
  if (staleMode === "fresh" || staleMode === "yesterday") {
    journal = cardsData.journal.find((j) => j.id === dailyData.journalId);
    if (!journal) {
      // An id that no longer resolves (pool edited, file not regenerated) is a freshness
      // problem: fall back to the offline pick, slate-chipped, not NO DATA over a loaded
      // library (v1.28); the error card is for the library itself failing (boot's catch).
      staleMode = "offline";
    }
  }
  if (staleMode === "offline") {
    ({ journal } = pickToday(cardsData, offlinePickReference(now)));
  }
  showChip(staleMode);

  // Content day, not raw calendar date (05:00 HKT boundary, matches staleness()).
  paintedDateHKT = expectedDateHKT(now);
  // Raw calendar date too (v1.34) -- see paintedCalendarDateHKT's own comment above for why
  // this is tracked separately from paintedDateHKT.
  paintedCalendarDateHKT = hktDateString(now);
  // No syncThemeColorMeta() here (v1.33 -- removed, not reintroduced): its v1.28 rationale was
  // re-syncing --bg when data-period changed, but data-period is gone since v1.31 and --bg is
  // keyed only by [data-theme]. Every path that can actually change the theme (initTheme() at
  // boot, the toggle handler, the visibilitychange window re-check) already calls applyTheme ->
  // applyThemeSideEffects -> syncThemeColorMeta itself; re-running it here on every card render
  // was always a no-op read of whatever --bg already resolved to.
  paintCards([renderJournalCard(journal)]);
}

async function boot() {
  initTheme();
  initDateLine();
  // v1.39: Weeks is part of the single page now, so it builds at boot rather than on a tab
  // activation -- its container is visible from load, the only condition build() ever needed.
  // Wrapped deliberately: boot() is called uncaught, so an exception in here (a canvas context
  // that fails to allocate, say) would otherwise reject the whole boot and leave the day's card
  // unrendered -- a failure mode that could not exist while Weeks was lazy behind a tab.
  try { initWeeks(); } catch (e) { /* Weeks is optional; the day's card is not */ }

  try {
    const [dailyData, cardsData] = await Promise.all([
      fetchJSON("./data/daily.json").catch(() => null),
      fetchJSON("./data/cards.json"),
    ]);
    bootedToday = { cardsData, dailyData };
    renderToday(cardsData, dailyData);
  } catch (e) {
    paintCards([renderErrorCard()]);
  }
}

// Installed iOS PWAs freeze JS while backgrounded and resume the frozen render — re-check every
// boundary on return: theme, content day, calendar day (v1.28/v1.29/v1.34; the focus-window
// boundary retired with focus mode in v1.39). Only a content-day flip REFETCHES daily.json
// (cron has almost certainly published overnight; on failure the cached object stands) -- a
// bare calendar-day flip just re-renders, same file.
let dailyRefetchInFlight = false;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const now = new Date();
  // A backgrounded resume can cross the 06:00/17:00 theme boundary too — re-apply the
  // clock's theme unless this session's toggle overrode it (v1.29).
  if (!manualOverride) {
    const want = isDarkWindowHKT(now) ? "dark" : "blossom";
    if (want !== currentTheme()) applyTheme(want);
  }
  if (bootedToday && expectedDateHKT(now) !== paintedDateHKT) {
    if (!dailyRefetchInFlight) {
      dailyRefetchInFlight = true;
      fetchJSON("./data/daily.json")
        .then((fresh) => { bootedToday.dailyData = fresh; }, () => {})
        .then(() => {
          dailyRefetchInFlight = false;
          initDateLine();
          renderToday(bootedToday.cardsData, bootedToday.dailyData);
        });
    }
  // v1.34: OR in a bare calendar-day flip -- see paintedCalendarDateHKT's comment above. No
  // refetch needed; same content day, same daily.json.
  } else if (bootedToday && hktDateString(now) !== paintedCalendarDateHKT) {
    initDateLine();
    renderToday(bootedToday.cardsData, bootedToday.dailyData);
  }
  refreshWeeksIfStale();
});

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
