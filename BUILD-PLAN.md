# MINDSET — Autonomous Build Plan (v1.17)

> **This file is the single source of truth.** It is written to be executed by Claude Code
> end-to-end with zero human input except the three escalation triggers in §11 (plus the
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

**v1.5 changelog (from v1.4, Fable-led end-to-end audit):** requested audit of UI/UX, code, and
whether the daily-refresh pipeline works in practice, plus a full current-and-historical PII
sweep. Full findings in `audits/v1.5-fable-audit.md`. Headline result: **`daily.yml`'s bot
commits were never triggering `pages-deploy.yml`**, because GitHub does not fire other
workflows' `on: push` for commits made with the default `GITHUB_TOKEN` — proven empirically by
dispatching the real workflow twice and observing zero downstream `pages-deploy.yml` runs. Left
unfixed, the live site would have stayed frozen on whatever a human's last push deployed, every
day, forever, with the existing `watchdog.yml` unable to notice (it only compared the calendar
date, which doesn't change within a day). Fixed: `daily.yml` now explicitly dispatches
`pages-deploy.yml` via `gh workflow run` after a successful commit; `watchdog.yml` now also
compares `generatedAtISO`, not just the date. Also fixed: two real UI/UX gaps (no
`:focus-visible` anywhere; `.card`'s shadow color hardcoded to one theme) and one real code gap
(`app.js`'s render calls sat outside `boot()`'s `try`/`catch`, so malformed data — not just a
fetch failure, which was already handled correctly — could crash the render silently instead of
showing the graceful error card). Three claimed issues from the initial (cheaper-model) review
did not survive independent fact-checking and were discarded — recomputing WCAG contrast by
hand in Node showed all three flagged pairs actually pass 4.5:1; `verify.mjs`'s own numeric
check was right all along. PII/history scan: clean, no findings.

**v1.6 changelog (from v1.5, post-launch human feedback):** (1) **header now shows the wordmark,
date, and theme toggle on one line** — `header` switched from a 2-item flex row (with the date
on its own line below) to a 3-column grid (`1fr auto 1fr`), so the date is genuinely centered
regardless of the wordmark/toggle's differing widths, per live feedback with an annotated
screenshot; (2) **the figure's poses were rebuilt from scratch with fixed anatomical bone
lengths** — an audit (prompted by live feedback questioning whether the movement was "actually
doing [a sun salutation] and not random moves") found the previous hand-placed coordinates had
wildly inconsistent segment lengths across poses (e.g. the torso measured anywhere from 8.6 to
34.1 units depending on the pose, the forearm from 3.6 to 30.3) — a real bug, not a matter of
taste, since a human's limbs don't change length between poses. Rebuilt every pose with forward
kinematics from one fixed skeleton (neck 12, torso 27, upper arm 17, forearm 20, thigh 21, shin
21 — identical in all 8 named poses, verified by script) and joint angles chosen from the actual
biomechanics of each Surya Namaskar A position, checked numerically (hand/foot positions land
where they should relative to the hip/shoulder for each pose) rather than eyeballed; (3) **the
figure now renders as a solid tapered silhouette** (filled quads per limb, wider at the body end
than the extremity, rounded joints) instead of thin stroked lines, per live feedback asking for
"an actual human, not a stickman" (referencing, but not literally reusing, a copyrighted stock
yoga-pose reference image — the ask was read as "look like a body," not "embed this exact
photo," which would also conflict with the vector/theme-reactive design). Verified locally via a
static HTTP server + headless-Chromium screenshot (the live deployed URL couldn't be used for
this per the standing anti-stuck note in `decisions.md`, and the environment's one-shot
screenshot tooling turned out to ignore `--window-size`/viewport meta entirely, always laying
out at a fixed 500px width regardless of flags tried — confirmed harmless once screenshotted at
that actual width instead of a cropped 390px, not a real bug). `figure.js` grew to ~11KB, still
under the 12KB budget.

**v1.7 changelog (from v1.6, post-launch human feedback, two annotated screenshots plus a
request to rebuild the animation):** (1) **header restructured again to fill both top
corners** — the figure sat alone in an otherwise-empty top strip while the wordmark/date/toggle
occupied a separate row below it; moved the figure into the same row as a `.brand` block
(wordmark + a smaller date line stacked left-aligned beneath it) on the left and the theme
toggle on the right, all one 3-column grid, so nothing sits in empty corners and the whole row
reads as the true top of the page; (2) **card gap widened 16px → 24px** for visibly distinct
cards, per an annotation marking where the stacked cards read as touching; (3) **the animation
was rebuilt from the ground up**, using Fable to research real Surya Namaskar A mechanics after
live feedback that the movement was "defying gravity." Fable's diagnosis, confirmed by reading
the actual pose data: the figure silently flipped which direction it faced twice per cycle, its
planted hand "teleported" between six different x-positions across poses where a real hand stays
on the mat, plank's feet computed 33 units above its hands, and down-dog's hip apex was
geometrically taller than the arm+leg reach could support. Root cause: each pose's hip position
had been chosen independently "for nice composition" rather than derived from a shared ground
reference. Rebuilt all 8 poses via inverse kinematics from one fixed floor line (y=92) and one
fixed hand-plant spot (x=84, unmoving from the forward fold through down-dog, matching how a
real practitioner's hands stay put on the mat) — every grounded foot/hand is now actually AT the
floor in every pose it should be, with a single consistent facing direction throughout, verified
by extracting the shipped pose data back out of `figure.js` and independently re-checking bone
lengths, ground-contact positions, and arm reachability against the target hand position for
every pose (a real bug was caught and fixed this way: a target that was geometrically unreachable
given the fixed arm length, for the lunge pose, before the final version). Replaced up-dog with
cobra (simpler, calmer, and up-dog's old geometry didn't hold together) per Fable's
recommendation. (4) **timing rebalanced**: the old model held each pose 0.6–1.9s with short
~1s snaps between; Fable's research says a real vinyasa-paced salutation is the opposite —
movement lasts most of the breath, poses (other than down-dog and standing) aren't really held.
New model: 2.2–3.1s transitions, 0.5–0.7s settles, down-dog held 5s (its traditional five
breaths), full cycle ~42s (up from 26s). (5) added a small procedural lift to whichever foot is
mid-step during the sequence's four stepping transitions, so it arcs rather than drags along the
floor. `figure.js` ~11.6KB, still under the 12KB budget. `verify.mjs all` 59/59. (6) **Fable-led
holistic content/tone audit**, requested alongside the animation rebuild, against a subtler bar
than the mechanical checks alone can catch: whether a card's payoff is a state of being (the
app's purpose) or an output dressed in calm vocabulary. Five items reworded as a result —
`focus-001`, `rel-001`, `wealth-001`, `wealth-008` (`data/cards.json`), `shift-002`'s `to` side,
and Ownership's `behaviour` (`data/values.json`) — see `audits/decisions.md`/`CONTENT-REVIEW.md`
for full before/after reasoning per item; all pre-validated against `verify.mjs`'s exact
word-cap/quote-glyph/platitude rules before writing. (7) **Fresh card visually demoted**: gave it
(and its offline Reserve-shelf fallback) a flat, bordered, shadow-free `.card-fresh` treatment
against the page background instead of the Anchor/Shift cards' elevated white/shadowed
treatment, muted its chip/link color, and softened its link text from "Read →" to "Worth a
look →" — framing it as a lighter-touch invitation rather than a third obligation. It was
already last in render order, so "never above the fold" needed no further change.

**v1.8 changelog (from v1.7, post-launch human feedback, two annotated screenshots):**
(1) **the yoga figure is replaced with a small glowing bottle of light** — `figure.js` keeps
its filename, its `<mindset-figure>` tag, and its `color`/`glow`/`animate` attribute API
(app.js's theme-toggle wiring needed no changes), but the entire pose/kinematics system is
gone. In its place: a simple glass-bottle silhouette (canvas path, stroked at low opacity)
containing a soft light that breathes — brightens and dims on one continuous 7-second sine
cycle, no sudden jumps — plus two or three small embers that drift slowly upward inside the
glass and fade, on a longer independent loop. Same performance/accessibility contract as
before (`requestAnimationFrame`, pauses on `visibilitychange`, static mid-breath frame under
`prefers-reduced-motion`, `devicePixelRatio` capped at 2, offscreen radial-gradient sprite for
the glow so there is still zero per-frame `shadowBlur`). `figure.js` dropped from ~11.6KB to
~7.6KB (well under the 12KB budget) now that there is no pose table to carry.
(2) **header-to-tabs spacing tightened**: shrank `mindset-figure`'s box (84×96 → 56×64) since a
bottle icon doesn't need the vertical room a standing human figure did, and trimmed
`header`'s bottom padding and `.tabs`'s top margin — live feedback circled the empty band
between the header row and the Today/Values labels as wasted space.
(3) **Today's cards now share the Values tab's exact visual language** — while implementing
this, found the v1.7-part-1 "card gap widened 16px → 24px" change had never actually taken
effect: the `gap` was set on `.panel`, but `.panel` only ever has one direct child (`#cards` or
`#values-list`), so the three Today cards were rendering with **zero space between them**,
touching edge-to-edge, this whole time — a real, previously-undetected bug (confirmed via a
`getBoundingClientRect` check: card 1's bottom pixel equaled card 2's top pixel exactly).
Rather than re-patch the gap in place, unified `.card` with `.value-row`'s existing
flat/hairline-divided treatment (transparent background, no shadow, no radius, `padding: 15px
0`, `border-bottom: 1px solid var(--hairline)`, no border on the last child) — this fixes the
dormant spacing bug and makes the two tabs read as one consistent list style, per the request
to make them "identical." The Fresh card's separate quiet/bordered `.card-fresh` treatment
(added in v1.7 part 3) is retired since every card now already uses the quieter flat style by
default; its softened "Worth a look →" copy is kept. `verify.mjs all` 59/59.

**v1.9 changelog (from v1.8, post-launch human feedback):** (1) **a real, visible entrance
animation** — live feedback asked for "a small animation when I open up the page ... opening
up of the cards"; the existing `cardIn` keyframe was a 250ms fade/8px-rise that read as barely
there. Redesigned it as a 500ms fade + 14px rise + scale-from-0.97 with an eased
(`cubic-bezier(0.16,1,0.3,1)`) easing curve, and increased the per-card stagger from 60ms to
90ms so Today's three cards visibly cascade in one after another rather than arriving together;
extended the same entrance animation to the Values tab's rows (60ms stagger) for consistency.
Added a `prefers-reduced-motion` guard so the animation is fully suppressed (content appears
instantly) for anyone with that OS setting, matching the care already taken with the figure.
(2) **Today's cards reverted to being actual cards, deliberately un-unified from Values** —
further live feedback ("I want to see actual cards so that it feels easy to read ... to be
mindful and to learn something new or as a reminder") walked back v1.8's flattening
specifically for Today: restored `--surface` background, 20px radius, and a soft shadow
(`0 10px 28px var(--shadow)`), with real spacing between cards via `#cards { display:flex;
flex-direction:column; gap:14px }` — applying the gap to `#cards` (the actual parent of the
`.card` elements) rather than repeating the v1.8-diagnosed `.panel`-gap mistake. The Values
tab's flat/hairline row style is intentionally kept as-is: Today is meant to be read and
learned from, Values is a quieter reference list, so the two tabs are now deliberately
different rather than identical, superseding v1.8's "identical" framing. The desktop 3-across
media query updated to match (gap-based row layout, no leftover `border-bottom` override).
`verify.mjs all` 59/59.

**v1.10 changelog (from v1.9, post-launch human feedback):** the Fresh card (a daily RSS/
YouTube pick, §7 v1.0–v1.9) is retired and replaced with **Word of the Day** — one word worth
knowing, with its origin and a one-line meaning — after live feedback ("I don't really like the
fresh card") and a menu of alternatives ("show me some ideas"); the human picked Word of the
Day over Reflection Prompt, Micro-Practice, and dropping the third card entirely. This removes
an entire subsystem rather than just swapping content: `generate-daily.mjs` no longer fetches
anything (no `OFF_THEME_PATTERNS`/`isOnTheme`, no `SOURCES`, no `fetchWithTimeout`/
`decodeEntities`/`parseItems`), `state/fresh-history.json` and the `state/` directory are
deleted (nothing writes to them anymore), `daily.json`'s `fresh` field is replaced with a plain
`wordId`, and `app.js`'s `validFreshUrl`/`domainOf`/`renderFreshCard`/`renderReserveCard` (and
the `freshOk` branching between them) collapse into one `renderWordCard` used identically in
both the daily.json-driven and offline-rotation paths — Word of the Day is deterministic
(`cards.json`'s new 30-entry `wordOfDay` pool, rotated via the same `pickIndex` mechanism as
anchor/shift, §6.2), so unlike Fresh there is no live-fetch failure mode and no separate
"reserve" fallback needed. `styles.css`'s Fresh-specific classes (`.fresh-footer`,
`.fresh-domain`, `.fresh-read`, `.fresh-reserve-label`) and the now-unused `a.card-link` rules
are removed; one new class (`.word-title`) styles the word itself as a small headline between
the card's chip and its meaning. §11's four escalation triggers become three (the "Feed
collapse" trigger has nothing left to collapse). Per invariant 12, `verify.mjs`'s check count
drops from 59 to 58 with this change — a legitimate removal (the `state/fresh-history.json`
upsert-by-date check, since that file and the behavior it verified no longer exist), not a
loosening of any check that still applies; logged here per the ratchet rule. `verify.mjs all`
58/58.

**v1.11 changelog (from v1.10, post-launch human feedback):** (1) **a real bug found while
closing the header-to-tabs gap** — live feedback asked (again) to tighten the space between
the bottle and the Today/Values line. Investigation found the actual cause: `#staleness-chip`
carries `class="chip"` even while hidden, and `.chip { display: table; ... }` (an author-
stylesheet rule) unconditionally overrides the browser's built-in `[hidden] { display: none }`
rule — author-origin CSS always wins over user-agent-origin CSS at equal specificity,
regardless of selector order, so the hidden chip was never actually disappearing; it sat there
empty but still consuming its padding/margin box (~22px) in the common "fresh" (no-chip) case,
every single page load. `.panel[hidden] { display: none; }` already existed as the correct
pattern elsewhere in this same stylesheet — `.chip` just never got the equivalent rule. Added
`.chip[hidden] { display: none; }`; confirmed via `getComputedStyle` that the chip now actually
computes to `display: none` when hidden, and the figure-to-tabs gap dropped from 24px to 2px
with no further hand-tuning needed.
(2) **Word of the Day gets a pronunciation button** — a real `<button>` (44×44px tap target,
`aria-label="Pronounce <word>"`) rendered next to the word title, using the native
`SpeechSynthesisUtterance`/`window.speechSynthesis` Web API (no library, no network request —
same "vanilla browser API" category as `fetch`/`ResizeObserver`/`matchMedia`, already used
elsewhere). Progressive enhancement: the button is only rendered at all if
`"speechSynthesis" in window`, so there's never a dead control on a browser without TTS
support. Each `wordOfDay` entry (`data/cards.json`) gained a `lang` field (a BCP-47 tag,
e.g. `ja-JP`, `de-DE`, `el-GR`) mapped from its `origin`, so the utterance is spoken in a voice
matched to the word's actual language rather than defaulting to whatever the browser's default
voice/locale is — meaningfully more likely to sound like a real pronunciation, not just an
English voice sounding out foreign spelling. `verify.mjs` gained a new stage3 check asserting
every `wordOfDay` entry has non-empty `word`/`origin`/`lang`/`meaning` and that `lang` looks
like a real BCP-47 tag (59/59, up from 58 — a genuine new requirement, not a re-add of the
removed `fresh-history.json` check).

**v1.12 changelog (from v1.11, post-launch human feedback):** the Shift card (a "From X → To Y"
reframe, present since v1.0) is retired and replaced with **Journal** — a mindful reflection
prompt — after live feedback that Shift "seems to be not so helpful." Same deterministic-
rotation architecture as before, just a content-type swap: `data/cards.json`'s `shifts` array
(40 `{ id, from, to }` entries) becomes `journal` (40 `{ id, prompt }` entries, each an
open-ended question meant to be sat with, e.g. "What's one thing you're avoiding right now,
and what is it costing you to keep avoiding it?"); `lib.mjs`'s `pickToday` and
`generate-daily.mjs` both rename their `shift`/`shiftId` variable and salt to `journal`/
`journalId`; `data/daily.json`'s schema follows suit. `app.js`'s `renderShiftCard` (which built
a custom strikethrough-`from` / bold-arrow-`to` structure) is replaced by a much simpler
`renderJournalCard` — just the `JOURNAL` chip plus the prompt in the existing `.card-body`,
needing zero new CSS; `styles.css`'s now-dead `.shift-from`/`.shift-to`/`.shift-to .arrow`
rules are removed. `verify.mjs`'s stage3 checks (shape, count, word cap, quote-glyph,
platitude, offline-fallback simulation) and stage4's `daily.json` schema check are retargeted
from `shifts`/`shiftId` to `journal`/`journalId`; the 40 new prompts were pre-validated against
these exact rules (word cap raised to ≤25 words, since a real question needs more room than an
8-word half-reframe did) before writing. `verify.mjs all` 59/59 (same count — this is a
retarget, not an add or removal, since Shift already had checks in all the same places
Journal now does).

**v1.13 changelog (from v1.12, post-launch human feedback):** the Word of the Day headline
(`.word-title-row`/`.word-title`) is centered and set in italics — live feedback that the word
"sitting on the left" didn't read as the deliberate headline it's meant to be. `.word-title-row`
gains `justify-content: center`; `.word-title` gains `font-style: italic` and `text-align:
center`. Purely cosmetic — no markup, schema, or rotation-logic change; `verify.mjs all` stays
59/59. Confirmed via a 10-consecutive-HKT-date dry run of `lib.mjs`'s real `pickIndex`/
`hktDayNumber` against `data/cards.json` that the word does change every day (Gemütlichkeit →
Dharma → Mono no aware → Ren → Tsundoku → Ataraxia → Ubuntu → Ikigai → Saudade → Amor fati across
ten consecutive dates, no repeats). Separately, live feedback questioned whether the **Anchor**
card actually functions as a mindful anchor — this was discussed at length (the 7-category pool
spans incompatible registers from Stoic principle to tactical relationship/productivity advice,
much of the pool reads as instruction rather than something to return to and sit with, and a
~4.3-month rotation cycle is too long for any single idea to recur often enough to feel
"anchoring") but **no Anchor content or logic changed in v1.13** — the user was asked to pick a
direction (narrow the pool to timeless principle-level entries; weight rotation so a core subset
recurs more often; rewrite the tactical entries toward observation/being rather than instruction)
and this remains open, pending their steer.

**v1.14 changelog (from v1.13, post-launch human feedback):** the human picked a direction for
the Anchor rewrite — "rewrite the tactical ones toward observation/being rather than
instruction," with calmness/mindfulness/grounding as the throughline — and separately asked to
expand the pool from 129 to 365 (one per day of the year), sourced from named public figures and
philosophical traditions, researched deeply rather than guessed at. The entire `anchors` pool was
replaced (not incrementally edited) under a new 10-category taxonomy designed to give the
observational voice real breadth: `stoic` (55, Marcus Aurelius/Seneca/Epictetus), `buddhist` (55,
Thich Nhat Hanh/Jon Kabat-Zinn/the Dalai Lama/Pema Chödrön), `taoist` (25, Lao Tzu/Zhuangzi),
`impermanence` (35, replacing `diewithzero` — Bill Perkins/memento mori), `attention` (35,
replacing `focus` — Cal Newport), `relationships` (30, Carnegie), `growth` (30, Dweck/Kristin
Neff/Brené Brown), `money` (25, replacing `wealth` — Morgan Housel), `voices` (40, expanded from 3
to 8 named figures — Jay Shetty, Barack Obama, Michelle Obama, Nelson Mandela, Desmond Tutu, Fred
Rogers, Viktor Frankl, Naval Ravikant), and `grounding` (35, new — universal sensory/body
observations with no named attribution, zero research risk by design).

Content was produced via 12 parallel research-and-author passes (one or two per category,
splitting the two largest for quality control), each explicitly researching its source figures'
actual documented themes/books before writing rather than working from vague memory, and each
given a hard voice mandate with worked before/after examples: every entry must read as an
**observation of something already happening** in the reader's mind/body/day (e.g. "notice the
pull toward the next tab before you follow it"), never an **instruction to perform a task**
(e.g. "close every tab") — the exact reframe the human asked for. All 365 drafts passed mechanical
validation cleanly on the first pass (word cap ≤40, zero quotation-mark glyphs, zero banned
platitudes, zero exact or near-duplicate text across the full 365).

That mechanical cleanliness undersells how much real editorial work followed: four independent,
fresh-context QA passes (mirroring the authoring split) fact-checked every named attribution
against real documented sources, checked for paraphrases that track a person's single most famous
line too closely (verbatim-quote-in-spirit, not just quote-mark glyphs), checked strict political
neutrality for the `voices` figures who held major public office (Obama, Michelle Obama, Mandela,
Tutu — personal-character themes only, zero reference to office/party/policy/elections), and
checked for the exact instruction-vs-observation slip this whole rewrite exists to fix. These
passes found ~70 genuine issues a mechanical script cannot catch, including: several
semantically-duplicate entries the token-overlap proxy missed (same cognitive move, different
words); Stoic/Taoist/Buddhist entries paraphrasing a specific famous line too closely (Marcus
Aurelius's "born to do the work of a human being," Seneca's "to be everywhere is to be nowhere,"
Epictetus's own cup-breaking example, Lao Tzu's water-flows-downhill image, Thich Nhat Hanh's
cloud-in-the-paper interbeing parable); a systemic relapse in `relationships` where ~11 entries
ended in a "Notice X" command tail — the instruction pattern this rewrite was meant to eliminate,
caught and rewritten; several `growth` entries written as third-person research reportage ("studies
found...") instead of a first-person noticed moment; three `voices` political-neutrality issues on
Obama entries reading as office-adjacent (an adversarial-negotiation framing, "back at the desk,"
a "season" of public criticism); and — most seriously — one Viktor Frankl entry built on the
"space between stimulus and response" line, which independent research confirmed is a
well-documented **misattribution** to Frankl (he never wrote or said it) and was dropped entirely
rather than softened. A dedicated fix pass (mirroring the same 4-way split) applied every flagged
correction, re-verified programmatically that all untouched entries stayed byte-identical, and the
final assembled pool re-passed the full mechanical validation suite (365/365, word caps, zero
quote glyphs, zero platitudes, zero exact or near-duplicates) before being written to
`data/cards.json`.

`scripts/verify.mjs`'s `CATEGORY_COUNTS` and total-anchors assertion were retargeted to the new
taxonomy and count (365, up from 129) — `verify.mjs all` stays 59/59 (a retarget, not an add or
removal). `data/daily.json` was regenerated via the real `generate-daily.mjs` since the old
`anchorId` (from the retired category scheme) no longer existed in the new pool. Verified visually
via Playwright: the Anchor card renders correctly, zero console errors. This is a full content
replacement, not an incremental edit — see `audits/CONTENT-REVIEW.md` for the complete new pool
and `audits/decisions.md` for the taxonomy design rationale and full QA findings.

**v1.15 changelog (from v1.14, live feature request):** the owner is traveling to Kenya (Masai
Mara) and asked for a fourth Today card — one new fact about Kenya per day, spanning animals,
geography, politics, history, "etc," with correctness as the explicit bar. This is an addition,
not a replacement of an existing card: a new **Kenya** card is inserted between **Journal** and
**Word of the Day** (render order: Anchor, Journal, Kenya, Word), using the same deterministic
`pickIndex`-based rotation (salt `"kenya"`) as the other three, so it works identically whether
`daily.json` resolves or the client falls back to offline rotation.

- **Content:** authored 60 entries (`data/cards.json`'s new `kenya` array, `{ id, category, fact
}`) across seven categories — `Geography` (12), `Wildlife` (14), `History` (10), `Government`
(8), `Culture` (8), `Economy` (4), `Sports` (4) — weighted toward Wildlife/Geography since those
are most relevant to a Masai Mara safari, while still covering the requested breadth. Before
writing any of it, dispatched an independent research pass (live web search) against ~30 of the
draft entries' more specific numeric/date/superlative claims (Mount Kenya's exact elevation, Lake
Turkana's "largest desert lake" claim, the Turkana Boy fossil discovery, Fort Jesus/Lamu's UNESCO
status, the Uganda Railway/Nairobi founding date, the 1963/1964 independence dates, the 2010
constitution's 47 counties, M-Pesa's 2007 launch, Kenya's first Olympic medal, and more) — 29 of
30 confirmed accurate as drafted; one (the UNEP/Nairobi claim) was tightened from "one of very
few" to the factually stronger and correct "the only UN agency headquarters located in the Global
South." Deliberately avoided anything likely to go stale — no named current officeholders, no
volatile statistics, no unverified travel-blog folklore (e.g. the popular but scientifically
staged equator water-drain demonstration near Nanyuki was left out on purpose). All 60 entries
pre-validated clean against `verify.mjs`'s exact mechanical rules (word cap, quote-glyph scan,
banned-platitude scan, near-duplicate token-overlap proxy) via a throwaway Node script before
being written, same method used for every prior content batch.
- **Same architecture, new pool, no schema break for existing cards:** `lib.mjs`'s `pickToday`
gains a `kenya` pick (salt `"kenya"`); `generate-daily.mjs` stamps a new `kenyaId`;
`data/daily.json`'s schema gains `kenyaId` alongside the existing three ids. `app.js` gains
`renderKenyaCard()` (`KENYA` chip, the fact in `.card-body`, the category as a small `.card-attr`
line — e.g. `— Wildlife` — mirroring how Word of the Day's `origin` renders), wired into both the
`daily.json`-driven render path and the offline-rotation fallback path. No new CSS was needed —
the card reuses `.card`/`.card-chip`/`.card-body`/`.card-attr` exactly as-is.
- **`verify.mjs` tightened, not loosened, per the invariant-12 ratchet:** stage3 gained a
`kenya`-shape check, a `journal = 40, kenya = 60, wordOfDay = 30` count check, a
category-counts-exact check (a new `KENYA_CATEGORY_COUNTS` constant mirroring the existing
anchor `CATEGORY_COUNTS` pattern), and `kenya` was added to the existing word-cap (≤40, same cap
as anchors), quote-glyph, banned-platitude, and offline-fallback-simulation checks. `stage4`'s
`daily.json` schema check now also asserts `kenyaId` is a string. Check count rises from 59 to 60
(a genuine new requirement, not a re-add of anything removed).
- **Verified:** `verify.mjs all` 60/60. Regenerated `data/daily.json` for real via
`NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs` (today, 2026-07-14, picked `kenya-51`).
Ran the real `pickIndex`/`hktDayNumber` across 10 consecutive HKT dates against the real `kenya`
pool and got 10 distinct facts, no repeats, matching the actually-shipped pick for today.
Verified visually via Playwright + the pre-installed headless Chromium at a real 390×844
viewport: cards render in the order Anchor → Journal → **Kenya** → Word, the Kenya card is
visually identical in styling to the other three (no drift, no new CSS bugs), zero console
errors.

**v1.16 changelog (from v1.15, live UI request):** the owner asked for two changes aimed at
making the morning open of the app calmer: (1) **Journal now renders first**, directly under
the Today tab, ahead of Anchor/Kenya/Word; (2) **before 09:00 HKT, only Journal shows** — the
other three cards are collapsed behind a quiet reveal control instead of rendering (and
competing for attention) alongside it. At or after 09:00 HKT the page renders exactly as
before (all four cards, Journal first), with no collapse and no control at all.

- **Why collapse instead of dim:** a project-director pass (Fable) considered blur/opacity
  dimming, an auto-reveal timer, and a native `<details>` disclosure before recommending a
  full collapse behind a `button[aria-expanded][aria-controls]` toggle. Dimmed-but-legible
  text is still a distraction (arguably a stronger one — half-visible copy invites a closer
  look) and fails the WCAG AA contrast pairs at any opacity worth calling "dimmed"; a live
  09:00 timer/`setInterval` would be new complexity this single-person app has never needed
  elsewhere (every other time-dependent render — cards, date line, staleness chip — is
  computed once at load, not kept live); `<details>/<summary>` would force the cards to nest
  inside it, breaking `#cards`'s flex/gap layout and the existing `cardIn` stagger. A plain
  disclosure button reuses the codebase's existing idioms (the `[hidden] { display: none }`
  override pattern from the v1.11 `.chip` bug fix, the mono pill visual language of the
  staleness chip/theme toggle, and the `cardIn` stagger, which replays for free when a
  `display:none` subtree is revealed) at effectively zero new JS.
- **`lib.mjs`:** the inline HKT-hour `Intl.DateTimeFormat` expression inside `expectedDateHKT`
  was extracted into a new exported `hktHour(d)` (pure refactor, `expectedDateHKT`'s behavior
  unchanged); a new `isFocusWindowHKT(d) = hktHour(d) < 9` drives the gate. 00:00–08:59 HKT
  counts as the focus window (including the pre-06:00 hours when yesterday's cards are still
  showing) — a 5am open should if anything be quieter, not less so.
- **`app.js`:** `renderToday` now resolves `{anchor, journal, kenya, word}` once regardless of
  staleness mode, then branches on `isFocusWindowHKT(new Date())`: `paintCards([Journal,
  Anchor, Kenya, Word])` post-09:00 (same function as before, just reordered), or the new
  `paintFocusedToday(journalNode, restNodes)` pre-09:00, which renders Journal alone, a
  `.reveal-rest` toggle button (text flips "show the rest" / "hide the rest"; `aria-expanded`
  flips with it), and a `#cards-more` wrapper (`hidden` by default) holding the other three.
  The toggle is a real disclosure, not a one-way reveal — clicking it again re-collapses —
  which avoids the focus-management problem of removing a focused control from the DOM.
  No new localStorage key: the window re-collapses on every fresh load before 09:00 by
  design (the point is the daily nudge back to Journal, not a one-time dismissal), and no
  live boundary-crossing update (consistent with every other time-gated render in this app).
- **`styles.css`:** new `.reveal-rest` (44px min-height pill, mono, matches the muted/hairline
  register of the staleness chip and theme toggle, `:focus-visible` ring, respects
  `prefers-reduced-motion`) and `#cards-more` (mirrors `#cards`'s flex column + gap; the
  `[hidden] { display: none }` override is required for the same reason the v1.11 `.chip`
  fix was — author-origin `display` would otherwise beat the user-agent `[hidden]` rule). The
  existing `@media (min-width: 900px)` 4-across row layout is untouched for the normal
  (post-09:00 or already-revealed) case; a `#cards.focus` override keeps the pre-09:00 state
  a single stacked column even on desktop, since the two states aren't meant to look alike.
- **`verify.mjs` tightened, not loosened, per the invariant-12 ratchet:** stage1 gained a
  boundary check pinning `isFocusWindowHKT` at 08:59 HKT (`true`) and 09:00 HKT (`false`).
  Check count rises from 60 to 61.
- **Verified:** `verify.mjs all` 61/61. Visually confirmed via Playwright + the pre-installed
  headless Chromium at a real 390×844 viewport, driven without a local dev server (all
  requests fulfilled directly from disk through Playwright's own request interception, per
  this project's no-local-server convention): before 09:00 HKT the page shows Journal alone
  plus a "show the rest" pill; clicking it reveals Anchor/Kenya/Word with the existing
  entrance cascade and flips the pill to "hide the rest"; clicking again re-collapses; at
  09:00 HKT and later the page renders all four cards Journal-first with no pill at all.
  Zero console errors in either state.
- **Fable-led iOS UX audit (pre-merge, this app's primary real-world context):** read the
  actual shipped code against researched WebKit/iOS Safari/VoiceOver behavior rather than
  generic advice. Confirmed correct as-is and left untouched: the `display:none`→animation
  restart on reveal (CSS Animations Level 1 guarantees this; no forced-reflow hack needed),
  the `#cards-more[hidden]{display:none}` specificity override (the same trap the v1.11
  `.chip` fix caught), 44px tap target sizing/spacing, `touch-action: manipulation` (still
  meaningfully different from the viewport meta's tap-delay fix at non-1x zoom, confirmed
  against WebKit's own 2016 announcement), and the VoiceOver disclosure pattern (iOS doesn't
  auto-announce the state *change* on activation — a known, old platform gap, not a bug in
  this code — but the swapped button label and the revealed card being the very next DOM
  node after it both compensate). One genuine, iOS-specific finding: installed iOS PWAs
  freeze JS while backgrounded and resume the frozen render on foreground, unlike a normal
  browser tab, so `isFocusWindowHKT`'s single load-time check could leave an 08:45-opened
  session still showing collapsed focus mode at 11:00 if the owner only app-switched and
  came back rather than reloading. Fixed: `app.js` now caches the booted `{cardsData,
  dailyData}` and the focus state it last painted, and a `visibilitychange` listener
  re-runs `renderToday` (idempotent, cheap, no network) only when the boundary has actually
  flipped since the last paint. Verified via Playwright: opened frozen-clock at 08:45 HKT
  (focus mode paints), advanced the clock to 11:00 HKT and dispatched a synthetic
  `visibilitychange` event with **no page reload** (the same event a real resume fires),
  confirmed the page repaints to the full Journal-first four-card layout with no toggle,
  zero console errors.

**v1.17 changelog (from v1.16, live feature request):** the owner and his wife fly out to Kenya
on 2026-08-15; asked for a day countdown on the Kenya card, top-right, with a beautiful design
and a Fable UI/UX audit before merging.

- **`lib.mjs`:** new `daysUntilKenyaTrip(now)`, diffing a fixed `KENYA_TRIP_DATE_HKT =
  "2026-08-15"` day-number against `hktDayNumber(now)` — the same epoch-day mechanism
  `pickIndex`/`hktDayNumber` already use elsewhere, not `new Date(future) - new Date(now)` ms
  subtraction, so it's immune to the kind of local-clock/DST edge case that method invites (HKT
  itself has no DST, but the shared helper keeps the whole app's date math in one consistent
  idiom per invariant 8).
- **`app.js`:** `renderKenyaCard` wraps the existing `.card-chip` in a new `.card-top` flex row
  and, when `daysUntilKenyaTrip` is still >= 0, appends a `.kenya-countdown` pill showing `N
  DAYS` / `1 DAY` / `TODAY` with a full-sentence `aria-label` (e.g. "31 days until the Kenya
  trip") for screen readers. Once the trip has passed the pill simply stops rendering — a
  negative countdown would read as a bug, not a feature — while the Kenya facts keep rotating
  normally either way, unaffected by the trip date.
- **`styles.css`:** `.card-top` (flex, `space-between`) plus `.kenya-countdown` (10px IBM Plex
  Mono 500, `--ink` text on a `--edge` accent-tinted pill, `999px` radius) — both new rules, no
  changes to any existing selector. Contrast was computed by hand before shipping (not
  assumed): `--accent` text on the composited `--edge`-over-`--surface` background measured
  4.46:1 (calm) and 4.01:1 (blossom) — both fail the 4.5:1 AA bar for this pill's 10px text, so
  `--ink` was used instead once `--accent` was ruled out; `--ink` on the same composited
  background measures 13.70:1 (calm) / 13.55:1 (blossom), comfortably clearing AA. `verify.mjs`
  doesn't check this specific pair mechanically (it isn't one of the app's persistent
  background/text token pairs), so this was verified directly in Node against the exact
  composited RGB before commit, the same method `verify.mjs`'s own contrast check uses.
- **`verify.mjs` tightened, not loosened, per the invariant-12 ratchet:** stage1 gained a check
  pinning `daysUntilKenyaTrip` at four known instants — 31 days out, 30 days out (one HKT day
  later), the trip's own HKT calendar day (0), and the day after (-1, confirming the sign the
  UI relies on to hide the pill). Check count rises from 61 to 62.
- **Fable UI/UX audit (pre-merge, per the request):** see `audits/v1.17-fable-audit.md` for the
  full write-up.
- **Verified:** `verify.mjs all` 62/62, `node --check` clean on every touched file. Visually
  confirmed via Playwright + the pre-installed headless Chromium at a real 390×844 viewport,
  served from a local static server (this project's established alternative to Playwright's
  own request interception, used in v1.6/v1.9/v1.15), across five clock-frozen states: 31 days
  out in both themes, 1 day out, the trip's own HKT day (renders `TODAY`), and the day after
  (pill absent, rest of the card unaffected) — plus a real-current-time pass confirming zero
  console errors. `#cards`'s existing entrance-cascade and the `@media (min-width: 900px)`
  4-across layout are both untouched; the pill adds no height to the card's chip row since it
  sits inline with the existing `.card-chip` inside the new flex wrapper.

## KICKOFF PROMPT (human copies this into Claude Code, run from the repo root)

```
Read BUILD-PLAN.md in full before doing anything. Then execute Stages 0 through 5
exactly as specified, fully autonomously. Obey §2 invariants at all times, follow
the §9 loop protocol for every stage, and only stop to ask a question if one of
the three triggers in §11 fires, or the §9.2 stop-loss condition is hit. After each
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
with three short grounding cards, headed by a living "mind" — a small bottle of light,
glowing and dimming on a slow breathing cycle, on repeat. Two tabs: **Today** (figure + date +
3 cards) and **Values** (a quiet list of core qualities). Two themes: a cream/blue default
and a soft pink alternative.
Zero backend. Zero dependencies. Zero personal data (about the owner — see §2.1).

The three daily cards:

1. **Anchor** — a timeless principle (Stoicism, Die With Zero, growth mindset, relationships, wealth principles, focus/energy), written as an original paraphrase with attribution.
2. **Journal** (v1.12, replacing Shift) — a mindful reflection prompt, an open-ended question meant to be actually sat with, not a quick from/to reframe.
3. **Word of the Day** (v1.10, replacing Fresh) — one word worth knowing (often untranslatable — *wabi-sabi*, *ikigai*, *amor fati*) with its origin and a one-line meaning, deterministically rotated the same way as Anchor/Journal.

---

## §2 — Non-negotiable invariants (check EVERY stage against these)

1. **PII invariant — protects the site owner and his wife, not the ideas being discussed.**
   No real name, employer (past or present), financial figure, date of birth, or location
   tied to *the owner or his wife* anywhere in the repo — code, content, commit messages,
   audit files, README. This does **not** apply to public figures cited by design: anchor
   attributions (`— after Seneca`, `— after Bill Perkins`, etc., per §5) are intentional and
   required — the site is public, and quoting/citing public thinkers is the point of the
   Anchor cards. The pink theme is still called `blossom`
   in code and UI, never a person's name. Enforcement is mechanical only where it can be
   (email-address pattern sweep excluding the git bot identity; obvious phone/financial-figure
   patterns); person/employer-of-the-owner PII is otherwise enforced by the writing rules (§5)
   never referencing the owner at all, plus the §13 human review — not by a script pretending
   to detect it.
2. **No verbatim quotes.** Every card is an original paraphrase. Card bodies must contain
   **zero quotation-mark glyphs** (`"`, `"`, `"`, `'`, `'` used as quotation marks — an ASCII
   apostrophe `'` used intra-word for a contraction or possessive, e.g. "yesterday's", is not
   a quotation mark and is allowed). Attribution style: `— after Seneca`, `— after Bill Perkins`,
   `— core principle`. Never copy sentences from books, sites, or transcripts.
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
├── figure.js               # canvas glowing-bottle animation (the signature element — was drop.js/brain.js)
├── lib.mjs                 # SHARED pure functions: HKT date, day number, rotation (imported by browser AND node)
├── manifest.webmanifest    # home-screen installability (Appendix C)
├── sw.js                   # offline shell, network-first (Appendix C, verbatim)
├── assets/
│   ├── fonts/              # self-hosted woff2 + OFL.txt licences
│   ├── icons/              # icon-192.png, icon-512.png, apple-touch-icon.png (180)
│   └── favicon.svg
├── data/
│   ├── cards.json          # anchors[365], journal[40], kenya[60], wordOfDay[30]
│   ├── values.json         # 5 values
│   └── daily.json          # written by the pipeline daily
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
which exactly one thing is alive: a small bottle of light, glowing and dimming slowly and
deliberately, on an otherwise still page. Contemplative Stoic calm + the precision of an
automated system. All boldness is spent on the figure; everything else is disciplined and
quiet. The whole screen fits without scrolling on a phone (§4.4) — editorial, not busy.

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

Type scale (px): 10 (mono meta chips) · 12–13 (mono date line, values essence/behaviour) · 15.5 (anchor/journal/word card text, error state) · 17–18 (values name, wordmark) · 20 (word title) — line-height ~1.45–1.5 body/card text.

### 4.4 Layout — one no-scroll screen (390×844 baseline)

The design supersedes v1.0's tall hero-canvas mockup with a compact, single-screen layout
(matching the "Mindset Mobile UI.dc.html" prototype, option 1c):

```
┌────────────────────────────────────┐
│         [ small glowing bottle ]   │  the page's literal top element (v1.4) —
├────────────────────────────────────┤  safe-area-inset-top padding lives here now
│ mindset (italic wordmark)  ◐ toggle│  header, ~44px, sits below the figure
├────────────────────────────────────┤
│      MONDAY · 13 JULY 2026         │  mono, letterspaced, uppercase (tightened v1.8)
│   (staleness chip if applicable)   │
├────────────────────────────────────┤
│      Today      Values             │  tabs (role=tablist), underline-active style
├────────────────────────────────────┤
│  JOURNAL (mono chip)                │  cards: surface + shadow + radius (v1.9);
│  card text (Fraunces)              │  Journal renders first since v1.16 (§4.5
│  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  │  item 4b — before 09:00 HKT this is the
│  [Anchor row]  [Kenya row]         │  only card shown, with a reveal toggle below
│  [Word row]                        │  it; at/after 09:00 HKT all four render as
├────────────────────────────────────┤  shown here, stacked ≤899px, 4-across ≥900px
                                          (desktop card min-width tightened 260→200px
                                          in v1.15 so 4 cards fit one row, not 3+1)
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
3. **Cards (v1.9 — restored as actual cards, deliberately distinct from the Values tab):** `--surface` background, 20px radius, shadow `0 10px 28px var(--shadow)`, 18px/20px padding, 14px gap between stacked cards (`#cards { display:flex; flex-direction:column; gap:14px }`). v1.8 had briefly unified Today's cards with the Values tab's flat/hairline row style; live feedback reversed that specifically for Today ("I want to see actual cards ... easy to read ... to be mindful and to learn something new") — Today is meant to be read and learned from, Values stays a quieter reference list, so the two tabs are now intentionally different rather than identical. Render order is **Journal, Anchor, Kenya, Word** (Journal moved to lead the list in v1.16 — see item 4b for what happens to the other three before 09:00 HKT). Header row = mono category chip (ANCHOR / JOURNAL / KENYA / WORD, no emoji — plain mono text per the prototype). Body in Fraunces. Journal card (v1.12, replacing Shift) is just a chip + one open-ended prompt in `.card-body` — no separate from/to structure needed. Kenya card (added v1.15) is the same minimal shape as Anchor — chip, fact in `.card-body`, category as a small `.card-attr` line (e.g. `— Wildlife`) — plus a trip-countdown pill top-right of its chip row as of v1.17 (item 4c). Word card additionally shows the word itself as a headline (`.word-title`, Fraunces, 20px, italic and centered per v1.13 — live feedback that it "sitting on the left" undersold it as a headline) inside a `.word-title-row` (also centered, v1.13) alongside a pronunciation button (`.word-speak`, v1.11 — see item 4a below), between the chip and the meaning (§5.3.10). Footer = muted attribution.
4. **Staleness chip (mono, small):**
   - Staleness is computed against the **expected refresh boundary**, not the bare calendar date: `expectedDateHKT = now(HKT) >= 06:00 ? today(HKT) : yesterday(HKT)`. `daily.json`'s `dateHKT` matching `expectedDateHKT` → no chip. Off by one day (and ≤ 48h old) → amber chip `yesterday's cards`. (This fixes a v1.0 ambiguity that would otherwise show a false amber chip to every visitor between midnight and 06:00 HKT, every single day.)
   - `daily.json` unreachable, > 48h stale, or fetch fails → page computes all three cards locally via `lib.mjs` rotation → slate chip `offline rotation`. Since Word of the Day is deterministic (v1.10), this path picks the exact same word as the server would have for that date — unlike the retired Fresh card, there is no divergent "fallback" content.
   - **`.chip[hidden] { display: none; }` (v1.11, real bug fix):** `#staleness-chip` keeps `class="chip"` at all times, including while hidden; `.chip`'s own `display: table` (author-origin CSS) unconditionally overrode the browser's default `[hidden] { display: none }` (user-agent-origin CSS) — author styles always win over user-agent styles at equal specificity, regardless of selector order. The hidden chip was never actually disappearing; it sat empty but still consumed its padding/margin box in the default "fresh" case, every load. Fixed with an explicit override, matching the pattern `.panel[hidden] { display: none; }` already used correctly elsewhere in the same stylesheet.
4a. **Word pronunciation (v1.11):** a 44×44px `<button aria-label="Pronounce <word>">🔊</button>` next to the word title, calling `window.speechSynthesis.speak(new SpeechSynthesisUtterance(word))` with `utterance.lang` set from the entry's `lang` field (§5.1/§5.3.10) — a native browser API, not a dependency (same category as `fetch`/`ResizeObserver`, already used). Rendered only if `"speechSynthesis" in window` (progressive enhancement — never a dead control on an unsupported browser).
4b. **Pre-09:00 HKT focus mode (v1.16):** `lib.mjs`'s `isFocusWindowHKT(now)` (HKT hour < 9) gates `renderToday`'s output. Inside the window: only the Journal card renders, followed by a `.reveal-rest` disclosure button (`aria-expanded`/`aria-controls`, 44px tap target, mono pill styling matching the staleness chip/theme toggle) and a `#cards-more` wrapper (`hidden` by default) holding Anchor/Kenya/Word. Clicking the button toggles `#cards-more`'s `hidden` state and flips the button's text between "show the rest" / "hide the rest" — a real disclosure, not a one-way reveal, so focus never needs to move off the button. Outside the window: renders exactly as item 3 describes, no button, no wrapper. No new `localStorage` key and no live 09:00 boundary timer — like every other time-gated render in this app (cards, date line, staleness chip), the check runs once per load, and a fresh pre-09:00 load always starts collapsed by design (the daily nudge back to Journal is the point, not a one-time dismissal).
4c. **Kenya trip countdown (v1.17):** a small mono pill (`.kenya-countdown`, 10px IBM Plex Mono 500, `--ink` text on a `--edge` accent-tinted background, `999px` border-radius) sits top-right of the Kenya card's chip row, inside a new `.card-top` flex container (`justify-content: space-between`) that wraps the existing `.card-chip`. `lib.mjs`'s `daysUntilKenyaTrip(now)` diffs the fixed trip date (`2026-08-15`, HKT-anchored) against `hktDayNumber(now)` — the same epoch-day mechanism `pickIndex`/`hktDayNumber` already use, not raw millisecond subtraction, so it can't drift on an odd local-clock offset. Renders `N DAYS` (N > 1), `1 DAY`, or `TODAY` (N = 0); once the trip has passed (N < 0) the pill simply doesn't render — a negative countdown would read as a bug, not a feature, and the Kenya facts keep rotating normally either way. `aria-label` on the pill spells out the full sentence (e.g. "31 days until the Kenya trip") for screen readers, since the visible text alone (`31 DAYS`) doesn't say what it's counting down to. No layout change to the other three cards; `.card-chip` itself is unchanged, just now wrapped in a flex row.
5. **Values tab:** the 5 values as quiet rows — value name (Fraunces, ~17px), one-line essence (Fraunces italic, ~13.5px), one observable behaviour (muted, ~12px). **No numbering** — values are not a sequence. (Cut from 10 to 5 in v1.2 — ten read as a checklist; keep only what actually matters.)
6. **Motion:** the figure is the primary animated element. Card/value-row entrance (v1.9, more noticeable per live feedback: "a small animation when I open up the page ... opening up of the cards") = a 500ms fade/rise/scale-in, staggered per item (90ms between Today's cards, 60ms between Values rows) so they visibly cascade in one after another rather than popping in together; nothing on scroll; respects `prefers-reduced-motion` (animation suppressed, content appears instantly). Hover lift 2px desktop only.

### 4.6 The figure (signature element — `figure.js`, was the water drop in v1.1, "the brain" in v1.0)

v1.2–v1.7 used a small human figure moving through a yoga sun salutation; **v1.8 replaces it
with a small glowing bottle of light** after live feedback that the pose-based figure's
movement still didn't hold together as real yoga anatomy. A bottle sidesteps that problem
category entirely — there is no joint anatomy to get wrong — while keeping the same "exactly
one calm, alive thing on the page" role:

1. **Form:** a simple glass-bottle silhouette (narrow neck, rounded shoulders, straight sides,
   rounded base — one canvas path, stroked at low opacity in the current theme color) holding a
   soft light near its base. No pose system, no joints, no kinematics.
2. **Rendering:** plain 2D canvas — the bottle outline is a stroked path; the light is the same
   offscreen-sprite radial-gradient glow technique used since v1.1's drop (no per-frame
   `shadowBlur`), drawn once as an offscreen sprite and stamped at different sizes for the main
   glow and for the embers, clipped to the bottle's own outline so nothing draws outside the
   glass.
3. **Life — breathing, not posing:** the light brightens and dims on one continuous sine-wave
   cycle (**7 seconds**, "very slowly" per the request) — no held frames, no sudden jumps, just
   a smooth in-and-out like a slow breath. Two or three small embers drift upward inside the
   glass on a longer independent loop (9s), fading in near the base and out near the neck, for
   a touch of life beyond the single pulsing light.
4. **Performance:** `requestAnimationFrame`; the same offscreen radial-gradient sprite glow
   technique as before (never per-frame `shadowBlur`); `devicePixelRatio` capped at 2; cancel
   RAF on `visibilitychange` hidden (resume on visible, unless reduced motion); `ResizeObserver`-
   driven re-setup, debounced; the setup routine retries via `requestAnimationFrame` if the
   element has zero size at connect-time rather than silently giving up (unchanged since v1.2 —
   this was the actual fix for the original "not moving" report and still applies here).
5. **Reduced motion:** `prefers-reduced-motion: reduce` (checked via `matchMedia`, re-checked
   live on a `change` listener) → render one static frame at a calm mid-bright point in the
   breath cycle, no RAF loop.
6. **Themes:** the element takes `color`/`glow` as attributes, unchanged from v1.2–v1.7;
   `app.js` sets these to the current theme's `--pulse` value on init and again on every
   theme-toggle event, so the light is blue in `calm` and rose in `blossom`. No app.js changes
   were needed for the v1.8 swap.
7. **Budget:** `figure.js` ≤ 12 KB (the reference implementation is ~7.6 KB as of v1.8 — smaller
   than the pose-based v1.7 figure since there is no pose table to carry).
8. **Not part of the shipped file:** the original Claude Design prototype's `ios-frame.jsx` and
   `support.js` were prototyping scaffolding only for the water-drop era and were never shipped;
   `figure.js` is an original implementation, not ported from any external prototype.

### 4.7 Mobile experience & installability (PRIMARY platform — enforce, don't hope)

Design at **390×844** first; adapt upward. Desktop must look intentional, but every trade-off resolves in the phone's favour.

**Layout & ergonomics:**
1. Single column ≤ 899px; content max-width with comfortable side padding (≥ 20px).
2. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`; header and footer pad with `env(safe-area-inset-top/bottom/left/right)` so nothing sits under a notch or home indicator.
3. Page uses `height: 100vh; height: 100svh;` (vh fallback line first) as the layout basis for the no-scroll goal (§4.4/invariant 11) — the figure itself is a small fixed-size inline element (~56×64px as of v1.8, not viewport-relative).
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
  "journal": [ { "id": "journal-01", "prompt": "What's one thing you're avoiding right now, and what is it costing you to keep avoiding it?" } ],
  "kenya": [ { "id": "kenya-01", "category": "Geography", "fact": "Kenya straddles the equator, with the line crossing the country just south of Mount Kenya near the town of Nanyuki." } ],
  "wordOfDay": [ { "id": "word-01", "word": "Wabi-sabi", "origin": "Japanese", "lang": "ja-JP", "meaning": "..." } ]
}
```

### 5.2 Exact counts (verified by script)

| Pool | Category | Count |
|---|---|---|
| anchors | `stoic` (Marcus Aurelius, Seneca, Epictetus) | 55 |
| anchors | `buddhist` (Thich Nhat Hanh, Jon Kabat-Zinn, the Dalai Lama, Pema Chödrön) | 55 |
| anchors | `taoist` (Lao Tzu, Zhuangzi) | 25 |
| anchors | `impermanence` (Bill Perkins/Die With Zero, memento mori tradition — replaced `diewithzero` in v1.14) | 35 |
| anchors | `attention` (Cal Newport — replaced `focus` in v1.14) | 35 |
| anchors | `relationships` (Carnegie-style) | 30 |
| anchors | `growth` (Dweck, Kristin Neff, Brené Brown) | 30 |
| anchors | `money` (Morgan Housel — replaced `wealth` in v1.14) | 25 |
| anchors | `voices` (Jay Shetty, Barack Obama, Michelle Obama, Nelson Mandela, Desmond Tutu, Fred Rogers, Viktor Frankl, Naval Ravikant; see §5.3.9) | 40 |
| anchors | `grounding` (added v1.14 — universal sensory/body observations, no named attribution) | 35 |
| **anchors total** | | **365** |
| journal | — (replaced `shifts` in v1.12) | **40** |
| kenya | `Geography` (12) `Wildlife` (14) `History` (10) `Government` (8) `Culture` (8) `Economy` (4) `Sports` (4) — added v1.15 | **60** |
| wordOfDay | — (added v1.10, replacing freshReserve) | **30** |

A Claude Design prototype (see changelog) already produced 18 anchors (3 per category), 10
shifts, and 4 freshReserve cards (the v1.0–v1.9 predecessor of `wordOfDay`, retired in v1.10)
in the intended voice — use these as the seed/first batch of the anchors/shifts pools (keep
their ids/text/attribution as-is; they've already had one round of human review during that
design session) and author the remaining cards per category to reach the exact counts above,
matching voice and format exactly. That prototype's `values.json` content was 5 core values +
5 "reserve" values (10 total); **v1.2 ships the 5 core values only** — ten read as a checklist
rather than a short list of what actually matters (§5.3.6).

### 5.3 Writing rules (enforced)

1. ≤ 40 words per card body; one idea per card; concrete over abstract.
2. Original paraphrase only; zero quotation-mark glyphs per invariant 2 (ASCII apostrophes for contractions/possessives are fine); attribution `— after <thinker>` or `— core principle`.
3. Second person or imperative voice (`You control the response, not the event.`).
4. **Banned platitudes** (verify.mjs greps, case-insensitive; store the list split/obfuscated in `verify.mjs` so the harness doesn't fail its own repo-wide-adjacent sweep by containing the literal strings): `believe in yourself`, `hustle`, `crush it`, `unlock your potential`, `be your best self`, `good vibes`, `grind`, `10x`, `manifest`.
5. **Journal prompts (replaced Shift cards in v1.12):** `{ "id", "prompt" }`, `prompt` ≤ 25 words, one open-ended question per entry, second person, no yes/no questions — it should invite a few sentences of actual reflection, not a one-word answer. Concrete and specific beats abstract and general (`What's one thing you're avoiding right now, and what is it costing you to keep avoiding it?`, not `How are you feeling today?`).
6. Values (`values.json`, exactly 5): `{ "name", "essence" (≤ 14 words), "behaviour" (≤ 16 words, observable — something a camera could see) }`. Generic-safe: no personal references to the owner. (Cut from 10 to 5 in v1.2 per live human feedback — keep the strongest 5, cut the rest rather than let the list grow back; if curating later, replace one of the 5, don't add a 6th.)
7. **Attribution-confidence rule:** use a person-named attribution (`— after X`) only when you are confident the specific idea is centrally/traditionally X's (e.g. Epictetus/Seneca/Marcus Aurelius for Stoic control-of-response ideas, Bill Perkins for Die With Zero's core thesis, Dweck for growth-mindset framing, Carnegie for the specific relationship tactics from *How to Win Friends*, Housel for invisible-wealth/avoid-ruin framing, Newport for deep-work framing). Otherwise, demote to tradition-level attribution (`— Stoic tradition`, `— growth-mindset research`, `— core principle`) rather than guessing at a specific person. This is a quality/accuracy safeguard, independent of the (resolved) PII question — misattributing an idea to a real, named public figure is a credibility problem even though naming public figures itself is fine.
8. Write anchors in six batches (one per category, extending each category's 3 seed cards to its full count). After each batch, run the normal mechanical self-review (word caps, quote marks, banned phrases — rules 1–5), **and then** a second, independent review pass per §10 Stage 3's content-QA step, before moving to the next batch.
9. **`voices` category (added v1.3):** a 7th anchor category, 9 cards (3 each), for named living/recent public figures the owner's household specifically finds inspiring, so their thinking surfaces periodically via the same rotation — not a new subsystem, just more entries in the same `anchors` pool. Extra bar beyond rules 1–8 for this category specifically: (a) any figure who has held significant political office must be scoped strictly to personal-character themes (grief, resilience, self-belief, service) and must never reference their office, party, policies, or elections — attribution is tied to a specific, nonpartisan book/body of work (e.g. `— after X, from <book>`), not their public office; (b) rule 2's "no verbatim quotes" is enforced against the *spirit*, not just quote-mark glyphs — a paraphrase that lands close to the person's one most-famous, most-recognizable line is a violation even with zero quote marks and needs a rewrite, not just a rewording; (c) run the independent second-pass review (rule 8) with an explicit prompt to check attribution-confidence, political neutrality, and closeness-to-source — this category carries materially higher reputational risk per card than the historical-thinker categories.
10. **`wordOfDay` (replaced `freshReserve` in v1.10, 30 entries):** `{ "id", "word", "origin" (a language/tradition, e.g. "Japanese", "Stoic Greek" — never a person's name, since this pool has no attribution-confidence question the way anchors do), "lang" (added v1.11 — a BCP-47 tag, e.g. "ja-JP", "de-DE", mapped from `origin`, feeding the pronunciation button's `SpeechSynthesisUtterance.lang` per §4.5.4a so the word is spoken in a voice matched to its actual language), "meaning" (≤ 20 words, one sentence, no verbatim dictionary-style copying — write the sense of the word, not a lifted definition) }`. Fully self-authored (no external source to fetch or verify), so it rotates deterministically exactly like anchors/journal (§6.2) rather than needing the daily pipeline to do any network work for it.
11. **`kenya` (added v1.15, 60 entries):** `{ "id", "category" (one of `Geography`/`Wildlife`/`History`/`Government`/`Culture`/`Economy`/`Sports`, capitalized to match `wordOfDay`'s `origin` convention — rendered directly as the card's `.card-attr` line), "fact" (≤ 40 words, same cap as anchors, one self-contained factual sentence or two) }`. **Correctness is the load-bearing rule for this pool, not attribution confidence** — every specific numeric/date/superlative claim (elevations, dates, "largest"/"only"/"first" claims) must be independently verified against a real source before writing, not written from memory, and content must be chosen for durability: no named current officeholders, no fast-moving statistics or sports records, no unverified travel-blog folklore. Same mechanical rules apply otherwise (word cap, zero quotation-mark glyphs, no banned platitudes, unique ids). Rotates deterministically exactly like anchors/journal/wordOfDay (§6.2, salt `"kenya"`).

---

## §6 — Data & logic

### 6.1 `daily.json` schema

```json
{
  "version": 1,
  "dateHKT": "2026-07-14",
  "generatedAtISO": "2026-07-13T22:00:41Z",
  "anchorId": "wealth-007",
  "journalId": "journal-23",
  "kenyaId": "kenya-51",
  "wordId": "word-16"
}
```
All four ids are always present — unlike the retired `fresh` field (v1.0–v1.9), there is
nothing here that can come back `null` or need URL/source validation, since `wordId`/`kenyaId`
are deterministic picks from the app's own `wordOfDay`/`kenya` pools (§6.2), not values pulled
from any external source.

### 6.2 Deterministic rotation (in `lib.mjs`, shared browser + node)

- `hktDateString(d)` → `YYYY-MM-DD` via `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' })`.
- `hktDayNumber(d)` → `floor(Date.UTC(y, m-1, day) / 86400000)` from the HKT date parts.
- `hktDateParts(d)` → `{ weekday, day, month, year }` via `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', weekday:'long', day:'numeric', month:'long', year:'numeric' })`, for rendering the date line without duplicating formatting logic in `app.js`.
- `pickIndex(poolSize, dayNumber, salt)` → per-cycle Fisher–Yates permutation seeded with `xmur3(salt + ":" + floor(dayNumber/poolSize))` feeding `mulberry32`; return `order[dayNumber % poolSize]`. **Use the reference implementation in Appendix B verbatim.** Guarantees: no repeats *within* a full cycle (adjacent cycles are independent permutations, so a repeat can occur right at a cycle boundary — roughly a 1-in-poolSize chance — this is expected and not a bug). Fully stateless, identical results in node and browser. Note for future curation (put this in the README runbook, not enforced by code): replace cards 1-for-1; adding or removing cards changes the pool size and reshuffles the whole rotation, which may repeat a recently-seen card once.
- Salts: `"anchor"`, `"journal"`, `"kenya"`, `"word"`.

### 6.3 Client behaviour (`app.js`)

1. Fetch `data/daily.json` (+ `cards.json`, `values.json`) with `cache: "no-store"`.
2. Compare `daily.dateHKT` against the expected-refresh-boundary date (§4.5.4) → render as-is, or apply staleness rules.
3. Any fetch failure → full offline rotation from `cards.json`; if that also fails, show a calm inline error state: `Couldn't load today's cards. Refresh, or check back tomorrow.`
4. The staleness/offline-fallback selection logic must live as pure functions in `lib.mjs` (not inline in `app.js`'s DOM code), so Stage 3's `node:test` coverage can actually exercise it headlessly.

---

## §7 — Daily pipeline (`scripts/generate-daily.mjs`)

**v1.10 note:** through v1.9, this script fetched five external RSS/YouTube feeds for the
Fresh card, with a whole subsystem of liveness/identity verification (old §7.1), a mindset-
relevance denylist filter (old §7.2), and a `state/fresh-history.json` idempotency file. Live
feedback disliked the Fresh card; its replacement, Word of the Day, is a deterministic pick
from `cards.json`'s own `wordOfDay` pool (§5.3.10) — nothing to fetch, parse, verify, or filter,
since there's no external source that can be down, off-theme, or misidentified. All of that
machinery is retired along with it; the script now only stamps today's four picks (a Kenya pick,
`kenyaId`, was added in v1.15 alongside the original three):

1. Compute `dateHKT`, `dayNumber` via `lib.mjs`; pick `anchorId`, `journalId`, `kenyaId`, `wordId`
   (all four via the same deterministic `pickIndex` rotation, §6.2 — no fetch, no external
   dependency).
2. Write `data/daily.json` (§6.1).
3. Idempotent and safe to re-run any number of times same-day — the picks are a pure function
   of `dateHKT`, so a re-run just rewrites `generatedAtISO` and reproduces the same four ids.
   When run locally in this environment, invoke as `NODE_USE_ENV_PROXY=1 node
   scripts/generate-daily.mjs` (§2.4) — this flag is now a no-op for this script specifically
   (nothing it does needs network access) but is still correct/harmless to pass, and remains
   required for any other script here that does use `fetch`.

The daily Actions cron (LOOP-A, §9.3) and the watchdog's staleness check (LOOP-C) both still
run exactly as before — `generatedAtISO`/`dateHKT` remain a genuine, useful signal that the
automated pipeline is alive, independent of anything Word of the Day itself needs.

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
          git add data/daily.json
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
4. **Network patience cap:** nothing waits on the network > 30s per attempt; font fetch budget per §4.3 (the daily pipeline itself has had no network dependency since v1.10 — see §7).
5. **Stop-loss (a standing terminal condition, alongside — not instead of — §11's three named triggers):** the §9.1 cycle cap exhausted, OR an unrecoverable environment error → write `BLOCKED.md` (§11 format), commit it, and STOP the run cleanly. Never idle, never thrash, never loop hoping. (v1.0 read as if only §11's four triggers — a fourth, "Feed collapse," existed through v1.9 and is retired in v1.10 — could ever justify stopping — that was an internal contradiction; this rule is always live.)
6. **Deploy-wait bound:** poll the Pages URL with `curl -s -o /dev/null -w "%{http_code}" -m 15` every 20s, max 12 tries — but only after the Stage 0 (initial), Stage 2, and Stage 5 pushes, not after every single stage's push (v1.0's every-stage polling added up to a meaningful chunk of dead wall-clock time for no additional information most stages). Still not 200 at Stage 5 → note `deploy pending` in the audit; Stage 5 has the final say.
7. **Session resume (statelessness):** if the session is interrupted, on restart: read `audits/` + `git log` to find the last stage whose audit says PASS, re-run `verify.mjs` for that stage to confirm, and continue from the next stage. No stage is ever redone if its verification still passes.

### 9.3 Runtime loops (production — mapping to the "two /loops" requirement)

| Loop | Mechanism | Catches |
|---|---|---|
| **LOOP-A** daily refresh | Actions cron 05:56 HKT + `workflow_dispatch` | the core auto-run |
| **LOOP-B** stuck-build killer | `timeout-minutes: 10` + `concurrency.cancel-in-progress` | any hung/overlapping run — killed inside 10 min, never "stuck for hours" |
| **LOOP-C** dead-man's switch | watchdog 09:00 HKT → checks the *live* site, not just git → GitHub issue (deduped) + email | silent failures LOOP-B can't see (cron never fired, push failed, **or Pages didn't redeploy**) |
| **LOOP-D** graceful degrade | client staleness chip (boundary-aware) + offline deterministic rotation (anchor/journal/wordOfDay all alike) | everything else — the page NEVER shows an empty slot |

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
**Tasks:** `figure.js` — an original canvas implementation (not sourced from a design prototype; v1.1's `drop.js` was, `figure.js` is written directly against §4.6), registered as `<mindset-figure>`; wire `color`/`glow` attributes to the live theme's `--pulse` token on init and on theme-toggle. Build the setup routine to retry via `requestAnimationFrame` if the element has zero size at connect-time (§4.6.4) rather than silently giving up — this is the actual fix for the v1.1 "wasn't moving" report, not just a cosmetic redraw.
**DoD:** all §4.6 behaviours present · `figure.js` ≤ 12 KB · no `shadowBlur` inside the RAF-driven draw path · setup retries on zero-size rather than bailing.
**Verify:** `stage2` = `node --check figure.js` + greps: `requestAnimationFrame`, `visibilitychange`, `prefers-reduced-motion`, `devicePixelRatio` + absence of `shadowBlur` anywhere in the file (ban it file-wide — it's not meaningfully scopeable by grep to "just the animate function") + byte-size check. The pause/reduced-motion behaviour should be structured so its branch logic is unit-testable under `node:test` (e.g. a pure function computing which draw mode applies), since a curl-based agent cannot visually confirm canvas behaviour — mark "the light visibly breathes and feels calm, not busy" as **deferred to §13 human review**, not a Stage 2 machine gate; the audit should say so plainly rather than checking it off unverified.
**Commit:** `stage2: living figure, canvas animation`

### Stage 3 — Content library & card engine
**Objective:** real cards, real values, full offline resilience, genuine content QA.
**Tasks:** extend the Claude Design project's seed content (`mindset-data.js`'s 18 anchors / 10 shifts / 4 freshReserve, pulled via `DesignSync`; its 10 values were cut to the 5 core ones in v1.2, §5.3.6) to the full §5.2 counts, six batches (one per anchor category, building on each category's 3 existing seed cards). After each batch's mechanical self-review (rules 1–5), run an **independent second pass** targeting what a script can't catch: attribution confidence (§5.3.7), closeness-to-source (quotation-in-substance risk), near-duplication against cards written so far (a cheap token-overlap check is fine as a proxy). Emit `audits/CONTENT-REVIEW.md`: all cards grouped by attribution, with any flags from either review pass noted inline. Wire card rendering in `app.js` (data from `cards.json`/`values.json`, staleness logic + offline rotation + calm error state, all as pure functions in `lib.mjs` per §6.3.4 where the logic itself lives, called from `app.js`'s DOM code). (`freshReserve` was authored here originally; retired in favor of `wordOfDay` in v1.10, §5.3.10.)
**DoD:** counts exact · schema valid · zero quotation-mark glyphs in bodies (apostrophes in contractions fine) · no banned platitudes · unique ids · word caps respected · offline rotation proven · `CONTENT-REVIEW.md` written and skimmed-clean (no unresolved flags, or flags explicitly accepted with a one-line reason).
**Verify:** `stage3` = full JSON schema/count/word-cap/platitude/quote-mark validation (quote-mark sweep scoped to `cards.json`/`values.json` string fields, not the whole repo — see Appendix A) + a `node:test` that renders three simulated dates through the rotation (via `lib.mjs`'s pure functions) and asserts distinct, in-range picks + a simulated stale-`daily.json` test asserting the fallback path selects valid ids + a near-duplicate proxy check (normalized-token overlap) flagged, not necessarily hard-failed, so a human can judge borderline cases.
**Commit:** `stage3: card library, values, offline resilience, content review`

### Stage 4 — Pipeline & loops
**Objective:** the machine that runs without anyone.
**Tasks:** `generate-daily.mjs` (§7) — as of v1.10 a pure, deterministic stamp of `anchorId`/`journalId`/`kenyaId`/`wordId` with no network calls (§7's original v1.1-era task list here resolved + verified five RSS/YouTube feeds for the now-retired Fresh card; that entire concern no longer exists, see §7's v1.10 note) — write both workflows from §8 (cron slots, watchdog live-check + dedup), run the generator locally as `NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs` to produce a real `daily.json`, commit, push, then dispatch `daily-cards` via the GitHub MCP tools (no `gh` CLI) and poll run status (bounded: 20s × 15) until success; **after the workflow's bot commit lands, `git pull --rebase origin main` before any further local commit** (this is a guaranteed non-fast-forward otherwise); dispatch `watchdog` once against the real deployed `daily.json` and confirm it passes, then run the exact stale-detection test prescribed in §8.2 (temporary branch, not an ad-hoc dry-run flag) and confirm it fails correctly with one new (then closed) issue.
**DoD:** real `daily.json` committed by the *workflow* (not only locally); both workflows have at least one green dispatch run against real content; watchdog's stale-detection path proven via the prescribed temporary-branch mechanism (this run is expected-red, and does not count against the "green dispatch" DoD line above); local clone rebased cleanly onto the workflow's commit.
**Verify:** `stage4` = YAML sanity greps (cron strings, `timeout-minutes`, permissions) + `daily.json` schema check (`anchorId`/`journalId`/`kenyaId`/`wordId` all present) + dispatch/poll results via the GitHub MCP tools (no `gh run list` dependency).
**Commit:** `stage4: daily pipeline, watchdog, loops live`

### Stage 5 — QA, polish, acceptance
**Objective:** launch-grade.
**Tasks:** favicon.svg (a minimal abstract mark — the specific motif can lag the current signature element; a single-drop mark from v1.1 is an acceptable placeholder until refreshed, not worth blocking on), icon pipeline per §4.7.10 (Linux rasterizer first), `manifest.webmanifest` + `sw.js` (Appendix C.2 **as amended** — the `res.ok` fix) + registration + theme-color sync, OG title/description meta, README (what/why/ops runbook: add cards, edit values, edit the wordOfDay pool, manual dispatch, what the chips mean, how to Add to Home Screen on iOS/Android, platform caveats §8, the rotation's 1-for-1 replacement note from §6.2), byte-budget check, run `verify.mjs all`, confirm Pages 200 for `index.html`, `data/daily.json`, `manifest.webmanifest` AND `sw.js`, write `audits/FINAL-AUDIT.md` (including the §2 invariant-12 `verify.mjs` diff-vs-Stage-0 summary, and an honest "known imperfections" section — e.g. the blossom cold-launch splash-color mismatch from §4.7.8, any font/icon exit ramps taken), tag `v1.0`.
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

## §11 — Escalation protocol (the three named triggers — plus the standing §9.2 stop-loss)

1. **Auth/permission failure** — cannot push, GitHub access unavailable/unauthorized, Pages enablement genuinely impossible after retries.
2. **Repo mismatch** — remote is not the `Mindset` repo, or the working directory is not its root.
3. **Out-of-scope need** — anything requiring credentials, money, new scopes, or touching anything outside this repo.

(A fourth trigger, "Feed collapse" — zero of the five RSS/YouTube sources for the Fresh card
verifiable — applied through v1.9. Retired in v1.10 along with the Fresh card itself: Word of
the Day is self-authored and deterministic, §7, so there is no longer any external source that
can collapse.)

These three are the only *substantive-decision* reasons to stop and ask. Separately, §9.2 rule 5's
stop-loss (cycle cap exhausted, or an unrecoverable environment error) is a standing, always-live
reason to stop cleanly and write `BLOCKED.md` — it is not one of "the three," but it is never
overridden by "decide, log, proceed" either. If both a §9.2 stop-loss and ambiguity about which
of these three (if any) applies come up at once, write `BLOCKED.md` with your best read of which
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
- [ ] The bottle's light visibly breathes (brightens/dims slowly) in both themes; pauses when hidden; static under reduced motion; feels calm, not busy
- [ ] Offline rotation demonstrated live on a phone (airplane mode)

## §13 — Human review checklist (the ONE human step, ~20 min, after completion)

1. Open the Pages URL **on your phone**. Does the bottle's light clearly, slowly breathe, feeling alive and calm, not busy? Rotate the phone, scroll — nothing clipped, nothing under the notch or home bar, no sideways scroll, the whole thing should fit one screen.
2. Safari: Share → **Add to Home Screen**. Reopen from the icon — it should launch full-screen like an app, with a proper icon and the chrome matching the theme.
3. Toggle blossom mode. Would its intended user smile? (Standalone chrome should turn blossom too — except the cold-launch splash screen, which is a known, logged limitation.)
4. **Airplane mode**, reopen from the icon: the shell loads instantly and the `offline rotation` chip appears with valid cards. Turn network back on, pull to refresh — today returns.
5. Open the **Values** tab and skim all 5 — confirm it reads as the same visual style as Today's cards. Toggle OS **Reduce Motion** and confirm the figure renders a static frame.
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
`to`, `essence`, `behaviour`, `name`, `word`, `origin`, `meaning`) plus any user-facing copy
strings in `app.js`, **not** the whole repo (JS/JSON/YAML syntax legitimately contains `"`), and
exclude `scripts/`, `CLAUDE.md`, `audits/`, `data/daily.json`, and this file itself; the PII check is an email-address-
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
