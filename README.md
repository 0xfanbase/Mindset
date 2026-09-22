# Mindset

A life in weeks for J and B. One page, no backend, no dependencies — a small bottle of light
breathing slowly, the day's date in Hong Kong time, and one 90-year grid of small squares, one
square per week.

The page opens on the number: how many weeks are left, which week this is out of 4,680, and
what percent is lived. A person switch (J or B) drives everything below it — both progress
bars, the next three milestones, and the grid itself. The grid shows one person at a time: the
selected person's lived weeks are solid, the other appears only as a faint lead band and a
hairline outline on their own current week, so the square that draws the eye is *now* — which
fills a seventh at a time as the week goes by, with a slow halo breathing on the same 7-second
cycle as the bottle in the header. Three views: **Life** (the whole 90 years), **Decade** (the
current ten years, twice the size), **Year** (52 weeks as four rows of 13).

One dark theme (v4.0 — the pink `blossom` theme and the Hong Kong theme clock that switched it
were retired at the owner's request). The page background is the night sky; only the grid sits
on a card.

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
full-screen like an app, with its own icon. The splash, the status bar and the page are all
the same `#1C1F2A` since v4.0, so there is no launch-time colour flash either way.

**Android (Chrome):** open the site → menu (⋮) → **Add to Home screen** / **Install app**.

## Ops runbook

There is no daily job anymore. Deploy = push to `main` — `pages-deploy.yml` runs
`node scripts/verify.mjs all` as the gate before the site goes live; nothing else runs on a
schedule.

**Change the two birth months** — edit `lib.mjs`'s `LIFE_PEOPLE` (month precision only: year +
month, never a day). `verify.mjs` pins the current values, so update its expectations in the
same commit or the build will correctly fail.

**Bump the service-worker cache** — any time `sw.js`'s `ASSETS` list, or the bytes of any file
already on it, meaningfully change, bump `CACHE` (currently `mindset-v25`, bumped from `mindset-v24` in v4.0) so old
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
