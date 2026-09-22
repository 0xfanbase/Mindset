// app.js — UI logic: theme, HKT date line, Weeks boot (BUILD-PLAN.md §4)
import { hktDateParts, hktDateString, isDarkWindowHKT } from "./lib.mjs";
import { initWeeks, refreshWeeksIfStale, redrawWeeksForTheme } from "./weeks.js";

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
  // v2.0: the visible mark is now a static CSS-drawn half-circle (styles.css's
  // .theme-toggle::before), not a swapped glyph (retired ◐/❀ Calm-era icons) -- only the
  // label/title (the real state carrier) still changes here. Deliberately no aria-pressed
  // (action-named label, not a toggle-state one).
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

// v3.0: Weeks IS the page, so a build failure has to be visible -- there is no other content
// left to fall back to. Replaces the old silent swallow (Weeks used to be the optional second
// zone under a card that carried the page on its own).
function renderWeeksError() {
  const root = document.getElementById("weeks-root");
  if (!root) return;
  root.className = "";
  root.textContent = "";
  const box = document.createElement("div");
  box.className = "weeks-error";
  const label = document.createElement("div");
  label.className = "error-label";
  label.textContent = "NO GRID";
  const msg = document.createElement("p");
  msg.className = "error-msg";
  msg.textContent = "Couldn't draw the weeks grid. Refresh, or try again later.";
  box.append(label, msg);
  root.appendChild(box);
}

// v3.0: the 05:00 HKT content boundary retired with the daily pipeline -- nothing about the
// site is published on a schedule any more, so the only day boundary left is HKT midnight,
// which is exactly what the date line and the grid both pivot on.
let paintedCalendarDateHKT = null;

function boot() {
  initTheme();
  initDateLine();
  paintedCalendarDateHKT = hktDateString(new Date());
  try {
    initWeeks();
  } catch (e) {
    // Loud as well as visible: the error panel tells the user, the console tells whoever debugs.
    console.error("[mindset] initWeeks failed:", e);
    renderWeeksError();
  }
}

// Installed iOS PWAs freeze JS while backgrounded and resume the frozen render — re-check
// every boundary on return: theme, then the HKT calendar day (v1.28/v1.29/v1.34; the
// focus-window boundary retired with focus mode in v1.39, the content-day/refetch branch with
// the daily pipeline in v3.0). Nothing is fetched here: both the date line and the grid are
// computed from the clock.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const now = new Date();
  // A backgrounded resume can cross the 06:00/17:00 theme boundary too — re-apply the
  // clock's theme unless this session's toggle overrode it (v1.29).
  if (!manualOverride) {
    const want = isDarkWindowHKT(now) ? "dark" : "blossom";
    if (want !== currentTheme()) applyTheme(want);
  }
  if (hktDateString(now) !== paintedCalendarDateHKT) {
    paintedCalendarDateHKT = hktDateString(now);
    initDateLine();
  }
  refreshWeeksIfStale();
});

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
