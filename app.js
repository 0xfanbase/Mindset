// app.js — UI logic: tabs, theme, date, cards, staleness (BUILD-PLAN.md §4/§6)
import { hktDateParts, staleness, pickToday, isFocusWindowHKT, daysUntilKenyaTrip } from "./lib.mjs";

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

// Countdown to the 2026-08-15 flight (v1.17), shown only while the trip is still ahead --
// a countdown that goes negative the day after departure would read as a bug, not a feature,
// so the badge simply stops rendering once the trip has passed (kenya-facts content keeps
// rotating as normal either way).
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

function paintCards(nodes) {
  const host = document.getElementById("cards");
  host.classList.remove("focus");
  host.textContent = "";
  nodes.forEach((n, i) => {
    n.style.animationDelay = `${i * 0.09}s`;
    host.appendChild(n);
  });
}

// Pre-09:00 HKT: Journal stands alone, the other three sit behind a reveal toggle
// so they don't compete for attention before the morning's actual reflection (v1.16).
function paintFocusedToday(journalNode, restNodes) {
  const host = document.getElementById("cards");
  host.classList.add("focus");
  host.textContent = "";

  journalNode.style.animationDelay = "0s";
  host.appendChild(journalNode);

  const toggle = el("button", {
    type: "button", class: "reveal-rest",
    "aria-expanded": "false", "aria-controls": "cards-more",
    text: "show the rest",
  });
  const more = el("div", { id: "cards-more" }, restNodes);
  more.hidden = true;
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

let paintedFocusState = null;
let bootedToday = null;

function renderToday(cardsData, dailyData) {
  const mode = staleness(dailyData && dailyData.dateHKT);
  showChip(mode);

  let anchor, journal, kenya, word;
  if (mode === "fresh" || mode === "yesterday") {
    anchor = cardsData.anchors.find((a) => a.id === dailyData.anchorId);
    journal = cardsData.journal.find((j) => j.id === dailyData.journalId);
    kenya = cardsData.kenya.find((k) => k.id === dailyData.kenyaId);
    word = cardsData.wordOfDay.find((w) => w.id === dailyData.wordId);
    if (!anchor || !journal || !kenya || !word) { paintCards([renderErrorCard()]); return; }
  } else {
    ({ anchor, journal, kenya, word } = pickToday(cardsData, new Date()));
  }

  const rest = [renderAnchorCard(anchor), renderKenyaCard(kenya), renderWordCard(word)];
  paintedFocusState = isFocusWindowHKT(new Date());
  if (paintedFocusState) {
    paintFocusedToday(renderJournalCard(journal), rest);
  } else {
    paintCards([renderJournalCard(journal), ...rest]);
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
    bootedToday = { cardsData, dailyData };
    renderToday(cardsData, dailyData);
  } catch (e) {
    paintCards([renderErrorCard()]);
  }
}

// Installed iOS PWAs freeze JS while backgrounded and resume the frozen render on
// return, so an 08:45 open can still show the pre-09:00 focus mode at 11:00 if the
// user only switched apps and came back — re-check the boundary (not the network)
// whenever the tab becomes visible again, and only repaint if it actually flipped.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !bootedToday) return;
  if (isFocusWindowHKT(new Date()) !== paintedFocusState) {
    initDateLine();
    renderToday(bootedToday.cardsData, bootedToday.dailyData);
  }
});

boot();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
