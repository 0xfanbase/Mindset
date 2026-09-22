// lib.mjs — shared pure functions: HKT date/time + life-in-weeks math. The v1.0-v2.0
// rotation engine (BUILD-PLAN.md Appendix B) was retired in v3.0 with the Journal card.
// Imported by both the browser (app.js, weeks.js) and Node (verify.mjs).

// Thousands-comma formatter (v2.0 redesign) -- so weeks.js's total pill ("N,NNN WEEKS
// TOTAL") and its stat labels share one implementation instead of two copies drifting apart.
export function commas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function hktDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d); // "YYYY-MM-DD"
}

export function hktDayNumber(d = new Date()) {
  const [y, m, day] = hktDateString(d).split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, day) / 86400000);
}

export function hktDateParts(d = new Date()) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong", weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const o = {};
  for (const p of f.formatToParts(d)) o[p.type] = p.value;
  return o;
}

// The HKT hour, 0-23. Kept here rather than inline in app.js's DOM code so the clock model
// below it stays headlessly testable (the sole caller since the 05:00 content pivot retired).
export function hktHour(d = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", hour: "2-digit", hour12: false }).format(d)
  );
}

// Dark theme 17:00 HKT through 06:00 HKT (wraps midnight); blossom the rest. The two
// windows exactly partition the day — every HKT hour resolves to exactly one, by
// construction of this single boolean (not two separate predicates that could drift
// into disagreeing at a boundary). index.html's pre-paint snippet duplicates this exact
// expression (it can't import a module); verify.mjs pins the two against each other.
export function isDarkWindowHKT(now = new Date()) {
  const h = hktHour(now);
  return h < 6 || h >= 17;
}

// Weeks-of-life chart (v1.22) -- "life in weeks" for J and B (initials only, never real
// names, invariant 1). Anchored to birth MONTH-START only (no exact day given or needed at
// week granularity), same epoch-day idiom as hktDayNumber itself. 90 years, not the literal
// 4,000-week/77 -- real headroom against HK life expectancy, so the grid can't visibly
// "complete" while its subject is alive -- see audits/decisions.md.
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
