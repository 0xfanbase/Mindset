# MINDSET — Autonomous Build Plan (v1.4)

> **This file is the single source of truth.** It is written to be executed by Claude Code
> end-to-end with zero human input except the four escalation triggers in §11 (plus the
> §9.2 stop-loss condition, which is a standing terminal condition alongside them — see §11).
> If any instruction elsewhere conflicts with this file, this file wins.

**v1.1 changelog (from v1.0):** a project-director review (Fable-led, 7 dimensions + synthesis
+ completeness critique) found the v1.0 plan unsafe to run as-is in this execution environment.
This revision: (1) replaces every `gh`-CLI-only step with a capability-based / GitHub-MCP-first
approach, since `gh` is not installed here; (2) targets `main` directly throughout (the human
owner has authorized this for this empty personal repo — no PR flow); (3) rescopes invariant 1
(PII) to protect the site owner and his wife specifically — public-figure attribution is
intentional and required, not a violation; (4) fixes several self-contradictions between
invariants and their verification (repo-wide sweeps that could never pass, a pre-commit
git-cleanliness check, a "the ONLY four reasons to stop" line that collided with the stop-loss
rule); (5) fixes a real bug in the mandated-verbatim service worker (Appendix C.2 cached error
responses over good ones); (6) adds a content-QA pass beyond mechanical self-review for the
~180 bulk-authored public cards; (7) restates the timeline honestly (2.5–4.5 hours, not
45–90 minutes); (8) **replaces the "particle brain" signature element with a water drop**,
matching a further-along Claude Design prototype (project `84cffca3-021f-4e25-a4d7-f9a9a4b209d7`,
"Mindset Mobile UI.dc.html") the owner had already built and refined — see §4.6. That prototype
also supplied real, working `lib.mjs`/rotation code, a compact one-screen layout, and seed
content in the intended voice; these are folded in throughout §3–§5.

**v1.2 changelog (from v1.1, post-launch human feedback):** (1) **replaces the water-drop
signature element with a small human figure moving through a yoga sun salutation on repeat**
— `drop.js`/`<mindset-drop>` becomes `figure.js`/`<mindset-figure>`, see §4.6; (2) fixes a real
robustness bug in that element's predecessor: the original `_setup()` silently gave up if the
element had zero size at connect-time, relying only on a delayed `ResizeObserver` callback to
ever recover — the new implementation retries via `requestAnimationFrame` until it gets a real
size, so a slow-loading stylesheet can no longer leave the animation stuck on a static first
frame; (3) **values.json cut from 10 to 5** — ten read as a checklist, not a short list of what
actually matters; keep the original 5 core values, drop the 5 that were always marked "reserve,
held back for later curation" (§5.2, §5.3.6); (4) tightens Today-tab spacing (header, card
padding/gaps, date-line rhythm) that read as cluttered with three stacked cards at the old,
tighter values (§4.4, §4.5.3); (5) adds a mindset-relevance filter to the daily pipeline (§7) —
a live pick (an Ali Abdaal video on AI-prompt tactics) was off-theme for a mindset app; the
generator now rejects off-theme candidate titles against a denylist and looks past the newest
1-2 posts on a topically-broad source to find one that fits, rather than dropping the source
entirely or shipping whatever's newest regardless of relevance.

**v1.3 changelog (from v1.2, post-launch human feedback):** (1) re-investigated a repeat "the
animation is still not moving" report; found no code defect (live-deployed `figure.js` is
byte-identical to the v1.2 fix, `sw.js` is network-first so stale caching is an unlikely cause) —
logged as an anti-stuck pivot in `decisions.md` after four browser-automation diagnostic attempts
failed on environment/tooling grounds, with the most likely remaining explanation being the
viewer's own OS-level reduce-motion setting (by design, per invariant 7); (2) **adds a `voices`
anchor category (9 cards)** for named public figures the owner's household finds personally
inspiring (Jay Shetty, Joe Biden, Michelle Obama) — new §5.2 row, new §5.3.9 rule (extra bar for
this category: nonpartisan scope for anyone who has held political office, stricter
closeness-to-source check, mandatory independent QA pass), anchors total 120 → 129.

**v1.4 changelog (from v1.3, post-launch human feedback):** (1) the v1.3 "still not moving"
diagnosis is **confirmed** — the owner had the OS-level Reduce Motion accessibility setting on;
turning it off resolved it, with no code change needed (see `decisions.md`); (2) **the figure now
sits at the true top of the page**, ahead of the header — `.figure-wrap` moved out of `<main>` to
be `<body>`'s first child (before `<header>`), and the safe-area-inset-top padding moved from the
header to the figure-wrap accordingly (§4.4/§4.5); (3) **the sun-salutation animation is
substantially slower and closer to a real practice pace**: replaced the old constant-speed,
evenly-divided 12s loop with a hold-then-ease model — each pose is actually held for a beat (like
a breath) before a distinct transition to the next, 26.2s per full cycle, longer holds at the
poses held longest in practice (down-dog, the standing poses); (4) **added the missing eighth
pose** (Ashtanga Namaskara, the low bridge between plank and up-dog) for closer fidelity to a real
Surya Namaskar A sequence, now 12 named poses instead of 11; (5) the figure now renders a filled
torso band (shoulder-to-hip) instead of a single wire-thin spine line, reading more like an actual
body and less like a stick-figure skeleton, within the same canvas/no-image/no-dependency
constraints; `figure.js` stays at ~10KB, under the 12KB budget; (6) `sw.js` cache version bumped
`mindset-v2` → `mindset-v3` (Appendix C.2 amended to match) since core assets changed again.

---

## KICKOFF PROMPT (human copies this into Claude Code, run from the repo root)

```
Read BUILD-PLAN.md in full before doing anything. Then execute Stages 0 through 5
exactly as specified, fully autonomously. Obey §2 invariants at all times, follow
the §9 loop protocol for every stage, and only stop to ask a question if one of
the four triggers in §11 fires, or the §9.2 stop-loss condition is hit. After each
stage: run its verification, write its audit file, commit, then continue immediately
to the next stage. When the Stage 5 acceptance checklist passes, reply with (1) the
live GitHub Pages URL, (2) a one-screen summary of all stage audits, (3) anything
logged in decisions.md.
```

---

## §0 — How to run this (for the human, 3 steps)

1. Ensure the `Mindset` GitHub repo exists, is cloned locally, and the executor has authenticated
   GitHub access — either the `gh` CLI, or (this environment) GitHub MCP tools / a REST token.
   Either is fine; Stage 0's preflight tests the capability, not a specific binary.
2. Place this file (`BUILD-PLAN.md`) in the repo root, on `main`. Open Claude Code in the repo
   root. Paste the kickoff prompt above.
3. On GitHub, set repo **Watch → All activity** so watchdog issues email you. Walk away.
   **Expected wall-clock time: 2.5–4.5 hours** (six stages including a from-scratch verification
   harness, ~180 hand-authored content items with an independent QA pass, a canvas animation,
   two CI workflows dispatched and polled to green, and the plan's own bounded network/deploy
   waits — this is not a 45–90-minute task; treat a much-faster finish as a sign a step was
   shortcut, not that the plan was slow). Your only remaining job is the human review checklist
   in §13 after completion.

---

## §1 — Mission & product summary

A single-page, public, static website hosted on GitHub Pages. It is a personal
mindset dashboard that refreshes itself every morning at **06:00 Hong Kong time**
with three short grounding cards, headed by a living "mind" — a small human figure
moving through a yoga sun salutation, on repeat. Two tabs: **Today** (figure + date + 3
cards) and **Values** (a quiet list of core qualities). Two themes: a cream/blue default
and a soft pink alternative.
Zero backend. Zero dependencies. Zero personal data (about the owner — see §2.1).

The three daily cards:

1. **Anchor** — a timeless principle (Stoicism, Die With Zero, growth mindset, relationships, wealth principles, focus/energy), written as an original paraphrase with attribution.
2. **Shift** — a "From X → To Y" reframe.
3. **Fresh** — the newest item pulled from a small set of public RSS feeds (title + link only), or a reserve card if feeds are unavailable.

---

## §2 — Non-negotiable invariants (check EVERY stage against these)

1. **PII invariant — protects the site owner and his wife, not the ideas being discussed.**
   No real name, employer (past or present), financial figure, date of birth, or location
   tied to *the owner or his wife* anywhere in the repo — code, content, commit messages,
   audit files, README. This does **not** apply to public figures cited by design: anchor
   attributions (`— after Seneca`, `— after Bill Perkins`, etc., per §5) and §7.1's podcast/
   YouTube host names are intentional and required — the site is public, and quoting/citing
   public thinkers is the point of the Anchor cards. The pink theme is still called `blossom`
   in code and UI, never a person's name. Enforcement is mechanical only where it can be
   (email-address pattern sweep excluding the git bot identity; obvious phone/financial-figure
   patterns); person/employer-of-the-owner PII is otherwise enforced by the writing rules (§5)
   never referencing the owner at all, plus the §13 human review — not by a script pretending
   to detect it.
