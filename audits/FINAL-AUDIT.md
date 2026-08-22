# FINAL AUDIT — v1.0 (see v1.2/v1.3/v1.33 updates below)

## `verify.mjs` integrity (invariant 12 ratchet check)

Diff against the Stage 0 committed version (`c904f4d`): one change, 13 lines. Stage 1's
`svh` presence check originally used `/\bsvh\b/`, which cannot match `100svh` (digit-to-letter
isn't a regex word boundary) — a false negative that would have failed on genuinely correct
code. Fixed to `/\d+svh/`. This is a bug fix that makes the check work as intended, not a
relaxation — no check was loosened or removed at any point in this build. No other lines of
`scripts/verify.mjs` changed after its Stage 0 commit.

**v1.2 update:** two further changes, neither a relaxation: (1) every `drop.js` reference
renamed to `figure.js` (the signature element was replaced, §4.6) — same checks, same
strictness, new filename; (2) the values-count assertion changed from `exactly 10` to
`exactly 5` — this reflects a deliberate, documented product decision (values.json cut from
10 to 5 per live human feedback, see `decisions.md`), not a softened gate avoiding a failure.
`verify.mjs all` remains 59/59 green after both changes.

**v1.3 update:** one further change, not a relaxation: `CATEGORY_COUNTS` gained a `voices: 9`
entry and the anchor-total assertion changed from `exactly 120` to `exactly 129` — this is a
documented content addition (a new `voices` anchor category, see `decisions.md`), a stricter/more
specific check than before (one more required category, one higher required total), not a
loosened gate. `verify.mjs all` remains 59/59 green after this change.

**v1.30–v1.33 update (independent-audit finding, addressed):** this file had drifted un-updated
since the v1.3 paragraph above — by the time this branch started, `main` was already at 82/82,
entirely through legitimate, individually-logged invariant-12 tightenings across roughly eighteen
intervening versions (v1.4 through v1.29). Each of those is its own dated, invariant-12-citing
entry in `audits/decisions.md`; they are not re-verified line-by-line against Stage 0 here, since
that is where the ground truth already lives, and re-deriving eighteen versions of history from
scratch in this paragraph would just be a second, less authoritative copy of it. What follows
accounts for this branch's own changes, 82 → 86:
1. **v1.30** (+1, 82→83): one stage1 regression check pinning `app.js`'s day-flip comparison to
   `expectedDateHKT`, not the raw calendar date — the fix for cards sticking on stale content
   past 05:00 HKT.
2. **v1.31** (net +0, then +2, 83→83→85): removing the `closing` pool deleted the checks that
   iterated it outright (nothing left to check), but their three shape assertions were inverted
   into `assert.equal(..., undefined, ...)` negative guards rather than silently dropped, so a
   future accidental reintroduction fails loudly — a reduction handled per invariant-12
   discipline, not a quiet deletion. Two new checks then prove the `pickIndex` cycle-seam fix: a
   multi-pool/multi-salt seam sweep, and an internal-consistency check reconstructing each
   cycle's full pick sequence to confirm it is still a genuine permutation (a direct regression
   test for the specific way the first, wrong fix attempt broke this, caught before it shipped).
3. **v1.32** (+1, 85→86): an exact-duplicate guard plus a near-duplicate proxy scoped to the
   expanded 1825-entry `journal` pool.

**The one relaxation this branch made, in full compliance with invariant 12's first clause:** the
stage5 page-weight budget moved from `<= 350KB` to `<= 600KB`, to fit the 1825-entry Journal pool
at full quality rather than compromise the content. The original check text (quoted verbatim),
the owner's explicit authorization, and the real byte math behind the new ceiling are all in
`audits/decisions.md`'s v1.32 entry, exactly as the invariant's own text requires.

**v1.33 also closed the second-clause gap this very update paragraph is answering.** The check
just above this paragraph used to assert only that the substring "verify.mjs" appears somewhere
in this file — true forever, so it had caught nothing since v1.3, which is how this file sat
stale for eighteen-plus versions without a single failing run. It now asserts (in `all` mode,
where the true live total is knowable) that this file states the current live check count, so a
future stale summary fails the suite instead of sitting quietly. This is a tightening, not a
relaxation — no prior check was loosened to add it.

One more disclosure while re-reading this file, not a new finding: the Stage-0 commit SHA quoted
at the top (`c904f4d`) predates the v1.28 PII-purge history rewrite (`git-filter-repo`) and, per
`decisions.md`'s v1.28 entry, no longer resolves anywhere in this repo's rewritten history —
that entry's own blanket note already covers every pre-rewrite SHA cited anywhere, including this
one. (Checked locally with `git cat-file -t c904f4d`, which reports no such object — but this
session's clone is shallow with its boundary at v1.12, so a local miss doesn't independently
prove non-resolution upstream the way a full clone would; noted here as a pointer to the existing
documented account, not as new proof beyond it, since this file is exactly the kind of place a
reader would go looking for that SHA.)

`verify.mjs all`: **86/86**, green.

