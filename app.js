// app.js — UI logic: tabs, theme, date, cards, staleness (BUILD-PLAN.md §4/§6)
import { hktDateParts, hktHour, staleness, expectedDateHKT, pickToday, isFocusWindowHKT, isDarkWindowHKT, daysUntilKenyaTrip } from "./lib.mjs";
import { initWeeksTab, refreshWeeksIfStale, redrawWeeksForTheme } from "./weeks.js";
import { initMaraTab } from "./mara.js";

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

// Ordered array, not a hardcoded boolean toggle -- the Weeks tab (v1.22) made a two-way
// today/values flip insufficient. Arrow keys roll with wraparound, matching the standard
// ARIA tablist roving-focus pattern.
function initTabs() {
  const tabs = ["today", "values", "weeks", "mara"].map((name) => ({
    name,
    btn: document.getElementById(`tab-${name}`),
    panel: document.getElementById(`panel-${name}`),
  }));

  function show(index) {
    tabs.forEach((t, i) => {
      const active = i === index;
      t.btn.setAttribute("aria-selected", String(active));
      t.panel.hidden = !active;
    });
    if (tabs[index].name === "weeks") initWeeksTab();
    if (tabs[index].name === "mara") initMaraTab();
  }

  tabs.forEach((t, i) => {
    t.btn.addEventListener("click", () => show(i));
    t.btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (i + dir + tabs.length) % tabs.length;
      show(next);
      tabs[next].btn.focus();
    });
  });
}

function showChip(mode) {
  const chip = document.getElementById("staleness-chip");
  if (mode === "fresh") { chip.hidden = true; return; }
  chip.hidden = false;
  chip.className = "chip " + (mode === "yesterday" ? "amber" : "slate");
  chip.textContent = mode === "yesterday" ? "yesterday's cards" : "offline rotation";
}

function renderAnchorCard(anchor) {
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "ANCHOR" }),
    el("p", { class: "card-body", text: anchor.text }),
    el("div", { class: "card-attr", text: anchor.attribution }),
  ]);
}

function renderJournalCard(journal) {
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "JOURNAL" }),
    el("p", { class: "card-body", text: journal.prompt }),
  ]);
}

// Countdown to the 2026-08-15 flight (v1.17) -- a negative countdown would read as a bug,
// so the badge stops rendering once the trip passes (facts keep rotating either way).
function kenyaCountdownText(days) {
  if (days > 1) return { label: `${days} DAYS`, aria: `${days} days until the Kenya trip` };
  if (days === 1) return { label: "1 DAY", aria: "1 day until the Kenya trip" };
  if (days === 0) return { label: "TODAY", aria: "The Kenya trip departs today" };
  return null;
}

function renderKenyaCard(kenya) {
  const top = el("div", { class: "card-top" }, [el("div", { class: "card-chip", text: "KENYA" })]);
  const countdown = kenyaCountdownText(daysUntilKenyaTrip(new Date()));
  if (countdown) {
    top.appendChild(el("div", { class: "kenya-countdown", "aria-label": countdown.aria, text: countdown.label }));
  }
  return el("article", { class: "card" }, [
    top,
    el("p", { class: "card-body", text: kenya.fact }),
    el("div", { class: "card-attr", text: `— ${kenya.category}` }),
  ]);
}

function speak(text, lang) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
}

function renderWordCard(word) {
  const titleRow = el("div", { class: "word-title-row" }, [
    el("div", { class: "word-title", text: word.word }),
  ]);
  if ("speechSynthesis" in window) {
    const speakBtn = el("button", {
      type: "button", class: "word-speak", "aria-label": `Pronounce ${word.word}`, title: "Pronounce",
    });
    speakBtn.textContent = "🔊";
    speakBtn.addEventListener("click", () => speak(word.word, word.lang));
    titleRow.appendChild(speakBtn);
  }
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "WORD" }),
    titleRow,
    el("p", { class: "card-body", text: word.meaning }),
    el("div", { class: "card-attr", text: `— ${word.origin}` }),
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
  host.classList.remove("focus");
  host.textContent = "";
  nodes.forEach((n, i) => {
    n.style.animationDelay = `${ARRIVAL_BEAT_S + i * 0.09}s`;
    host.appendChild(n);
  });
}

