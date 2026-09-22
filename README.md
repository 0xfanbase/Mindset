# Mindset

A life in weeks for J and B. One page, no backend, no dependencies — a small bottle of light
breathing slowly, the day's date in Hong Kong time, and one 90-year grid of small squares, one
square per week, filled pink-and-blue as each week passes (split cells where both have lived a
week, solid blue where only B has so far — he's older). It's zoomable and scrollable, with a
progress bar and percent-of-life-spent figure for each person at the top, a tap/hover toggle to highlight
just one person's weeks, and a total-weeks pill under the heading.

Two themes that follow the Hong Kong clock — `blossom` (soft pink) through the day, `dark`
(warm charcoal) from 17:00 to 06:00 HKT. The header toggle overrides the schedule for the
current visit only: nothing is stored, and every fresh load returns to the time-of-day cycle.

Weeks is the entire page (v3.0 — the Journal card and its daily pipeline were retired). It
advances on its own: since it's computed from today's HKT date on every load and on every
resumed visit, no daily-pipeline step is involved, and nothing here refreshes on a schedule —
the site only changes when a human pushes to `main`.

Zero build step, zero runtime dependencies. The only personal data anywhere in this repo is
two initials and two birth months (month precision only, never an exact day) — never full
names, never anyone else's data. See `BUILD-PLAN.md` for the full specification this site was
built from.

## Add to Home Screen

**iOS (Safari):** open the site → Share sheet → **Add to Home Screen**. It launches
full-screen like an app, with its own icon, and the standalone chrome follows the
time-of-day theme — pink through the Hong Kong day, dark from 17:00 HKT (a toggle override
lasts only until the app is next relaunched). The cold-launch splash is always dark-toned
by design: a light splash flashing at night was the harm worth removing, a dark splash by
day is a shrug.

**Android (Chrome):** open the site → menu (⋮) → **Add to Home screen** / **Install app**.

## Ops runbook

There is no daily job anymore. Deploy = push to `main` — `pages-deploy.yml` runs
`node scripts/verify.mjs all` as the gate before the site goes live; nothing else runs on a
schedule.

**Change the two birth months** — edit `lib.mjs`'s `LIFE_PEOPLE` (month precision only: year +
month, never a day). `verify.mjs` pins the current values, so update its expectations in the
same commit or the build will correctly fail.

**Bump the service-worker cache** — any time `sw.js`'s `ASSETS` list, or the bytes of any file
already on it, meaningfully change, bump `CACHE` (e.g. `mindset-v24` → `mindset-v25`) so old
installed clients purge stale cached files instead of serving them alongside the new ones.
Keep `BUILD-PLAN.md` Appendix C.2's code block in sync with the real file.

## Local development

There is no dev server and no build step by design (see `BUILD-PLAN.md` §9.2.3 — this
project's autonomous build explicitly avoided local preview servers; the real Pages URL is
the intended way to look at it). To run the verifier locally:

```
node scripts/verify.mjs all
```

## License

Site code: MIT (see `LICENSE`). Fonts (Fraunces, IBM Plex Mono) are SIL Open Font License —
see `assets/fonts/OFL-*.txt`.
