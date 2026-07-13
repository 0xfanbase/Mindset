# Stage 6 Audit — v1.2 post-launch revision (figure, layout, values, Fresh filter)
Time (HKT): 12:55 · Cycles used: 1/3

Triggered by live human feedback after v1.0 launch, not part of the original Stage 0-5
sequence. BUILD-PLAN.md bumped to v1.2 to keep it the accurate source of truth (see its own
changelog for full detail).

| Change | Result |
|---|---|
| Water drop → yoga sun-salutation figure (`drop.js` → `figure.js`, `<mindset-drop>` → `<mindset-figure>`) | ✅ original implementation, 11-pose loop (standing → raised arms → forward fold → lunge → plank → up-dog → down-dog → lunge → fold → raised arms → standing), 8.3KB |
| Fix "wasn't moving" | ✅ root cause: `_setup()` silently gave up if the element had zero size at connect-time, relying only on `ResizeObserver`'s own delayed initial callback to recover. New implementation retries via `requestAnimationFrame` until it gets a real size. Also made the new animation's motion structurally more visible at a glance (clear pose-to-pose transitions vs. the drop's one subtle physical effect) |
| Today tab decluttered | ✅ card padding 18px→20px, gap 11px→16px, line-height 1.5→1.55; header tightened (14px→10px top padding) to offset the taller figure box (84px→112px tall) |
| Values 10 → 5 | ✅ kept the 5 originally marked "core" (Consistency, Ownership, Patience, Focus, Presence), cut the 5 always marked "reserve, held back for later curation" — not a new deletion, just never promoting them |
| Mindset-relevance filter on Fresh pipeline | ✅ `OFF_THEME_PATTERNS` denylist in `generate-daily.mjs`; parser upgraded to check up to 5 items per feed (not just the newest) so a topically-broad source (Ali Abdaal) isn't dropped entirely when its newest post is off-theme. Regenerated live `daily.json`: previously picked an AI-prompt-tips video, now correctly picks a genuinely on-theme item |
| `verify.mjs` updated (renames + values count) | ✅ no relaxation — see updated invariant-12 note in `FINAL-AUDIT.md` |
| `sw.js` cache version bumped | ✅ `mindset-v1` → `mindset-v2` (asset list changed), `ASSETS` updated to `figure.js`; BUILD-PLAN.md Appendix C.2 updated to match so the byte-identity check still passes |
| `verify.mjs all` | ✅ 59/59 |

Verdict: PASS → ready to commit, push, and confirm live.

Decisions this stage: see `decisions.md` for the full list (figure replaces drop; robustness
fix; layout tightening; values cut to 5; Fresh topic filter; cache version bump).

Honest notes: the Fresh filter is a keyword denylist, not a real relevance classifier — it
catches the specific failure mode observed (AI-tool tips, then a fan-fiction recommendation,
both from Ali Abdaal) but can't guarantee every future pick from a topically-broad source is
genuinely on-theme. If that source keeps producing off-theme picks despite the filter, removing
it from `SOURCES` is the honest fix, not an ever-growing denylist — noted in the README.
Visual/behavioral confirmation of the new figure (does it actually read as yoga poses, does the
layout actually feel less cluttered) is still a browser-only judgment — deferred to the human,
same as every prior animation/layout change in this build.
