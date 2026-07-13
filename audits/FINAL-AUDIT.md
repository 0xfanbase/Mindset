# FINAL AUDIT — v1.0

## `verify.mjs` integrity (invariant 12 ratchet check)

Diff against the Stage 0 committed version (`c904f4d`): one change, 13 lines. Stage 1's
`svh` presence check originally used `/\bsvh\b/`, which cannot match `100svh` (digit-to-letter
isn't a regex word boundary) — a false negative that would have failed on genuinely correct
code. Fixed to `/\d+svh/`. This is a bug fix that makes the check work as intended, not a
relaxation — no check was loosened or removed at any point in this build. No other lines of
`scripts/verify.mjs` changed after its Stage 0 commit.

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
