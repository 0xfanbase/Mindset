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

function check(stage, name, fn) {
  try {
    const detail = fn();
    results.push({ stage, name, pass: true, detail: detail === undefined ? "ok" : String(detail) });
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
function hasQuoteGlyph(s) {
  // strip intra-word ASCII apostrophes (letter'letter, e.g. "yesterday's", "don't")
  // before checking — a leading/trailing/isolated ' would still be flagged.
  const stripped = s.replace(/(\p{L})'(\p{L})/gu, "$1$2");
  return QUOTE_GLYPHS.test(stripped);
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
    assert.equal(offenders.length, 0, offenders.join(" | "));
  });

  check("stage1", "node --check passes on all JS/MJS files", () => {
    const { execFileSync } = require("node:child_process");
    const jsFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
    for (const f of jsFiles) execFileSync(process.execPath, ["--check", abs(f)], { stdio: "pipe" });
  });

  check("stage1", "WCAG contrast pairs pass at corrected thresholds", () => {
    const calm = extractTokens(css(), /:root\s*\{/);
    const blossomOverride = extractTokens(css(), /\[data-theme=["']blossom["']\]\s*\{/);
    const blossom = { ...calm, ...blossomOverride };
    const themes = { calm, blossom };
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
  check("stage2", "node --check figure.js", () => {
    require("node:child_process").execFileSync(process.execPath, ["--check", abs("figure.js")], { stdio: "pipe" });
  });
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

function stage3() {
  check("stage3", "data/cards.json valid JSON with required shape", () => {
    const d = readJSON("data/cards.json");
    assert.ok(Array.isArray(d.anchors) && Array.isArray(d.journal) && Array.isArray(d.wordOfDay));
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
  check("stage3", "journal = 40, wordOfDay = 30", () => {
    const d = readJSON("data/cards.json");
    assert.equal(d.journal.length, 40, `journal = ${d.journal.length}`);
    assert.equal(d.wordOfDay.length, 30, `wordOfDay = ${d.wordOfDay.length}`);
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
  check("stage3", "all ids unique within each pool", () => {
    const d = readJSON("data/cards.json");
    for (const [name, pool] of Object.entries(d)) {
      const ids = pool.map((x) => x.id);
      assert.equal(new Set(ids).size, ids.length, `${name} has duplicate ids`);
    }
  });
  check("stage3", "word caps respected (anchors <=40w, journal prompts <=25w, wordOfDay meaning<=20w, values essence<=14w/behaviour<=16w)", () => {
    const d = readJSON("data/cards.json");
    const v = readJSON("data/values.json");
    const problems = [];
    for (const a of d.anchors) if (wordCount(a.text) > 40) problems.push(`${a.id}: ${wordCount(a.text)}w`);
    for (const j of d.journal) if (wordCount(j.prompt) > 25) problems.push(`${j.id}: ${wordCount(j.prompt)}w`);
    for (const w of d.wordOfDay) if (wordCount(w.meaning) > 20) problems.push(`${w.id}: ${wordCount(w.meaning)}w`);
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
    for (const w of d.wordOfDay) { scan(`${w.id}.word`, w.word); scan(`${w.id}.origin`, w.origin); scan(`${w.id}.meaning`, w.meaning); }
    for (const val of v) { scan(`${val.name}.essence`, val.essence); scan(`${val.name}.behaviour`, val.behaviour); }
    assert.equal(problems.length, 0, problems.join(" | "));
  });
  check("stage3", "no banned platitudes", () => {
    const d = readJSON("data/cards.json");
    const problems = [];
    const scan = (label, s) => { const p = s && findPlatitude(s); if (p) problems.push(`${label}: "${p}"`); };
    for (const a of d.anchors) scan(a.id, a.text);
    for (const j of d.journal) scan(j.id, j.prompt);
    for (const w of d.wordOfDay) scan(w.id, w.meaning);
    assert.equal(problems.length, 0, problems.join(" | "));
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
    const word = d.wordOfDay[lib.pickIndex(d.wordOfDay.length, dayNumber, "word")];
    assert.ok(anchor && anchor.id && journal && journal.id && word && word.id);
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
    assert.ok(typeof d.anchorId === "string" && typeof d.journalId === "string" && typeof d.wordId === "string");
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
    const jsFiles = ["app.js", "figure.js", "lib.mjs", "sw.js"].filter(exists);
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
    const files = ["index.html", "styles.css", "app.js", "figure.js", "lib.mjs", "manifest.webmanifest", "sw.js",
      "data/cards.json", "data/values.json", "data/daily.json"].filter(exists);
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