**v1.35 update:** one further change, a genuine reduction handled per invariant-12 discipline,
not a silent drop: retiring Word of the Day (owner: "not helpful") deleted the `wordOfDay`-shape
check outright (nothing left to iterate once the pool's gone) while converting its count/shape
assertions into `assert.equal(..., undefined, ...)` negative guards, the same treatment Closing's
removal got in v1.31. Check count: 86 → 85. `verify.mjs all`: **85/85**, green.

**v1.36 update:** the Mara tab was retired (owner: the Masai Mara trip is over). Same discipline
again: the five `data/mara.json` shape/content checks and the `assets/mara/` photo-budget check
had nothing left to check once the file and directory were deleted, so they were removed outright
and replaced with one negative-guard check (`data/mara.json`/`assets/mara/` must not exist),
mirroring v1.31/v1.35's treatment of Closing/Word of the Day. Four other checks that scanned
`mara.js`/`data/mara.json` alongside still-live files had those two filenames dropped from their
file-list arrays — the checks themselves are unchanged in strictness for every file that remains.
Check count: 85 → 80 (6 removed, 1 added). Full accounting in `audits/decisions.md`'s v1.36 entry.
`verify.mjs all`: **80/80**, green.

## Acceptance checklist (BUILD-PLAN.md §12)

**Machine-verifiable — all green (`verify.mjs all`, 59/59):**
- [x] `verify.mjs all` green; budgets met (JS ~35KB, fonts ~174KB, icons ~16KB, page weight well under 350KB); contrast pairs pass at 4.5:1 (blossom's `--accent` was darkened from the design prototype's `#C94F7C` to `#B84870` to clear this gate — see `decisions.md`)
- [x] Both workflows registered and dispatchable; `daily-cards` has a green dispatch run against real content (bot commit `6f26aa8`); watchdog's live-check path is proven — for real, not simulated (see "known imperfections" below)
- [x] Zero PII about the owner/his wife (scripted email/phone/financial-figure sweep clean; the site never references either of them); zero quotation-mark glyphs in card bodies; zero banned phrases
- [x] Mobile-first proven mechanically: zero `max-width` queries, zero root-absolute local URLs, safe-area + `svh` + `touch-action` present, no fixed widths ≥ 400px in `styles.css`
- [x] Installable: manifest valid + relative paths, icons present (rasterized via headless Chromium, no npm install), `sw.js` byte-identical to the amended Appendix C.2 modulo `ASSETS`, registered
- [x] README runbook complete
- [x] `audits/CONTENT-REVIEW.md` written, no unresolved flags (74 of 170 cards were corrected during independent review; every correction is logged with its reasoning)
- [x] This file, with the diff-vs-Stage-0 summary above
- [x] Pages URL returns 200 for `/`, `/data/daily.json`, `/manifest.webmanifest`, `/sw.js` — confirmed live with correct content (see "known imperfections" #1 for how this got resolved)
- [x] `v1.0` tag pushed

**Explicitly deferred to §13 human review (not machine-checkable from this environment):**
- [ ] Today's HKT date shows; cards populated; no console errors — UNVERIFIED, no browser available to this build
- [ ] Theme toggle works both ways, survives reload, no wrong-theme flash — UNVERIFIED
- [ ] The drop animates in both themes, pauses when hidden, static under reduced motion, feels calm not busy — UNVERIFIED
- [ ] Offline rotation demonstrated live on a phone (airplane mode) — UNVERIFIED

## Known imperfections (honest)

1. **GitHub Pages needed two fixes, not one.** First, it wasn't enabled at all (confirmed via a direct 404), which required the repo owner's one-time Settings action. After that, the live URL *still* 404'd for over 30 minutes with a fresh push landed and no visible deployment activity anywhere — the repo's Pages **source turned out to be set to "GitHub Actions"**, not "Deploy from a branch," which needs an actual `actions/deploy-pages` workflow to ever publish anything. Added `.github/workflows/pages-deploy.yml` (checkout + `configure-pages` + `upload-pages-artifact` + `deploy-pages`); it ran successfully on the next push and the site went live immediately. All four live paths confirmed 200 with correct content.
2. The `watchdog` dispatch in Stage 4 correctly detected the (real, at-the-time) staleness and opened **issue #1** — genuine detection of a genuine gap, not the synthetic dry-run test §8 originally specified. That real detection is stronger evidence the stale-check path works than a synthetic test would have been, so the synthetic test was not additionally run (logged as a substitution in `audits/decisions.md`). Issue #1 is now closed — a re-dispatched `watchdog` run passes clean against the live site.
3. Visual/behavioral confirmation of the drop animation, theme transitions, and console cleanliness genuinely requires a browser — this build had no dev server (by design, see `BUILD-PLAN.md` §9.2.3) and no headless-browser step in the loop. These are exactly what §13's human checklist is for.
4. Blossom theme's cold-launch splash screen (before the app's own JS repaints `theme-color`) will briefly show calm's background color, since `manifest.webmanifest`'s `background_color`/`theme_color` are necessarily static. Cosmetic only, logged in `decisions.md`.
5. The manifest's single 512px icon carries `"purpose": "any maskable"` on one image rather than separate `any`/`maskable` entries — a known, low-severity anti-pattern (maskable rendering safe-zone-crops the same art). Left as-is; not worth a second icon for a single-drop mark this simple.
6. `.github/workflows/pages-deploy.yml` is additive infrastructure not described in BUILD-PLAN.md §3/§8 — it exists because of how this specific repo's Pages source was configured, not because the spec called for it. Noting this so it doesn't look like scope creep: without it, the site could not go live at all under this repo's actual settings.

## What's genuinely solid

The independent content-QA pass (Stage 3) caught real problems a mechanical script cannot see:
two of the *original seed cards* paraphrased Steve Jobs and Tony Schwartz/Jim Loehr closely
enough to read as quotations in substance despite carrying no attribution to either, and were
rewritten. Several near-duplicate cognitive moves within categories were caught and
diversified. The daily pipeline's feed resolution used real identity checks, not just
liveness — Ali Abdaal's YouTube channel ID in particular was resolved via the canonical
`<link>`/`og:url` on the handle page rather than the first bare `"channelId"` string match,
which pointed at three unrelated channels elsewhere in the same page. A same-day idempotency
bug in the daily pipeline (the Fresh pick flipping on re-run) was caught and fixed before
shipping. The rotation algorithm (Appendix B, from the Claude Design prototype) was unit-tested
for full-cycle uniqueness at all three real pool sizes.
