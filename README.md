# Mindset

A personal mindset dashboard. One page, no backend, no dependencies — a small bottle of light
breathing slowly, the day's date in Hong Kong time, and three short grounding cards
that refresh themselves every morning at 06:00 HKT: an **Anchor** (a timeless principle),
a **Shift** (a "from → to" reframe), and something **Fresh** (the newest item from a small
set of public feeds, or a reserve card if none are available). A quiet **Values** tab sits
alongside it. Two themes — `calm` (cream/blue, default) and `blossom` (soft pink).

Zero build step, zero runtime dependencies, zero personal data about anyone but public
thinkers already credited by name. See `BUILD-PLAN.md` for the full specification this
site was built from.

## Add to Home Screen

**iOS (Safari):** open the site → Share sheet → **Add to Home Screen**. It launches
full-screen like an app, with its own icon, and the standalone chrome matches whichever
theme you last used.

**Android (Chrome):** open the site → menu (⋮) → **Add to Home screen** / **Install app**.

## What the chips mean

- **No chip** — today's cards, generated within the last 06:00 HKT refresh window.
- **`yesterday's cards`** (amber) — the daily refresh hasn't landed yet or briefly failed;
  showing the most recent successful day's cards (≤ 48h old).
- **`offline rotation`** (slate) — `data/daily.json` couldn't be reached at all (offline, or
  > 48h stale). The page computes today's cards locally from the full card library via the
  same deterministic rotation the daily pipeline uses, so you never see an empty screen.

## Ops runbook

**Add or edit cards** — edit `data/cards.json` (anchors/shifts/freshReserve) or
`data/values.json` directly, commit, push to `main`. No build step. Keep the writing rules
in `BUILD-PLAN.md` §5.3 in mind: ≤ 40 words, no quotation marks, no banned platitudes,
person-named attribution only when you're confident the idea is really theirs.

**Replace cards, not resize the pool** — the daily rotation (`lib.mjs`'s `pickIndex`) is a
per-cycle shuffle keyed to the pool size. Swapping one card's content for another (same
id, same position in the array) doesn't affect anything else. **Adding or removing** cards
changes the pool size and reshuffles the *entire* rotation from that point on — it may
briefly repeat a recently-seen card. Fine to do, just expect that one-time ripple.

**Change/add a Fresh feed source** — edit the `SOURCES` array in
`scripts/generate-daily.mjs`. Verify a new source two ways before trusting it: (1) liveness
— `curl` it and confirm it parses; (2) identity — confirm the feed's own `<title>`/author
actually matches who you think it is, not just that *some* feed responded. Two of the
current five sources were resolved this way (a podcast search API for Rob Dial's show, and
the canonical channel link for Ali Abdaal's YouTube ID) rather than trusted at face value.

**Keep the Fresh card on-theme** — four of the five sources are single-topic by nature and
always on-theme. Ali Abdaal's channel is topically broad (productivity, AI tools, book/fiction
recommendations, business), so the generator rejects candidate titles matching
`OFF_THEME_PATTERNS` in `scripts/generate-daily.mjs` (AI-tool tactics, app/tech reviews,
sponsorship language, pure entertainment) and looks further back through that source's recent
posts rather than dropping it outright. This is a keyword heuristic, not a real relevance
check — if an off-theme pick still slips through, add a pattern for it; if a broad-topic
source keeps producing off-theme picks despite the filter, the honest fix is removing it from
`SOURCES` rather than growing the denylist forever.

**Manually trigger the daily refresh** — GitHub → Actions → `daily-cards` → **Run workflow**
(branch `main`). Safe to re-run same-day: `generate-daily.mjs` upserts by date, so it won't
duplicate history or spuriously change an already-committed pick.

**Manually trigger the watchdog** — GitHub → Actions → `watchdog` → **Run workflow**. It
compares today's date (Hong Kong time) against both the committed `data/daily.json` and the
*live* Pages URL, and opens a GitHub issue if either is stale — catching not just a failed
daily run but also "the commit landed but Pages didn't redeploy."

## Platform caveats (real, not bugs)

- GitHub Actions cron can fire several minutes late under scheduler load — the daily job is
  scheduled at 05:56 HKT (not top-of-hour) and the watchdog waits until 09:00 HKT before
  alerting, specifically to absorb that.
- Scheduled workflows auto-disable after ~60 days with no repository activity. The daily
  bot commit keeps the repo active *while the daily job is actually succeeding* — if it
  silently breaks for two months straight, the watchdog protecting it eventually goes quiet
  too. There's no fix for this beyond an occasional glance (see the human checklist in
  `BUILD-PLAN.md` §13).
- Actions failure emails follow your own GitHub notification settings, not this repo's.

## Local development

There is no dev server and no build step by design (see `BUILD-PLAN.md` §9.2.3 — this
project's autonomous build explicitly avoided local preview servers; the real Pages URL is
the intended way to look at it). To run the generator or verifier locally:

```
node scripts/verify.mjs all
NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs   # only needed behind an egress proxy
```

## License

Site code: MIT (see `LICENSE`). Fonts (Fraunces, IBM Plex Mono) are SIL Open Font License —
see `assets/fonts/OFL-*.txt`.
