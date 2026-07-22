#!/usr/bin/env node
// scripts/verify.mjs — stage-gated verification harness (BUILD-PLAN.md Appendix A, v1.1)
// Node >= 20, zero deps. Usage: node scripts/verify.mjs <stage0..stage5|all>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] || "all";
const results = [];

function abs(p) { return path.join(ROOT, p); }
function exists(p) { return fs.existsSync(abs(p)); }
function read(p) { return fs.readFileSync(abs(p), "utf8"); }
function sizeOf(p) { return fs.statSync(abs(p)).size; }
function readJSON(p) { return JSON.parse(read(p)); }

// Plain `node --check <path>` on a bare .js file is unreliable here: this repo has no
// package.json to declare "type":"module", so a .js file's CommonJS-vs-ESM handling is
// sniffed rather than explicit, and that sniffing can silently under-report real syntax
// errors once a top-level import/export is present (found empirically during a v1.22 audit:
// a file with a leading `import` plus a later stray invalid token parsed clean under plain
// `--check <path>`, but the identical bytes correctly failed both `--check
// --input-type=module` and a real `import()`). .mjs files are unaffected -- the extension
// alone is unambiguous -- but every browser-facing .js file in this repo uses import/export,
// so piping content through stdin with an explicit --input-type=module is the only reliable
// syntax-only check (no top-level execution, so app.js/figure.js/weeks.js's browser-global
// references never need to actually resolve).
function nodeCheckSyntax(p) {
  require("node:child_process").execFileSync(
    process.execPath, ["--input-type=module", "--check"], { input: read(p), stdio: ["pipe", "pipe", "pipe"] }
  );
}

function check(stage, name, fn) {
  try {
    const detail = fn();
    // Store the raw value, NOT String(detail) -- an async fn() returns a pending Promise
    // here (it hasn't rejected yet even if it eventually will), and stringifying it
    // immediately collapses it to the literal text "[object Promise]", a plain string with
    // no .then method. The tail-loop below exists specifically to await promise-returning
    // checks after the stage runners return, but it can only find them by duck-typing
    // .then -- if this line coerces to a string first, that duck-type check always misses
    // and the tail loop's re-await never fires, silently passing every async check
    // regardless of what it actually asserts (found by Fable's pre-merge audit, confirmed
    // by mutation: a deliberately-broken invariant still reported green before this fix).
    results.push({ stage, name, pass: true, detail: detail === undefined ? "ok" : detail });
  } catch (e) {
    results.push({ stage, name, pass: false, detail: e.message });
  }
}

// ---------- shared helpers ----------