2. **No verbatim quotes.** Every card is an original paraphrase. Card bodies must contain
   **zero quotation-mark glyphs** (`"`, `"`, `"`, `'`, `'` used as quotation marks — an ASCII
   apostrophe `'` used intra-word for a contraction or possessive, e.g. "yesterday's", is not
   a quotation mark and is allowed). Attribution style: `— after Seneca`, `— after Bill Perkins`,
   `— core principle`, `— evergreen`. Never copy sentences from books, sites, or transcripts.
   Fresh cards carry only the item's **title + link** — no excerpts.
3. **Zero runtime dependencies.** Vanilla HTML/CSS/JS. No frameworks, no npm packages, no build step, no bundler, no analytics, no cookies, no third-party scripts or CDNs at runtime. `localStorage` only, keys namespaced `mindset.*`.
4. **Node ≥ 20 built-ins only** for scripts (global `fetch`, `node:fs`, `node:test` allowed). No `npm install` at any point. When running `generate-daily.mjs` locally in this environment, set `NODE_USE_ENV_PROXY=1` so Node's built-in `fetch` honours the environment's egress proxy (GitHub Actions runners are unaffected and need no flag).
5. **Static hosting truth:** everything must work on GitHub Pages served from `main` branch root. Include a `.nojekyll` file. All stages commit and push directly to `main` — the owner has authorized this for this repo; there is no feature-branch/PR step in this plan.
6. **Performance budget:** total page weight ≤ 350 KB excluding fonts; fonts ≤ 300 KB total; JS ≤ 60 KB total; the figure animation must pause when the tab is hidden and must honour `prefers-reduced-motion`.
7. **Accessibility floor:** WCAG AA contrast for all text token pairs (verified numerically in `verify.mjs`, including `(--muted,--bg)` and `(--accent,--bg)` — not just the on-`--surface` pairs — and gated at 4.5:1 for any pair used for normal-size text, 3:1 only where the token is genuinely large-text/UI-component use), visible keyboard focus, `aria` roles on tabs and theme toggle, tap targets ≥ 44px, semantic landmarks (`header`, `main`, `nav`, `footer`).
8. **Timezone law:** every date shown or computed is **Asia/Hong_Kong**, derived via `Intl.DateTimeFormat` with an explicit `timeZone` — never a bare `new Date().toLocaleDateString()` and never the runner's local time. `app.js`/`figure.js` must not call locale-date APIs without an explicit `timeZone` (Stage 1 verify greps for this).
9. **Search visibility:** `<meta name="robots" content="noindex">` (public but unlisted — note: this hides the Pages URL from search, but the GitHub repo itself, including `cards.json`, remains a public, indexable, code-searchable text file regardless. Don't rely on "unlisted" as a content-privacy mechanism).
10. **Git hygiene:** no force-push, no history rewrites of already-pushed commits, no edits outside this repo, no global installs, conventional commit messages per stage as specified. `git pull --rebase origin main` (rebasing your own unpushed local commits onto a workflow's bot commit) is explicitly permitted and required where noted (Stage 4/5) — this is not the kind of history rewrite the ban refers to.
11. **Mobile-first law:** the phone is the PRIMARY client; desktop is the adaptation. Base CSS **is** the mobile layout; wider layouts are layered on exclusively via `min-width` media queries — **`max-width` media queries are banned** (mechanically verifiable). All URLs — assets, fetches, SW scope, manifest `start_url` — are **relative** (`./…`), never root-absolute. Viewport heights use `svh` (with a `vh` fallback line above it). Safe-area insets are respected. The page must be installable to the home screen (§4.7). The whole layout is a **single no-scroll screen** on a 390×844 viewport (see §4.4) — this is stricter than "mobile-first," it's "mobile-fits."
12. **Verifier integrity ratchet.** After Stage 0's commit, `verify.mjs` checks and budget constants may only be added or tightened, never relaxed. Any relaxation requires a `decisions.md` entry quoting the original check text and the reason. `FINAL-AUDIT.md` must include a one-paragraph diff summary of `verify.mjs` versus its Stage 0 version. This exists because the same agent that hits a hard-to-satisfy check is the one who would otherwise be tempted to quietly soften it.

---

## §3 — Repository layout (exact)

```
/
├── index.html
├── styles.css
├── app.js                  # UI logic: tabs, theme, date, cards, staleness
├── figure.js               # canvas yoga-figure animation (the signature element — was drop.js/brain.js)
├── lib.mjs                 # SHARED pure functions: HKT date, day number, rotation (imported by browser AND node)
├── manifest.webmanifest    # home-screen installability (Appendix C)
├── sw.js                   # offline shell, network-first (Appendix C, verbatim)
├── assets/
│   ├── fonts/              # self-hosted woff2 + OFL.txt licences
│   ├── icons/              # icon-192.png, icon-512.png, apple-touch-icon.png (180)
│   └── favicon.svg
├── data/
│   ├── cards.json          # anchors[129], shifts[40], freshReserve[10]
│   ├── values.json         # 5 values
│   └── daily.json          # written by the pipeline daily
├── state/
│   └── fresh-history.json  # last 7 fresh-source picks, upserted by dateHKT (see §7)
├── scripts/
│   ├── generate-daily.mjs
│   └── verify.mjs          # stage-gated verification harness
├── .github/workflows/
│   ├── daily.yml
│   └── watchdog.yml
├── audits/
│   ├── build-log.md        # heartbeat log
│   ├── decisions.md        # ADR-lite decision log
│   ├── CONTENT-REVIEW.md   # Stage 3: all cards grouped by attribution, QA flags inline
│   └── stage-N-audit.md    # one per stage + FINAL-AUDIT.md
├── CLAUDE.md               # created in Stage 0: invariants summary + pointer here
├── BUILD-PLAN.md           # this file
├── .nojekyll
└── README.md
```

---

## §4 — UI/UX specification

### 4.1 Design direction (one sentence)
**"An instrument panel for the inner life"** — a quiet, warm, paper-like field on
which exactly one thing is alive: a small human figure, moving slowly and deliberately
through a yoga sun salutation, on an otherwise still page. Contemplative Stoic calm + the
precision of an automated system. All boldness is spent on the figure; everything else is
disciplined and quiet. The whole screen fits without scrolling on a phone (§4.4) —
editorial, not busy.

### 4.2 Design tokens (CSS custom properties on `:root` / `[data-theme="blossom"]`)

**Theme `calm` (default — cream/blue):**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAF9F5` | page background (brief-specified) |
| `--surface` | `#FFFFFF` | cards |
| `--ink` | `#1C1B17` | primary text |
| `--muted` | `#6F6B60` | attribution, meta |
| `--accent` | `#2B5FD9` | links, active tab, chips |
| `--pulse` | `#7FB0FF` | figure colour/glow |
| `--edge` | `rgba(43,95,217,0.16)` | reserved (unused since the brain's edges retired; keep the token defined for future use, no verify requirement) |
| `--hairline` | `rgba(28,27,23,0.10)` | dividers, toggle border (cards are borderless — see §4.5.3) |

**Theme `blossom` (pink):**

| Token | Value |
|---|---|
| `--bg` | `#FBF4F6` |
| `--surface` | `#FFFFFF` |
| `--ink` | `#241A20` |
| `--muted` | `#7A6870` |
| `--accent` | `#C94F7C` |
| `--pulse` | `#F2A9C6` |
| `--edge` | `rgba(201,79,124,0.16)` |
| `--hairline` | `rgba(36,26,32,0.10)` |

Rules: verify **contrast ≥ 4.5:1** numerically for (`--ink`,`--bg`), (`--ink`,`--surface`),
(`--muted`,`--surface`), (`--muted`,`--bg`) in BOTH themes. For (`--accent`,`--surface`) and
(`--accent`,`--bg`): gate at **4.5:1** because `--accent` is used for normal-size text (the
active-tab underline text and inline links are body-size, not large/bold) — verify blossom's
`--accent` (`#C94F7C`) against `#FFFFFF`/`#FBF4F6` numerically and darken it slightly if it
fails 4.5:1 (it is close, ~4.3:1 on white, so expect to adjust); log any token adjustment in
`decisions.md`. `color-scheme: light` for both themes.

### 4.3 Typography (three deliberate roles)

1. **Display / card voice:** `Fraunces` (variable, optical size on, italic used for the wordmark) — headings, card body text, value names, wordmark. Literary and warm: the cards are book-derived wisdom, so the type is bookish.
2. **Utility / telemetry:** `IBM Plex Mono` — the date line, category chips, staleness chip, footer "refreshed 06:00 HKT" line. The page is machine-refreshed; the mono face *says* that truthfully.
3. **Body / everything else:** system sans stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).

Self-host both webfonts as woff2 in `assets/fonts/` with `font-display: swap` and their OFL licence files. **Exit ramp:** if woff2 files cannot be fetched within the attempt budget (§9.2), ship the system stack for all roles, log it in `decisions.md`, and continue — fonts are never a blocker.

Type scale (px): 10 (mono meta chips) · 12–13 (mono date line, values essence/behaviour) · 14.5–16.5 (shift text) · 15.5 (anchor/fresh card text, error state) · 17–18 (values name, wordmark) — line-height ~1.45–1.5 body/card text.

### 4.4 Layout — one no-scroll screen (390×844 baseline)

The design supersedes v1.0's tall hero-canvas mockup with a compact, single-screen layout
(matching the "Mindset Mobile UI.dc.html" prototype, option 1c):

```
┌────────────────────────────────────┐
│        [ small figure, ~96×112 ]   │  the page's literal top element (v1.4) —
├────────────────────────────────────┤  safe-area-inset-top padding lives here now
│ mindset (italic wordmark)  ◐ toggle│  header, ~44px, sits below the figure
├────────────────────────────────────┤
│      MONDAY · 13 JULY 2026         │  mono, letterspaced, uppercase
│   (staleness chip if applicable)   │
├────────────────────────────────────┤
│      Today      Values             │  tabs (role=tablist), underline-active style
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ ANCHOR (mono chip)           │  │  cards: borderless, 22px radius,
│  │ card text (Fraunces)         │  │  shadow 0 14px 36px rgba(36,26,32,.07),
│  │ — after Marcus Aurelius      │  │  20px/22px padding, 16px gaps (loosened
│  └──────────────────────────────┘  │  in v1.2 — the tighter v1.1 values read
│  [Shift card] [Fresh card]         │  as cluttered with three stacked cards)
├────────────────────────────────────┤   stacked ≤899px, 3-across ≥900px desktop
│ refreshes daily · 06:00 HKT        │  footer, margin-top:auto pins it down
└────────────────────────────────────┘
```

On mobile the whole thing must fit one viewport height (`100svh`, `vh` fallback) without
scrolling in the common case; if a very small viewport or large system font forces overflow,
allow the page itself to scroll rather than clipping content — never clip.

**v1.4:** the figure moved out of `<main>` to be `<body>`'s first child, ahead of `<header>` —
live feedback asked for it to sit at the true top of the page. It carries the safe-area-inset-top
padding now instead of the header (the header's own top padding dropped to a small fixed value
since it's no longer adjacent to the notch/status bar).

### 4.5 Components

1. **Theme toggle:** pill button top-right, `aria-pressed`, icons ◐/❀ (calm/blossom), 44×44px, `persists mindset.theme`, default `calm`, no flash-of-wrong-theme (inline script reads localStorage before CSS paint).
2. **Date line:** always HKT (invariant 8), computed via `lib.mjs`'s `hktDateParts`. Format: `MONDAY · 13 JULY 2026` (uppercase, letterspaced, mono).
3. **Cards:** `--surface`, **22px radius, borderless** (no hairline border — an intentional refinement from the design prototype over v1.0's bordered-card spec), shadow `0 14px 36px rgba(36,26,32,0.07)`, 20px/22px padding, 16px gap between stacked cards (loosened in v1.2 — the original 18px/22px padding with an 11px gap read as cluttered with three cards stacked). Header row = mono category chip (ANCHOR / SHIFT / FRESH, no emoji — plain mono text per the prototype). Body in Fraunces. Footer = muted attribution. Fresh card footer = source domain + `Read →` link (`target="_blank" rel="noopener"`); whole Fresh card is the tap target; render the title via `textContent` only (never `innerHTML`) and validate `fresh.url` is `https:` before treating the card as live (§6.3, §7 — untrusted third-party feed content).
4. **Staleness chip (mono, small):**
   - Staleness is computed against the **expected refresh boundary**, not the bare calendar date: `expectedDateHKT = now(HKT) >= 06:00 ? today(HKT) : yesterday(HKT)`. `daily.json`'s `dateHKT` matching `expectedDateHKT` → no chip. Off by one day (and ≤ 48h old) → amber chip `yesterday's cards`. (This fixes a v1.0 ambiguity that would otherwise show a false amber chip to every visitor between midnight and 06:00 HKT, every single day.)
   - `daily.json` unreachable, > 48h stale, or fetch fails → page computes cards locally via `lib.mjs` rotation → slate chip `offline rotation`.
   - Fresh slot in offline mode → deterministic pick from `freshReserve`.
5. **Values tab:** the 5 values as quiet rows — value name (Fraunces, ~17px), one-line essence (Fraunces italic, ~13.5px), one observable behaviour (muted, ~12px). **No numbering** — values are not a sequence. (Cut from 10 to 5 in v1.2 — ten read as a checklist; keep only what actually matters.)
6. **Motion:** the figure is the ONLY animated element. Card entrance = one subtle 250ms fade/rise on load, nothing on scroll. Hover lift 2px desktop only.

### 4.6 The figure (signature element — `figure.js`, was the water drop in v1.1, "the brain" in v1.0)

v1.2 replaces the water drop with a small human figure moving through a yoga sun salutation
(Surya Namaskar) on repeat — more obviously alive at a glance than the drop's subtle physics
(the drop's slow bead-forming phase read, to a live human reviewer, as "not moving" even when
it technically was), and still one continuous, calm, legible loop:

1. **Form:** a side-profile figure (head circle + a filled shoulder-to-hip torso band +
   neck/arm/leg line segments, round line caps, soft glow sprite behind it) interpolated
   smoothly between named pose keyframes in a full loop (**26.2s, v1.4** — see "Pace" below):
   standing prayer (Pranamasana) → arms raised overhead (Urdhva Hastasana, slight back bend) →
   forward fold (Uttanasana) → lunge, one leg back (Ashwa Sanchalanasana) → plank
   (Kumbhakasana) → **eight-limbed pose (Ashtanga Namaskara, added v1.4)** → upward dog
   (Urdhva Mukha Svanasana) → downward dog (Adho Mukha Svanasana) → lunge (return) → forward
   fold → raised arms → standing (loop restarts) — 12 named poses. Poses are defined as named
   keypoint sets in a normalized 0–100 box; each transition eases with a smoothstep, so the
   motion between recognizable poses is itself the visible "aliveness" — no reliance on a
   single subtle physical effect the way the drop's slow bead-growth was.
2. **Rendering:** plain 2D canvas — a filled torso band between shoulder and hip (v1.4, so the
   figure reads as a body rather than a wire skeleton), stroked limb segments (round caps/joins),
   a filled circle for the head, and the same offscreen-sprite ambient glow technique as v1.1's
   drop (no per-frame `shadowBlur`) stamped behind the figure each frame. No DOM particles, no
   bezier body-fill shading beyond the torso band — still simple on purpose, since the pose
   transitions carry the motion.
3. **Life:** legible, continuous motion through named poses — not a single physics effect. Slow
   enough to read as calm, fast enough that a glance clearly shows it moving (this directly
   addresses the v1.1 "wasn't moving" report).
3a. **Pace (v1.4):** live feedback asked for slower, more realistic movement — a real sun
   salutation holds each pose for a breath rather than drifting at constant speed. Replaced the
   even 12s loop with a per-pose hold (600ms–1.9s, longest at down-dog and the standing poses,
   shortest at the brief eight-limbed bridge) followed by its own eased transition (0.9–1.3s) into
   the next pose — 26.2s per full cycle.
4. **Performance:** `requestAnimationFrame`; the same offscreen radial-gradient sprite glow
   technique as before (never per-frame `shadowBlur`); `devicePixelRatio` capped at 2; cancel
   RAF on `visibilitychange` hidden (resume on visible, unless reduced motion); `ResizeObserver`-
   driven re-setup, debounced. **Robustness fix (the actual root cause of the v1.1 "not moving"
   report):** the setup routine must not silently give up if the element has zero size at
   connect-time — retry via `requestAnimationFrame` until a real size is available, rather than
   relying solely on `ResizeObserver`'s own delayed initial callback to ever recover.
5. **Reduced motion:** `prefers-reduced-motion: reduce` (checked via `matchMedia`, re-checked
   live on a `change` listener) → render one static frame (the standing-prayer pose), no RAF
   loop.
6. **Themes:** the element takes `color`/`glow` as attributes; `app.js` sets these to the
   current theme's `--pulse` value on init and again on every theme-toggle event, so the figure
   is blue in `calm` and rose in `blossom`.
7. **Budget:** `figure.js` ≤ 12 KB (the reference implementation is ~10 KB as of v1.4).
8. **Not part of the shipped file:** the original Claude Design prototype's `ios-frame.jsx` and
   `support.js` were prototyping scaffolding only for the water-drop era and were never shipped;
   `figure.js` is an original implementation for v1.2, not ported from any external prototype.

### 4.7 Mobile experience & installability (PRIMARY platform — enforce, don't hope)

Design at **390×844** first; adapt upward. Desktop must look intentional, but every trade-off resolves in the phone's favour.

**Layout & ergonomics:**
1. Single column ≤ 899px; content max-width with comfortable side padding (≥ 20px).
2. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`; header and footer pad with `env(safe-area-inset-top/bottom/left/right)` so nothing sits under a notch or home indicator.
3. Page uses `height: 100vh; height: 100svh;` (vh fallback line first) as the layout basis for the no-scroll goal (§4.4/invariant 11) — the figure itself is a small fixed-size inline element (~96×112px, not viewport-relative).
4. All interactive elements: ≥ 44px tap targets, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent` replaced by a designed `:active` state (scale 0.99 + hairline darken). No information may be hover-only.
5. `html { -webkit-text-size-adjust: 100%; }`. Card text ≥ 15.5px on mobile (per the actual type scale in §4.3).
6. No horizontal scroll, ever: no fixed `width` ≥ 400px on any element in `styles.css` (`max-width` is fine — verified by grep, scoped to `styles.css` so it doesn't false-positive on legitimate JS canvas pixel dimensions in `figure.js`).

**Installability (home-screen app):**
7. `manifest.webmanifest` — use the Appendix C JSON verbatim; `display: standalone`, relative `start_url`/`scope`.
8. `<link rel="manifest">`, `<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">`, and `<meta name="theme-color">` — updated by JS to the current `--bg` whenever the theme toggles, so the standalone chrome matches calm/blossom (note: the manifest's own static `theme_color`/`background_color` only cover the calm-theme cold-launch splash screen — this is a known, acceptable cosmetic limitation for blossom's first paint; log it in `decisions.md`, don't try to fix it with JS that can't run before launch).
9. `sw.js` — Appendix C **verbatim (as amended in this v1.1 — see C.2)**: network-first for every GET with cache fallback. Registered with the one-liner in Appendix C.
10. **Icon pipeline (this environment is Linux, not macOS):** check for an available rasterizer first — `rsvg-convert`, ImageMagick (`convert`/`magick`), or Inkscape's CLI, in that order of preference — and use whichever is present to render `favicon.svg` to 512/192/180px PNGs. If none is available (and none can be installed — `npm install` and global installs are banned), ship the manifest with the SVG icon entry only, skip `apple-touch-icon`, log the decision, and continue — icons are never a hard blocker, but do check for a real rasterizer before assuming none exists.

## §5 — Content specification

### 5.1 `cards.json` schema

```json
{
  "anchors": [ { "id": "stoic-001", "category": "stoic", "text": "...", "attribution": "— after Epictetus" } ],
  "shifts":  [ { "id": "shift-001", "from": "Proving I belong", "to": "Deciding what is worth building" } ],
  "freshReserve": [ { "id": "reserve-01", "text": "...", "attribution": "— evergreen" } ]
}
```

### 5.2 Exact counts (verified by script)

| Pool | Category | Count |
|---|---|---|
| anchors | `stoic` | 25 |
| anchors | `diewithzero` | 20 |
| anchors | `growth` (Dweck-style growth mindset) | 20 |
| anchors | `relationships` (Carnegie-style) | 15 |
| anchors | `wealth` (patience, avoid ruin, invisible wealth, asymmetry) | 20 |
| anchors | `focus` (deep work, energy, saying no) | 20 |
| anchors | `voices` (added v1.3 — Jay Shetty, Joe Biden, Michelle Obama; see §5.3.9) | 9 |
| **anchors total** | | **129** |
| shifts | — | **40** |
| freshReserve | — | **10** |

A Claude Design prototype (see changelog) already produced 18 anchors (3 per category), 10
shifts, and 4 freshReserve cards in the intended voice — use these as the seed/first batch of
each pool (keep their ids/text/attribution as-is; they've already had one round of human
review during that design session) and author the remaining cards per category to reach the
exact counts above, matching voice and format exactly. That prototype's `values.json` content
was 5 core values + 5 "reserve" values (10 total); **v1.2 ships the 5 core values only** —
ten read as a checklist rather than a short list of what actually matters (§5.3.6).

### 5.3 Writing rules (enforced)

1. ≤ 40 words per card body; one idea per card; concrete over abstract.
2. Original paraphrase only; zero quotation-mark glyphs per invariant 2 (ASCII apostrophes for contractions/possessives are fine); attribution `— after <thinker>`, `— core principle`, or `— evergreen` (freshReserve only).
3. Second person or imperative voice (`You control the response, not the event.`).
4. **Banned platitudes** (verify.mjs greps, case-insensitive; store the list split/obfuscated in `verify.mjs` so the harness doesn't fail its own repo-wide-adjacent sweep by containing the literal strings): `believe in yourself`, `hustle`, `crush it`, `unlock your potential`, `be your best self`, `good vibes`, `grind`, `10x`, `manifest`.
5. Shift cards: `from` ≤ 8 words, `to` ≤ 8 words, and the pair must name a real cognitive move, not a mood (`From clearing the inbox → To finishing one thing that matters`).
6. Values (`values.json`, exactly 5): `{ "name", "essence" (≤ 14 words), "behaviour" (≤ 16 words, observable — something a camera could see) }`. Generic-safe: no personal references to the owner. (Cut from 10 to 5 in v1.2 per live human feedback — keep the strongest 5, cut the rest rather than let the list grow back; if curating later, replace one of the 5, don't add a 6th.)
7. **Attribution-confidence rule:** use a person-named attribution (`— after X`) only when you are confident the specific idea is centrally/traditionally X's (e.g. Epictetus/Seneca/Marcus Aurelius for Stoic control-of-response ideas, Bill Perkins for Die With Zero's core thesis, Dweck for growth-mindset framing, Carnegie for the specific relationship tactics from *How to Win Friends*, Housel for invisible-wealth/avoid-ruin framing, Newport for deep-work framing). Otherwise, demote to tradition-level attribution (`— Stoic tradition`, `— growth-mindset research`, `— core principle`) rather than guessing at a specific person. This is a quality/accuracy safeguard, independent of the (resolved) PII question — misattributing an idea to a real, named public figure is a credibility problem even though naming public figures itself is fine.
8. Write anchors in six batches (one per category, extending each category's 3 seed cards to its full count). After each batch, run the normal mechanical self-review (word caps, quote marks, banned phrases — rules 1–5), **and then** a second, independent review pass per §10 Stage 3's content-QA step, before moving to the next batch.
9. **`voices` category (added v1.3):** a 7th anchor category, 9 cards (3 each), for named living/recent public figures the owner's household specifically finds inspiring, so their thinking surfaces periodically via the same rotation — not a new subsystem, just more entries in the same `anchors` pool. Extra bar beyond rules 1–8 for this category specifically: (a) any figure who has held significant political office must be scoped strictly to personal-character themes (grief, resilience, self-belief, service) and must never reference their office, party, policies, or elections — attribution is tied to a specific, nonpartisan book/body of work (e.g. `— after X, from <book>`), not their public office; (b) rule 2's "no verbatim quotes" is enforced against the *spirit*, not just quote-mark glyphs — a paraphrase that lands close to the person's one most-famous, most-recognizable line is a violation even with zero quote marks and needs a rewrite, not just a rewording; (c) run the independent second-pass review (rule 8) with an explicit prompt to check attribution-confidence, political neutrality, and closeness-to-source — this category carries materially higher reputational risk per card than the historical-thinker categories.

---

## §6 — Data & logic

### 6.1 `daily.json` schema

```json
{
  "version": 1,
  "dateHKT": "2026-07-14",
  "generatedAtISO": "2026-07-13T22:00:41Z",
  "anchorId": "wealth-007",
  "shiftId": "shift-023",
  "fresh": { "title": "...", "url": "https://...", "source": "Farnam Street", "publishedISO": "..." }
}
```
`fresh` may be `null` → the page substitutes a deterministic `freshReserve` pick. `fresh.title` is rendered client-side via `textContent` only; `fresh.url` must be validated as an `https:` URL both when `generate-daily.mjs` writes it and when `app.js` reads it — an item failing either check is dropped to `fresh: null` rather than rendered (§7, invariant-adjacent: this is untrusted third-party content in the DOM). `data/daily.json` and `state/fresh-history.json` are exempt from the quote-mark sweep (Appendix A) — third-party RSS titles may legitimately contain quote characters; that invariant governs *authored* card bodies, not passthrough titles.

### 6.2 Deterministic rotation (in `lib.mjs`, shared browser + node)

- `hktDateString(d)` → `YYYY-MM-DD` via `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' })`.
- `hktDayNumber(d)` → `floor(Date.UTC(y, m-1, day) / 86400000)` from the HKT date parts.
- `hktDateParts(d)` → `{ weekday, day, month, year }` via `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', weekday:'long', day:'numeric', month:'long', year:'numeric' })`, for rendering the date line without duplicating formatting logic in `app.js`.
- `pickIndex(poolSize, dayNumber, salt)` → per-cycle Fisher–Yates permutation seeded with `xmur3(salt + ":" + floor(dayNumber/poolSize))` feeding `mulberry32`; return `order[dayNumber % poolSize]`. **Use the reference implementation in Appendix B verbatim.** Guarantees: no repeats *within* a full cycle (adjacent cycles are independent permutations, so a repeat can occur right at a cycle boundary — roughly a 1-in-poolSize chance — this is expected and not a bug). Fully stateless, identical results in node and browser. Note for future curation (put this in the README runbook, not enforced by code): replace cards 1-for-1; adding or removing cards changes the pool size and reshuffles the whole rotation, which may repeat a recently-seen card once.
- Salts: `"anchor"`, `"shift"`, `"reserve"`.

### 6.3 Client behaviour (`app.js`)

1. Fetch `data/daily.json` (+ `cards.json`, `values.json`) with `cache: "no-store"`.
2. Compare `daily.dateHKT` against the expected-refresh-boundary date (§4.5.4) → render as-is, or apply staleness rules.
3. Any fetch failure → full offline rotation from `cards.json`; if that also fails, show a calm inline error state: `Couldn't load today's cards. Refresh, or check back tomorrow.`
4. The staleness/offline-fallback selection logic must live as pure functions in `lib.mjs` (not inline in `app.js`'s DOM code), so Stage 3's `node:test` coverage can actually exercise it headlessly.

---

## §7 — Daily pipeline (`scripts/generate-daily.mjs`)

1. Compute `dateHKT`, `dayNumber` via `lib.mjs`; pick `anchorId`, `shiftId`.
2. Fetch each feed in §7.1 with an 8-second `AbortController` timeout; tolerate any failure (skip source, log to stdout). Parse minimally with regex for up to 5 `<item>`/`<entry>` blocks per feed (not just the first — see step 3), in feed order: `title`, `link`/`href`, `pubDate`/`published`. Decode HTML entities and strip CDATA wrappers when extracting `title`. No XML libraries.
3. Candidate items: published within 14 days, **and on-theme** (§7.2). Walk each source's parsed items newest-first and take the first one that passes both filters — this matters for topically-broad sources (Ali Abdaal's channel spans productivity, AI tools, book/fiction recommendations, etc.): don't drop the whole source just because its single newest post happens to be off-theme when an on-theme one from a few days earlier is available. Prefer a source NOT in `state/fresh-history.json` (last 3 entries); among preferred, pick newest. All feeds failed or none produced an on-theme candidate → `fresh: null`.
4. Write `data/daily.json`; **upsert** (not append) the `state/fresh-history.json` entry keyed by `dateHKT` (cap 7 distinct dates) — this makes same-day re-runs (which Stage 4 performs: once locally, then once via the dispatched workflow) genuinely idempotent instead of duplicating history or flipping the Fresh pick.
5. Idempotent and safe to re-run; exit 0 even when `fresh` is null (a missing fresh card must never fail the build). When run locally in this environment, invoke as `NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs` (§2.4).

### 7.1 Sources (RESOLVE AND VERIFY in Stage 4 — do not trust these blindly)

| Source | Type | Feed (verify with `curl -sL -m 15`, require HTTP 200 + ≥ 1 item, **AND** an identity check below) |
|---|---|---|
| Daily Stoic | blog | `https://dailystoic.com/feed/` — verify liveness + parse |
| Farnam Street | blog | `https://fs.blog/feed/` — verify liveness + parse |
| Huberman Lab | podcast | `https://feeds.megaphone.fm/hubermanlab` — verify liveness + parse |
| The Mindset Mentor (Rob Dial) | podcast | **RESOLVE at build:** find the public RSS via the show's site / podcast directories (or the Apple Podcasts Search API, `itunes.apple.com/search?media=podcast&term=...`, which returns a `feedUrl` and `artistName` to cross-check); verify; record final URL in `decisions.md` |
| Ali Abdaal | YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>` — **RESOLVE `<ID>`** by preference from the canonical handle `youtube.com/@aliabdaal`'s page (its `og:url`/canonical `<link>`, not the first bare `"channelId"` string match, which can appear multiple times in page source for unrelated elements); verify |

**Liveness is not enough for the two discovered sources.** For Rob Dial and Ali Abdaal specifically, also check the feed's `<title>`/author (`itunes:author`, atom `<author><name>`) case-insensitively matches an expected string (`"Mindset Mentor"`/`"Rob Dial"`; `"Ali Abdaal"`) before counting the source as verified — a live-but-wrong feed (a similarly-named show, a mirror, a decoy channel) must not silently pass. Verify each source by actually running it through `generate-daily.mjs`'s own parse path (not curl alone) so a feed that returns 200 but breaks the regex parser (CDATA, HTML entities, an atom `<link href=...>` instead of element text) is caught here, not in production. A source that fails the identity check is **dropped and not counted** toward the verification threshold below — it is a failure, not a pass.

Resolution budget per source: ≤ 4 attempts. Escalate via §11 trigger 3 only if **zero** sources verify (`fresh: null` is a fully supported, non-blocking outcome per LOOP-D — halting a multi-hour unattended run over the optional Fresh card is disproportionate; document in the final summary how many of the five verified either way).

### 7.2 Mindset-relevance filter (v1.2)

Four of the five sources are single-topic by nature (Stoicism, mental models, neuroscience/
self-improvement, mindset — every post they publish is on-theme by construction). Ali Abdaal's
channel is not: it spans productivity, book/fiction recommendations, AI-tool tutorials, and
business content, only some of which fits a mindset app. Liveness and identity (§7.1) don't
catch this — a live, correctly-identified feed can still publish an off-theme item.

Maintain a denylist of regex patterns for off-theme signals in `generate-daily.mjs`
(`OFF_THEME_PATTERNS`) — AI-tool/prompt tactics, app/tech/gadget reviews, sponsorship/
marketing language, pure-entertainment recommendations (fan fiction, etc.) — and reject any
candidate item whose title matches. This is a heuristic, not a semantic classifier: it catches
the specific failure modes observed in practice (extend the list as new ones show up; this is
meant to be a living list, not a one-time fix) but cannot guarantee every accepted item is
genuinely mindset-relevant for a topically-broad source. If Ali Abdaal (or any future broad-
topic source) keeps producing off-theme picks despite the filter, the honest fix is removing
it from `SOURCES` rather than expanding the denylist indefinitely — document that tradeoff in
the README if it comes to that.

A rejected item does not disqualify the source for the day — walk further back through that
source's recent items (§7 step 3) before giving up on it entirely.

---

## §8 — Workflows (copy these, adjusted per this v1.1, then validate)

### 8.1 `.github/workflows/daily.yml`

```yaml
name: daily-cards
on:
  schedule:
    - cron: "56 21 * * *"   # 21:56 UTC = 05:56 HKT next day — a few minutes before the
                              # 06:00 HKT target and off the top-of-hour scheduler-congestion
                              # slot GitHub Actions cron is most likely to delay
  workflow_dispatch: {}
permissions:
  contents: write
concurrency:
  group: daily
  cancel-in-progress: true
jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: node scripts/generate-daily.mjs
      - name: commit if changed
        run: |
          git config user.name "mindset-bot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add data/daily.json state/fresh-history.json
          git diff --cached --quiet || git commit -m "[bot] daily cards $(TZ=Asia/Hong_Kong date +%F)"
          git push
```

### 8.2 `.github/workflows/watchdog.yml`

```yaml
name: watchdog
on:
  schedule:
    - cron: "0 1 * * *"   # 09:00 HKT — a wider ~3h buffer after the 05:56/06:00 HKT daily
                            # run than v1.0's 90 minutes, so a merely-delayed (not dead)
                            # daily run doesn't trigger a false alarm
  workflow_dispatch: {}
permissions:
  contents: read
  issues: write
jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - name: fail loudly if stale
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          today=$(TZ=Asia/Hong_Kong date +%F)
          live=$(curl -s -m 15 https://${{ github.repository_owner }}.github.io/Mindset/data/daily.json | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).dateHKT" 2>/dev/null || echo "unreadable")
          filedate=$(node -p "JSON.parse(require('fs').readFileSync('data/daily.json','utf8')).dateHKT")
          if [ "$today" != "$filedate" ] || [ "$today" != "$live" ]; then
            already_open=$(gh issue list --search "Mindset daily build stale in:title" --state open --json number --jq 'length')
            if [ "$already_open" = "0" ]; then
              gh issue create \
                --title "⚠️ Mindset daily build stale ($today)" \
                --body "Checkout dateHKT=$filedate, live Pages dateHKT=$live, expected $today. Check the daily-cards workflow run logs and confirm Pages actually redeployed the latest commit." \
                || true
            fi
            exit 1
          fi
```

The watchdog now checks the **live Pages URL's** `daily.json`, not just the git checkout — this
catches the case where the bot commit landed but Pages failed to redeploy, which the v1.0
watchdog (checkout-only) could never see. It also skips creating a duplicate issue if one is
already open.

**Known platform caveats (document in README, do not "fix"):** GitHub cron can fire minutes late under load — the schedule above intentionally avoids the top-of-hour slot and gives the watchdog a wide buffer to absorb this; scheduled workflows are auto-disabled after ~60 days without repo activity (the daily bot commit itself keeps the repo active *only while the daily job is actually succeeding* — if it dies silently for 60+ days, the watchdog protecting it eventually disables too; there is no fix for this short of an external monitor, which is out of scope — just be honest about it in the README); Actions failure emails follow the owner's GitHub notification settings.

**Stage 4 stale-detection test (the exact mechanism — do not improvise one mid-run):** create a
temporary branch, backdate `data/daily.json`'s `dateHKT` by one day on that branch, dispatch
`watchdog` against that ref (`workflow_dispatch` with a ref parameter via the GitHub MCP tools /
REST — this is expected to produce a red run and exactly one new issue), confirm the issue was
created, close it, delete the temporary branch. This is expected-red — do not treat this run's
failure as a real problem, and don't count it against Stage 5's "both workflows green" check
(that check only concerns the real fresh-file dispatch, not this deliberate stale test).

---

## §9 — LOOP ENGINEERING

### 9.1 LOOP-0 · Build loop (applies to every stage)

```
for stage in 0..5:
    implement stage tasks
    repeat (max: 3 consecutive cycles with no reduction in total failure count):
        run: node scripts/verify.mjs stage<N>     # plus stage-specific commands
        if all green: break
        else: fix ALL diagnosed failures this cycle (not just the first), log one
              heartbeat line, iterate
        # a §9.2-rule-2 pivot (approach change after the same error repeats 3x)
        # resets this cycle counter once per stage — it is a fresh start, not
        # extra rope on the same failing approach
    if green:
        write audits/stage-<N>-audit.md (template §10.7)
        git add -A && git commit -m "<stage commit message>"
        git push
        continue to next stage immediately — do not ask permission
    else:
        follow §9.2 rule 5 (stop-loss)
```

### 9.2 Anti-stuck protocol (build time) — hard rules

1. **Heartbeat:** append one line to `audits/build-log.md` per verify cycle (not before/after every substantive action — that was excessive given the volume of work in this plan): `[HH:MM HKT] stage-N: <cycle result summary>`. A silent build is a failing build.
2. **Pivot rule:** the **same error text 3×** across cycles → mandatory approach change first (one line in `decisions.md`: `pivot: <old> → <new> because <reason>`) — this resets the §9.1 cycle counter once per stage. Exempt from this rule: §7.1's bounded feed-resolution retries (≤4 attempts is a legitimate, expected pattern, not a stuck loop).
3. **Command hygiene:** wrap anything that could exceed 2 minutes in `timeout 120 <cmd>`; curls get `-m 30`. **Banned outright:** interactive prompts (always pass `-y`/non-interactive flags), watch modes, dev servers of any kind (preview happens on the live Pages URL), `npm install`, global installs, `git push --force` (to any branch containing already-pushed history), touching anything outside this repo.
4. **Network patience cap:** nothing waits on the network > 30s per attempt; feed/font fetch budgets per §7.1 / §4.3.
5. **Stop-loss (a standing terminal condition, alongside — not instead of — §11's four named triggers):** the §9.1 cycle cap exhausted, OR an unrecoverable environment error → write `BLOCKED.md` (§11 format), commit it, and STOP the run cleanly. Never idle, never thrash, never loop hoping. (v1.0 read as if only §11's four triggers could ever justify stopping — that was an internal contradiction; this rule is always live.)
6. **Deploy-wait bound:** poll the Pages URL with `curl -s -o /dev/null -w "%{http_code}" -m 15` every 20s, max 12 tries — but only after the Stage 0 (initial), Stage 2, and Stage 5 pushes, not after every single stage's push (v1.0's every-stage polling added up to a meaningful chunk of dead wall-clock time for no additional information most stages). Still not 200 at Stage 5 → note `deploy pending` in the audit; Stage 5 has the final say.
7. **Session resume (statelessness):** if the session is interrupted, on restart: read `audits/` + `git log` to find the last stage whose audit says PASS, re-run `verify.mjs` for that stage to confirm, and continue from the next stage. No stage is ever redone if its verification still passes.

### 9.3 Runtime loops (production — mapping to the "two /loops" requirement)

| Loop | Mechanism | Catches |
|---|---|---|
| **LOOP-A** daily refresh | Actions cron 05:56 HKT + `workflow_dispatch` | the core auto-run |
| **LOOP-B** stuck-build killer | `timeout-minutes: 10` + `concurrency.cancel-in-progress` | any hung/overlapping run — killed inside 10 min, never "stuck for hours" |
| **LOOP-C** dead-man's switch | watchdog 09:00 HKT → checks the *live* site, not just git → GitHub issue (deduped) + email | silent failures LOOP-B can't see (cron never fired, push failed, **or Pages didn't redeploy**) |
| **LOOP-D** graceful degrade | client staleness chip (boundary-aware) + offline deterministic rotation + freshReserve | everything else — the page NEVER shows an empty slot |

Design consequence: the worst possible failure is one morning of yesterday's (or locally rotated) cards, visibly labelled, followed by self-healing the next cron. No standing agents, no machine that must stay awake.

---

## §10 — STAGES (execute in order; each has Objective / Tasks / DoD / Verify / Commit)

### Stage 0 — Preflight & scaffold
**Objective:** a verified-sane environment and the full skeleton.
**Tasks:**
1. Preflight (capability-based, not binary-based): confirm authenticated GitHub access via the GitHub MCP tools (or a REST token) — able to read repo metadata and push; confirm `git remote` resolves to this `Mindset` repo; `node --version` ≥ 20. Any failure → §11 trigger 1 or 2 as appropriate.
2. **Pages go/no-go gate (hard, not deferred):** confirm GitHub Pages is enabled for `main`/root (via GitHub MCP tools or REST — no `gh` CLI dependency). If it cannot be confirmed enabled after one retry, this is §11 trigger 1 (auth/permission) — stop here, don't spend the rest of the build on a site that can never deploy.
3. Commit this exact `BUILD-PLAN.md` (v1.1) to the repo root first, if not already there.
4. Create the §3 tree (empty placeholders fine), `.nojekyll`, `audits/build-log.md`, `audits/decisions.md`.
5. Create `CLAUDE.md`: ≤ 30 lines — the §2 invariants verbatim-condensed + `Source of truth: BUILD-PLAN.md` + the §9.2 rules 2/3/5 one-liners.
6. Create `scripts/verify.mjs` harness: `node scripts/verify.mjs <stage0..stage5|all>`, exits non-zero on any failure, prints a ✅/❌ table.
**DoD:** tree exists · CLAUDE.md exists · verify harness runs · preflight logged · Pages confirmed enabled.
**Verify:** `node scripts/verify.mjs stage0` (file existence + harness sanity). Git working-tree cleanliness is checked **once, after** the stage commit — not as part of the in-loop (pre-commit) verify gate, since files are necessarily uncommitted while the fix loop runs.
**Commit:** `stage0: scaffold, invariants, verify harness`

### Stage 1 — Static shell, design system, themes, date, tabs
**Objective:** the complete non-animated page with placeholder cards, matching the one-screen layout in §4.4.
**Tasks:** `index.html` (semantic landmarks, viewport meta **with `viewport-fit=cover`**, robots noindex, inline pre-paint theme snippet), `styles.css` written **mobile-first per invariant 11** (all §4.2 tokens, both themes, §4.4 one-screen layout, §4.5 components incl. staleness chip styles and borderless-card styling, safe-area insets, `svh` sizing, `touch-action`, `text-size-adjust`, designed `:active` states), theme toggle (`mindset.theme`), HKT date line via `lib.mjs`'s `hktDateParts`, tabs with `role="tablist"` + keyboard support (arrow-key switching, matching the design prototype), footer. All local URLs relative. Fetch fonts per §4.3 (with exit ramp). Write `lib.mjs` — adapt from the Claude Design project's `mindset-lib.js` (Appendix B verbatim + the `hktDateParts` helper), no separate implementation needed.
**DoD:** both themes render · date correct in HKT · tabs keyboard-navigable · contrast pairs pass numerically (per the §4.2/§2.7 4.5:1 gate, including the blossom accent check) · fonts loaded or fallback decision logged · zero `max-width` media queries · zero root-absolute local URLs · safe-area + `svh` present · layout fits one screen at 390×844.
**Verify:** `stage1` = greps for viewport-fit/robots/aria/roles/localStorage key/`env(safe-area-inset`/`svh`/`text-size-adjust`/`touch-action` + **absence** greps (`@media` with `max-width`; `href="/`, `src="/`, `fetch("/`, `url(/`, `import("/`, `register("/`, manifest `src` for local paths; fixed `width` ≥ 400px, scoped to `styles.css` only) + absence-grep for locale-date calls without an explicit `timeZone:` in `app.js`/`figure.js` + `node --check` on all JS + **numeric WCAG contrast computation** on §4.2 pairs at the corrected thresholds + `lib.mjs` unit tests via `node:test` (HKT date fn against 3 known instants incl. one that crosses midnight UTC-vs-HKT; `pickIndex` full-cycle uniqueness for pool sizes 120/40/10; a non-negative-dayNumber guard).
**Commit:** `stage1: shell, tokens, themes, HKT date, tabs`

### Stage 2 — The figure
**Objective:** §4.6 exactly.
**Tasks:** `figure.js` — an original canvas implementation (not sourced from a design prototype; v1.1's `drop.js` was, v1.2's `figure.js` is written directly against §4.6's pose sequence), registered as `<mindset-figure>`; wire `color`/`glow` attributes to the live theme's `--pulse` token on init and on theme-toggle. Build the setup routine to retry via `requestAnimationFrame` if the element has zero size at connect-time (§4.6.4) rather than silently giving up — this is the actual fix for the v1.1 "wasn't moving" report, not just a cosmetic pose swap.
**DoD:** all §4.6 behaviours present · `figure.js` ≤ 12 KB · no `shadowBlur` inside the RAF-driven draw path · setup retries on zero-size rather than bailing.
**Verify:** `stage2` = `node --check figure.js` + greps: `requestAnimationFrame`, `visibilitychange`, `prefers-reduced-motion`, `devicePixelRatio` + absence of `shadowBlur` anywhere in the file (ban it file-wide — it's not meaningfully scopeable by grep to "just the animate function") + byte-size check. The pause/reduced-motion behaviour should be structured so its branch logic is unit-testable under `node:test` (e.g. a pure function computing which draw mode applies), since a curl-based agent cannot visually confirm canvas behaviour — mark "the figure visibly animates through recognizable poses and feels calm, not busy" as **deferred to §13 human review**, not a Stage 2 machine gate; the audit should say so plainly rather than checking it off unverified.
**Commit:** `stage2: living figure, canvas animation`

### Stage 3 — Content library & card engine
**Objective:** real cards, real values, full offline resilience, genuine content QA.
**Tasks:** extend the Claude Design project's seed content (`mindset-data.js`'s 18 anchors / 10 shifts / 4 freshReserve, pulled via `DesignSync`; its 10 values were cut to the 5 core ones in v1.2, §5.3.6) to the full §5.2 counts, six batches (one per anchor category, building on each category's 3 existing seed cards). After each batch's mechanical self-review (rules 1–5), run an **independent second pass** targeting what a script can't catch: attribution confidence (§5.3.7), closeness-to-source (quotation-in-substance risk), near-duplication against cards written so far (a cheap token-overlap check is fine as a proxy). Emit `audits/CONTENT-REVIEW.md`: all cards grouped by attribution, with any flags from either review pass noted inline. Wire card rendering in `app.js` (data from `cards.json`/`values.json`, staleness logic + offline rotation + reserve fallback + calm error state, all as pure functions in `lib.mjs` per §6.3.4 where the logic itself lives, called from `app.js`'s DOM code).
**DoD:** counts exact · schema valid · zero quotation-mark glyphs in bodies (apostrophes in contractions fine) · no banned platitudes · unique ids · word caps respected · offline rotation proven · `CONTENT-REVIEW.md` written and skimmed-clean (no unresolved flags, or flags explicitly accepted with a one-line reason).
**Verify:** `stage3` = full JSON schema/count/word-cap/platitude/quote-mark validation (quote-mark sweep scoped to `cards.json`/`values.json` string fields, not the whole repo — see Appendix A) + a `node:test` that renders three simulated dates through the rotation (via `lib.mjs`'s pure functions) and asserts distinct, in-range picks + a simulated stale-`daily.json` test asserting the fallback path selects valid ids + a near-duplicate proxy check (normalized-token overlap) flagged, not necessarily hard-failed, so a human can judge borderline cases.
**Commit:** `stage3: card library, values, offline resilience, content review`

### Stage 4 — Pipeline & loops
**Objective:** the machine that runs without anyone.
**Tasks:** `generate-daily.mjs` (§7), resolve + verify all feeds including the identity checks in §7.1 (log outcomes in `decisions.md`), write both workflows from §8 (as amended in this v1.1 — cron slots, watchdog live-check + dedup), run the generator locally as `NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs` to produce a real `daily.json`, commit, push, then dispatch `daily-cards` via the GitHub MCP tools (no `gh` CLI) and poll run status (bounded: 20s × 15) until success; **after the workflow's bot commit lands, `git pull --rebase origin main` before any further local commit** (this is a guaranteed non-fast-forward otherwise); dispatch `watchdog` once against the real fresh file and confirm it passes, then run the exact stale-detection test prescribed in §8.2 (temporary branch, not an ad-hoc dry-run flag) and confirm it fails correctly with one new (then closed) issue.
**DoD:** at least one of the five §7.1 sources verified (log exactly how many, and which); real `daily.json` committed by the *workflow* (not only locally); both workflows have at least one green dispatch run against real content; watchdog's stale-detection path proven via the prescribed temporary-branch mechanism (this run is expected-red, and does not count against the "green dispatch" DoD line above); local clone rebased cleanly onto the workflow's commit.
**Verify:** `stage4` = YAML sanity greps (cron strings, `timeout-minutes`, permissions) + `daily.json` schema check + dispatch/poll results via the GitHub MCP tools (no `gh run list` dependency) + `fresh-history.json` upsert-by-date behaviour confirmed (re-running the generator same-day doesn't duplicate an entry or need a different Fresh pick).
**Commit:** `stage4: daily pipeline, watchdog, loops live`

### Stage 5 — QA, polish, acceptance
**Objective:** launch-grade.
**Tasks:** favicon.svg (a minimal abstract mark — the specific motif can lag the current signature element; a single-drop mark from v1.1 is an acceptable placeholder until refreshed, not worth blocking on), icon pipeline per §4.7.10 (Linux rasterizer first), `manifest.webmanifest` + `sw.js` (Appendix C.2 **as amended** — the `res.ok` fix) + registration + theme-color sync, OG title/description meta, README (what/why/ops runbook: add cards, edit values, change feeds, manual dispatch, what the chips mean, how to Add to Home Screen on iOS/Android, platform caveats §8, the rotation's 1-for-1 replacement note from §6.2), byte-budget check, run `verify.mjs all`, confirm Pages 200 for `index.html`, `data/daily.json`, `manifest.webmanifest` AND `sw.js`, write `audits/FINAL-AUDIT.md` (including the §2 invariant-12 `verify.mjs` diff-vs-Stage-0 summary, and an honest "known imperfections" section — e.g. the blossom cold-launch splash-color mismatch from §4.7.8, any font/icon exit ramps taken), tag `v1.0`.
**DoD:** the §12 acceptance checklist — every machine-verifiable line green, every explicitly-human-deferred line clearly marked as such (not silently checked off).
**Verify:** `stage5` = budgets + curl 200s (four paths, live) + manifest JSON validation (required fields, relative `start_url`/`scope`) + `sw.js` byte-identity against Appendix C.2 **modulo the `ASSETS` array literal** (so extending it with fonts/favicon/manifest at this stage doesn't fail the gate) + a live-200 check on every entry in the extended `ASSETS` list + registration line present + `all` green.
**Commit:** `stage5: v1.0 launch` (+ tag `v1.0`)

### §10.7 Audit template (every stage)

```markdown
# Stage N Audit — <name>
Time (HKT): · Cycles used: x (cap: 3 consecutive without progress)
| Check | Result |
|---|---|
| <each DoD line> | ✅/❌/DEFERRED-TO-§13 + one-line evidence |
Verdict: PASS → proceeding to Stage N+1
Decisions this stage: <ids from decisions.md or "none">
Honest notes: <anything imperfect, deferred, or worth the human's eyes>
```

---

## §11 — Escalation protocol (the four named triggers — plus the standing §9.2 stop-loss)

1. **Auth/permission failure** — cannot push, GitHub access unavailable/unauthorized, Pages enablement genuinely impossible after retries.
2. **Repo mismatch** — remote is not the `Mindset` repo, or the working directory is not its root.
3. **Feed collapse** — **zero** of the five §7.1 sources can be verified after the full resolution budget (revised down from v1.0's "<3" — see §7.1; `fresh: null` is a fully supported outcome, not a build-ending one).
4. **Out-of-scope need** — anything requiring credentials, money, new scopes, or touching anything outside this repo.

These four are the only *substantive-decision* reasons to stop and ask. Separately, §9.2 rule 5's
stop-loss (cycle cap exhausted, or an unrecoverable environment error) is a standing, always-live
reason to stop cleanly and write `BLOCKED.md` — it is not one of "the four," but it is never
overridden by "decide, log, proceed" either. If both a §9.2 stop-loss and ambiguity about which
of these four (if any) applies come up at once, write `BLOCKED.md` with your best read of which
trigger is closest, plus the raw error — don't spend cycles deliberating the taxonomy.

**On trigger:** write `BLOCKED.md` — stage, attempts made, exact last error, **two** proposed fixes, and the single specific question for the human — commit it, stop cleanly. Everything not covered by the above: **decide, log it in `audits/decisions.md`, proceed.**

---

## §12 — Final acceptance checklist (Stage 5 gate)

**Machine-verifiable (gate Stage 5's `verify.mjs all`):**
- [ ] Pages URL returns 200 for `/` and `/data/daily.json`, `/manifest.webmanifest`, `/sw.js`
- [ ] `verify.mjs all` green; budgets met; contrast pairs pass at the corrected thresholds
- [ ] Both workflows have ≥ 1 green run via dispatch against real content; watchdog's stale-detection path proven via the prescribed mechanism (expected-red, doesn't count against the green-dispatch line)
- [ ] Zero PII about the owner/his wife (scripted email/phone/financial-figure sweep + human confirmation there's no accidental self-reference); zero quotation-mark glyphs in card bodies; zero banned phrases
- [ ] Mobile-first proven mechanically: zero `max-width` queries · zero root-absolute local URLs · safe-area + `svh` + `touch-action` present · no fixed widths ≥ 400px in `styles.css`
- [ ] Installable: manifest valid + served 200 · icons exist (or SVG-fallback decision logged) · `sw.js` byte-identical to the amended Appendix C.2 modulo `ASSETS`, registered, served 200
- [ ] README runbook complete; `v1.0` tag pushed
- [ ] `audits/CONTENT-REVIEW.md` written with no unresolved flags
- [ ] FINAL-AUDIT.md written with an honest "known imperfections" section and the `verify.mjs` diff-vs-Stage-0 summary

**Explicitly deferred to §13 human review (mark UNVERIFIED in FINAL-AUDIT, do not check off here):**
- [ ] Today's HKT date shows; cards populated; no console errors
- [ ] Theme toggle works both ways and survives reload; no wrong-theme flash
- [ ] The figure animates through recognizable sun-salutation poses in both themes; pauses when hidden; static under reduced motion; feels calm, not busy
- [ ] Offline rotation demonstrated live on a phone (airplane mode)

## §13 — Human review checklist (the ONE human step, ~20 min, after completion)

1. Open the Pages URL **on your phone**. Does the figure clearly move through its poses, feeling alive and calm, not busy? Rotate the phone, scroll — nothing clipped, nothing under the notch or home bar, no sideways scroll, the whole thing should fit one screen.
2. Safari: Share → **Add to Home Screen**. Reopen from the icon — it should launch full-screen like an app, with a proper icon and the chrome matching the theme.
3. Toggle blossom mode. Would its intended user smile? (Standalone chrome should turn blossom too — except the cold-launch splash screen, which is a known, logged limitation.)
4. **Airplane mode**, reopen from the icon: the shell loads instantly and the `offline rotation` chip appears with valid cards. Turn network back on, pull to refresh — today returns.
5. Open the **Values** tab and skim all 5. Toggle OS **Reduce Motion** and confirm the figure renders a static frame.
6. Read today's three cards aloud. Would you keep any? (Your monthly curation replaces the weakest cards — that's where the library becomes *yours*.)
7. Skim `audits/CONTENT-REVIEW.md` (~15 min) — delete or reword anything you wouldn't sign, especially any card whose attribution feels like a guess rather than a known idea.
8. Skim `audits/FINAL-AUDIT.md` "honest notes" + `decisions.md`.
9. Confirm you received the watchdog test issue/email (from the Stage 4 stale-detection test). Close it if still open.
10. Tomorrow at 06:00 HKT, glance once — on the phone. Then stop checking — LOOP-C watches so you don't have to.

---

## Appendix A — `verify.mjs` requirements

Node ≥ 20, zero deps, `node:test` + `node:assert` + `node:fs`. Modes `stage0..stage5|all`.
Must implement: file-existence maps per stage; regex/grep checks listed in each stage's Verify
(scoped precisely — see below); JSON schema + count validation for all three data files (plus
`manifest.webmanifest` fields + relative-path check); WCAG relative-luminance contrast math for
the §4.2 pairs at the §2.7-corrected thresholds; `lib.mjs` unit tests (HKT + rotation uniqueness
+ non-negative-dayNumber guard); mobile-first sweeps (`max-width`-query ban repo-wide is fine —
it's genuinely only valid in CSS; root-absolute local URL ban across `href=`/`src=`/`fetch(`/
`url(`/`import(`/`register(`/manifest `src`; fixed-width ≥ 400px ban **scoped to `styles.css`
only**); `sw.js` byte-identity with the amended Appendix C.2, **modulo the `ASSETS` array
literal**; a **scoped** PII/quote-mark/platitude sweep — quote-mark and platitude checks run
only over `data/cards.json` and `data/values.json` string fields (`text`, `attribution`, `from`,
`to`, `essence`, `behaviour`, `name`) plus any user-facing copy strings in `app.js`, **not** the
whole repo (JS/JSON/YAML syntax legitimately contains `"`), and exclude `scripts/`, `CLAUDE.md`,
`audits/`, `data/daily.json`, `state/`, and this file itself; the PII check is an email-address-
pattern sweep (excluding the git bot identity) plus obvious phone/financial-figure patterns, not
a name detector (see invariant 1); byte budgets (page ≤ 350 KB excl. fonts · fonts ≤ 300 KB ·
JS ≤ 60 KB · icons ≤ 150 KB). Per invariant 12, after Stage 0's commit these checks may only be
added or tightened — log any relaxation in `decisions.md` with the original check quoted.
Output: aligned ✅/❌ table, non-zero exit on any ❌.

## Appendix B — Reference rotation implementation (use verbatim in `lib.mjs`)

```js
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
```

*(This is byte-for-byte the Claude Design project's `mindset-lib.js`, which is itself v1.0's
Appendix B verbatim plus the `hktDateParts` addition above — use that file directly via
`DesignSync` rather than retyping it.)*

## Appendix C — Installability files (use VERBATIM, C.2 as amended)

### C.1 `manifest.webmanifest`

```json
{
  "name": "Mindset",
  "short_name": "Mindset",
  "description": "Three grounding cards, every morning at 06:00 HKT.",
  "display": "standalone",
  "start_url": "./",
  "scope": "./",
  "background_color": "#FAF9F5",
  "theme_color": "#FAF9F5",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```
*(If the §4.7.10 icon fallback fires, replace the icons array with the single SVG entry and log it. Known cosmetic limitation, logged rather than fixed: this manifest's static `theme_color`/`background_color` only cover calm's cold-launch splash; blossom users see a calm-colored splash for an instant before the app's own JS repaints — see §4.7.8.)*

### C.2 `sw.js` — network-first, cache fallback (amended: guard against caching failed responses)

```js
const CACHE = "mindset-v3";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./figure.js", "./lib.mjs",
  "./data/cards.json", "./data/values.json", "./data/daily.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
```

Why network-first for everything: when online the user ALWAYS sees today's cards (the stale-cache class of PWA bugs cannot occur); when offline the cached shell + last-known data load instantly and `app.js` shows the `offline rotation` chip. The `res.ok` guard (added in v1.1) is what makes this actually true: v1.0's unconditional `c.put` would silently overwrite a good cached copy with a transient 404/500 (e.g. mid-deploy), which then gets served as the "offline" fallback — the exact bug this guard closes. At Stage 5, extend `ASSETS` with the font files, favicon, and manifest so the offline shell is genuinely complete on first install (the byte-identity check in Appendix A is modulo this array, so extending it here is expected and sanctioned). `CACHE` was bumped to `"mindset-v2"` in v1.2 (drop.js → figure.js changed the asset list) — bump it again any time `ASSETS`' *contents* meaningfully change, so old clients purge stale cached files rather than serving them alongside the new ones (`activate` deletes any cache key that isn't the current `CACHE` name).

### C.3 Registration (last lines of `app.js`)

```js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
```

*End of plan. Execute.*
