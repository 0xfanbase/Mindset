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
export function expectedDateHKT(now = new Date()) {
  const parts = hktDateParts(now);
  const hktHour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", hour: "2-digit", hour12: false }).format(now)
  );
  if (hktHour >= 6) return hktDateString(now);
  const yesterday = new Date(now.getTime() - 86400000);
  return hktDateString(yesterday);
}

export function staleness(dailyDateHKT, now = new Date()) {
  if (!dailyDateHKT) return "offline";
  const expected = expectedDateHKT(now);
  if (dailyDateHKT === expected) return "fresh";
  const ageMs = now.getTime() - Date.parse(dailyDateHKT + "T00:00:00+08:00");
  if (ageMs <= 48 * 3600 * 1000) return "yesterday";
  return "offline";
}

export function pickToday(cards, now = new Date()) {
  const dayNumber = hktDayNumber(now);
  const anchor = cards.anchors[pickIndex(cards.anchors.length, dayNumber, "anchor")];
  const shift = cards.shifts[pickIndex(cards.shifts.length, dayNumber, "shift")];
  const word = cards.wordOfDay[pickIndex(cards.wordOfDay.length, dayNumber, "word")];
  return { anchor, shift, word, dayNumber };
}
