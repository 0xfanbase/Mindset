# Mindset

A personal mindset dashboard. One page, no backend, no dependencies — a small bottle of light
breathing slowly, the day's date in Hong Kong time, and four short cards
that refresh themselves every morning at 06:00 HKT: an **Anchor** (a timeless principle),
a **Journal** prompt (a mindful reflection question), a **Kenya** fact (one fact about Kenya —
geography, wildlife, history, culture, and more), and a **Word of the Day** (one word
worth knowing, its origin, and a one-line meaning). A quiet **Values** tab sits alongside it.
Two themes — `calm` (cream/blue, default) and `blossom` (soft pink).

A third tab, **Weeks**, is a combined life-in-weeks chart for J and B — one 90-year grid of
small squares, one square per week, filled pink-and-blue as each week passes (split cells
where both have lived a week, solid blue where only B has so far — he's older), zoomable and
scrollable, with a big percent-of-life-spent figure for each person at the top and a tap/hover
toggle to highlight just one person's weeks. It advances on its own: since it's computed from
today's date on every load, no daily-pipeline step is involved.

A fourth tab, **Mara**, is a reference for the August 2026 Masai Mara trip: a 2-column grid of
20 animals (Big Five, migration species, and other commonly-spotted wildlife) doubles as the
picker — tap one and it opens to a focused profile (real photos, lifespan/size/diet, where to
look, field notes, and a sighting-likelihood score for an August safari) with no filter left
showing, exactly as asked. A park-facts and Great Migration card leads the list. On a wide
screen the animal list becomes a persistent side column next to whichever animal is open.

Zero build step, zero runtime dependencies. The only personal data anywhere in this repo is
two initials and two birth months (for the Weeks tab above) — never full names, never an exact
day, never anyone else's data; everything else traces to public thinkers already credited by
name, or — for the Mara tab's photos — to the Wikimedia Commons photographers credited in each
photo's own caption, under Public Domain/CC0/CC BY/CC BY-SA licenses. See `BUILD-PLAN.md` for
the full specification this site was built from.

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

**Add or edit cards** — edit `data/cards.json` (anchors/journal/kenya/wordOfDay) or
`data/values.json` directly, commit, push to `main`. No build step. Keep the writing rules
in `BUILD-PLAN.md` §5.3 in mind: ≤ 40 words, no quotation marks, no banned platitudes,
person-named attribution only when you're confident the idea is really theirs. Word of the
Day entries have their own, shorter cap (≤ 20 words for `meaning`, §5.3.10). Kenya facts
(§5.3.11) share the anchors' ≤ 40 word cap, but the load-bearing rule there is correctness,
not attribution: verify any specific number, date, or superlative claim before writing it,
and favor durable facts over anything that could go stale (current officeholders, fast-moving
stats, unverified travel folklore).

**Replace cards, not resize the pool** — the daily rotation (`lib.mjs`'s `pickIndex`) is a
per-cycle shuffle keyed to the pool size. Swapping one card's content for another (same
id, same position in the array) doesn't affect anything else. **Adding or removing** cards
changes the pool size and reshuffles the *entire* rotation from that point on — it may
briefly repeat a recently-seen card. Fine to do, just expect that one-time ripple.

**Manually trigger the daily refresh** — GitHub → Actions → `daily-cards` → **Run workflow**
(branch `main`). Safe to re-run same-day (and any day) — `generate-daily.mjs` is a pure,
deterministic function of the date, no external fetch involved (v1.10 retired the Fresh card
and the RSS-fetching machinery that came with it), so re-running never duplicates or changes
anything unexpectedly.

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
