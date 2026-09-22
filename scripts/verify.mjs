#!/usr/bin/env node
// scripts/verify.mjs — stage-gated verification harness (BUILD-PLAN.md Appendix A, v1.1)
// Node >= 20, zero deps. Usage: node scripts/verify.mjs <stage0..stage5|all>
// v3.0: the Journal card, the daily pipeline that fed it, and the rotation engine it rotated
// through are all retired -- Weeks (a life-in-weeks grid, computed from today's HKT date on
// every load) is now the entire page. Every check that only ever existed to prove those retired
// pieces correct was removed or retargeted; see audits/decisions.md for the exact list
// (invariant 12's logged-exception ledger).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
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
// v1.29 theme model: blossom lives on `:root, [data-theme="blossom"]`, dark overrides after.
// Both extractions are guarded non-empty (same rationale as the retired evening-block guard:
// a moved/renamed block must fail loudly, never silently extract {} and trivially pass).
const BLOSSOM_SEL = /:root\s*,\s*\[data-theme=["']blossom["']\]\s*\{/;
const DARK_SEL = /\[data-theme=["']dark["']\]\s*\{/;
function themeTokens(cssText) {
  const blossom = extractTokens(cssText, BLOSSOM_SEL);
  const darkOverride = extractTokens(cssText, DARK_SEL);
  assert.ok(blossom.bg && blossom.ink, "could not extract tokens from the `:root, [data-theme=blossom]` block");
  assert.ok(darkOverride.bg, "could not extract a non-empty [data-theme=dark] --bg token");
  return { blossom, dark: { ...blossom, ...darkOverride } };
}
// v3.0: parseRgba/compositeOver/ruleTintAndColor existed only to composite the retired
// staleness chip's rgba() tint over --bg for its contrast check; removed as genuinely unused
// once that check went (invariant-12 logged exception, see decisions.md). wordCount similarly
// existed only for cards.json's retired word-cap check; removed alongside it.

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

// ---------- invariant-1 name denylist (shared by two stage0 checks) ----------
// One-way detection: text is lowercased, split into letter-only tokens, and each unique
// token is salted + SHA-256 hashed against the stored digest -- the protected name itself
// appears nowhere in this file in any decodable form. (The v1.28 original stored it as
// base64, which anyone can reverse in one command; see the stage0 check for the rest of
// the rationale and the accepted limitation.)
const NAME_SALT = "mindset-invariant1-2026.";
const NAME_DIGEST = "65ca9b4a5d1408f29b9db04de88aaeaf18b77af0553d61eae7140c368c4f508b";
function containsProtectedName(text) {
  const seen = new Set();
  for (const token of text.toLowerCase().split(/[^a-z]+/)) {
    if (!token || seen.has(token)) continue;
    seen.add(token);
    if (createHash("sha256").update(NAME_SALT + token).digest("hex") === NAME_DIGEST) return true;
  }
  return false;
}
// Extension DENYLIST for obvious binaries, not an allowlist of "known text" -- an allowlist
// silently skips extensionless tracked files (LICENSE today, a future CNAME), which is
// exactly the kind of gap a denylist closes by defaulting to "scan it."
const BINARY_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".ico",
  ".woff", ".woff2", ".ttf", ".otf", ".eot", ".zip", ".gz", ".tar", ".pdf",
]);
function gitTrackedTextFiles() {
  return require("node:child_process")
    .execFileSync("git", ["ls-files", "-z"], { cwd: ROOT })
    .toString("utf8").split("\0").filter(Boolean)
    .filter((f) => !BINARY_EXTS.has(path.extname(f).toLowerCase()))
    .filter((f) => fs.existsSync(abs(f)));
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
    for (const d of ["assets/fonts", "assets/icons", "scripts", ".github/workflows", "audits"]) {
      assert.ok(fs.existsSync(abs(d)) && fs.statSync(abs(d)).isDirectory(), `missing dir ${d}`);
    }
  });
  // v3.0: the Journal card and everything that only ever fed it (the daily pipeline, the
  // rotation engine, the content library) was retired -- data/ has no reason to exist anymore.
  // A loud guard, not a bare deletion, so a reintroduction (a bad merge, a stray revert) is
  // caught rather than silently shipped.
  check("stage0", "data/ directory retired (v3.0): data/cards.json, data/daily.json, data/ do not exist", () => {
    assert.ok(!exists("data/cards.json"), "data/cards.json exists but the Journal card was retired in v3.0");
    assert.ok(!exists("data/daily.json"), "data/daily.json exists but the daily pipeline was retired in v3.0");
    assert.ok(!fs.existsSync(abs("data")), "data/ exists but was retired in v3.0");
  });
  check("stage0", "invariant-1 name denylist: protected first name appears in no tracked file", () => {
    // v1.28: a protected family member's first name shipped in two prose files (BUILD-PLAN.md's
    // v1.24 changelog and the matching decisions.md entry) and sat live on Pages for two days
    // before an audit caught it -- invariant 1's most important term had no mechanical check at
    // all. v1.28 stored the needle base64-encoded so this file never held the name in plain
    // text, but base64 is an ENCODING, not a one-way function -- anyone reading this file could
    // recover the name in one command. Replaced (v1.28 follow-up) with a salted SHA-256 digest
    // of the lowercased name, compared token-by-token via containsProtectedName() above.
    // Honest limitation, accepted: a salted hash of a low-entropy secret (a common first name)
    // defeats casual reading of this file but NOT a deliberate dictionary attack hashing
    // candidate names against the stored digest -- that trade-off is unavoidable for an
    // in-repo check that must recognize one specific known string, and is still strictly
    // better than a reversible encoding. Case-insensitivity is by construction (tokens are
    // lowercased before hashing). Enumeration is `git ls-files` -- genuinely tracked files
    // only, which the v1.28 walker claimed but didn't do (it also scanned untracked files) --
    // filtered by the binary-extension DENYLIST above, so extensionless tracked files
    // (LICENSE, a future CNAME) are scanned instead of silently skipped. The name has no
    // legitimate use anywhere in this project, including audit prose -- "the owner's wife"
    // is always the correct spelling of it.
    const offenders = gitTrackedTextFiles().filter((f) => containsProtectedName(fs.readFileSync(abs(f), "utf8")));
    assert.equal(offenders.length, 0, `protected name found in: ${offenders.join(", ")}`);
  });
  check("stage0", "invariant-1 name denylist: protected first name appears in no commit message reachable from HEAD", () => {
    // The v1.24 incident lived in commit MESSAGES as well as blobs -- the 2026-07-25 history
    // purge needed --replace-message, not just --replace-text (see decisions.md). This scans
    // every commit message reachable from HEAD with the same hashed-token detection as the
    // file check above. Full history, no cutoff: the purge left the whole rewritten graph
    // clean, so any hit at any depth is a new leak. Nuance, documented: a shallow CI checkout
    // only exposes the commits it actually fetched, so this check's reach there equals the
    // checkout's -- pages-deploy.yml checks out with fetch-depth: 0 specifically so this
    // check sees the full graph before anything deploys.
    const log = require("node:child_process")
      .execFileSync("git", ["log", "--format=%B", "HEAD"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
      .toString("utf8");
    assert.ok(!containsProtectedName(log), "protected name found in at least one commit message reachable from HEAD");
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
  check("stage1", "tab system retired (v1.39): no tablist/tab/tabpanel/aria-selected; toggle labels pinned in app.js, no aria-pressed on it", () => {
    // v1.39: the Today/Weeks tab system was retired in favor of one scrolling page. This
    // check used to assert these roles were PRESENT; flipped in place to assert their ABSENCE
    // (same treatment as the Mara/Values retired-file guards and the isEveningWindowHKT/
    // isFocusWindowHKT retirement guards below) so a reintroduction is caught, not just
    // silently unchecked.
    assert.doesNotMatch(html(), /role=["']tablist["']/, "role=tablist must not be reintroduced (tab system retired v1.39)");
    assert.doesNotMatch(html(), /role=["']tab["']/, "role=tab must not be reintroduced (tab system retired v1.39)");
    assert.doesNotMatch(html(), /role=["']tabpanel["']/, "role=tabpanel must not be reintroduced (tab system retired v1.39)");
    assert.doesNotMatch(html(), /aria-selected/, "aria-selected must not be reintroduced (tab system retired v1.39)");
    // v1.29: the theme toggle is an action-named control (its accessible name changes per
    // state) and must NOT also carry aria-pressed — the old `aria-pressed`-in-index.html
    // assertion is retargeted to the exact two label strings app.js swaps between.
    assert.ok(appjs().includes('"Switch to dark theme"'), 'app.js missing pinned label "Switch to dark theme"');
    assert.ok(appjs().includes('"Switch to pink theme"'), 'app.js missing pinned label "Switch to pink theme"');
    const toggleTag = /<button id="theme-toggle"[^>]*>/.exec(html());
    assert.ok(toggleTag, "no theme-toggle button in index.html");
    assert.doesNotMatch(toggleTag[0], /aria-pressed/, "theme-toggle must not carry aria-pressed");
  });
  check("stage1", "single page (v3.0): .mindset-panel > #weeks-root is main's only content; #cards/.seam/#staleness-chip retired", () => {
    // v3.0: the Journal card is retired, and with it everything that only ever shared main
    // with Weeks -- #cards, .seam (the divider between them), #staleness-chip (the Journal
    // freshness indicator). Weeks is now the entire page. Retargeted from the v1.39/v2.0 check
    // of the same name/spirit, which asserted .mindset-panel > #cards -> .seam -> #weeks-root
    // DOM order; that ordering assumption no longer applies since two of the three nodes it
    // ordered are gone -- a loud absence guard, not a bare deletion, so a reintroduction (a bad
    // merge, a stray revert) is caught rather than silently shipped.
    const src = html();
    const mainOpen = src.indexOf("<main>");
    assert.ok(mainOpen !== -1, "no <main> tag found");
    const mainClose = src.indexOf("</main>", mainOpen);
    assert.ok(mainClose !== -1, "no closing </main> tag found");
    const mainHTML = src.slice(mainOpen, mainClose);
    const iPanel = mainHTML.indexOf('class="mindset-panel"');
    const iWeeks = mainHTML.indexOf('id="weeks-root"');
    assert.ok(iPanel !== -1, ".mindset-panel not found inside main");
    assert.ok(iWeeks !== -1, "#weeks-root not found inside main");
    assert.ok(iPanel < iWeeks, "expected DOM order .mindset-panel -> #weeks-root inside main");
    assert.doesNotMatch(src, /id="cards"/, "#cards must not be reintroduced (Journal card retired v3.0)");
    assert.doesNotMatch(src, /class="seam"/, ".seam must not be reintroduced (Journal card retired v3.0)");
    assert.doesNotMatch(src, /id="staleness-chip"/, "#staleness-chip must not be reintroduced (Journal card retired v3.0)");
  });
  check("stage1", "localStorage: mindset.theme only in a removeItem; zero other localStorage use app-wide", () => {
    // v1.29 retired theme persistence entirely — the ONLY localStorage touch permitted
    // anywhere in the app is index.html's removeItem cleanup of the retired key, which
    // runs on every load (idempotent and harmless once the key is gone, not a one-shot).
    const files = ["index.html", "app.js", "figure.js", "lib.mjs", "weeks.js", "sw.js"].filter(exists);
    const offenders = [];
    let removes = 0;
    for (const f of files) {
      const src = read(f);
      for (const m of src.matchAll(/localStorage\s*(?:\.\s*(\w+)|\[)/g)) {
        if (m[1] === "removeItem") { removes++; continue; }
        offenders.push(`${f}: ${m[0].trim()}`);
      }
    }
    assert.equal(offenders.length, 0, `unexpected localStorage usage: ${offenders.join(" | ")}`);
    assert.equal(removes, 1, `expected exactly one localStorage.removeItem (the index.html cleanup), found ${removes}`);
    assert.match(html(), /localStorage\.removeItem\("mindset\.theme"\)/);
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
  check("stage1", "no bare locale-date calls without timeZone (app/figure/weeks/index.html)", () => {
    const offenders = exists("app.js") ? localeDateWithoutTZ(appjs()) : [];
    if (exists("figure.js")) offenders.push(...localeDateWithoutTZ(read("figure.js")));
    if (exists("weeks.js")) offenders.push(...localeDateWithoutTZ(read("weeks.js")));
    // index.html's pre-paint snippet is genuinely time-critical since v1.29.
    offenders.push(...localeDateWithoutTZ(html()));
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

  check("stage1", "WCAG contrast pairs pass at corrected thresholds (blossom + dark)", () => {
    // v1.29: calm and the evening --bg shift are retired; the theme set is blossom + dark
    // (themeTokens() carries the old evening check's loud-failure extraction guard forward).
    // v2.0 added three --surface-2 pairs (the Journal card's nested inner prompt box) to every
    // existing pair list a real --surface pairing already covered. v3.0 retired --surface-2
    // itself along with the Journal card it was styled for, so those three pairs are dropped
    // here (invariant-12 logged exception -- see decisions.md); the remaining six are unchanged.
    const themes = themeTokens(css());
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

  // v2.0: the Weeks section became a permanently dark card, independent of the page's
  // blossom/dark theme (see styles.css's --weeks-* token comment and audits/decisions.md
  // v2.0) -- --person-j/--person-b/--weeks-muted/--weeks-ink are now fixed constants, not
  // theme-scoped, so this replaces the old "person colors vs --bg/--surface in both themes"
  // check (that pairing no longer reflects where these colors actually render) with checks
  // against the surfaces they now actually sit on: --weeks-bg (the section) and --weeks-card
  // (the nested grid card, the harder constraint since it's the lighter of the two). Still
  // looped over both theme extractions for parity with the rest of this file, even though
  // blossom/dark resolve to the identical fixed values by construction.
  check("stage1", "weeks-section colors >= 4.5:1 on --weeks-bg and --weeks-card, both theme extractions (v2.0)", () => {
    const themes = themeTokens(css());
    const failures = [];
    for (const [themeName, tokens] of Object.entries(themes)) {
      for (const p of ["person-j", "person-b", "weeks-muted", "weeks-ink"]) {
        for (const base of ["weeks-bg", "weeks-card"]) {
          assert.ok(tokens[p] && tokens[base], `${themeName}: missing token --${p} or --${base}`);
          const ratio = contrastRatio(tokens[p], tokens[base]);
          if (ratio < 4.5) failures.push(`${themeName} (--${p} on --${base}) = ${ratio.toFixed(2)} < 4.5`);
        }
      }
      // --weeks-ink additionally renders directly on --weeks-pill-bg (the seam pill).
      const pillRatio = contrastRatio(tokens["weeks-ink"], tokens["weeks-pill-bg"]);
      if (pillRatio < 4.5) failures.push(`${themeName} (--weeks-ink on --weeks-pill-bg) = ${pillRatio.toFixed(2)} < 4.5`);
      // --weeks-accent renders as real text only in the epigraph attribution, on --weeks-bg.
      const accentRatio = contrastRatio(tokens["weeks-accent"], tokens["weeks-bg"]);
      if (accentRatio < 4.5) failures.push(`${themeName} (--weeks-accent on --weeks-bg) = ${accentRatio.toFixed(2)} < 4.5`);
    }
    assert.equal(failures.length, 0, failures.join(" | "));
  });

  // v3.0: the staleness chip was retired with the Journal card it flagged, so its
  // tint-composited contrast check has nothing left to iterate -- removed (invariant-12 logged
  // exception, see decisions.md), replaced below by a check of the new .weeks-error state,
  // which is now the only failure-surfacing UI on the page.
  check("stage1", "error state: --muted and --ink >= 4.5:1 on --surface, both themes (v3.0 .weeks-error)", () => {
    // Weeks is no longer optional -- it IS the page -- so its failure state (.weeks-error,
    // painted when initWeeks() throws) must itself be legible in both themes. --error-label
    // renders in --muted, --error-msg in --ink, both directly on --surface (no tint compositing
    // involved, unlike the retired chip).
    const themes = themeTokens(css());
    const failures = [];
    for (const [themeName, tokens] of Object.entries(themes)) {
      for (const fg of ["muted", "ink"]) {
        assert.ok(tokens[fg] && tokens.surface, `${themeName}: missing token --${fg} or --surface`);
        const ratio = contrastRatio(tokens[fg], tokens.surface);
        if (ratio < 4.5) failures.push(`${themeName} (--${fg} on --surface) = ${ratio.toFixed(2)} < 4.5`);
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

  // v3.0: expectedDateHKT/staleness were retired with the daily pipeline they judged --
  // the 05:00 HKT content boundary they modeled no longer exists (removed, invariant-12
  // logged exception, see decisions.md).

  check("stage1", "app.js: visibilitychange resume re-checks theme, calendar day, and Weeks (v3.0)", () => {
    // v3.0: the Journal card, its 05:00 HKT content boundary, and the expectedDateHKT/staleness
    // model that judged it are all retired -- the only day boundary left is HKT midnight, and
    // the only content to refresh on resume is Weeks (computed fresh from today's HKT date,
    // never fetched). Retargeted from the v1.30/v1.34 check of the same name/spirit, which
    // pinned paintedDateHKT (the Journal CONTENT-day tracker) against expectedDateHKT; that
    // tracker and the bug class it guarded no longer exist. Source-pattern check, not a
    // behavioral one: app.js runs in a DOM this harness lacks.
    const src = read("app.js");
    assert.match(src, /paintedCalendarDateHKT\s*=\s*hktDateString\(now\)/,
      "paintedCalendarDateHKT must be stamped from hktDateString(now)");
    assert.match(src, /hktDateString\(now\)\s*!==\s*paintedCalendarDateHKT/,
      "the visibilitychange handler must re-render on a bare calendar-day flip");
    assert.match(src, /refreshWeeksIfStale\(\)/, "visibilitychange must call refreshWeeksIfStale()");
    assert.match(src, /visibilitychange/, "visibilitychange handler must be present");
    assert.doesNotMatch(src, /fetch\(/, "zero fetches remain in app.js (v3.0: nothing refreshes over the network)");
    assert.doesNotMatch(src, /daily\.json/, "app.js must not reference daily.json (retired v3.0)");
    assert.doesNotMatch(src, /cards\.json/, "app.js must not reference cards.json (retired v3.0)");
    assert.doesNotMatch(src, /expectedDateHKT/, "expectedDateHKT must not be reintroduced (retired v3.0)");
    assert.doesNotMatch(src, /staleness\(/, "staleness( must not be reintroduced (retired v3.0)");
    assert.doesNotMatch(src, /renderJournalCard/, "renderJournalCard must not be reintroduced (Journal card retired v3.0)");
    assert.doesNotMatch(src, /showChip/, "showChip must not be reintroduced (staleness chip retired v3.0)");
  });

  check("stage1", "lib.mjs: isFocusWindowHKT retired, not reintroduced (v1.39 -- focus/morning-hiding mode removed, unused)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    assert.equal(lib.isFocusWindowHKT, undefined, "isFocusWindowHKT should no longer be exported from lib.mjs");
    assert.doesNotMatch(read("app.js"), /isFocusWindowHKT|paintFocusedToday|windowMode|renderAnchorCard/,
      "focus mode / Anchor rendering must not be reintroduced into app.js");
  });

  check("stage1", "lib.mjs: isEveningWindowHKT retired, not reintroduced (v1.31 -- evening/Closing removed, unused)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    assert.equal(lib.isEveningWindowHKT, undefined, "isEveningWindowHKT should no longer be exported from lib.mjs");
    assert.doesNotMatch(read("app.js"), /isEveningWindowHKT|renderClosingCard|\bcards\.closing\b/,
      "evening/Closing must not be reintroduced into app.js");
  });

  check("stage1", "lib.mjs: rotation engine retired (v3.0): pickIndex/pickToday/minSeamGap/staleness/expectedDateHKT no longer exported", async () => {
    // v3.0: the entire v1.0-v2.0 rotation engine (Appendix B) was retired with the Journal
    // card it fed -- xmur3/mulberry32/shuffledOrder/shuffledOrderSeamSafe are internal (never
    // exported) so aren't independently checkable here, but every exported entry point is.
    // Same loud-absence treatment as isFocusWindowHKT/isEveningWindowHKT below: a reintroduction
    // must fail loudly, not silently pass unchecked.
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    for (const name of ["pickIndex", "pickToday", "minSeamGap", "staleness", "expectedDateHKT"]) {
      assert.equal(lib[name], undefined, `${name} should no longer be exported from lib.mjs (rotation engine retired v3.0)`);
    }
  });

  check("stage1", "lib.mjs: isDarkWindowHKT correct at the 06:00 and 17:00 HKT boundaries", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-14T21:59:59Z = 2026-07-15T05:59:59 HKT — last second of the overnight dark window
    assert.equal(lib.isDarkWindowHKT(new Date("2026-07-14T21:59:59Z")), true);
    // 2026-07-14T22:00:00Z = 2026-07-15T06:00:00 HKT — blossom takes over
    assert.equal(lib.isDarkWindowHKT(new Date("2026-07-14T22:00:00Z")), false);
    // 2026-07-15T08:59:59Z = 2026-07-15T16:59:59 HKT — last blossom second
    assert.equal(lib.isDarkWindowHKT(new Date("2026-07-15T08:59:59Z")), false);
    // 2026-07-15T09:00:00Z = 2026-07-15T17:00:00 HKT — dark window opens for the evening
    assert.equal(lib.isDarkWindowHKT(new Date("2026-07-15T09:00:00Z")), true);
  });

  check("stage1", "lib.mjs: 1440-minute sweep — dark/blossom partition the HKT day (transitions exactly at 06:00/17:00), hktHour always 0-23", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-14T16:00:00Z = 2026-07-15T00:00 HKT; walk one full HKT day minute by minute.
    // The hktHour range assertion doubles as the h23-vs-h24 ICU-safety guard for ALL three
    // window functions at once (each is a pure comparison on hktHour's return value).
    const start = Date.parse("2026-07-14T16:00:00Z");
    const transitions = [];
    let prev = null;
    for (let m = 0; m < 1440; m++) {
      const d = new Date(start + m * 60000);
      const h = lib.hktHour(d);
      assert.ok(Number.isInteger(h) && h >= 0 && h <= 23, `hktHour at minute ${m} = ${h}, outside [0,23]`);
      const dark = lib.isDarkWindowHKT(d);
      assert.equal(typeof dark, "boolean", `isDarkWindowHKT at minute ${m} is not boolean`);
      if (prev !== null && dark !== prev) transitions.push(m);
      prev = dark;
    }
    assert.deepEqual(transitions, [360, 1020],
      `expected exactly two dark/blossom transitions, at 06:00 (minute 360) and 17:00 (minute 1020) HKT; got [${transitions.join(", ")}]`);
  });

  check("stage1", "index.html pre-paint snippet agrees with lib.mjs isDarkWindowHKT (anti-drift)", async () => {
    // The snippet can't import lib.mjs, so it duplicates the boundary logic — this pins the
    // two together: structural match on the numbers/strings, behavioral match at all 24 hours.
    const src = html();
    const m = /var dark = \(h < (\d+) \|\| h >= (\d+)\);/.exec(src);
    assert.ok(m, "could not find `var dark = (h < N || h >= M);` in index.html's inline script");
    const lo = Number(m[1]), hi = Number(m[2]);
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    const midnightHKT = Date.parse("2026-07-14T16:00:00Z"); // 2026-07-15T00:00 HKT
    for (let hour = 0; hour < 24; hour++) {
      const d = new Date(midnightHKT + hour * 3600000);
      const snippetSays = hour < lo || hour >= hi;
      assert.equal(snippetSays, lib.isDarkWindowHKT(d),
        `HKT hour ${hour}: snippet boundaries (${lo},${hi}) say ${snippetSays}, lib.mjs says ${lib.isDarkWindowHKT(d)}`);
    }
    assert.match(src, /root\.setAttribute\("data-theme", dark \? "dark" : "blossom"\)/,
      "snippet must set the same two theme ids app.js/styles.css use");
    assert.match(src, /timeZone:\s*"Asia\/Hong_Kong",\s*hour:\s*"2-digit",\s*hour12:\s*false/,
      "snippet's hour read must be HKT-pinned, 2-digit, hour12:false (mirrors lib.mjs hktHour)");
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

  check("stage1", "weeks.js: no quotation-mark glyphs or banned platitudes in user-facing copy (EPIGRAPH text/attr)", () => {
    // v1.24: CAPTION (a flat string) became EPIGRAPH (an array of {text, attr} lines); the
    // legend this check also used to scan was removed entirely (see decisions.md). Updated to
    // match rather than left checking a constant that no longer exists -- a verify.mjs check
    // silently going stale exactly like this was the async-check bug this ratchet exists to
    // catch (v1.23). v3.0: with data/cards.json's platitude scan retired alongside the Journal
    // card, EPIGRAPH is the only user-facing copy verify.mjs still scans -- widened here to also
    // run findPlatitude over it (tightening, not a new category: the same guard, just no longer
    // only for cards.json).
    if (!exists("weeks.js")) return;
    const src = read("weeks.js");
    const problems = [];
    const textMatches = [...src.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)];
    const attrMatches = [...src.matchAll(/attr:\s*"((?:[^"\\]|\\.)*)"/g)];
    for (const m of textMatches) if (hasQuoteGlyph(m[1])) problems.push(`EPIGRAPH text: ${m[1]}`);
    for (const m of textMatches) { const p = findPlatitude(m[1]); if (p) problems.push(`EPIGRAPH text platitude "${p}": ${m[1]}`); }
    for (const m of attrMatches) if (hasQuoteGlyph(m[1])) problems.push(`EPIGRAPH attr: ${m[1]}`);
    assert.ok(textMatches.length >= 2, `expected >=2 EPIGRAPH text lines, found ${textMatches.length} -- check the check itself, not just weeks.js`);
    assert.equal(problems.length, 0, problems.join(" | "));
  });

  // v3.0: the three pickIndex checks that used to live here (full-cycle uniqueness, minimum
  // cross-seam gap, internal consistency across a cycle) were retired along with pickIndex
  // itself -- the rotation engine they proved correct has nothing left to iterate now that the
  // Journal card is gone (invariant-12 logged exception, see decisions.md). Its absence is now
  // covered by the "rotation engine retired" guard above instead.

  check("stage1", "styles.css: Journal-era rules retired (v3.0): no --surface-2, .chip, .seam, #cards, .card-body selectors", () => {
    // v3.0 audit finding (N1): re-adding --surface-2 passed 64/64 -- the token's three contrast
    // pairs were dropped with the Journal card, so nothing forbade its return as a dead token
    // that could drift out of contrast compliance unmeasured. Same loud-absence treatment the
    // other retirements got (wordOfDay/kenya/Mara/Values guards above and below).
    // Comments stripped first: the token block's own "--surface-2 retired" note is prose, not a rule.
    const src = css().replace(/\/\*[\s\S]*?\*\//g, "");
    for (const needle of [/--surface-2\b/, /^\s*\.chip\b/m, /^\s*\.seam\b/m, /^\s*#cards\b/m, /\.card-body\b/, /\.card-chip\b/]) {
      assert.doesNotMatch(src, needle, `styles.css matches ${needle}: retired with the Journal card in v3.0, must not be reintroduced`);
    }
  });

  check("stage1", "sw.js: every relative ASSETS entry exists on disk (addAll() rejects atomically on any 404)", () => {
    // v3.0 audit finding (N2): a nonexistent path in ASSETS passed 64/64 locally, yet
    // cache.addAll() fails the whole install on a single 404, which would silently break every
    // offline visit. The Appendix C.2 byte-identity check is deliberately modulo this array;
    // this only asserts the listed files exist, not what the list contains.
    const m = /const ASSETS = \[([\s\S]*?)\];/.exec(read("sw.js"));
    assert.ok(m, "could not find the ASSETS array in sw.js");
    const entries = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    assert.ok(entries.length >= 8, `suspiciously short ASSETS list (${entries.length})`);
    const missing = entries.filter((e) => e !== "./" && !exists(e.replace(/^\.\//, "")));
    assert.equal(missing.length, 0, `ASSETS entries missing on disk: ${missing.join(", ")}`);
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

function stage3() {
  // v3.0: the Journal card and the 1825-prompt data/cards.json pool that fed it are retired --
  // its six shape/count/word-cap/quote-glyph/platitude checks and the two rotation-simulation
  // checks below (invariant-12 logged exceptions, see decisions.md) have nothing left to
  // iterate. Historical content survives in git history (the commit before this round's) and in
  // audits/CONTENT-REVIEW.md's retirement note. Replaced with a loud absence guard, kept
  // alongside the pre-existing Mara/Values retired-file guards this file already used for the
  // same purpose.
  check("stage3", "Journal retired (v3.0): no journal/cards.json references in shipped code", () => {
    // Strips comments before scanning so the retirement notes THIS FILE and its sibling docs
    // agent write (which legitimately say "journal"/"cards.json" in prose) can't ever be
    // mistaken for a real reference living in shipped code.
    const stripJsComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, "");
    const targets = [
      ["index.html", stripHtmlComments],
      ["app.js", stripJsComments],
      ["weeks.js", stripJsComments],
      ["lib.mjs", stripJsComments],
      ["sw.js", stripJsComments],
    ];
    const offenders = [];
    for (const [f, strip] of targets) {
      if (!exists(f)) continue;
      const src = strip(read(f));
      for (const needle of [/cards\.json/i, /daily\.json/i, /journal/i]) {
        if (needle.test(src)) offenders.push(`${f}: matches ${needle}`);
      }
    }
    assert.equal(offenders.length, 0, offenders.join(" | "));
  });

  check("stage3", "Mara tab retired (v1.36): mara.js, data/mara.json, assets/mara/ do not exist", () => {
    // Same treatment as v1.31/v1.35's closing/wordOfDay negative guards: the five mara.json
    // shape checks and the photo-budget check have nothing left to iterate now that the file
    // and the asset directory are gone, so they're deleted outright rather than left dead --
    // but a bare deletion risks a future accidental reintroduction (a bad merge, a stray
    // revert) going unnoticed. This guard fails loudly if any of the three ever reappear
    // without the tab being rebuilt around them. mara.js itself is included (not just its
    // data) because it had also been dropped from three other hardcoded file-list sweeps
    // (the localStorage scan, the bare-locale-date scan, the JS budget sum) -- a lone
    // mara.js reappearing would otherwise pass 80/80 while silently escaping all three
    // (v1.36 audit finding).
    assert.ok(!exists("mara.js"), "mara.js exists but the Mara tab was retired in v1.36");
    assert.ok(!exists("data/mara.json"), "data/mara.json exists but the Mara tab was retired in v1.36");
    assert.ok(!fs.existsSync(abs("assets/mara")), "assets/mara/ exists but the Mara tab was retired in v1.36");
  });

  check("stage3", "Values tab retired (v1.37): data/values.json does not exist", () => {
    // Same treatment as the Mara guard directly above (and v1.31/v1.35's closing/wordOfDay
    // guards before it): the values.json shape/word-cap/quote-glyph checks had nothing left
    // to iterate once the file is gone, so their values-specific clauses were removed from
    // the shared word-cap/quote-glyph checks (which still cover journal, and covered kenya
    // until it was retired in v1.38 and anchors until v1.39) rather than left dead. This guard fails loudly
    // if the file is ever reintroduced without the tab being rebuilt around it.
    assert.ok(!exists("data/values.json"), "data/values.json exists but the Values tab was retired in v1.37");
  });

  check("stage3", "audits/CONTENT-REVIEW.md exists", () => assert.ok(exists("audits/CONTENT-REVIEW.md"), "missing"));
}

// ---------- Stage 4 ----------

function stage4() {
  // v3.0: the daily pipeline (the cron workflow, the watchdog that only ever checked its output
  // for staleness, the generator script, and the generated file's schema) is retired wholesale
  // along with the Journal card it fed -- nothing about the site refreshes daily anymore.
  // Replaced with a loud absence guard (invariant-12 logged exception, see decisions.md).
  check("stage4", "daily pipeline retired (v3.0): daily.yml, watchdog.yml, scripts/generate-daily.mjs do not exist", () => {
    assert.ok(!exists(".github/workflows/daily.yml"), ".github/workflows/daily.yml exists but the daily pipeline was retired in v3.0");
    assert.ok(!exists(".github/workflows/watchdog.yml"), ".github/workflows/watchdog.yml exists but it only ever checked daily.json staleness, retired in v3.0");
    assert.ok(!exists("scripts/generate-daily.mjs"), "scripts/generate-daily.mjs exists but the daily pipeline was retired in v3.0");
  });

  check("stage4", "pages-deploy.yml: on push to main, runs verify.mjs all before deploy, fetch-depth 0, stages no data/ dir", () => {
    // v3.0: data/ no longer exists, so pages-deploy.yml's staging step must not try to `cp -r`
    // it (that line would fail every deploy) -- the fetch-depth 0 and verify.mjs all gates this
    // check already relied on are unchanged; only the data/ clause is new here.
    assert.ok(exists(".github/workflows/pages-deploy.yml"), "missing");
    const y = read(".github/workflows/pages-deploy.yml");
    assert.match(y, /branches:\s*\[main\]/);
    assert.match(y, /node scripts\/verify\.mjs all/);
    assert.match(y, /fetch-depth:\s*0/);
    assert.doesNotMatch(y, /cp -r data/, "pages-deploy.yml must not stage data/ (retired v3.0)");
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
  check("stage5", "byte budgets: JS <= 65KB, icons <= 150KB, fonts <= 300KB", () => {
    // JS budget raised 60KB -> 65KB in v1.34 (invariant-12 logged exception) -- see
    // audits/decisions.md for the original check text this replaced and the reason.
    const jsFiles = ["app.js", "figure.js", "lib.mjs", "weeks.js", "sw.js"].filter(exists);
    const jsTotal = jsFiles.reduce((sum, f) => sum + sizeOf(f), 0);
    assert.ok(jsTotal <= 65 * 1024, `JS total ${jsTotal} bytes > 65KB (${jsFiles.join(",")})`);
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
  check("stage5", "page weight (index.html+styles.css+js+manifest+sw) <= 600KB excl. fonts", () => {
    // Budget raised 350KB -> 600KB in v1.32 (invariant-12 logged exception, owner-authorized)
    // to fit the 1825-entry, 5-year Journal pool; see audits/decisions.md for the original
    // text this replaced and the reasoning. v3.0: data/cards.json and data/daily.json are
    // retired along with the Journal card and no longer exist, so the two data-json entries are
    // dropped from the summed file list (the file list only got smaller; the cap itself is
    // unchanged -- still a tightening in spirit, not a relaxation).
    const files = ["index.html", "styles.css", "app.js", "figure.js", "lib.mjs", "weeks.js", "manifest.webmanifest", "sw.js"].filter(exists);
    const total = files.reduce((sum, f) => sum + sizeOf(f), 0);
    assert.ok(total <= 600 * 1024, `total ${total} bytes > 600KB (${files.join(",")})`);
  });
  check("stage5", "README.md runbook present, non-trivial", () => {
    assert.ok(exists("README.md"));
    assert.ok(read("README.md").length > 500, "README looks like a stub, not a runbook");
  });
  check("stage5", "verify.mjs integrity ratchet: diff-vs-Stage-0 note present in FINAL-AUDIT, count current", () => {
    if (!exists("audits/FINAL-AUDIT.md")) throw new Error("audits/FINAL-AUDIT.md not written yet");
    const text = read("audits/FINAL-AUDIT.md");
    assert.match(text, /verify\.mjs/i);
    // v1.33 audit finding: the check above is true forever (the substring "verify.mjs" always
    // appears somewhere), so it never actually caught FINAL-AUDIT.md going stale -- the file
    // sat unedited from v1.12 to v1.29 while the real count moved 59 -> 82 and a real
    // relaxation (350KB -> 600KB) shipped, and nothing here noticed. Only meaningful in "all"
    // mode: this check is the LAST one registered in the LAST stage, so by the time its fn()
    // runs, `results` already holds every other check's pushed result (check() pushes AFTER
    // fn() returns) -- `results.length + 1` is therefore the true live total, computed from
    // the actual run, not a hardcoded or source-grepped number that could itself drift. An
    // isolated `stage5`-only run has no way to know the full-suite total, so it skips this half
    // rather than fail on a number it structurally cannot compute -- the committed convention
    // is always `all` (BUILD-PLAN.md Appendix A, CLAUDE.md invariant 12), so every run that
    // matters still gets the real guard.
    if (mode === "all") {
      const liveTotal = results.length + 1;
      assert.match(
        text,
        new RegExp(`\\b${liveTotal}/${liveTotal}\\b`),
        `FINAL-AUDIT.md doesn't mention the current live total (${liveTotal}/${liveTotal}) -- its ` +
        `diff-vs-Stage-0 summary is stale. Add a dated update paragraph per invariant 12's second clause.`
      );
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
    try {
      const resolved = await r.detail;
      // Same undefined -> "ok" normalization the sync path applies in check() itself (line ~51)
      // -- without it, an async check with no explicit return value resolved to `String(undefined)`,
      // the literal text "undefined", which the v1.33 print-loop fix below would then wrongly
      // treat as real informational content and print on an otherwise-silent green line.
      r.detail = resolved === undefined ? "ok" : String(resolved);
      r.pass = true;
    } catch (e) { r.pass = false; r.detail = e.message; }
  }
}

const width = Math.max(...results.map((r) => r.name.length), 20);
let anyFail = false;
console.log(`\nverify.mjs — mode: ${mode}\n`);
for (const r of results) {
  if (!r.pass) anyFail = true;
  const icon = r.pass ? "✅" : "❌";
  // v1.33 bug fix: this used to print `detail` only on failure, so a passing "informational,
  // non-blocking" check (the near-duplicate proxies) could never actually inform anyone --
  // its whole return value was computed then discarded, silently, forever. A passing check
  // still shows nothing when its detail is the generic "ok" placeholder (the overwhelming
  // majority of checks), so ordinary green output stays exactly as quiet as before; only a
  // check that deliberately returns a real message, pass or fail, gets it shown.
  const showDetail = !r.pass || r.detail !== "ok";
  console.log(`${icon} [${r.stage}] ${r.name.padEnd(width)} ${showDetail ? "— " + r.detail : ""}`);
}
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} checks passed.\n`);
process.exit(anyFail ? 1 : 0);