function hexToRgb(hex) {
  hex = hex.replace("#", "").trim();
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(hexA, hexB) {
  const L1 = relLuminance(hexA), L2 = relLuminance(hexB);
  const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function extractBlock(css, selectorRegex) {
  const m = selectorRegex.exec(css);
  if (!m) return null;
  const start = css.indexOf("{", m.index);
  if (start === -1) return null;
  let depth = 1, i = start + 1;
  while (depth > 0 && i < css.length) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
    i++;
  }
  return css.slice(start + 1, i - 1);
}
function extractTokens(css, selectorRegex) {
  const block = extractBlock(css, selectorRegex);
  if (block === null) return {};
  const tokens = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let mm;
  while ((mm = re.exec(block))) tokens[mm[1]] = mm[2].trim();
  return tokens;
}
function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

// quotation-mark glyphs that count as "verbatim quote" markers — an ASCII apostrophe
// used intra-word (contraction/possessive) is explicitly allowed (invariant 2).
const QUOTE_GLYPHS = /["“”‘’]/;
// A matched PAIR of straight apostrophes used as quote delimiters ('like this') — separate
// from QUOTE_GLYPHS above, which only ever covered curly quotes and the ASCII double-quote.
// A v1.23 audit found this codebase's long-standing claim that "a leading/trailing/isolated
// ' would still be flagged" was never actually true (`'quoted like this'` passed clean):
// U+0027 was never a member of QUOTE_GLYPHS, so no amount of intra-word stripping upstream
// could ever have made it match. The straightforward fix — just adding U+0027 to
// QUOTE_GLYPHS — was tried and reverted after it flagged real, correct, already-shipped
// content: English plural possessives ("runners'", "the dogs' toys") end in exactly the
// same "letter + apostrophe + non-letter" shape as a closing quote mark, so a single trailing
// apostrophe can't be judged in isolation. This requires an actual PAIR instead — an opening
// apostrophe hugging the start of a word and a later closing apostrophe hugging the end of
// one — which a lone plural-possessive apostrophe never forms. Verified against the entire
// real data/cards.json + data/values.json corpus before landing: zero new flags.
const PAIRED_QUOTE = /(?:^|[\s(—-])'[^\s'][^']*?'(?=$|[\s.,;:!?)—-])/;
function hasQuoteGlyph(s) {
  // strip intra-word ASCII apostrophes (letter'letter, e.g. "yesterday's", "don't")
  // before checking QUOTE_GLYPHS — irrelevant to PAIRED_QUOTE, which only ever matches a
  // genuine word-boundary-anchored pair, never a lone intra-word apostrophe.
  const stripped = s.replace(/(\p{L})'(\p{L})/gu, "$1$2");
  return QUOTE_GLYPHS.test(stripped) || PAIRED_QUOTE.test(s);
}

const BANNED_PLATITUDES = [
  "believe in yourself", "hustle", "crush it", "unlock your potential",
  "be your best self", "good vibes", "grind", "10x", "manifest",
];
function findPlatitude(s) {
  const lower = s.toLowerCase();
  return BANNED_PLATITUDES.find((p) => lower.includes(p));
}

function localeDateWithoutTZ(src) {
  // flag toLocaleDateString(/toLocaleString(/toLocaleTimeString( calls with no
  // `timeZone` anywhere in the same statement (heuristic: same line or next line).
  const lines = src.split("\n");
  const offenders = [];
  lines.forEach((line, i) => {
    if (/\.toLocale(Date|Time)?String\s*\(/.test(line)) {
      const window = lines.slice(Math.max(0, i - 1), i + 2).join("\n");
      if (!/timeZone/.test(window)) offenders.push(`line ${i + 1}: ${line.trim()}`);
    }
    if (/new Date\(\)\.getDay\(\)|new Date\(\)\.getDate\(\)|new Date\(\)\.getHours\(\)/.test(line)) {
      offenders.push(`line ${i + 1} (bare local-time getter): ${line.trim()}`);
    }
  });
  return offenders;
}

// ---------- Stage 0 ----------

function stage0() {
  check("stage0", "BUILD-PLAN.md exists at repo root", () => {
    assert.ok(exists("BUILD-PLAN.md"), "missing");
    assert.ok(read("BUILD-PLAN.md").length > 1000, "suspiciously short");
  });
  check("stage0", "CLAUDE.md exists and is condensed", () => {
    assert.ok(exists("CLAUDE.md"), "missing");
    const lines = read("CLAUDE.md").split("\n").length;
    assert.ok(lines <= 40, `CLAUDE.md is ${lines} lines (expect a condensed pointer, not the full plan)`);
  });
  check("stage0", ".nojekyll exists", () => assert.ok(exists(".nojekyll"), "missing"));
  check("stage0", "audits/build-log.md + decisions.md exist", () => {
    assert.ok(exists("audits/build-log.md"), "missing build-log.md");
    assert.ok(exists("audits/decisions.md"), "missing decisions.md");
  });
  check("stage0", "repo tree directories exist", () => {
    for (const d of ["assets/fonts", "assets/icons", "data", "scripts", ".github/workflows", "audits"]) {
      assert.ok(fs.existsSync(abs(d)) && fs.statSync(abs(d)).isDirectory(), `missing dir ${d}`);
    }
  });
}

// ---------- Stage 1 ----------

function stage1() {
  check("stage1", "index.html exists", () => assert.ok(exists("index.html"), "missing"));
  check("stage1", "styles.css exists", () => assert.ok(exists("styles.css"), "missing"));
  check("stage1", "app.js exists", () => assert.ok(exists("app.js"), "missing"));
  check("stage1", "lib.mjs exists", () => assert.ok(exists("lib.mjs"), "missing"));

  const html = () => read("index.html");
  const css = () => read("styles.css");
  const appjs = () => read("app.js");

  check("stage1", "viewport meta has viewport-fit=cover", () => {
    assert.match(html(), /viewport-fit=cover/);
  });
  check("stage1", "robots noindex present", () => {
    assert.match(html(), /<meta\s+name=["']robots["']\s+content=["']noindex["']/);
  });
  check("stage1", "tablist + aria roles present", () => {
    assert.match(html(), /role=["']tablist["']/);
    assert.match(html(), /role=["']tab["']/);
    assert.match(html(), /aria-selected/);
    assert.match(html(), /aria-pressed/);
  });
  check("stage1", "localStorage key mindset.theme used", () => {
    const hay = html() + appjs();
    assert.match(hay, /mindset\.theme/);
  });
  check("stage1", "safe-area insets present", () => assert.match(css(), /env\(safe-area-inset/));
  check("stage1", "svh sizing present (with vh fallback line above)", () => {
    assert.match(css(), /\d+svh/);
    assert.match(css(), /:\s*100vh/); // fallback line
  });
  check("stage1", "text-size-adjust present", () => assert.match(css(), /-webkit-text-size-adjust/));
  check("stage1", "touch-action present", () => assert.match(css(), /touch-action/));
  check("stage1", "semantic landmarks present", () => {
    for (const tag of ["<header", "<main", "<footer"]) assert.ok(html().includes(tag), `missing ${tag}`);
  });

  check("stage1", "no max-width media queries (mobile-first law)", () => {
    const offenders = [];
    for (const f of ["styles.css"]) {
      const m = read(f).match(/@media[^{]*max-width[^{]*\{/g);
      if (m) offenders.push(...m.map((x) => `${f}: ${x}`));
    }
    assert.equal(offenders.length, 0, offenders.join(" | "));
  });
  check("stage1", "no root-absolute local URLs", () => {
    const offenders = [];
    const files = ["index.html", "app.js", "styles.css"];
    if (exists("manifest.webmanifest")) files.push("manifest.webmanifest");
    if (exists("sw.js")) files.push("sw.js");
    for (const f of files) {
      const src = read(f);
      const patterns = [
        /href=["']\/(?!\/)/g, /src=["']\/(?!\/)/g, /fetch\(["']\/(?!\/)/g,
        /url\(\/(?!\/)/g, /import\(["']\/(?!\/)/g, /register\(["']\/(?!\/)/g,
        /"src"\s*:\s*"\/(?!\/)/g,
      ];
      for (const p of patterns) {
        const m = src.match(p);
        if (m) offenders.push(`${f}: ${m.join(", ")}`);
      }
    }
    assert.equal(offenders.length, 0, offenders.join(" | "));
  });
  check("stage1", "no fixed width >= 400px in styles.css", () => {
    const m = css().match(/(?<!max-|min-)\bwidth\s*:\s*(\d+)px/g) || [];
    const offenders = m.filter((s) => parseInt(s.match(/\d+/)[0], 10) >= 400);
    assert.equal(offenders.length, 0, offenders.join(", "));
  });
  check("stage1", "no bare locale-date calls without timeZone (app.js)", () => {
    const offenders = exists("app.js") ? localeDateWithoutTZ(appjs()) : [];
    if (exists("figure.js")) offenders.push(...localeDateWithoutTZ(read("figure.js")));
    if (exists("weeks.js")) offenders.push(...localeDateWithoutTZ(read("weeks.js")));
    if (exists("mara.js")) offenders.push(...localeDateWithoutTZ(read("mara.js")));
    assert.equal(offenders.length, 0, offenders.join(" | "));
  });

  check("stage1", "weeks-chart people are initials only, never real names (invariant 1)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    assert.equal(lib.LIFE_PEOPLE.length, 2, `expected exactly 2 people, found ${lib.LIFE_PEOPLE.length}`);
    for (const p of lib.LIFE_PEOPLE) {
      assert.match(p.id, /^[A-Z]$/, `id "${p.id}" is not a single initial`);
      assert.match(p.birthMonthHKT, /^\d{4}-\d{2}$/, `birthMonthHKT "${p.birthMonthHKT}" is not YYYY-MM (day-level precision is not permitted)`);
    }
  });

  check("stage1", "node --check passes on all JS/MJS files", () => {
    const jsFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
    for (const f of jsFiles) nodeCheckSyntax(f);
  });

  check("stage1", "WCAG contrast pairs pass at corrected thresholds", () => {
    const calm = extractTokens(css(), /:root\s*\{/);
    const blossomOverride = extractTokens(css(), /\[data-theme=["']blossom["']\]\s*\{/);
    const blossom = { ...calm, ...blossomOverride };
    const eveningOverride = extractTokens(css(), /\[data-period=["']evening["']\]\s*\{/);
    // Guard against a silent false-pass: if the evening rule is ever split across a media
    // query or moved non-contiguously, extractTokens's single-block regex would return {}
    // and the checks below would trivially pass without verifying anything real.
    assert.ok(eveningOverride.bg, "could not extract a non-empty [data-period=evening] --bg token");
    const calmEvening = { ...calm, ...eveningOverride };
    const blossomEvening = { ...blossom, ...eveningOverride };
    const themes = { calm, blossom, calmEvening, blossomEvening };
    const pairs = [
      ["ink", "bg", 4.5], ["ink", "surface", 4.5],
      ["muted", "surface", 4.5], ["muted", "bg", 4.5],
      ["accent", "surface", 4.5], ["accent", "bg", 4.5],
    ];
    const failures = [];
    for (const [themeName, tokens] of Object.entries(themes)) {
      for (const [a, b, min] of pairs) {
        assert.ok(tokens[a] && tokens[b], `${themeName}: missing token --${a} or --${b}`);
        const ratio = contrastRatio(tokens[a], tokens[b]);
        if (ratio < min) failures.push(`${themeName} (--${a} on --${b}) = ${ratio.toFixed(2)} < ${min}`);
      }
    }
    assert.equal(failures.length, 0, failures.join(" | "));
  });

  check("stage1", "lib.mjs: hktDateString/hktDayNumber correct at 3 known instants", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // known instant: 2026-07-13T15:59:00Z is 2026-07-13T23:59 HKT (UTC+8)
    assert.equal(lib.hktDateString(new Date("2026-07-13T15:59:00Z")), "2026-07-13");
    // one minute later crosses UTC midnight boundary but is still 2026-07-14 HKT (00:00 HKT)
    assert.equal(lib.hktDateString(new Date("2026-07-13T16:00:00Z")), "2026-07-14");
    // and one crossing UTC date without crossing HKT date: 2026-07-13T00:00:00Z = 2026-07-13T08:00 HKT
    assert.equal(lib.hktDateString(new Date("2026-07-13T00:00:00Z")), "2026-07-13");
    const d1 = lib.hktDayNumber(new Date("2026-07-13T15:59:00Z"));
    const d2 = lib.hktDayNumber(new Date("2026-07-13T16:00:00Z"));
    assert.equal(d2 - d1, 1, "day number must increment across the HKT midnight boundary");
    assert.ok(d1 >= 0, "dayNumber must be non-negative for real post-epoch HKT dates");
  });

  check("stage1", "lib.mjs: expectedDateHKT/staleness correct at the 05:00 HKT boundary", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-15T20:59:00Z = 2026-07-16T04:59 HKT — before the boundary, still expects yesterday's date
    assert.equal(lib.expectedDateHKT(new Date("2026-07-15T20:59:00Z")), "2026-07-15");
    // 2026-07-15T21:00:00Z = 2026-07-16T05:00 HKT — boundary crossed, expects today's date
    assert.equal(lib.expectedDateHKT(new Date("2026-07-15T21:00:00Z")), "2026-07-16");
    assert.equal(lib.staleness("2026-07-15", new Date("2026-07-15T20:59:00Z")), "fresh");
    assert.equal(lib.staleness("2026-07-15", new Date("2026-07-15T21:00:00Z")), "yesterday");
  });

  check("stage1", "lib.mjs: isFocusWindowHKT correct at the 09:00 HKT boundary", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-15T00:59:00Z = 2026-07-15T08:59 HKT — inside the pre-09:00 focus window
    assert.equal(lib.isFocusWindowHKT(new Date("2026-07-15T00:59:00Z")), true);
    // 2026-07-15T01:00:00Z = 2026-07-15T09:00 HKT — window has closed
    assert.equal(lib.isFocusWindowHKT(new Date("2026-07-15T01:00:00Z")), false);
  });

  check("stage1", "lib.mjs: isEveningWindowHKT correct at the 20:00 HKT boundary", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-15T11:59:00Z = 2026-07-15T19:59 HKT — evening window not yet open
    assert.equal(lib.isEveningWindowHKT(new Date("2026-07-15T11:59:00Z")), false);
    // 2026-07-15T12:00:00Z = 2026-07-15T20:00 HKT — evening window opens
    assert.equal(lib.isEveningWindowHKT(new Date("2026-07-15T12:00:00Z")), true);
  });

  check("stage1", "lib.mjs: daysUntilKenyaTrip correct at 4 known instants (HKT-anchored, 2026-08-15 trip)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-14T16:00:00Z = 2026-07-15T00:00 HKT -> 31 days before 2026-08-15
    assert.equal(lib.daysUntilKenyaTrip(new Date("2026-07-14T16:00:00Z")), 31);
    // one HKT day later -> exactly one fewer day out
    assert.equal(lib.daysUntilKenyaTrip(new Date("2026-07-15T16:00:00Z")), 30);
    // 2026-08-14T16:01:00Z = 2026-08-15T00:01 HKT, the trip's own HKT calendar day -> 0
    assert.equal(lib.daysUntilKenyaTrip(new Date("2026-08-14T16:01:00Z")), 0);
    // the day after departure -> negative, so the UI knows to hide the countdown
    assert.equal(lib.daysUntilKenyaTrip(new Date("2026-08-15T16:01:00Z")), -1);
  });

  check("stage1", "lib.mjs: weeksLived/percentLifeSpent correct at month-start, +6d, +7d, and clamped far-future (J and B)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    const J = lib.LIFE_PEOPLE.find((p) => p.id === "J").birthMonthHKT;
    const B = lib.LIFE_PEOPLE.find((p) => p.id === "B").birthMonthHKT;
    assert.equal(J, "1989-12", "J's anchor month changed -- confirm this is deliberate, not a slip");
    assert.equal(B, "1988-11", "B's anchor month changed -- confirm this is deliberate, not a slip");

    // Month-start HKT (04:00 UTC = 12:00 HKT, unambiguous) -> the very first week, 0 lived.
    assert.equal(lib.weeksLived(J, new Date("1989-12-01T04:00:00Z")), 0);
    assert.equal(lib.weeksLived(B, new Date("1988-11-01T04:00:00Z")), 0);
    // +6 HKT days: still inside the first week.
    assert.equal(lib.weeksLived(J, new Date("1989-12-07T04:00:00Z")), 0);
    assert.equal(lib.weeksLived(B, new Date("1988-11-07T04:00:00Z")), 0);
    // +7 HKT days: exactly one week has now elapsed -- the weekly boundary the owner asked for.
    assert.equal(lib.weeksLived(J, new Date("1989-12-08T04:00:00Z")), 1);
    assert.equal(lib.weeksLived(B, new Date("1988-11-08T04:00:00Z")), 1);
    // 200 years later: clamps to the grid total rather than indexing past it or going negative.
    assert.equal(lib.weeksLived(J, new Date("2189-12-01T04:00:00Z")), lib.LIFE_WEEKS_TOTAL);
    assert.equal(lib.weeksLived(B, new Date("2188-11-01T04:00:00Z")), lib.LIFE_WEEKS_TOTAL);
    // percentLifeSpent is always weeksLived/LIFE_WEEKS_TOTAL -- never independently wrong,
    // and never exceeds 100 since weeksLived is itself clamped.
    assert.equal(lib.percentLifeSpent(J, new Date("1989-12-01T04:00:00Z")), 0);
    assert.equal(lib.percentLifeSpent(J, new Date("2189-12-01T04:00:00Z")), 100);
  });

  check("stage1", "lib.mjs: the B-minus-J age-week gap stays within {56, 57} (v1.23 combined-grid invariant)", async () => {
    // The combined Weeks-tab grid (v1.23) relies on B always being AT LEAST as far along in
    // age-weeks as J, with no "J-only-lived" cell ever existing. The two birth months are a
    // fixed 395 real days apart (56 whole weeks + 3 days), so floor-division age-week gap
    // is not a constant 57 -- it alternates with the weekday phase, confirmed by an exhaustive
    // 40-year daily sweep during implementation (only ever 56 or 57, never anything else).
    // These 5 fixed instants are pinned samples of that sweep, not the whole guarantee.
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    const J = lib.LIFE_PEOPLE.find((p) => p.id === "J").birthMonthHKT;
    const B = lib.LIFE_PEOPLE.find((p) => p.id === "B").birthMonthHKT;
    const instants = [
      "2026-07-22T04:00:00Z", "2024-01-01T04:00:00Z", "2020-06-15T04:00:00Z",
      "2015-03-10T04:00:00Z", "1998-11-05T04:00:00Z",
    ];
    for (const iso of instants) {
      const now = new Date(iso);
      const gap = lib.weeksLived(B, now) - lib.weeksLived(J, now);
      assert.ok(gap === 56 || gap === 57, `gap at ${iso} was ${gap}, expected 56 or 57`);
    }
  });

  check("stage1", "weeks.js: no quotation-mark glyphs in user-facing copy (EPIGRAPH text/attr)", () => {
    // v1.24: CAPTION (a flat string) became EPIGRAPH (an array of {text, attr} lines); the
    // legend this check also used to scan was removed entirely (see decisions.md). Updated to
    // match rather than left checking a constant that no longer exists -- a verify.mjs check
    // silently going stale exactly like this was the async-check bug this ratchet exists to
    // catch (v1.23).
    if (!exists("weeks.js")) return;
    const src = read("weeks.js");
    const problems = [];
    const textMatches = [...src.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)];
    const attrMatches = [...src.matchAll(/attr:\s*"((?:[^"\\]|\\.)*)"/g)];
    for (const m of textMatches) if (hasQuoteGlyph(m[1])) problems.push(`EPIGRAPH text: ${m[1]}`);
    for (const m of attrMatches) if (hasQuoteGlyph(m[1])) problems.push(`EPIGRAPH attr: ${m[1]}`);
    assert.ok(textMatches.length >= 2, `expected >=2 EPIGRAPH text lines, found ${textMatches.length} -- check the check itself, not just weeks.js`);
    assert.equal(problems.length, 0, problems.join(" | "));
  });

  check("stage1", "lib.mjs: pickIndex full-cycle uniqueness for pools 120/40/10", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    for (const poolSize of [120, 40, 10]) {
      const cycleStart = 3 * poolSize; // an arbitrary later cycle, still >= 0
      const seen = new Set();
      for (let d = cycleStart; d < cycleStart + poolSize; d++) {
        const idx = lib.pickIndex(poolSize, d, "anchor");
        assert.ok(idx >= 0 && idx < poolSize, `index ${idx} out of range for pool ${poolSize}`);
        assert.ok(!seen.has(idx), `repeat within cycle at pool ${poolSize}, day ${d}`);
        seen.add(idx);
      }
      assert.equal(seen.size, poolSize);
    }
  });

  check("stage1", "fonts present or fallback decision logged", () => {
    const fontsDir = abs("assets/fonts");
    const hasFonts = fs.existsSync(fontsDir) && fs.readdirSync(fontsDir).some((f) => f.endsWith(".woff2"));
    if (!hasFonts) {
      assert.match(read("audits/decisions.md"), /font/i, "no woff2 fonts and no decisions.md note about the fallback");
    }
  });
}

// ---------- Stage 2 ----------

function stage2() {
  check("stage2", "figure.js exists", () => assert.ok(exists("figure.js"), "missing"));
  const src = () => read("figure.js");
  check("stage2", "node --check figure.js", () => nodeCheckSyntax("figure.js"));
  for (const [name, re] of [
    ["requestAnimationFrame present", /requestAnimationFrame/],
    ["visibilitychange present", /visibilitychange/],
    ["prefers-reduced-motion present", /prefers-reduced-motion/],
    ["devicePixelRatio present", /devicePixelRatio/],
  ]) {
    check("stage2", `figure.js: ${name}`, () => assert.match(src(), re));
  }
  check("stage2", "figure.js: no shadowBlur anywhere", () => assert.doesNotMatch(src(), /shadowBlur/));
  check("stage2", "figure.js budget <= 12KB", () => {
    const bytes = sizeOf("figure.js");
    assert.ok(bytes <= 12 * 1024, `${bytes} bytes > 12KB`);
  });
}

// ---------- Stage 3 ----------

const CATEGORY_COUNTS = { stoic: 55, buddhist: 55, taoist: 25, impermanence: 35, attention: 35, relationships: 30, growth: 30, money: 25, voices: 40, grounding: 35 };
const KENYA_CATEGORY_COUNTS = { Geography: 12, Wildlife: 14, History: 10, Government: 8, Culture: 8, Economy: 4, Sports: 4 };

function stage3() {
  check("stage3", "data/cards.json valid JSON with required shape", () => {
    const d = readJSON("data/cards.json");
    assert.ok(Array.isArray(d.anchors) && Array.isArray(d.journal) && Array.isArray(d.kenya) && Array.isArray(d.wordOfDay) && Array.isArray(d.closing));
  });
  check("stage3", "data/values.json valid JSON, exactly 5 values", () => {
    const v = readJSON("data/values.json");
    assert.ok(Array.isArray(v));
    assert.equal(v.length, 5, `expected 5 values, got ${v.length}`);
  });

  check("stage3", "anchor category counts exact (365 total)", () => {
    const d = readJSON("data/cards.json");
    const counts = {};
    for (const a of d.anchors) counts[a.category] = (counts[a.category] || 0) + 1;
    const problems = [];
    for (const [cat, want] of Object.entries(CATEGORY_COUNTS)) {
      if (counts[cat] !== want) problems.push(`${cat}: got ${counts[cat] || 0}, want ${want}`);
    }
    assert.equal(d.anchors.length, 365, `total anchors = ${d.anchors.length}`);
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "journal = 40, kenya = 60, wordOfDay = 30, closing = 34", () => {
    const d = readJSON("data/cards.json");
    assert.equal(d.journal.length, 40, `journal = ${d.journal.length}`);
    assert.equal(d.kenya.length, 60, `kenya = ${d.kenya.length}`);
    assert.equal(d.wordOfDay.length, 30, `wordOfDay = ${d.wordOfDay.length}`);
    assert.equal(d.closing.length, 34, `closing = ${d.closing.length}`);
  });
  check("stage3", "wordOfDay entries have word/origin/lang/meaning as non-empty strings", () => {
    const d = readJSON("data/cards.json");
    const problems = [];
    for (const w of d.wordOfDay) {
      for (const field of ["word", "origin", "lang", "meaning"]) {
        if (typeof w[field] !== "string" || !w[field].trim()) problems.push(`${w.id}.${field} missing/empty`);
      }
      if (typeof w.lang === "string" && !/^[a-z]{2,3}(-[A-Z]{2})?$/.test(w.lang)) {
        problems.push(`${w.id}.lang "${w.lang}" doesn't look like a BCP-47 tag`);
      }
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "kenya entries have category/fact as non-empty strings; category counts exact (60 total)", () => {
    const d = readJSON("data/cards.json");
    const problems = [];
    const counts = {};
    for (const k of d.kenya) {
      for (const field of ["category", "fact"]) {
        if (typeof k[field] !== "string" || !k[field].trim()) problems.push(`${k.id}.${field} missing/empty`);
      }
      counts[k.category] = (counts[k.category] || 0) + 1;
    }
    for (const [cat, want] of Object.entries(KENYA_CATEGORY_COUNTS)) {
      if (counts[cat] !== want) problems.push(`${cat}: got ${counts[cat] || 0}, want ${want}`);
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "all ids unique within each pool", () => {
    const d = readJSON("data/cards.json");
    for (const [name, pool] of Object.entries(d)) {
      const ids = pool.map((x) => x.id);
      assert.equal(new Set(ids).size, ids.length, `${name} has duplicate ids`);
    }
  });
  check("stage3", "word caps respected (anchors <=40w, journal/closing prompts <=25w, kenya facts<=40w, wordOfDay meaning<=20w, values essence<=14w/behaviour<=16w)", () => {
    const d = readJSON("data/cards.json");
    const v = readJSON("data/values.json");
    const problems = [];
    for (const a of d.anchors) if (wordCount(a.text) > 40) problems.push(`${a.id}: ${wordCount(a.text)}w`);
    for (const j of d.journal) if (wordCount(j.prompt) > 25) problems.push(`${j.id}: ${wordCount(j.prompt)}w`);
    for (const k of d.kenya) if (wordCount(k.fact) > 40) problems.push(`${k.id}: ${wordCount(k.fact)}w`);
    for (const w of d.wordOfDay) if (wordCount(w.meaning) > 20) problems.push(`${w.id}: ${wordCount(w.meaning)}w`);
    for (const c of d.closing) if (wordCount(c.prompt) > 25) problems.push(`${c.id}: ${wordCount(c.prompt)}w`);
    for (const val of v) {
      if (wordCount(val.essence) > 14) problems.push(`${val.name} essence: ${wordCount(val.essence)}w`);
      if (wordCount(val.behaviour) > 16) problems.push(`${val.name} behaviour: ${wordCount(val.behaviour)}w`);
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "zero quotation-mark glyphs in card/value string fields", () => {
    const d = readJSON("data/cards.json");
    const v = readJSON("data/values.json");
    const problems = [];
    const scan = (label, s) => { if (s && hasQuoteGlyph(s)) problems.push(`${label}: ${s}`); };
    for (const a of d.anchors) { scan(`${a.id}.text`, a.text); scan(`${a.id}.attribution`, a.attribution); }
    for (const j of d.journal) scan(`${j.id}.prompt`, j.prompt);
    for (const k of d.kenya) { scan(`${k.id}.category`, k.category); scan(`${k.id}.fact`, k.fact); }
    for (const w of d.wordOfDay) { scan(`${w.id}.word`, w.word); scan(`${w.id}.origin`, w.origin); scan(`${w.id}.meaning`, w.meaning); }
    for (const c of d.closing) scan(`${c.id}.prompt`, c.prompt);
    for (const val of v) { scan(`${val.name}.essence`, val.essence); scan(`${val.name}.behaviour`, val.behaviour); }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "no banned platitudes", () => {
    const d = readJSON("data/cards.json");
    const problems = [];
    const scan = (label, s) => { const p = s && findPlatitude(s); if (p) problems.push(`${label}: "${p}"`); };
    for (const a of d.anchors) scan(a.id, a.text);
    for (const j of d.journal) scan(j.id, j.prompt);
    for (const k of d.kenya) scan(k.id, k.fact);
    for (const w of d.wordOfDay) scan(w.id, w.meaning);
    for (const c of d.closing) scan(c.id, c.prompt);
    assert.equal(problems.length, 0, problems.join(" | "));
  });

  const SIGHTING_BANDS = ["Almost certain", "Very likely", "Likely", "Even odds", "Long shot"];
  check("stage3", "data/mara.json valid JSON with required shape (park + 20 animals, unique ids)", () => {
    const d = readJSON("data/mara.json");
    assert.ok(d.park && typeof d.park === "object", "missing park object");
    assert.ok(Array.isArray(d.park.stats) && d.park.stats.length > 0, "park.stats missing/empty");
    assert.ok(Array.isArray(d.park.migration?.paragraphs) && d.park.migration.paragraphs.length > 0, "park.migration.paragraphs missing/empty");
    assert.ok(Array.isArray(d.animals), "animals missing");
    assert.equal(d.animals.length, 20, `expected 20 animals, got ${d.animals.length}`);
    const ids = d.animals.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate animal ids");
  });
  check("stage3", "mara.json: every animal has required non-empty text fields and a valid sighting score", () => {
    const d = readJSON("data/mara.json");
    const problems = [];
    for (const a of d.animals) {
      for (const field of ["name", "swahili", "intro", "whereToLook"]) {
        if (typeof a[field] !== "string" || !a[field].trim()) problems.push(`${a.id}.${field} missing/empty`);
      }
      for (const field of ["lifespan", "size", "eats"]) {
        if (typeof a.stats?.[field] !== "string" || !a.stats[field].trim()) problems.push(`${a.id}.stats.${field} missing/empty`);
      }
      if (!Array.isArray(a.fieldNotes) || a.fieldNotes.length < 3 || a.fieldNotes.length > 4) {
        problems.push(`${a.id}.fieldNotes should have 3-4 entries, has ${a.fieldNotes?.length ?? 0}`);
      }
      const s = a.sighting;
      if (!s || !Number.isInteger(s.pct) || s.pct < 0 || s.pct > 100) problems.push(`${a.id}.sighting.pct invalid: ${s?.pct}`);
      if (!s || !SIGHTING_BANDS.includes(s.band)) problems.push(`${a.id}.sighting.band "${s?.band}" not in ${SIGHTING_BANDS.join("/")}`);
      if (!s || typeof s.note !== "string" || !s.note.trim()) problems.push(`${a.id}.sighting.note missing/empty`);
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "mara.json: every animal has exactly 2 photos, each with non-empty src/alt/credit/license, and the file exists", () => {
    const d = readJSON("data/mara.json");
    const problems = [];
    for (const a of d.animals) {
      if (!Array.isArray(a.photos) || a.photos.length !== 2) {
        problems.push(`${a.id}: expected exactly 2 photos, got ${a.photos?.length ?? 0}`);
        continue;
      }
      for (const p of a.photos) {
        for (const field of ["src", "alt", "credit", "license"]) {
          if (typeof p[field] !== "string" || !p[field].trim()) problems.push(`${a.id}.photos[].${field} missing/empty`);
        }
        if (p.src && !exists(p.src)) problems.push(`${a.id}: photo file not found on disk: ${p.src}`);
      }
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "mara.json: fieldNotes bullets <=20 words each (house convention)", () => {
    const d = readJSON("data/mara.json");
    const problems = [];
    for (const a of d.animals) {
      for (const note of a.fieldNotes || []) {
        if (wordCount(note) > 20) problems.push(`${a.id}: ${wordCount(note)}w -- ${note}`);
      }
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "mara.json: zero quotation-mark glyphs and no banned platitudes in animal/park text", () => {
    const d = readJSON("data/mara.json");
    const problems = [];
    const scan = (label, s) => {
      if (!s) return;
      if (hasQuoteGlyph(s)) problems.push(`${label}: quote glyph -- ${s}`);
      const p = findPlatitude(s);
      if (p) problems.push(`${label}: platitude "${p}"`);
    };
    scan("park.about", d.park.about);
    for (const para of d.park.migration.paragraphs) scan("park.migration.paragraphs[]", para);
    for (const fact of d.park.migration.facts) scan("park.migration.facts[]", fact);
    for (const a of d.animals) {
      scan(`${a.id}.name`, a.name);
      scan(`${a.id}.swahili`, a.swahili);
      scan(`${a.id}.intro`, a.intro);
      scan(`${a.id}.whereToLook`, a.whereToLook);
      scan(`${a.id}.sighting.note`, a.sighting?.note);
      for (const note of a.fieldNotes || []) scan(`${a.id}.fieldNotes[]`, note);
      for (const p of a.photos || []) scan(`${a.id}.photos[].alt`, p.alt);
    }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "assets/mara/ photo budget: total <= 4096KB, no single file > 150KB", () => {
    const dir = abs("assets/mara");
    assert.ok(fs.existsSync(dir), "assets/mara/ missing");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg"));
    assert.equal(files.length, 40, `expected 40 jpg files, found ${files.length}`);
    let total = 0;
    const oversized = [];
    for (const f of files) {
      const size = fs.statSync(path.join(dir, f)).size;
      total += size;
      if (size > 150 * 1024) oversized.push(`${f}: ${(size / 1024).toFixed(0)}KB`);
    }
    assert.equal(oversized.length, 0, oversized.join(", "));
    assert.ok(total <= 4096 * 1024, `total ${(total / 1024).toFixed(0)}KB > 4096KB`);
  });

  check("stage3", "near-duplicate proxy (token-overlap) — informational, non-blocking", () => {
    const d = readJSON("data/cards.json");
    const tok = (s) => new Set(s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
    const flagged = [];
    for (let i = 0; i < d.anchors.length; i++) {
      for (let j = i + 1; j < d.anchors.length; j++) {
        const a = tok(d.anchors[i].text), b = tok(d.anchors[j].text);
        const overlap = [...a].filter((w) => b.has(w)).length;
        const denom = Math.min(a.size, b.size) || 1;
        if (overlap / denom > 0.6) flagged.push(`${d.anchors[i].id} ~ ${d.anchors[j].id}`);
      }
    }
    return flagged.length ? `flagged for human review: ${flagged.join(", ")}` : "no near-duplicates flagged";
  });
  check("stage3", "rotation: three simulated dates give distinct in-range picks", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    const d = readJSON("data/cards.json");
    const dates = [new Date("2026-07-13T00:00:00Z"), new Date("2026-07-14T00:00:00Z"), new Date("2026-07-20T00:00:00Z")];
    const picks = dates.map((dt) => lib.pickIndex(d.anchors.length, lib.hktDayNumber(dt), "anchor"));
    for (const p of picks) assert.ok(p >= 0 && p < d.anchors.length);
    assert.ok(new Set(picks).size >= 2, "expected at least 2 distinct picks across 3 well-separated dates");
  });
  check("stage3", "offline/stale fallback selects valid ids (simulated)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    const d = readJSON("data/cards.json");
    // simulate: daily.json missing/stale -> compute locally via rotation, same contract as app.js/lib.mjs
    const dayNumber = lib.hktDayNumber(new Date());
    const anchor = d.anchors[lib.pickIndex(d.anchors.length, dayNumber, "anchor")];
    const journal = d.journal[lib.pickIndex(d.journal.length, dayNumber, "journal")];
    const kenya = d.kenya[lib.pickIndex(d.kenya.length, dayNumber, "kenya")];
    const word = d.wordOfDay[lib.pickIndex(d.wordOfDay.length, dayNumber, "word")];
    const closing = d.closing[lib.pickIndex(d.closing.length, dayNumber, "closing")];
    assert.ok(anchor && anchor.id && journal && journal.id && kenya && kenya.id && word && word.id && closing && closing.id);
  });
  check("stage3", "audits/CONTENT-REVIEW.md exists", () => assert.ok(exists("audits/CONTENT-REVIEW.md"), "missing"));
}

// ---------- Stage 4 ----------

function stage4() {
  check("stage4", ".github/workflows/daily.yml exists with cron + timeout + permissions", () => {
    assert.ok(exists(".github/workflows/daily.yml"), "missing");
    const y = read(".github/workflows/daily.yml");
    assert.match(y, /cron:\s*"[\d*\s]+"/);
    assert.match(y, /timeout-minutes:\s*10/);
    assert.match(y, /contents:\s*write/);
  });
  check("stage4", ".github/workflows/watchdog.yml exists with cron + permissions", () => {
    assert.ok(exists(".github/workflows/watchdog.yml"), "missing");
    const y = read(".github/workflows/watchdog.yml");
    assert.match(y, /cron:\s*"[\d*\s]+"/);
    assert.match(y, /issues:\s*write/);
  });
  check("stage4", "scripts/generate-daily.mjs exists, node --check passes", () => {
    assert.ok(exists("scripts/generate-daily.mjs"), "missing");
    require("node:child_process").execFileSync(process.execPath, ["--check", abs("scripts/generate-daily.mjs")], { stdio: "pipe" });
  });
  check("stage4", "data/daily.json schema valid", () => {
    const d = readJSON("data/daily.json");
    assert.match(d.dateHKT, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(typeof d.generatedAtISO === "string" && !Number.isNaN(Date.parse(d.generatedAtISO)));
    assert.ok(typeof d.anchorId === "string" && typeof d.journalId === "string" && typeof d.kenyaId === "string" && typeof d.wordId === "string" && typeof d.closingId === "string");
  });
}

// ---------- Stage 5 ----------

function stage5() {
  check("stage5", "manifest.webmanifest valid, relative start_url/scope", () => {
    const m = readJSON("manifest.webmanifest");
    for (const f of ["name", "short_name", "display", "start_url", "scope", "icons"]) {
      assert.ok(f in m, `missing field ${f}`);
    }
    assert.ok(m.start_url.startsWith("./") || m.start_url === ".", `start_url not relative: ${m.start_url}`);
    assert.ok(m.scope.startsWith("./") || m.scope === ".", `scope not relative: ${m.scope}`);
  });
  check("stage5", "sw.js byte-identical to Appendix C.2 modulo ASSETS array", () => {
    const reference = extractSwReferenceFromPlan();
    const live = read("sw.js");
    const normalize = (s) => s.replace(/const ASSETS = \[[\s\S]*?\];/, "const ASSETS = [/*normalized*/];");
    assert.equal(normalize(live).trim(), normalize(reference).trim(), "sw.js diverges from Appendix C.2 outside the ASSETS array");
  });
  check("stage5", "sw.js registered in app.js", () => {
    assert.match(read("app.js"), /serviceWorker\.register\(["']\.\/sw\.js["']\)/);
  });
  check("stage5", "byte budgets: JS <= 60KB, icons <= 150KB, fonts <= 300KB", () => {
    const jsFiles = ["app.js", "figure.js", "lib.mjs", "weeks.js", "mara.js", "sw.js"].filter(exists);
    const jsTotal = jsFiles.reduce((sum, f) => sum + sizeOf(f), 0);
    assert.ok(jsTotal <= 60 * 1024, `JS total ${jsTotal} bytes > 60KB (${jsFiles.join(",")})`);
    const iconsDir = abs("assets/icons");
    if (fs.existsSync(iconsDir)) {
      const iconsTotal = fs.readdirSync(iconsDir).reduce((sum, f) => sum + fs.statSync(path.join(iconsDir, f)).size, 0);
      assert.ok(iconsTotal <= 150 * 1024, `icons total ${iconsTotal} bytes > 150KB`);
    }
    const fontsDir = abs("assets/fonts");
    if (fs.existsSync(fontsDir)) {
      const fontsTotal = fs.readdirSync(fontsDir).filter((f) => f.endsWith(".woff2")).reduce((sum, f) => sum + fs.statSync(path.join(fontsDir, f)).size, 0);
      assert.ok(fontsTotal <= 300 * 1024, `fonts total ${fontsTotal} bytes > 300KB`);
    }
  });
  check("stage5", "page weight (index.html+styles.css+data jsons) <= 350KB excl. fonts", () => {
    const files = ["index.html", "styles.css", "app.js", "figure.js", "lib.mjs", "weeks.js", "mara.js", "manifest.webmanifest", "sw.js",
      "data/cards.json", "data/values.json", "data/daily.json", "data/mara.json"].filter(exists);
    const total = files.reduce((sum, f) => sum + sizeOf(f), 0);
    assert.ok(total <= 350 * 1024, `total ${total} bytes > 350KB (${files.join(",")})`);
  });
  check("stage5", "README.md runbook present, non-trivial", () => {
    assert.ok(exists("README.md"));
    assert.ok(read("README.md").length > 500, "README looks like a stub, not a runbook");
  });
  check("stage5", "verify.mjs integrity ratchet: diff-vs-Stage-0 note present in FINAL-AUDIT", () => {
    if (exists("audits/FINAL-AUDIT.md")) {
      assert.match(read("audits/FINAL-AUDIT.md"), /verify\.mjs/i);
    } else {
      throw new Error("audits/FINAL-AUDIT.md not written yet");
    }
  });
}

function extractSwReferenceFromPlan() {
  const plan = read("BUILD-PLAN.md");
  const m = plan.match(/### C\.2[\s\S]*?```js\n([\s\S]*?)\n```/);
  if (!m) throw new Error("could not locate Appendix C.2 reference sw.js in BUILD-PLAN.md");
  return m[1];
}

// ---------- runner ----------

const STAGE_FNS = { stage0, stage1, stage2, stage3, stage4, stage5 };

if (mode === "all") {
  for (const fn of Object.values(STAGE_FNS)) fn();
} else if (STAGE_FNS[mode]) {
  STAGE_FNS[mode]();
} else {
  console.error(`Unknown mode "${mode}". Use one of: stage0..stage5, all`);
  process.exit(2);
}

await Promise.all([]); // allow any pending async check() promises below to be awaited properly
// Note: check() calls fn() synchronously; async fn()s return a Promise which we must await
// before reading results. Re-run any promise-returning results now.
for (const r of results) {
  if (r.detail && typeof r.detail.then === "function") {
    try { r.detail = String(await r.detail); r.pass = true; }
    catch (e) { r.pass = false; r.detail = e.message; }
  }
}

const width = Math.max(...results.map((r) => r.name.length), 20);
let anyFail = false;
console.log(`\nverify.mjs — mode: ${mode}\n`);
for (const r of results) {
  if (!r.pass) anyFail = true;
  const icon = r.pass ? "✅" : "❌";
  console.log(`${icon} [${r.stage}] ${r.name.padEnd(width)} ${r.pass ? "" : "— " + r.detail}`);
}
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} checks passed.\n`);
process.exit(anyFail ? 1 : 0);
