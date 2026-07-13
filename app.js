// app.js — UI logic: tabs, theme, date, cards, staleness (BUILD-PLAN.md §4/§6)
import { hktDateParts, staleness, pickToday } from "./lib.mjs";

const PULSE = { calm: "#7FB0FF", blossom: "#F2A9C6" };
const BG = { calm: "#FAF9F5", blossom: "#FBF4F6" };

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

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "blossom" ? "blossom" : "calm";
}

function applyThemeSideEffects(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", BG[theme]);
  const figure = document.getElementById("figure");
  if (figure) {
    figure.setAttribute("color", PULSE[theme]);
    figure.setAttribute("glow", PULSE[theme]);
  }
}

function initTheme() {
  let theme = "calm";
  try {
    const saved = localStorage.getItem("mindset.theme");
    if (saved === "calm" || saved === "blossom") theme = saved;
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);

  const btn = document.getElementById("theme-toggle");
  function paint(t) {
    btn.setAttribute("aria-pressed", String(t === "blossom"));
    btn.textContent = t === "calm" ? "◐" : "❀";
    applyThemeSideEffects(t);
  }
  paint(theme);

  btn.addEventListener("click", () => {
    const next = currentTheme() === "calm" ? "blossom" : "calm";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mindset.theme", next); } catch (e) {}
    paint(next);
  });
}

function initDateLine() {
  const p = hktDateParts(new Date());
  document.getElementById("date-line").textContent =
    `${p.weekday} · ${p.day} ${p.month} ${p.year}`.toUpperCase();
}

function initTabs() {
  const tabToday = document.getElementById("tab-today");
  const tabValues = document.getElementById("tab-values");
  const panelToday = document.getElementById("panel-today");
  const panelValues = document.getElementById("panel-values");

  function show(which) {
    const isToday = which === "today";
    tabToday.setAttribute("aria-selected", String(isToday));
    tabValues.setAttribute("aria-selected", String(!isToday));
    panelToday.hidden = !isToday;
    panelValues.hidden = isToday;
  }
  tabToday.addEventListener("click", () => show("today"));
  tabValues.addEventListener("click", () => show("values"));

  function keyNav(e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const goingToday = tabValues.getAttribute("aria-selected") === "true";
    show(goingToday ? "today" : "values");
    (goingToday ? tabToday : tabValues).focus();
  }
  tabToday.addEventListener("keydown", keyNav);
  tabValues.addEventListener("keydown", keyNav);
}

function showChip(mode) {
  const chip = document.getElementById("staleness-chip");
  if (mode === "fresh") { chip.hidden = true; return; }
  chip.hidden = false;
  chip.className = "chip " + (mode === "yesterday" ? "amber" : "slate");
  chip.textContent = mode === "yesterday" ? "yesterday's cards" : "offline rotation";
}

function validFreshUrl(u) {
  try { return new URL(u).protocol === "https:"; } catch (e) { return false; }
}

function renderAnchorCard(anchor) {
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "ANCHOR" }),
    el("p", { class: "card-body", text: anchor.text }),
    el("div", { class: "card-attr", text: anchor.attribution }),
  ]);
}

function renderShiftCard(shift) {
  const to = el("p", { class: "shift-to" });
  to.appendChild(el("span", { class: "arrow", text: "→ " }));
  to.appendChild(document.createTextNode(shift.to));
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "SHIFT" }),
    el("p", { class: "shift-from", text: shift.from }),
    to,
  ]);
}

function domainOf(url, fallback) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return fallback || ""; }
}

// Untrusted third-party content (RSS title/link) — textContent only, https-only URL,
// per BUILD-PLAN §4.5.3 / §6.1.
function renderFreshCard(fresh) {
  return el("a", { class: "card card-link", href: fresh.url, target: "_blank", rel: "noopener" }, [
    el("div", { class: "card-chip", text: "FRESH" }),
    el("p", { class: "card-body", text: fresh.title }),
    el("div", { class: "fresh-footer" }, [
      el("span", { class: "fresh-domain", text: domainOf(fresh.url, fresh.source) }),
      el("span", { class: "fresh-read", text: "Worth a look →" }),
    ]),
  ]);
}

function renderReserveCard(reserve) {
  return el("article", { class: "card" }, [
    el("div", { class: "card-chip", text: "FRESH" }),
    el("p", { class: "card-body", text: reserve.text }),
    el("div", { class: "fresh-footer" }, [
      el("span", { class: "card-attr", text: reserve.attribution }),
      el("span", { class: "fresh-reserve-label", text: "reserve shelf" }),
    ]),
  ]);
}

function renderErrorCard() {
  return el("article", { class: "card error-card" }, [
    el("div", { class: "error-label", text: "NO DATA" }),
    el("p", { class: "error-msg", text: "Couldn't load today's cards. Refresh, or check back tomorrow." }),
  ]);
}

function paintCards(nodes) {
  const host = document.getElementById("cards");
  host.textContent = "";
  nodes.forEach((n, i) => {
    n.style.animationDelay = `${i * 0.06}s`;
    host.appendChild(n);
  });
}

function renderValues(values) {
  const host = document.getElementById("values-list");
  host.textContent = "";
  for (const v of values) {
    host.appendChild(el("div", { class: "value-row" }, [
      el("div", { class: "value-name", text: v.name }),
      el("div", { class: "value-essence", text: v.essence }),
      el("div", { class: "value-behaviour", text: v.behaviour }),
    ]));
  }
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function renderToday(cardsData, dailyData) {
  const mode = staleness(dailyData && dailyData.dateHKT);
  showChip(mode);

  if (mode === "fresh" || mode === "yesterday") {
    const anchor = cardsData.anchors.find((a) => a.id === dailyData.anchorId);
    const shift = cardsData.shifts.find((s) => s.id === dailyData.shiftId);
    if (!anchor || !shift) { paintCards([renderErrorCard()]); return; }
    const freshOk = dailyData.fresh && dailyData.fresh.title && validFreshUrl(dailyData.fresh.url);
    const freshNode = freshOk
      ? renderFreshCard(dailyData.fresh)
      : renderReserveCard(pickToday(cardsData, new Date()).reserve);
    paintCards([renderAnchorCard(anchor), renderShiftCard(shift), freshNode]);
  } else {
    const { anchor, shift, reserve } = pickToday(cardsData, new Date());
    paintCards([renderAnchorCard(anchor), renderShiftCard(shift), renderReserveCard(reserve)]);
  }
}

async function boot() {
  initTheme();
  initDateLine();
  initTabs();

  let cardsData, valuesData, dailyData;
  try {
    [dailyData, cardsData, valuesData] = await Promise.all([
      fetchJSON("./data/daily.json").catch(() => null),
      fetchJSON("./data/cards.json"),
      fetchJSON("./data/values.json"),
    ]);
    renderValues(valuesData);
    renderToday(cardsData, dailyData);
  } catch (e) {
    paintCards([renderErrorCard()]);
  }
}

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
