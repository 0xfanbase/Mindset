# Mindset — invariants (condensed)

Source of truth: BUILD-PLAN.md — read it before touching this repo.

1. PII: never the owner's or his wife's real name/employer/DOB/location/finances. Public-figure attribution (Seneca, Bill Perkins, etc.) is intentional and required, not a violation.
2. No verbatim quotes: zero quotation-mark glyphs in card bodies (ASCII apostrophes in contractions are fine). Attribution only, never excerpts.
3. Zero runtime deps: vanilla HTML/CSS/JS, no build step, no npm install, `localStorage` keys `mindset.*` only.
4. Node ≥ 20 built-ins only for scripts. Local `generate-daily.mjs` runs need `NODE_USE_ENV_PROXY=1`.
5. Ships on GitHub Pages from `main` root. All local URLs relative. `.nojekyll` present.
6. Budgets: page ≤350KB (excl. fonts), fonts ≤300KB, JS ≤60KB, `drop.js` ≤12KB.
7. WCAG AA contrast, keyboard focus, aria roles, 44px tap targets, semantic landmarks.
8. Every date is Asia/Hong_Kong via `Intl.DateTimeFormat` with explicit `timeZone` — never bare local time.
9. `<meta name="robots" content="noindex">`.
10. No force-push, no history rewrites of pushed commits. `git pull --rebase` on unpushed local commits is fine and required after the daily workflow's bot commit.
11. Mobile-first: base CSS is mobile, `min-width` queries only (`max-width` banned), relative URLs only, one-screen layout at 390×844, `svh` + safe-area insets, installable PWA.
12. Verifier ratchet: after Stage 0's commit, `verify.mjs` checks may only tighten, never loosen, without a logged `decisions.md` entry.

Anti-stuck (§9.2): same error text 3× → mandatory approach pivot, logged in `decisions.md`, resets the cycle counter. Command hygiene: `timeout 120` on anything slow, curls get `-m 30`, no dev servers/watch modes/interactive prompts/`npm install`/force-push. Stop-loss: cycle cap exhausted or unrecoverable environment error → write `BLOCKED.md` and stop cleanly — this is always live, not overridden by "decide and proceed."
