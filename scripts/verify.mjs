#!/usr/bin/env node
// scripts/verify.mjs — stage-gated verification harness (BUILD-PLAN.md Appendix A, v1.1)
// Node >= 20, zero deps. Usage: node scripts/verify.mjs <stage0..stage5|all>
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
// Composite a CSS rgba() tint over a solid hex base -> solid hex, for the pill/chip pairs
// whose rendered background is translucent (their contrast is real but not token-vs-token).
function parseRgba(str) {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(str);
  return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
}
function compositeOver(rgbaStr, baseHex) {
  const f = parseRgba(rgbaStr);
  if (!f) throw new Error(`not an rgba() tint: ${rgbaStr}`);
  const b = hexToRgb(baseHex);
  const mix = (fg, bg) => Math.round(f.a * fg + (1 - f.a) * bg);
  const to2 = (n) => n.toString(16).padStart(2, "0");
  return `#${to2(mix(f.r, b.r))}${to2(mix(f.g, b.g))}${to2(mix(f.b, b.b))}`;
}
// Pull `background:` (rgba tint) and `color:` (hex) out of one CSS rule found by regex.
function ruleTintAndColor(cssText, selectorRegex, label) {
  const block = extractBlock(cssText, selectorRegex);
  assert.ok(block, `could not find rule: ${label}`);
  const bg = /background:\s*([^;]+);/.exec(block);
  const color = /color:\s*(#[0-9A-Fa-f]{3,8})/.exec(block);
  assert.ok(bg && color, `rule ${label} is missing background: or a hex color:`);
  return { tint: bg[1].trim(), color: color[1] };
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
    for (const d of ["assets/fonts", "assets/icons", "data", "scripts", ".github/workflows", "audits"]) {
      assert.ok(fs.existsSync(abs(d)) && fs.statSync(abs(d)).isDirectory(), `missing dir ${d}`);
    }
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
  check("stage1", "tablist + aria roles present; toggle labels pinned in app.js, no aria-pressed on it", () => {
    assert.match(html(), /role=["']tablist["']/);
    assert.match(html(), /role=["']tab["']/);
    assert.match(html(), /aria-selected/);
    // v1.29: the theme toggle is an action-named control (its accessible name changes per
    // state) and must NOT also carry aria-pressed — the old `aria-pressed`-in-index.html
    // assertion is retargeted to the exact two label strings app.js swaps between.
    assert.ok(appjs().includes('"Switch to dark theme"'), 'app.js missing pinned label "Switch to dark theme"');
    assert.ok(appjs().includes('"Switch to pink theme"'), 'app.js missing pinned label "Switch to pink theme"');
    const toggleTag = /<button id="theme-toggle"[^>]*>/.exec(html());
    assert.ok(toggleTag, "no theme-toggle button in index.html");
    assert.doesNotMatch(toggleTag[0], /aria-pressed/, "theme-toggle must not carry aria-pressed");
  });
  check("stage1", "localStorage: mindset.theme only in a removeItem; zero other localStorage use app-wide", () => {
    // v1.29 retired theme persistence entirely — the ONLY localStorage touch permitted
    // anywhere in the app is index.html's removeItem cleanup of the retired key, which
    // runs on every load (idempotent and harmless once the key is gone, not a one-shot).
    const files = ["index.html", "app.js", "figure.js", "lib.mjs", "weeks.js", "mara.js", "sw.js"].filter(exists);
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
  check("stage1", "no bare locale-date calls without timeZone (app/figure/weeks/mara/index.html)", () => {
    const offenders = exists("app.js") ? localeDateWithoutTZ(appjs()) : [];
    if (exists("figure.js")) offenders.push(...localeDateWithoutTZ(read("figure.js")));
    if (exists("weeks.js")) offenders.push(...localeDateWithoutTZ(read("weeks.js")));
    if (exists("mara.js")) offenders.push(...localeDateWithoutTZ(read("mara.js")));
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

  check("stage1", "person colors >= 4.5:1 on --bg and --surface in both themes (v1.22 hand-check, now gated)", () => {
    const themes = themeTokens(css());
    const failures = [];
    for (const [themeName, tokens] of Object.entries(themes)) {
      for (const p of ["person-j", "person-b"]) {
        for (const base of ["bg", "surface"]) {
          assert.ok(tokens[p] && tokens[base], `${themeName}: missing token --${p} or --${base}`);
          const ratio = contrastRatio(tokens[p], tokens[base]);
          if (ratio < 4.5) failures.push(`${themeName} (--${p} on --${base}) = ${ratio.toFixed(2)} < 4.5`);
        }
      }
    }
    assert.equal(failures.length, 0, failures.join(" | "));
  });

  check("stage1", "composited --edge pills: --ink >= 4.5:1 on edge-over-surface (Kenya countdown) and edge-over-bg (Mara pressed pill), both themes", () => {
    // These pills render text on a translucent --edge tint — real rendered pairs that the
    // token-vs-token check above can never see (hand-verified in v1.17, gated since v1.29).
    const themes = themeTokens(css());
    const failures = [];
    for (const [themeName, tokens] of Object.entries(themes)) {
      for (const base of ["surface", "bg"]) {
        const ratio = contrastRatio(tokens.ink, compositeOver(tokens.edge, tokens[base]));
        if (ratio < 4.5) failures.push(`${themeName} (--ink on edge-over-${base}) = ${ratio.toFixed(2)} < 4.5`);
      }
    }
    assert.equal(failures.length, 0, failures.join(" | "));
  });

  check("stage1", "staleness chips: text >= 4.5:1 on its tint composited over --bg, both themes", () => {
    const themes = themeTokens(css());
    const rules = {
      blossom: {
        amber: ruleTintAndColor(css(), /^\.chip\.amber\s*\{/m, ".chip.amber"),
        slate: ruleTintAndColor(css(), /^\.chip\.slate\s*\{/m, ".chip.slate"),
      },
      dark: {
        amber: ruleTintAndColor(css(), /\[data-theme=["']dark["']\]\s*\.chip\.amber\s*\{/, "dark .chip.amber"),
        slate: ruleTintAndColor(css(), /\[data-theme=["']dark["']\]\s*\.chip\.slate\s*\{/, "dark .chip.slate"),
      },
    };
    const failures = [];
    for (const [themeName, chips] of Object.entries(rules)) {
      for (const [chipName, { tint, color }] of Object.entries(chips)) {
        const ratio = contrastRatio(color, compositeOver(tint, themes[themeName].bg));
        if (ratio < 4.5) failures.push(`${themeName} .chip.${chipName} = ${ratio.toFixed(2)} < 4.5`);
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

  check("stage1", "app.js: PWA-resume day-flip check uses expectedDateHKT, not raw hktDateString (v1.30)", () => {
    // Bug: paintedDateHKT was stamped with the raw HKT calendar date, which flips at midnight,
    // while content only rolls over at the 05:00 HKT boundary staleness() actually judges (the
    // line above). A resume during 00:00-05:00 "used up" that day's flip early; a later
    // same-morning resume (after the real 05:00 rotation, same window mode) then compared two
    // equal raw dates, skipped the refetch, and left the prior day's cards painted with no
    // further recheck all day -- reproduced live via Playwright clock mocking + a synthetic
    // visibilitychange dispatch (no reload) before this check was written; see decisions.md.
    // Source-pattern check, not a behavioral one: app.js runs in a DOM this harness lacks.
    const src = read("app.js");
    assert.match(src, /paintedDateHKT\s*=\s*expectedDateHKT\(now\)/,
      "paintedDateHKT must be stamped from expectedDateHKT(now), not the raw HKT calendar date");
    assert.match(src, /expectedDateHKT\(now\)\s*!==\s*paintedDateHKT/,
      "the visibilitychange day-flip comparison must use expectedDateHKT(now), matching staleness()'s boundary");
    assert.doesNotMatch(src, /\bhktDateString\b/, "hktDateString is unused in app.js now -- drop it, don't reintroduce it");
  });

  check("stage1", "lib.mjs: isFocusWindowHKT correct at the 09:00 HKT boundary", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    // 2026-07-15T00:59:00Z = 2026-07-15T08:59 HKT — inside the pre-09:00 focus window
    assert.equal(lib.isFocusWindowHKT(new Date("2026-07-15T00:59:00Z")), true);
    // 2026-07-15T01:00:00Z = 2026-07-15T09:00 HKT — window has closed
    assert.equal(lib.isFocusWindowHKT(new Date("2026-07-15T01:00:00Z")), false);
  });

  check("stage1", "lib.mjs: isEveningWindowHKT retired, not reintroduced (v1.31 -- evening/Closing removed, unused)", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    assert.equal(lib.isEveningWindowHKT, undefined, "isEveningWindowHKT should no longer be exported from lib.mjs");
    assert.doesNotMatch(read("app.js"), /isEveningWindowHKT|renderClosingCard|\bcards\.closing\b/,
      "evening/Closing must not be reintroduced into app.js");
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

  check("stage1", "lib.mjs: pickIndex full-cycle uniqueness for pools 1825/365/120/40/30/10", async () => {
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    for (const poolSize of [1825, 365, 120, 40, 30, 10]) {
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

  check("stage1", "lib.mjs: pickIndex has no consecutive-day repeat across 10 cycle SEAMS per pool (v1.31 fix)", async () => {
    // The full-cycle check above only proves uniqueness WITHIN one cycle; it can't catch a
    // repeat AT the boundary between two independently-shuffled cycles, which is exactly the
    // class of bug the v1.31 seam guard fixes (see lib.mjs's pickIndex comment). Sweeps 10
    // consecutive seams (not just 1) per pool, across every salt in current use ("closing" is
    // retired -- kept here anyway as a generic-correctness check, proving the fix isn't
    // accidentally salt-specific -- plus one synthetic salt), so a fix that happens to work for
    // one lucky seed can't pass silently.
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    for (const poolSize of [1825, 365, 60, 40, 34, 30, 10, 5]) {
      for (const salt of ["anchor", "journal", "kenya", "word", "closing", "arbitrary-salt"]) {
        for (let cycle = 1; cycle <= 10; cycle++) {
          const seamDay = cycle * poolSize; // first day of `cycle`, i.e. dayNumber%poolSize===0
          const before = lib.pickIndex(poolSize, seamDay - 1, salt);
          const after = lib.pickIndex(poolSize, seamDay, salt);
          assert.notEqual(before, after,
            `pool ${poolSize} salt "${salt}": day ${seamDay - 1} and day ${seamDay} (cycle seam) both picked index ${after}`);
        }
      }
    }
  });

  check("stage1", "lib.mjs: pickIndex is internally consistent -- every day in a cycle agrees on that cycle's order (v1.31 regression guard)", async () => {
    // The bug the seam fix itself had, caught before shipping: if the swap decision depended
    // on WHICH dayNumber triggered it instead of the cycle alone, two different days inside the
    // SAME cycle could each recompute a different order and collide with each other -- proven
    // by reconstructing each cycle's full picked sequence from its individual per-day calls and
    // checking it's still a genuine permutation (every index appears exactly once).
    const lib = await import(`file://${abs("lib.mjs")}?t=${Date.now()}`);
    for (const poolSize of [1825, 365, 40, 34, 10]) {
      for (let cycle = 0; cycle <= 4; cycle++) {
        const picks = [];
        for (let i = 0; i < poolSize; i++) picks.push(lib.pickIndex(poolSize, cycle * poolSize + i, "journal"));
        assert.equal(new Set(picks).size, poolSize, `pool ${poolSize} cycle ${cycle}: per-day calls don't form a permutation`);
      }
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
    assert.ok(Array.isArray(d.anchors) && Array.isArray(d.journal) && Array.isArray(d.kenya) && Array.isArray(d.wordOfDay));
    assert.equal(d.closing, undefined, "closing pool retired in v1.31 (evening feature removed) -- must not be reintroduced");
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
  check("stage3", "journal = 1825, kenya = 60, wordOfDay = 30", () => {
    const d = readJSON("data/cards.json");
    assert.equal(d.journal.length, 1825, `journal = ${d.journal.length}`);
    assert.equal(d.kenya.length, 60, `kenya = ${d.kenya.length}`);
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
  check("stage3", "word caps respected (anchors <=40w, journal prompts <=25w, kenya facts<=40w, wordOfDay meaning<=20w, values essence<=14w/behaviour<=16w)", () => {
    const d = readJSON("data/cards.json");
    const v = readJSON("data/values.json");
    const problems = [];
    for (const a of d.anchors) if (wordCount(a.text) > 40) problems.push(`${a.id}: ${wordCount(a.text)}w`);
    for (const j of d.journal) if (wordCount(j.prompt) > 25) problems.push(`${j.id}: ${wordCount(j.prompt)}w`);
    for (const k of d.kenya) if (wordCount(k.fact) > 40) problems.push(`${k.id}: ${wordCount(k.fact)}w`);
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
    for (const k of d.kenya) { scan(`${k.id}.category`, k.category); scan(`${k.id}.fact`, k.fact); }
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
    for (const k of d.kenya) scan(k.id, k.fact);
    for (const w of d.wordOfDay) scan(w.id, w.meaning);
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
  check("stage3", "journal: exact-duplicate guard + near-duplicate proxy (v1.32, 1825 entries) — informational, non-blocking", () => {
    // Exact duplicates ARE a hard failure (unlike the fuzzy proxy below) -- a byte-identical
    // repeat in a pool explicitly sized for "no repeat" would defeat the entire point of the
    // v1.31 pickIndex seam fix. Near-duplicates stay informational -- run once per authoring
    // pass, not worth blocking CI on. Threshold lowered 75% -> 70% in v1.33: the shipped
    // corpus's real max was exactly 75.00% (one pair, a strict `>` away from ever firing), so
    // the check had zero margin -- structurally unable to ever flag anything again short of a
    // regression at exactly the ceiling. 70% still clears every false-positive pair the v1.32
    // authoring pass already read and accepted (shared connective scaffold -- "today", "you",
    // "which of today's" -- around substantively different content); it surfaces 12 pairs as
    // informational notes now, a real signal instead of a check that can only ever pass silent.
    const d = readJSON("data/cards.json");
    const seen = new Map();
    const exactDupes = [];
    for (const j of d.journal) {
      const key = j.prompt.trim().toLowerCase();
      if (seen.has(key)) exactDupes.push(`${seen.get(key)} ~ ${j.id}`);
      else seen.set(key, j.id);
    }
    assert.equal(exactDupes.length, 0, `exact duplicate journal prompts: ${exactDupes.join(", ")}`);
    const tok = (s) => new Set(s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
    const toks = d.journal.map((j) => tok(j.prompt));
    const flagged = [];
    for (let i = 0; i < d.journal.length; i++) {
      for (let j = i + 1; j < d.journal.length; j++) {
        const a = toks[i], b = toks[j];
        const overlap = [...a].filter((w) => b.has(w)).length;
        const denom = Math.min(a.size, b.size) || 1;
        if (overlap / denom > 0.70) flagged.push(`${d.journal[i].id} ~ ${d.journal[j].id}`);
      }
    }
    return flagged.length ? `flagged for human review: ${flagged.join(", ")}` : "no near-duplicates flagged (>70%)";
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
    assert.ok(anchor && anchor.id && journal && journal.id && kenya && kenya.id && word && word.id);
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
    assert.ok(typeof d.anchorId === "string" && typeof d.journalId === "string" && typeof d.kenyaId === "string" && typeof d.wordId === "string");
    assert.equal(d.closingId, undefined, "closingId retired in v1.31 (evening feature removed) -- must not be reintroduced");
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
  check("stage5", "page weight (index.html+styles.css+data jsons) <= 600KB excl. fonts", () => {
    // Budget raised 350KB -> 600KB in v1.32 (invariant-12 logged exception, owner-authorized)
    // to fit the 1825-entry, 5-year Journal pool; see audits/decisions.md for the original
    // text this replaced and the reasoning.
    const files = ["index.html", "styles.css", "app.js", "figure.js", "lib.mjs", "weeks.js", "mara.js", "manifest.webmanifest", "sw.js",
      "data/cards.json", "data/values.json", "data/daily.json", "data/mara.json"].filter(exists);
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