// Pre-09:00 HKT: Journal stands alone, the rest behind a reveal toggle so they don't compete
// for morning attention (v1.16).
function paintFocusedToday(leadNode, restNodes) {
  const host = document.getElementById("cards");
  host.classList.add("focus");
  host.textContent = "";

  leadNode.style.animationDelay = `${ARRIVAL_BEAT_S}s`;
  host.appendChild(leadNode);

  const toggle = el("button", {
    type: "button", class: "reveal-rest",
    "aria-expanded": "false", "aria-controls": "cards-more",
    text: "show the rest",
  });
  const more = el("div", { id: "cards-more" }, restNodes);
  more.hidden = true;
  // No arrival beat (v1.28): these animate on each "show the rest" click, and v1.18's beat
  // was a page-arrival treatment — a click should answer from zero, not re-pause.
  restNodes.forEach((n, i) => { n.style.animationDelay = `${i * 0.09}s`; });

  toggle.addEventListener("click", () => {
    const revealing = more.hidden;
    more.hidden = !revealing;
    toggle.setAttribute("aria-expanded", String(revealing));
    toggle.textContent = revealing ? "hide the rest" : "show the rest";
  });

  host.appendChild(toggle);
  host.appendChild(more);
}

function renderValues(values) {
  const host = document.getElementById("values-list");
  host.textContent = "";
  values.forEach((v, i) => {
    const row = el("div", { class: "value-row" }, [
      el("div", { class: "value-name", text: v.name }),
      el("div", { class: "value-essence", text: v.essence }),
      el("div", { class: "value-behaviour", text: v.behaviour }),
    ]);
    row.style.animationDelay = `${i * 0.06}s`;
    host.appendChild(row);
  });
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// Two-state read of "what part of the day is it" -- focus (pre-09:00, Journal leads alone) or
// normal (flat four-card layout) (v1.16; the evening/Closing third state retired in v1.31 --
// unused). Deliberately independent of the THEME clock (dark 17:00-06:00) -- two clocks, four
// combined states per HKT day: dark+focus 00-06, blossom+focus 06-09, blossom+normal 09-17,
// dark+normal 17-24.
function windowMode(now) {
  return isFocusWindowHKT(now) ? "focus" : "normal";
}

let paintedWindowMode = null;
let paintedDateHKT = null;
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

  let anchor, journal, kenya, word;
  if (staleMode === "fresh" || staleMode === "yesterday") {
    anchor = cardsData.anchors.find((a) => a.id === dailyData.anchorId);
    journal = cardsData.journal.find((j) => j.id === dailyData.journalId);
    kenya = cardsData.kenya.find((k) => k.id === dailyData.kenyaId);
    word = cardsData.wordOfDay.find((w) => w.id === dailyData.wordId);
    if (!anchor || !journal || !kenya || !word) {
      // An id that no longer resolves (pool edited, file not regenerated) is a freshness
      // problem: fall back to the offline pick, slate-chipped, not NO DATA over a loaded
      // library (v1.28); the error card is for the library itself failing (boot's catch).
      staleMode = "offline";
    }
  }
  if (staleMode === "offline") {
    ({ anchor, journal, kenya, word } = pickToday(cardsData, offlinePickReference(now)));
  }
  showChip(staleMode);

  const rest = [renderAnchorCard(anchor), renderKenyaCard(kenya), renderWordCard(word)];
  const winMode = windowMode(now);
  paintedWindowMode = winMode;
  // Content day, not raw calendar date (05:00 HKT boundary, matches staleness()).
  paintedDateHKT = expectedDateHKT(now);
  // No syncThemeColorMeta() here (v1.33 -- removed, not reintroduced): its v1.28 rationale was
  // re-syncing --bg when data-period changed, but data-period is gone since v1.31 and --bg is
  // keyed only by [data-theme]. Every path that can actually change the theme (initTheme() at
  // boot, the toggle handler, the visibilitychange window re-check) already calls applyTheme ->
  // applyThemeSideEffects -> syncThemeColorMeta itself; re-running it here on every card render
  // was always a no-op read of whatever --bg already resolved to.
  if (winMode === "focus") {
    paintFocusedToday(renderJournalCard(journal), rest);
  } else {
    paintCards([renderJournalCard(journal), ...rest]);
  }
}

function renderValuesError() {
  const host = document.getElementById("values-list");
  host.textContent = "";
  host.appendChild(el("p", { class: "values-empty", text: "Couldn't load values. Refresh to try again." }));
}

async function boot() {
  initTheme();
  initDateLine();
  initTabs();

  // Values renders (or quietly fails) on its own — one bad values.json must not blank
  // Today, nor a Today failure blank Values (v1.28; one Promise.all coupled all three).
  fetchJSON("./data/values.json").then(renderValues).catch(renderValuesError);

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

// Installed iOS PWAs freeze JS while backgrounded and resume the frozen render — re-check
// every boundary on return: theme window, content day, focus window (v1.28/v1.29). A
// content-day flip REFETCHES daily.json first (the cron has almost certainly published
// overnight; on failure the cached object stands). A mode flip alone never fetches — same
// day, same file (v1.16).
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
  } else if (bootedToday && windowMode(now) !== paintedWindowMode) {
    initDateLine();
    renderToday(bootedToday.cardsData, bootedToday.dailyData);
  }
  refreshWeeksIfStale();
});

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
