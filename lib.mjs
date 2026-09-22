// lib.mjs — shared pure functions: HKT date/time + life-in-weeks math. The v1.0-v2.0
// rotation engine (BUILD-PLAN.md Appendix B) was retired in v3.0 with the Journal card;
// hktHour/isDarkWindowHKT went in v4.0 with the blossom theme they switched.
// Imported by both the browser (app.js, weeks.js) and Node (verify.mjs).

// Thousands-comma formatter (v2.0 redesign) -- the hero number, the bars, the milestone
// labels and the canvas aria-label all share one implementation instead of copies drifting.
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

// The DISPLAYED week is 1-indexed, so at weeksLived()'s clamp weeks+1 would read "week 4,681
// of 4,680" -- cap the display at the same total (real, though unreachable before ~2079).
// Lives here, not in a renderer, so the hero number, the bars and the canvas label can never
// disagree about which week it is.
export function displayWeek(weeks) {
  return Math.min(weeks + 1, LIFE_WEEKS_TOTAL);
}

// Percent of the grid's own total filled -- deliberately not percent-of-4000, so this can
// never nonsensically exceed 100% and always matches the grid's own visual fill ratio.
export function percentLifeSpent(birthMonthHKT, now = new Date()) {
  return (weeksLived(birthMonthHKT, now) / LIFE_WEEKS_TOTAL) * 100;
}

// v4.0 -- the "now" square fills day by day rather than flipping once a week, so the grid
// reads as moving. daysIntoWeek is 0..6 within the CURRENT age-week; fraction is (d+1)/7, i.e.
// the square is already 1/7 full on the first day of the week (a lived day is a lived day).
// Past the clamp there is no partial square left to fill, so it reports complete and the
// caller draws no now-marker at all.
export function weekProgress(birthMonthHKT, now = new Date()) {
  if (weeksLived(birthMonthHKT, now) >= LIFE_WEEKS_TOTAL) {
    return { daysIntoWeek: 6, fraction: 1, complete: true };
  }
  const days = hktDayNumber(now) - monthStartDayNumber(birthMonthHKT);
  const d = Math.max(0, days) % 7;
  return { daysIntoWeek: d, fraction: (d + 1) / 7, complete: false };
}

// v4.0 milestones -- the few week indices worth naming, built once here so the hero list and
// any future caller read the same table. Four sources: round week counts, the grid's own
// halfway mark, decade birthdays (age years * 52, the grid's own row arithmetic), and the last
// square. 4,000 carries the Burkeman attribution the epigraph already credits -- attribution,
// never an excerpt (invariant 2).
export const MILESTONE_WEEKS = (() => {
  const out = new Map();
  const add = (week, label) => { if (week <= LIFE_WEEKS_TOTAL && !out.has(week)) out.set(week, { week, label }); };
  add(LIFE_WEEKS_TOTAL, `${LIFE_WEEKS_YEARS} years · the last square`);
  add(4000, `week ${commas(4000)} · Burkeman's average life`);
  add(LIFE_WEEKS_TOTAL / 2, `halfway · week ${commas(LIFE_WEEKS_TOTAL / 2)}`);
  for (const years of [30, 40, 50, 60, 70, 80]) {
    add(years * LIFE_WEEKS_PER_ROW, `${years} years · week ${commas(years * LIFE_WEEKS_PER_ROW)}`);
  }
  for (const w of [1000, 1500, 2000, 2500, 3000, 3500, 4000]) add(w, `week ${commas(w)}`);
  return [...out.values()].sort((a, b) => a.week - b.week);
})();

// The next n milestones, nearest first. weeksUntil 0 means the current week IS the milestone
// (the caller renders "this week"), so the filter is >= 0, not > 0. Once weeksLived clamps at
// the grid end there is nothing ahead any more -- returns [] rather than re-offering the last
// square forever, which is what lets the hero switch to its own "the grid is full" line.
export function upcomingMilestones(birthMonthHKT, now = new Date(), n = 3) {
  const lived = weeksLived(birthMonthHKT, now);
  if (lived >= LIFE_WEEKS_TOTAL) return [];
  const out = [];
  for (const m of MILESTONE_WEEKS) {
    if (m.week < lived) continue;
    out.push({ label: m.label, week: m.week, weeksUntil: m.week - lived });
    if (out.length === n) break;
  }
  return out;
}
