// lib.mjs — shared pure functions (BUILD-PLAN.md Appendix B, verbatim + hktDateParts)
// Imported by both the browser (app.js, drop.js) and Node (scripts/, verify.mjs).
export function hktDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d); // "YYYY-MM-DD"
}

export function hktDayNumber(d = new Date()) {
  const [y, m, day] = hktDateString(d).split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, day) / 86400000);
}

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickIndex(poolSize, dayNumber, salt) {
  const cycle = Math.floor(dayNumber / poolSize);
  const rand = mulberry32(xmur3(`${salt}:${cycle}`)());
  const order = [...Array(poolSize).keys()];
  for (let i = poolSize - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order[dayNumber % poolSize];
}

export function hktDateParts(d = new Date()) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong", weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const o = {};
  for (const p of f.formatToParts(d)) o[p.type] = p.value;
  return o;
}

// Pure staleness/fallback selection — kept here (not inline in app.js's DOM code)
// so it's headlessly testable under node:test (BUILD-PLAN §6.3.4).
export function hktHour(d = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", hour: "2-digit", hour12: false }).format(d)
  );
}

export function expectedDateHKT(now = new Date()) {
  if (hktHour(now) >= 5) return hktDateString(now);
  const yesterday = new Date(now.getTime() - 86400000);
  return hktDateString(yesterday);
}

// Pre-09:00 HKT "focus window" — Journal-first morning UI hides the other three
// cards behind a reveal toggle so they don't compete with the journal prompt (v1.16).
export function isFocusWindowHKT(now = new Date()) {
  return hktHour(now) < 9;
}

// After 20:00 HKT: a "Closing" reflection leads, paired with a low-stimulation palette
// (data-period="evening" in app.js/styles.css). Non-overlapping with isFocusWindowHKT by
// construction (hktHour is never simultaneously < 9 and >= 20).
export function isEveningWindowHKT(now = new Date()) {
  return hktHour(now) >= 20;
}

export function staleness(dailyDateHKT, now = new Date()) {
  if (!dailyDateHKT) return "offline";
  const expected = expectedDateHKT(now);
  if (dailyDateHKT === expected) return "fresh";
  const ageMs = now.getTime() - Date.parse(dailyDateHKT + "T00:00:00+08:00");
  if (ageMs <= 48 * 3600 * 1000) return "yesterday";
  return "offline";
}

// Kenya trip countdown (v1.17) — the flight departs 2026-08-15, HKT-anchored like every
// other date in this app (invariant 8). Day-number diffing (not ms subtraction) reuses the
// exact same epoch-day mechanism as hktDayNumber/pickIndex, so it can't drift from a DST edge
// case or an odd local-clock offset the way `new Date(future) - new Date(now)` could.
const KENYA_TRIP_DATE_HKT = "2026-08-15";

export function daysUntilKenyaTrip(now = new Date()) {
  const [y, m, day] = KENYA_TRIP_DATE_HKT.split("-").map(Number);
  const tripDayNumber = Math.floor(Date.UTC(y, m - 1, day) / 86400000);
  return tripDayNumber - hktDayNumber(now);
}

export function pickToday(cards, now = new Date()) {
  const dayNumber = hktDayNumber(now);
  const anchor = cards.anchors[pickIndex(cards.anchors.length, dayNumber, "anchor")];
  const journal = cards.journal[pickIndex(cards.journal.length, dayNumber, "journal")];
  const kenya = cards.kenya[pickIndex(cards.kenya.length, dayNumber, "kenya")];
  const word = cards.wordOfDay[pickIndex(cards.wordOfDay.length, dayNumber, "word")];
  const closing = cards.closing[pickIndex(cards.closing.length, dayNumber, "closing")];
  return { anchor, journal, kenya, word, closing, dayNumber };
}

// Weeks-of-life chart (v1.22) -- a "life in weeks" grid for J and B (initials only, never
// real names, per invariant 1). Anchored to each person's birth MONTH-START only -- no exact
// day was given or is needed at week-level granularity -- via the same epoch-day idiom as
// daysUntilKenyaTrip/hktDayNumber, so it can't drift on a DST/local-clock edge case. 90 years
// (not the literal 4,000-week/77-year average) so the grid has real headroom against Hong
// Kong life expectancy rather than risk "completing" while its subject is alive -- see
// audits/decisions.md.
export const LIFE_WEEKS_YEARS = 90;
export const LIFE_WEEKS_PER_ROW = 52;
export const LIFE_WEEKS_TOTAL = LIFE_WEEKS_YEARS * LIFE_WEEKS_PER_ROW;

export const LIFE_PEOPLE = [
  { id: "J", birthMonthHKT: "1989-12" },
  { id: "B", birthMonthHKT: "1988-11" },
];

function monthStartDayNumber(monthHKT) {
  const [y, m] = monthHKT.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, 1) / 86400000);
}

// Weeks fully lived (0-indexed count) as of `now`, clamped to the grid so a life that
// outruns 90 years just stops advancing rather than indexing past the array.
export function weeksLived(birthMonthHKT, now = new Date()) {
  const w = Math.floor((hktDayNumber(now) - monthStartDayNumber(birthMonthHKT)) / 7);
  return Math.max(0, Math.min(LIFE_WEEKS_TOTAL, w));
}

// Percent of the grid's own total filled -- deliberately not percent-of-4000, so this can
// never nonsensically exceed 100% and always matches the grid's own visual fill ratio.
export function percentLifeSpent(birthMonthHKT, now = new Date()) {
  return (weeksLived(birthMonthHKT, now) / LIFE_WEEKS_TOTAL) * 100;
}
