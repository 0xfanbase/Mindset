# Content Review — cards.json / values.json

Every card below was authored per BUILD-PLAN.md §5, then passed through an independent
fresh-context QA review (a separate reviewer, not the author, checking specifically for
attribution confidence, quotation-in-substance risk, and near-duplication — the three things
a mechanical script cannot catch). 74 of 170 cards had at least
one issue caught and fixed during that review; each is noted inline below. Everything else
passed unchanged.

Human: skim this before the v1.0 tag (§13.7) — delete or reword anything you would not sign,
especially anything whose attribution feels like a guess rather than a known idea.

**v1.3 addendum:** 9 more anchors were added (the `voices` category, §5.3.9) after live feedback
asked for content inspired by Jay Shetty, Joe Biden, and Michelle Obama. Same independent-review
process, with an extra bar given two of the three are former holders of political office — see
the dedicated section below, inserted after the `core principle` group.

**v1.7 addendum:** a Fable-led holistic audit (requested alongside the same round's animation
rebuild) re-read a real content sample against a subtler bar than the mechanical checks below can
catch: whether a card's payoff is a state of being (what this app is for) or an output dressed in
calm vocabulary (a KPI in disguise). Five items were reworded as a result — `focus-001`,
`rel-001`, `wealth-001`, `wealth-008`, and `shift-002` — each flagged inline below at its entry;
full before/after reasoning is in `audits/decisions.md`'s "v1.7 (part 3 of 3)" entry. Every other
card was left as previously reviewed; a full re-audit of all 129 anchors against this subtler bar
was not performed, only the items Fable named or that directly matched its named pattern.

**v1.10 addendum:** the Fresh reserve pool (`freshReserve`, 10 evergreen fallback cards) is
retired along with the Fresh card itself; see the new "Word of the Day" section below (30
entries, `wordOfDay`) for its replacement. The `anchors`/`shifts` sections below and their
review notes are unaffected by this change.

**v1.14 addendum:** the entire `anchors` pool (129 entries) was replaced with a new 365-entry
pool per live feedback asking to rewrite tactical/instructional entries toward observation and
being, with calm/mindfulness/grounding as the throughline, expanded to cover a full year. The old
pool is kept below as a historical record; the current, shipping pool is in the "Anchors v1.14"
section further down. Same author-then-independent-QA process as every other round, scaled up:
12 parallel research-and-author passes, then 4 independent fresh-context QA passes checking
attribution confidence, verbatim-quote-in-spirit risk, voice compliance, and (for `voices`)
political neutrality — 68 of 365 entries had at least one issue caught and fixed, each flagged
inline in that section. Full narrative in `audits/decisions.md`'s "v1.14" entry.

## Anchors v1.0–v1.13 (retired in v1.14, replaced by the 365-entry pool below)

Kept in full below as the historical record of this pool's authoring/QA work through v1.13 (real
editorial decisions — duplicate cognitive moves caught and reworded, attribution-confidence
downgrades, political-neutrality fixes for the `voices` category). The entire `anchors` array was
replaced (not incrementally edited) in v1.14 per live feedback asking to rewrite tactical entries
toward observation/being and expand the pool to 365 — see the new "Anchors v1.14" section after
this one for the current, shipping content.

## Anchors, grouped by attribution

### — after Bill Perkins

- **dwz-001** (diewithzero): Memories pay a dividend every time you replay them. Book the experience while the body can still collect.
- **dwz-002** (diewithzero): Some things can only be done this decade. Put them first; the rest will wait either way.
- **dwz-003** (diewithzero): Money left unspent at the end is time you worked for nothing. Convert it to life, on purpose.
- **dwz-004** (diewithzero): Health, time, and money rarely peak together. Whichever one is abundant right now, spend it before the other two catch up.
  - ⚑ No change needed. Within word cap, no quotation-mark glyphs, no banned phrases, second-person imperative present, and the health/wealth/time tradeoff-curve attribution to Perkins is well-founded (it is the book's central chart).
- **dwz-005** (diewithzero): Zero at the end is the goal: run out of money the same day you run out of life, not sooner, not with leftovers.
  - ⚑ No change needed. Paraphrases the 'die with zero' target thesis without lifting any specific famous sentence, no quotation marks, no banned phrases, correctly attributed to Perkins as his title thesis.
- **dwz-006** (diewithzero): Fund the wedding or the first apartment now, when the money changes a life — not decades later as a will.
  - ⚑ No change needed after resolving the duplicate with dwz-014; still a valid, concrete, correctly attributed card about giving to heirs at an impactful moment rather than through a will.
- **dwz-007** (diewithzero): Don't mistake this for reckless spending. Spend on purpose, backed by a plan, not a guess.
  - ⚑ No change needed. Functions as Perkins' own caveat defending his thesis against the 'this is reckless' objection, so the named attribution is appropriate; clean on word count, quotes, and banned phrases.
- **dwz-008** (diewithzero): Excess caution has a cost too: each year you postpone spending for safety is a year your body has less capacity to enjoy it. Weigh that cost, not just the risk.
  - ⚑ Duplicate cognitive move: original text ("a year of experience you paid for and never used") used the exact same 'earned-but-unused = waste' framing as seed dwz-003 ("time you worked for nothing") and also collided with dwz-018. Rewrote to a distinct mechanism: caution's cost is paid in declining body-capacity-years, not in 'wasted purchase' terms. Attribution (after Bill Perkins) kept — the cost-of-excess-caution thesis is centrally his.
- **dwz-009** (diewithzero): Give to the cause while you can still watch what your money does. A will lets you skip the best part.
  - ⚑ No change needed. Distinct from dwz-006/dwz-014 (charity + the giver's own experience of the impact, rather than heir-timing); giving to charity while alive is explicitly part of Perkins' 'give to heirs/charity while alive' thesis, so attribution is fine.
- **dwz-010** (diewithzero): Buy insurance against outliving your money, then stop stockpiling against every other imagined disaster.
  - ⚑ No change needed. Concrete, distinct (specific insurance-product recommendation), correctly attributed — longevity annuities as a hedge Perkins explicitly discusses.
- **dwz-011** (diewithzero): Before you take the next contract, ask what it buys you in life, not just in savings. Some income stops paying you back.
  - ⚑ No change needed. Distinct axis (diminishing returns of continued paid work, not savings or caution); clean mechanically.
- **dwz-012** (diewithzero): Backpacking through hostels fits your twenties; a cruise fits your seventies. Match the plan to the decade instead of running one version of fun for fifty years.
  - ⚑ Duplicate cognitive move: original ("experience at twenty returns memories for sixty more years... wait until seventy and it only pays out for ten") was just a numeric restatement of seed dwz-001's memory-dividend logic (front-load experience for a longer replay window). Rewrote to cover the separate 'time buckets by life stage' thesis instead (matching activity type/intensity to decade), which was underrepresented in the set.
- **dwz-013** (diewithzero): A dollar at eighty cannot buy what it could at forty. Its value depends on the body you have left to spend it with.
  - ⚑ No change needed. Distinct from dwz-004 and the revised dwz-008 (an observational fact about money's utility curve vs. a prescriptive multi-resource strategy vs. a caution-specific critique); matches the book's well-known utility-vs-age chart.
- **dwz-014** (diewithzero): Net worth for most people keeps climbing until death, peaking decades after it could have changed anything. Let yours peak while you can still use it.
  - ⚑ Duplicate cognitive move: original ("inheritance lands when kids are already retired") made the same point as dwz-006 (give to heirs before/around a life-defining moment rather than via a late inheritance). Rewrote to cover the distinct 'net worth peaks too late in life' thesis (the empirical shape of the lifetime net-worth curve) instead, which was not yet represented on its own.
- **dwz-016** (diewithzero): The old script front-loads work and back-loads rest. Spread your rest across the whole timeline instead of saving it all for the end.
  - ⚑ No change needed. Distinct from the revised dwz-012 (this one is about redistributing rest/leisure across the working years, not about sequencing adventure-type trips by decade); matches Perkins' critique of the traditional work-then-retire script.
- **dwz-018** (diewithzero): Vacation days reset every January whether you used them or not; the years your body can still enjoy that trip do not reset. Spend the days now.
  - ⚑ Duplicate cognitive move: original ("experiences you already earned and let expire... take the time off") reused the same 'earned-but-unused = waste' template as seed dwz-003 and (pre-fix) dwz-008. Rewrote to a distinct angle: vacation days are renewable, bodily capacity to use them is not, so the urgency comes from the asymmetry rather than from 'wasted earnings.'
- **dwz-020** (diewithzero): Past a certain point, more savings stops buying more life and starts just inflating a number. Notice when you cross that line.
  - ⚑ No change needed. Distinct from dwz-019 (marginal-utility-of-savings framing vs. auditing an automatic-contribution habit) and from the revised dwz-014 (a threshold/marginal-utility insight vs. the shape of the net-worth-over-time curve); clean mechanically and centrally Perkins' argument.

### — after Cal Newport

- **focus-001** (focus): Depth is rare, so depth is valuable. Protect three uninterrupted hours the way you protect sleep -- non-negotiable, not optional.
  - ⚑ v1.7 Fable audit: original ("guard...the way you guard revenue") reframed depth as a revenue-protection tactic — payoff-is-an-output framing, not payoff-is-a-state-of-being. Reworded to anchor the comparison to something restorative. See `audits/decisions.md`.
- **focus-004** (focus): Switching tasks does not end the last one. A residue of attention lingers, dragging down whatever you turn to next.
  - ⚑ No change. Attention-residue topic is explicitly authorized for the Cal Newport attribution per instructions; word count, voice, and phrasing all check out.
- **focus-005** (focus): Answer email and admin in set blocks, not all day long. Batched, shallow work stops leaking into the hours meant for depth.
  - ⚑ No change. Shallow-work batching is a core, explicitly-authorized Newport topic; passes all mechanical checks.
- **focus-006** (focus): Deep focus is not a personality trait. Train it deliberately, in stages, the way you would train a muscle.
  - ⚑ No change. Deep-work-as-a-trainable-skill is central to Deep Work's thesis, so the Newport attribution holds; no quote-glyphs, banned phrases, or word-cap issues.
- **focus-007** (focus): Pick one place, one time, one cue for entering deep work. A fixed ritual removes the daily decision to start.
  - ⚑ No change. The fixed-ritual-to-start-deep-work concept is a specific, well-known Deep Work discipline; distinct from focus-010's end-of-day shutdown ritual (bookend, not duplicate).
- **focus-008** (focus): Let small idle moments stay empty. Reaching for your phone every time you're bored trains your mind to need constant input.
  - ⚑ No change (kept as the anchor card; focus-016 was revised instead to remove the overlap). Boredom-tolerance/embracing-boredom is a specific, well-known Deep Work chapter, so the Newport attribution is confidently correct.
- **focus-009** (focus): Do not adopt a tool because everyone else has it. Adopt it only if its gain to your work clearly beats its cost to your attention.
  - ⚑ No change. The craftsman-approach-to-tool-selection idea is specifically Newport's framework in Deep Work; passes all mechanical checks.
- **focus-010** (focus): Close the workday on purpose. Note what's done and what's next, then let the rest go until tomorrow.
  - ⚑ No change. The shutdown ritual is a specific, well-known named practice from Deep Work; distinct from focus-007's starting ritual.

### — after Carol Dweck

- **growth-001** (growth): Not yet is a location, not a verdict. Keep walking.
- **growth-002** (growth): Praise the method you used, not the talent you were handed. Method repeats.
- **growth-003** (growth): A setback is data about the approach, never a measurement of the person.
- **growth-012** (growth): Don't stop at effort alone. Pair it with a change in strategy. That is what finally moves the number.
- **growth-013** (growth): Don't praise the score alone. Kids praised only for being smart are more likely to hide a bad one.

### — after Dale Carnegie

- **rel-001** (relationships): Ask about their work before mentioning yours. Genuine curiosity about someone else is rare enough that people remember who offered it.
  - ⚑ v1.7 Fable audit: original ("interest given first returns multiplied") framed curiosity as an investment with a return — relationships-as-ROI framing. Reworded to state the human payoff directly instead of a multiplier. See `audits/decisions.md`.
- **rel-002** (relationships): Remember the small thing they told you last time. It says: you exist to me.
- **rel-003** (relationships): Hand your best idea away and help them build it. Ownership persuades where argument cannot.
- **rel-004** (relationships): Turn a correction into a question: what do you think happened here? People fix what they discover themselves faster than what they are told.
  - ⚑ No change. Distinct move (turn correction into a self-discovery question) from rel-007 and rel-013, which handle mistakes via different mechanisms. Word count 24, imperative/second-person voice, no quote glyphs, no banned phrases, attribution to Carnegie is confident (his 'ask questions instead of giving direct orders' chapter).
- **rel-005** (relationships): Skip the generic compliment. Name the specific thing they did well, and they will remember it for years.
  - ⚑ No change. Distinct from rel-011 (future reputation) and rel-014 (timing of praise on improvement) — this one is about specificity of praise for a completed act. 18 words, clean, attribution confident (honest/sincere appreciation chapter).
- **rel-006** (relationships): Before you ask for anything, work out why they would want to give it. Their reason moves them, not yours.
  - ⚑ No change needed to this card itself (rel-012 was the one rewritten to remove the duplication). Attribution confident — this is Carnegie's 'arouse an eager want' principle.
- **rel-007** (relationships): Name your own mistake before you point to theirs. It turns a correction into a conversation between equals.
  - ⚑ No change. Distinct from rel-004 and rel-013. Attribution confident (literal Carnegie chapter: talk about your own mistakes before criticizing).
- **rel-008** (relationships): Winning the argument loses the person. Let the point go and keep the relationship.
  - ⚑ No change. Checked wording against Carnegie's famous 'you can't win an argument' passage — this is a original paraphrase, not close enough to read as a quotation. Attribution confident.
- **rel-009** (relationships): Open a disagreement by naming the part you already agree on. Common ground first, the difference second.
  - ⚑ No change. Distinct from rel-008 and rel-010 (different phase of a disagreement: opening vs. conceding). Attribution confident (Carnegie's 'get the other person saying yes immediately' / common-ground approach).
- **rel-010** (relationships): When someone concedes, leave them a graceful exit. A cornered person defends; a person with room out changes their mind.
  - ⚑ No change. Distinct move (letting the other person save face on exit) from rel-009 (opening a disagreement). Attribution confident (literal chapter: let the other person save face).
- **rel-011** (relationships): Tell someone the good reputation you already think they have. Most people work hard not to disappoint it.
  - ⚑ No change. Distinct from rel-003 (idea ownership) and rel-005 (specific praise). Attribution confident (literal chapter: give a fine reputation to live up to).
- **rel-012** (relationships): Smile before you say a word, even over the phone. Warmth offered first sets the tone for everything that follows.
  - ⚑ Duplicate cognitive move: as originally written ("Explain a request in terms of what they gain, not what you need. Self-interest listens harder than your deadline.") this was the same move as rel-006 (frame your ask around the other person's want/self-interest, not your own need) — essentially a rewording of the same card. Rewrote it to a distinct, equally well-known Carnegie tactic (lead with warmth/a smile before you ask for anything, including on the phone), keeping the Dale Carnegie attribution since 'Smile' is a genuine, centrally-his chapter, not a generic borrow.
- **rel-013** (relationships): Tell them the mistake is easy to fix, not evidence of who they are. People keep trying when the gap looks closeable.
  - ⚑ No change. Distinct from rel-004 and rel-007. Attribution confident (literal chapter: make the fault seem easy to correct).
- **rel-014** (relationships): Praise the improvement the moment you see it, not just the finished result. Progress noticed early keeps going.
  - ⚑ No change. Distinct from rel-005 (praises in-progress improvement rather than a specific finished act). Attribution confident (literal chapter: praise every improvement).
- **rel-015** (relationships): Frame a hard task as a challenge worth meeting, not an obligation. People rise faster toward a contest than a chore.
  - ⚑ No change. Distinct move from all other cards. Attribution confident (literal chapter: throw down a challenge). All 12 cards also re-checked as a backstop: none exceed 40 words, none contain quotation-mark glyphs (no apostrophes present at all in this batch), and none contain any banned phrase.

### — after Epictetus

- **stoic-001** (stoic): You control the response, not the event. Practice at the small scale today: the delay, the tone, the traffic. The arena is everywhere.
- **stoic-004** (stoic): Set the goal only you can deliver: full effort, honest attempt, clean conscience. Let the sale, the score, the verdict fall where it falls — that part was never yours to promise.
- **stoic-005** (stoic): Let a quiet thought surface while you laugh with your child or embrace someone you love: this will not last forever. Use it to stay present, not to darken the moment with dread.
  - ⚑ Paraphrase tracked Epictetus's specific Enchiridion 3 passage too closely (kissing one's child + naming them mortal, in the same order and near-identical framing). Reworded with different verbs/imagery (laughing with a child, embracing a loved one; 'this will not last forever' instead of the word mortal placed identically) so it reads as an original paraphrase rather than a lightly-disguised quotation. The underlying idea remains centrally and confidently Epictetus's, so attribution is unchanged.
- **stoic-010** (stoic): What stung you was never the remark itself — it was the verdict you silently attached to it. Find that sentence before you react, and question it first.
- **stoic-014** (stoic): Progress will make you look strange to people who haven't changed. Let them think you slow or naive — chasing their approval is the slowest path there is.
  - ⚑ The phrase 'let them think you slow or foolish' echoed Epictetus's Enchiridion 13 line 'be content to be thought foolish and stupid' on the load-bearing word 'foolish' placed in the same slot. Swapped to 'naive' so the sentence is a paraphrase rather than a near-verbatim echo. Attribution unchanged — the idea (progress makes you look strange to unchanged onlookers; ignore their judgment) is centrally his.
- **stoic-015** (stoic): The job, the house, even the people you love — you were never the owner, only the temporary keeper. When one is taken back, mourn if you must, but don't call it robbery.
- **stoic-016** (stoic): Reserve dread for the one thing worth fearing: acting against your own values. Weather, traffic, other people's moods — waste no aversion on things that were never yours to steer.
- **stoic-019** (stoic): Philosophy is not a lecture to admire, it is a clinic you walk into wounded. Stop collecting quotes and start applying one, today, to the actual problem in front of you.

### — after Marcus Aurelius

- **stoic-003** (stoic): The obstacle is not blocking the work. Today, it is the work.
- **stoic-006** (stoic): Before you leave the house, expect the meddler, the ingrate, the rude driver. You already know your part: patience, not surprise. Meet them like a trainer, not a victim.
- **stoic-008** (stoic): Everything you are holding onto — this mood, this problem, this version of your life — is already dissolving into something else. Stop bracing against change; it is the one constant you can rely on.
  - ⚑ Duplicate cognitive move: original text ('Meet the one that arrived... as material built for you to use well') was just a reworded restatement of seed stoic-003's obstacle-is-the-way move (reframe the hindrance itself as the task). Rewrote to a distinct, still-genuine Marcus Aurelius theme — the constant flux/impermanence of circumstances, moods, and problems — so it no longer overlaps with the seed. Attribution unchanged (Marcus Aurelius) and still warranted for the new content.
- **stoic-009** (stoic): Picture this ordinary Tuesday as possibly your last. The pointless argument drops off the list immediately; so does the errand you were dreading. What remains is what actually mattered.
- **stoic-011** (stoic): Zoom out until today's crisis is a dot on a much longer timeline — the argument, the deadline, the setback. Most of what wrecks your afternoon shrinks from orbit.
- **stoic-012** (stoic): You are one strand in a shared weave, not a thread cut loose. Treat your next choice as something that ripples into other lives, because it always does.
- **stoic-023** (stoic): A hand does not pause mid-task waiting for the foot to thank it. Do the right thing and move on — needing applause for it is a separate, needier want.
- **stoic-024** (stoic): You are never asked to handle your whole life at once, only this hour. Set the rest down and finish what is directly in front of you.
  - ⚑ Duplicate cognitive move: original ('Grip intentions firmly and outcomes loosely') was functionally the same move as stoic-004 (define success by controllable effort, let the uncontrollable outcome go) just with different concrete nouns. Rewrote to a distinct idea — confine your sense of responsibility to the present hour rather than your whole life — and corrected the attribution from Epictetus to Marcus Aurelius, the traditional source for this present-moment-confinement teaching (the original reserve-clause framing was more looosely Epictetan/Chrysippan and risked being a guess).

### — after Morgan Housel

- **wealth-001** (wealth): Getting wealthy rewards risk. Staying wealthy rewards caution. Know which game today calls for.
  - ⚑ v1.7 Fable audit: "paranoia" is a clinical/anxious word for what Housel's own framing calls caution. Reworded "paranoia" → "caution"; attribution unchanged, thesis is centrally Housel's. See `audits/decisions.md`.
- **wealth-002** (wealth): Real wealth is the upgrade not bought and the hours not owed. Invisible, by design.
- **wealth-004** (wealth): Give compounding decades to work with, not headlines to chase. The wealth that looks sudden was two quiet decades in the making.
- **wealth-005** (wealth): Plan for a range of outcomes, not one forecast. Room for error is what lets you survive being wrong.
- **wealth-007** (wealth): Decide what enough looks like before the market decides it for you. Without a number, more always wins.
- **wealth-008** (wealth): What you choose not to spend says more about your priorities than what you earn ever will.
  - ⚑ v1.7 Fable audit: original ("outbuilds") framed savings rate as a numerical outbuilding contest — payoff-is-an-output framing. Reworded to a values-revealing frame instead of a competition frame. Attribution unchanged. See `audits/decisions.md`.
- **wealth-010** (wealth): Buying things to prove you have arrived quietly taxes the wealth that arriving was supposed to build.
- **wealth-012** (wealth): Give luck and risk their due. Every fortune and every collapse had a silent partner you did not choose.
- **wealth-013** (wealth): The money moves that look reckless to you make perfect sense to someone whose worst financial memory differs from yours.
- **wealth-015** (wealth): Do not expect long-term returns without stomach-churning drops along the way. The drops are the cost of earning them, not evidence something is broken.
  - ⚑ Rewrote text: original phrasing ('Treat volatility as the entry fee for long-term returns, not a penalty. Pay it without flinching and stay in.') echoed Morgan Housel's specific, widely-circulated formulation ('volatility is a fee, not a fine' / his 'Price of Admission' framing) closely enough to read as a quotation in substance even without quote marks. Reworded to express the same idea (volatility is an expected, necessary cost of long-term returns) in clearly different language. Attribution kept as after Morgan Housel since the general thesis is confidently and centrally his; no duplicate-move or word-cap/banned-phrase/quote-glyph issues found.
- **wealth-017** (wealth): Choose the money habit you can actually keep when you are stressed and tired, not the one that is optimal on paper.
- **wealth-018** (wealth): A handful of decisions will account for nearly all your results. Expect most days to feel uneventful in between.

### — after Nassim Taleb

- **wealth-006** (wealth): Weigh advice by what the advisor loses if it turns out wrong. Risk-free counsel is often worthless counsel.
- **wealth-011** (wealth): Put most of your money where surprises cannot hurt you, and only a small slice where a surprise could pay off huge.
- **wealth-016** (wealth): Make sure no single job, client, or investment can sink your entire financial life. One bad break should cost you an inconvenience, not everything.
  - ⚑ Rewrote text: original ('Build a financial life that can gain from shocks, not merely survive them. Seek upside exposure, not just protection.') made the same cognitive move as wealth-011 (structure finances so limited downside pairs with large asymmetric upside / barbell logic) -- effectively a restatement, not a distinct idea. Rewrote around a different, equally core Taleb idea -- avoiding a single point of failure / building redundancy so no one job, client, or investment can cause ruin -- which is squarely 'avoiding ruin' territory per the attribution guidance and no longer overlaps with wealth-011's barbell-allocation card or wealth-014's bet-sizing card. Attribution kept as after Nassim Taleb.

### — after Seneca

- **stoic-002** (stoic): Rehearse loss in the morning — the meeting gone wrong, the plan undone — and nothing at noon can ambush you.
- **stoic-013** (stoic): Anger punishes the angry first — racing pulse, ruined focus, words you cannot recall. Delay the reply until the heat passes; the target rarely feels it as fast as you do.
- **stoic-017** (stoic): Each night before sleep, audit the day like a ledger: where you acted well, where you slipped, what still needs fixing. Small honest accounting beats vague guilt.
- **stoic-018** (stoic): You guard your wallet closely and let strangers spend your afternoons for free. Time is the one asset you cannot earn back — budget it like it is scarce, because it is.
- **stoic-020** (stoic): You don't find out what you're made of during comfort. Difficulty is the diagnostic — welcome it as data on your character, not as an insult from the universe.
- **stoic-021** (stoic): Count how often the disaster you dreaded never actually arrived. Most of your suffering happens in rehearsal, in a scene that never gets performed.
- **stoic-022** (stoic): Once a month, choose the harder option on purpose — the cold shower, the plain meal, the walk instead of the ride. Comfort you chose voluntarily cannot later be used against you as a threat.
  - ⚑ Near-quotation risk: 'Do this next task as if it were the final one you get to do' paraphrased Marcus Aurelius's specific, very famous line 'Do every act of your life as though it were the very last act of your life' closely enough to read as quoting it. It also duplicated stoic-009's already-used memento-mori-for-the-day move. Rewrote as Seneca's distinct, well-documented voluntary-hardship practice (deliberately choosing minor discomfort to inoculate against fear of loss) and corrected the attribution from Marcus Aurelius to Seneca, to whom this practice is centrally traceable.

### — growth-mindset research

- **growth-004** (growth): Ability is a starting point, not a ceiling. Where you begin says nothing about where you can end up.
- **growth-005** (growth): Don't mistake your effort for a confession of low talent. It is the mechanism that builds talent.
- **growth-006** (growth): Stop picking the easy task just to look smart. It trades away the exact challenge you need to grow.
- **growth-007** (growth): What you believe about your ability quietly decides how hard you are willing to try.
- **growth-008** (growth): Don't mistake a flat stretch of no visible progress for proof your climb is over.
- **growth-009** (growth): Don't write off someone else's skill as fixed. Assume it can still move, the same way yours can.
- **growth-011** (growth): You can hold a growth mindset at work and a fixed one at home. Check both separately.
- **growth-014** (growth): Do not let being called gifted once convince you the skill is finished. It still needs reps.
- **growth-016** (growth): The mindset of the people around you rubs off during practice. Choose partners who treat mistakes as useful, not embarrassing.
  - ⚑ Duplicate cognitive move with growth-005: both reframed uncomfortable/unglamorous effort as literally the mechanism that builds skill/talent (near-paraphrase of each other). Rewrote growth-016 to a distinct idea -- the mindset of the people you practice with (training partners/environment) rubs off on you. Attribution left at growth-mindset research (already generic, no named person).
- **growth-017** (growth): Ask how you can improve, not how well you did. One question keeps working for you.
  - ⚑ Attribution was -- after Carol Dweck, but the specific practical framing (ask "how can I improve" instead of "how well did I do") is a generic coaching application of her learning-goals-vs-performance-goals research rather than one of her specific, confidently documented, headline findings (unlike the process-praise studies or the not-yet grading concept). Demoted to -- growth-mindset research. Card text unchanged; still complies with word cap, voice, and banned-phrase rules.
- **growth-019** (growth): Don't read your confusion mid-lesson as a warning sign. It is what learning feels like in progress.
- **growth-020** (growth): Ask for the feedback that stings a little. It points straight at your next skill to build.

### — Stoic tradition

- **stoic-007** (stoic): Wealth, praise, and health are nice to have and easy to lose. Character is the one thing no one can repossess. Bank your effort there, not in what can be taken.
- **stoic-025** (stoic): You are not measured against the sage you will never fully become. Measure today against yesterday only — a little steadier, a little less reactive, that is the whole race.

### — core principle

- **dwz-015** (diewithzero): You are working against two deadlines: the day you die, and the earlier day your body stops cooperating. Plan for the second one.
  - ⚑ No change needed. Appropriately kept at 'core principle' (the two-deadlines framing is a general mortality observation, not uniquely Perkins'); clean mechanically.
- **dwz-017** (diewithzero): The fear of running out often outlives the actual risk of it. Don't let that fear ration a life you can actually afford.
  - ⚑ No change needed. Appropriately kept at 'core principle' (fear-outliving-risk is a general behavioral-finance observation, not a specific Perkins claim); distinct from dwz-010's concrete insurance recommendation.
- **dwz-019** (diewithzero): Automatic saving doesn't know when to stop. Revisit why the contribution is still rising after the reason for it is gone.
  - ⚑ Attribution-confidence fix: downgraded from "after Bill Perkins" to "core principle." The specific mechanism described (automatic/auto-escalating contribution rates persisting past their original purpose) is more centrally associated with general behavioral-economics/default-bias research than with a well-known, specific Perkins argument; not confident enough to keep a named attribution on a living author. Text unchanged (already within word cap, no quotation marks, no banned phrases).
- **growth-010** (growth): Set your goal on the very next step, not the final result. The step is fully within your control today.
  - ⚑ Duplicate cognitive move with growth-006: both were built around "stop trying to look smart/capable and choose real challenge/learning instead" (easy task vs. look smart; understand material vs. look capable in the room). Rewrote growth-010 to a distinct idea -- set goals on the controllable next step rather than the uncontrollable final result. Also demoted attribution from growth-mindset research to core principle since process-vs-outcome goal framing is general, not a specific Dweck finding.
- **growth-015** (growth): Practice the specific move that embarrasses you. Avoiding it only guarantees the gap stays exactly that wide.
- **growth-018** (growth): Keep a record of what you could not do six months ago. That list is the only scoreboard that matters.
  - ⚑ Original text ("Measure today against your own yesterday. Someone else's highlight reel was never the right ruler.") read as a substantive paraphrase of two specific famous lines -- Jordan Peterson's "Compare yourself to who you were yesterday, not to who someone else is today" and the widely-quoted "don't compare your behind-the-scenes to someone else's highlight reel" (Steven Furtick). Rewrote to a concrete record-keeping instruction ("Keep a record of what you could not do six months ago...") that preserves the underlying self-referenced-progress idea without mirroring either famous sentence. Attribution unchanged (core principle).
- **wealth-003** (wealth): Avoid ruin first. Any bet that can take you to zero is mispriced at every payout.
- **wealth-009** (wealth): Keep an emergency fund not for the interest it earns but so you are never forced to sell at the worst possible moment.
- **wealth-014** (wealth): Look for bets where the worst case is a bruise and the best case changes your decade. Size accordingly.
- **wealth-019** (wealth): Curb your impatience; it is the most expensive habit in investing. It sells low, buys high, and calls it bad luck.
- **wealth-020** (wealth): Compounding rewards staying invested far more than it rewards being right about timing. Outlast the downturn; do not try to outsmart it.
  - ⚑ Rewrote first sentence and changed attribution from after Morgan Housel to core principle: 'The single requirement for compounding to work is that you never interrupt it' tracks Charlie Munger's well-known line ('The first rule of compounding: never interrupt it unnecessarily') closely enough to read as quoting it -- and that specific idea is Munger's (merely cited inside Housel's book), not centrally Morgan Housel's own thesis, so attributing it to Housel violated the attribution-confidence rule and misattributed a specific claim to a living person who didn't originate it. Reworded the first sentence in clearly different language (staying invested beats being right about timing) and downgraded attribution to core principle since 'time in the market over timing the market' is general market wisdom, not centrally either author's documented idea. Kept the original, unproblematic second sentence ('Outlast the downturn; do not try to outsmart it.').
- **focus-002** (focus): Saying yes to one thing means saying no to many others. Make those nos explicit, not silent.
  - ⚑ Too close to Steve Jobs' famous line 'It means saying no to the hundred other good ideas that there are' — the reuse of the specific number 'a hundred' alongside 'yes/no' made it a substantive paraphrase of that quote despite no attribution to Jobs. Rewrote in clearly different words (dropped 'hundred', restructured the sentence) while keeping the same idea and the core-principle attribution.
- **focus-003** (focus): Track how much energy a task costs, not just how long it takes. One rested hour outworks a tired afternoon.
  - ⚑ Opening clause 'Manage energy, not minutes' was a near-verbatim paraphrase of Tony Schwartz/Jim Loehr's well-known title 'Manage Your Energy, Not Your Time' — quotation in substance even though no author was named. Reworded to 'Track how much energy a task costs, not just how long it takes' to convey the same idea in clearly different words. Attribution (core principle) was already correct and unchanged.
- **focus-011** (focus): Rest is not the absence of productivity. It is what rebuilds the capacity your focus just spent.
  - ⚑ No change. General rest/recovery reframe, correctly kept at core-principle level (not Newport-specific); distinct enough from focus-003's energy-management instruction (reframing what rest is, vs. an allocation strategy).
- **focus-012** (focus): Protect the first hour of your day before anyone else's request reaches you. What you choose first sets the whole day's frame.
  - ⚑ No change. Protecting the first hour from external requests is a distinct mechanism from other prioritization cards (013, 018, 002); no quote-closeness or word-cap issues.
- **focus-013** (focus): Three priorities done well beat ten done adequately. Narrow the list before you start the day, not while you're in it.
  - ⚑ No change. General prioritization idea, appropriately unattributed to any person; distinct mechanism (narrowing count of priorities) from other focus/priority cards.
- **focus-014** (focus): Save your hardest task for your sharpest hour, whenever that falls, instead of whatever slot happens to be open.
  - ⚑ No change. Distinct from focus-012 (energy-matched task sequencing vs. protecting the day's first hour) and not a close paraphrase of 'eat the frog' since it explicitly decouples the hardest task from 'first thing in the morning'.
- **focus-015** (focus): Make silence the default and interruption the exception. Turn off notifications and let people wait for your attention, not command it.
  - ⚑ No change. Notification/interruption management is distinct from focus-020's open-tabs/apps mechanism; passes all mechanical checks.
- **focus-016** (focus): Take a short walk outside when your focus fades. Movement and changing scenery rebuild attention that sitting still cannot.
  - ⚑ Made the same cognitive move as focus-008 (both hinged on 'resisting phone/scrolling during idle or break moments protects attention'). Rewrote to isolate a distinct mechanism — restorative walking/movement and scenery change (attention-restoration angle) — removing the phone-scrolling contrast so it no longer duplicates focus-008's boredom-tolerance/training angle.
- **focus-017** (focus): Give one task your full attention at a time; it finishes faster than juggling three ever will.
  - ⚑ No change. Monotasking-speed claim is distinct from focus-006 (skill-training over time) and focus-004 (residue-dragging-down-next-task); no issues found.
- **focus-018** (focus): Urgent is not the same as important. Pause before you let a ping decide what deserves your attention next.
  - ⚑ No change. 'Urgent is not the same as important' is a widely-used generic idiom (Eisenhower-principle territory) but reworded enough, and carries no named attribution, so it doesn't read as quoting a specific sentence.
- **focus-019** (focus): Protect your sleep like you protect your calendar. It is the foundation tomorrow's focus is built on, not a tax on it.
  - ⚑ No change. Sleep-protection card is unique in the set; no quote-closeness, banned-phrase, or word-cap issues.
- **focus-020** (focus): Close every tab and app you are not using right now. An open one keeps a hook in your attention even when idle.
  - ⚑ No change. Open-tabs/apps-as-attention-hook mechanism is distinct enough from focus-004's task-switching-residue mechanism (background presence of unused, idle apps vs. residue from an active task switch).

### New in v1.3 — `voices` category (§5.3.9)

Extra review bar for this category: Joe Biden and Michelle Obama are former holders of
significant political office, so every card was checked for political neutrality (no reference
to office, party, policy, or elections — strictly personal-character/resilience/grief/self-belief
territory) in addition to the standard attribution-confidence and closeness-to-source checks.

- **voices-001** (voices): Ask what you want, not what looks impressive to people you will forget by next year. Write the answer down before you check anyone else's opinion. — after Jay Shetty, from Think Like a Monk
  - ⚑ No change. Validation-vs-values framing is a genuine, recurring Shetty theme; not close to a specific verbatim line.
- **voices-002** (voices): Treat your attention like a muscle, not a mood. Ten quiet minutes before the phone touches your hand trains it the same way a rep trains a shoulder. — after Jay Shetty, from Think Like a Monk
  - ⚑ No change. Attention-as-trainable-skill is a central, recurring theme of his work.
- **voices-003** (voices): When your own thoughts loop without end, redirect them toward one specific person you can help today. Service interrupts rumination faster than self-analysis does. — after Jay Shetty, from Think Like a Monk
  - ⚑ No change. Service (seva) as an antidote to rumination is arguably his most authentic, monastery-rooted idea; strong attribution fit.
- **voices-004** (voices): Grief does not resolve on a schedule. Get up anyway, on the day you do not feel ready — the getting up is the discipline, not proof that you are healed. — after Joe Biden, from Promise Me, Dad
  - ⚑ No change. Stays a paraphrase of the broader grief-and-perseverance theme rather than his one widely-quoted specific line; respectful, strictly non-political.
- **voices-005** (voices): Turn one hard hour into something someone else can use — a call, a story, your time. You will know you are further along when helping stops feeling like performance. — after Joe Biden, from Promise Me, Dad
  - ⚑ No change. Turning pain into helping others is a well-documented, frequently repeated theme of his; non-political, tasteful.
- **voices-006** (voices): Go back to the same desk, the same calls, the same ordinary Tuesday, days after the worst week of your life. Do it again the next day. That return is what resilience actually looks like. — after Joe Biden, from Promise Me, Dad
  - ⚑ Independent review flagged the original draft as a generic resilience platitude with a name attached, not something distinctly traceable to him, and too third-person/declarative for the second-person/imperative house voice. Rewritten to ground it in his documented, fast return to an ordinary work routine after tragedy, in imperative voice.
- **voices-007** (voices): Describe the part where you struggled and adjusted, not just the outcome. People trust an account with friction in it far more than a polished highlight reel. — after Michelle Obama, from Becoming
  - ⚑ Reworded from an earlier draft that sat too close to the Obama Foundation/Becoming tagline "Your story is your power." This version keeps the underlying idea (authenticity over a curated image, a genuinely central Becoming theme) in clearly distinct wording.
- **voices-008** (voices): Prepare harder than the room expects, then walk in anyway when your right to be there is questioned. Competence answers doubt better than arguing with it does. — after Michelle Obama, from Becoming
  - ⚑ No change. Reflects a well-documented, central Becoming theme (being doubted in rooms she'd earned a place in); stays generic ("the room") rather than naming any office, so it clears the political-neutrality bar.
- **voices-009** (voices): Answer the message from someone one step behind you, the way an older student once helped you find your footing. That kind of mentoring rarely gets credited, but it compounds for years. — after Michelle Obama, from Becoming
  - ⚑ Reworded from an earlier draft that brushed against Reach Higher (an actual White House initiative). This version grounds the idea in personal mentorship from her own memoir rather than any policy program.

## Anchors v1.14 (365 entries, full replacement)

The entire `anchors` pool (previously 129 entries across `stoic`/`diewithzero`/`growth`/
`relationships`/`wealth`/`focus`/`voices`) was replaced, not incrementally edited, per live
feedback asking to rewrite tactical/instructional entries toward observation-and-being and expand
the pool to 365 (one per day of the year). Full methodology, taxonomy rationale, and QA findings
narrative are in `audits/decisions.md`'s "v1.14" entry — this section is the per-card record.

**Process:** 12 parallel research-and-author passes (one per category, splitting stoic and
buddhist into two each for quality control), each required to research its named figures' actual
documented work before writing and to write every entry as an observation of something already
happening in the reader's mind/body/day rather than an instruction. All 365 drafts passed
mechanical validation cleanly (word caps, zero quote glyphs, zero banned platitudes, zero exact
duplicates) on the first pass. Four independent, fresh-context QA passes then fact-checked
attribution confidence, verbatim-quote-in-spirit risk, voice compliance, and (for `voices`)
strict political neutrality for the office-holders — finding 68 genuine issues, each fixed in a
dedicated pass and flagged with ⚑ below. Everything else passed unflagged.

### Stoic (Marcus Aurelius, Seneca, Epictetus) — 55 entries

- **stoic-001**: The departure board flips your flight to a later hour, and something in you argues with the screen as if outrage were a lever. The hour is fixed. What happens in you next is not. — after Marcus Aurelius
- **stoic-002**: There is a reply already typed, sharper than it needs to be, sitting one thumb-tap from sent. The longer it sits there unsent, the more the not-sending starts to feel like its own small relief. — after Marcus Aurelius
  - ⚑ voice fix — original ending invited testing how long the reader COULD hold off (technique), reworded to end on the not-sending itself as already-felt relief.
- **stoic-003**: The urge to check the phone arrives before any reason for checking it does. Watch it rise and pass like weather, one more sensation the ruling part of you was never obligated to obey. — after Marcus Aurelius
- **stoic-004**: A birthday photo surfaces on the screen, a version of you that did not know what was coming. It still doesn't. Today is the same kind of day: entirely unknown, entirely worth using well. — after Marcus Aurelius
- **stoic-005**: The meeting you prepared for gets canceled an hour before it starts. The preparation was not wasted; it becomes whatever the freed hour needs it to become. Very little effort disappears, it only changes shape. — after Marcus Aurelius
- **stoic-006**: From the plane window the whole city looks like a circuit board, its arguments and traffic jams too small to see. Nothing about the argument you are still having down there has changed size. — after Marcus Aurelius
- **stoic-007**: Someone cuts you off without a glance, and the anger arrives fast, like it always does. He is not out to wrong you; he is only rushing toward something, same as you were a minute ago. — after Marcus Aurelius
- **stoic-008**: A friend announces a promotion and something in you quietly recalculates your own worth against it. Their timeline was never the ruler you are measured with. It only feels that way for a moment. — Stoic tradition
  - ⚑ attribution downgrade — idea wasn't confidently traceable to a specific Marcus Aurelius passage; downgraded to Stoic tradition.
- **stoic-009**: You trip on the curb in front of strangers and your face goes hot immediately. Not one of them will remember it by dinner. The only lasting injury here is the one you keep rehearsing. — after Marcus Aurelius
- **stoic-010**: A stranger leaves a harsh comment under something you made, and it lands harder than ten kind ones combined. Their sentence describes their afternoon. It was never a report on your worth. — after Marcus Aurelius
- **stoic-011**: You hold the door for the stranger behind you, four seconds, nothing else lost. The whole day runs on hinges this small, one person doing their small part so the larger thing keeps turning. — after Marcus Aurelius
- **stoic-012**: The alarm goes off and the blanket makes its case for five more minutes, as if there will obviously be a tomorrow to spend them in. Nothing about today was ever actually guaranteed like that. — after Marcus Aurelius
  - ⚑ quote-risk fix — original mirrored Marcus Aurelius's famous Meditations 5.1 wake-up passage too closely; rewritten around a different angle.
- **stoic-013**: The message sits marked read with no answer for hours, and the mind spins a story about the silence. Most people who forget to reply are simply busy being the main character of their own day. — after Marcus Aurelius
- **stoic-014**: The doctor pauses a beat too long before speaking, and the whole day tilts for a second. Whatever the news turns out to be, it was already true of a body never meant to last forever. — after Marcus Aurelius
- **stoic-015**: A plaque on the old building names a donor nobody in line for coffee can place anymore. Whatever you are building a reputation toward will reach that same quiet forgetting, likely sooner than you assume. — after Marcus Aurelius
- **stoic-016**: It's tempting to blame the late train for the mood that followed it home. The train only made you wait. Something else, much closer to home, decided that waiting deserved this much irritation. — after Marcus Aurelius
- **stoic-017**: A misunderstanding starts forming a few messages into the group chat, everyone slightly off about what you meant. The urge to jump in and clarify sits there, unacted on, restless but not yet obeyed. — after Marcus Aurelius
  - ⚑ voice fix — original ending gave direct permission-giving advice (you are not required to.../silence is also an option); reworded to observe the urge to clarify sitting unacted-on.
- **stoic-018**: A stranger waves you into the merging lane for no reason but that it was easy for them. Notice how the whole morning tilts, slightly, toward the fact that people are built to help each other. — after Marcus Aurelius
- **stoic-019**: The news scrolls past wars and elections and a stadium of strangers arguing about all of it. Seen from far enough away, this is the same small drama the species has staged on repeat for ages. — after Marcus Aurelius
- **stoic-020**: The knees complain on the same hike that used to feel easy, and it is tempting to argue with the calendar. Bodies age on schedule, like fruit, like seasons. Arguing with the schedule has never changed it. — Stoic tradition
- **stoic-021**: The hard conversation scheduled for three o'clock has already happened four different ways in your head by breakfast. None of those versions is the one that will actually occur at three. — Stoic tradition
- **stoic-022**: What people will say about you after you leave the room was decided the moment they formed their own opinions, long before you spoke. Only the sentence you actually said belongs to you. — after Marcus Aurelius
- **stoic-023**: A colleague cuts corners on the shared project, and it is tempting to catalog every shortcut for later conversation. Only your own half of the work is in your hands right now. The cataloging can wait. — after Marcus Aurelius
- **stoic-024**: The to-do list stretches toward evening, each item feeling urgent in its own small way. Almost none of what felt urgent on last month's list is even remembered now, let alone still waiting. — after Marcus Aurelius
- **stoic-025**: A headache sits behind the eyes all through the afternoon meeting, dull and unhelpful. The part of you doing the actual deciding, the part running the meeting, was never located in that ache. — after Marcus Aurelius
- **stoic-026**: The meeting derails into a problem nobody planned for, and the agenda quietly becomes irrelevant. The derailment isn't blocking the work — for the next few minutes, it simply is the work. — after Marcus Aurelius
  - ⚑ quote-risk fix — replaces an entry that directly re-derived Marcus Aurelius's specific no-man-loses-any-life-but-this line.
- **stoic-027**: Rain starts exactly when the picnic blanket gets spread on the grass. There was never a version of today where the weather asked your permission first. The afternoon still has to be lived, just a different one. — Stoic tradition
- **stoic-028**: The pay raise lands and for about a week everything feels solved. Then Tuesday is ordinary again, same as before the number changed. The number was never the thing doing the solving. — Stoic tradition
- **stoic-029**: At the funeral, the years get listed out loud, the decades, the dates, until the number stops sounding abstract. It is the same calendar you are still living inside. — after Marcus Aurelius
- **stoic-030**: Filling out the same tedious form for the third department this month feels like busywork until you notice it is one small gear turning so that other people, whole rooms of them, get paid on time. — after Marcus Aurelius
- **stoic-031**: The calendar filled itself again — a meeting, a message, someone else's deadline — and underneath the fullness sits a quiet question about whose day this actually was. — after Seneca
- **stoic-032**: Looking back over a whole decade, only a handful of afternoons actually stand out as lived rather than simply passed through. The rest apparently happened to someone who wasn't quite paying attention. — after Seneca
- **stoic-033**: Some part of you already suspects this ordinary dinner, this unremarkable Tuesday, could be the last of its kind. The thought is uncomfortable, and for a moment it sharpens the whole room. — after Seneca
- **stoic-034**: After a night on a hard floor and a plain meal, the ordinary bed and the ordinary bread become almost startling. The comfort was there all along — you had just stopped noticing it as a gift. — after Seneca
- **stoic-035**: Wealth, looked at plainly, is only the gap between what you have and what you still want. Most days the want quietly grows to match whatever arrives, closing nothing. — after Seneca
- **stoic-036**: Six tabs open, three of them urgent an hour ago and forgotten now. Money spent this carelessly would be missed by lunchtime; the hour never was. — after Seneca
  - ⚑ quote-risk fix — payoff reworked away from Seneca's famous everywhere-is-nowhere line (Letter 2).
- **stoic-037**: Something shifts the day a promotion lands: a new watchfulness over rank, over rivals, over whether it might slip away. Getting the thing multiplied what there now was to lose. — after Seneca
- **stoic-038**: A stranger asking to borrow money would be refused without a second thought. The same stranger asking to borrow an hour is rarely refused at all, though the hour was worth more. — after Seneca
- **stoic-039**: Real living keeps getting scheduled for after the busy season, after the move, after this year settles down. The settling never quite arrives, and neither, somehow, does the living. — after Seneca
- **stoic-040**: A sharp reply fires off before the anger even finishes cresting, sent on heat alone. By the next hour, none of that certainty will still be standing. — after Seneca
  - ⚑ quote-risk fix — replaces an entry restating Seneca's famous it-takes-a-lifetime-to-learn-to-live line.
- **stoic-041**: Yesterday's argument keeps replaying, and tomorrow's is already being rehearsed, while today quietly passes in between, mostly unattended by either one. — after Seneca
- **stoic-042**: The stubbed toe actually hurts for a few real seconds. The string of curses that follows is a second impression, stacked on top and entirely optional, in a way the first one never was. — after Epictetus
  - ⚑ duplicate-pair fix — replaces the Epictetus half of a pair (both entries made the identical the-event-is-fixed-only-your-response-isnt point); rewritten around impressions vs. judgments instead of a flight-delay scenario.
- **stoic-043**: Reading the message twice doesn't change the verdict already reached: cold, dismissive, unkind. That judgment arrived faster than the words themselves, which were only ever a few lines on a screen. — after Epictetus
- **stoic-044**: A slow line, a dropped call, the neighbor's radio through the wall — small, forgettable annoyances, and, without any ceremony, exactly the size of the practice ground. — after Epictetus
- **stoic-045**: Wanting one particular person to think well of you tonight comes with a hidden cost: a small piece of freedom changes hands, and you are the one who hands it over. — after Epictetus
- **stoic-046**: Your schedule can be rearranged by someone else's decision, your name misquoted, your plans undone by weather. None of that was ever fully yours to begin with — only the response was. — after Epictetus
- **stoic-047**: There's a particular strain that comes from wanting today to go exactly as planned. It rarely announces itself as a wish — it just feels, quietly, like a fact being violated. — after Epictetus
- **stoic-048**: Standing in a colleague's newly renovated kitchen, a small dissatisfaction with your own arrives out of nowhere. It was not there an hour ago, and it is not really about the kitchen. — after Epictetus
- **stoic-049**: An hour ago someone else made the decision, and it cannot be unmade from here. Some part of you is still arguing the case anyway, to an empty room. — after Epictetus
- **stoic-050**: Losing a friendly game, cracking a phone screen, misplacing the keys again — each is a small, low-cost rehearsal for how the bigger losses will eventually be met. — after Epictetus
  - ⚑ quote-risk fix — swapped chipping a favorite mug for cracking a phone screen; Epictetus's own Enchiridion 3 example is literally a favorite cup breaking.
- **stoic-051**: Someone close doesn't do what you expected, and irritation shows up as if their choices had been issued to you to manage. They never were, no matter how close they stand. — after Epictetus
- **stoic-052**: The apartment is empty on moving day, stripped down to bare walls and echo. One thing still rides along fully intact: the part of you that decides how to meet whatever room comes next. — Stoic tradition
  - ⚑ quality fix — grounded a previously abstract lifetime-summary claim in one concrete scene.
- **stoic-053**: Traffic gets called unbearable, the wait called endless, the delay called ruinous — when the actual cost was eleven minutes. Somewhere the vocabulary outran the event. — Stoic tradition
- **stoic-054**: Good news arrives in disguise sometimes — a raise, a compliment, a clean bill of health, each one closer to neutral cargo than it first appears. What makes it good or bad is only how it gets carried. — Stoic tradition
- **stoic-055**: Disappointment can be felt fully for a moment without being allowed to drive the rest of the evening. The first is honest. The second borrows more than it needs. — Stoic tradition

### Buddhist (Thich Nhat Hanh, Jon Kabat-Zinn, the Dalai Lama, Pema Chödrön) — 55 entries

- **buddhist-001**: There is a breath happening right now, whether or not it is noticed — the ribs widening slightly, then settling, already finished before it was seen. — after Thich Nhat Hanh
- **buddhist-002**: Already three steps ahead, the mind is drafting the next email while the hands are still typing this one. An actual afternoon is quietly passing in between. — after Thich Nhat Hanh
- **buddhist-003**: A hard feeling moves through the chest like weather — building, cresting, passing — whether it is fought or not. This one is already changing shape. — after Jon Kabat-Zinn
- **buddhist-004**: Underneath the thought that this should be going better, there is just a room, a task, an ordinary Tuesday. The judgment arrived first and got mistaken for the facts. — after Jon Kabat-Zinn
- **buddhist-005**: Something in the feet already knows the floor before the mind finishes thinking about where it is going. A dozen steps to the kitchen, each one actually arriving. — after Thich Nhat Hanh
- **buddhist-006**: The retort arrives instantly, already worn smooth from a hundred earlier arguments, before this particular moment even asked for it. That groove was laid down long before today, running now mostly on its own. — after Thich Nhat Hanh
  - ⚑ quote-risk fix — one of two Thich Nhat Hanh entries both restating his signature interbeing/cloud-in-the-paper parable; rewritten around habit energy instead.
- **buddhist-007**: The jaw has been clenched since the second paragraph of that message, rehearsing an argument that has not happened yet. The teeth noticed before the mind did. — after Jon Kabat-Zinn
- **buddhist-008**: An ache in the lower back has not changed in the last hour, but something in how it is being held just did. That shift is its own small event. — after Jon Kabat-Zinn
- **buddhist-009**: Anger has already arrived and taken a seat before any decision was made about it. The breath is still available underneath it, doing its usual quiet work. — after Thich Nhat Hanh
- **buddhist-010**: Every version of this exact worry has already ended once before, quietly, without ceremony. This one is likely further along than it feels right now. — Buddhist teaching
- **buddhist-011**: Already swiping before the mind agreed to open the app, the thumb moves on its own. Whatever was true a second ago is still true now, underneath the scrolling. — after Thich Nhat Hanh
- **buddhist-012**: An effort is quietly working in this shoulder to look relaxed rather than actually being relaxed. The difference is small but entirely felt. — after Jon Kabat-Zinn
- **buddhist-013**: This exact cup of coffee, cooling by the second, is the only one actually here. The next one, already imagined, is not real yet. — after Thich Nhat Hanh
- **buddhist-014**: A small flicker of dislike showed up before the meeting even started, coloring everything that followed it. It arrived on its own, uninvited, and got treated like a fact. — after Jon Kabat-Zinn
- **buddhist-015**: Warm water in the shower feels sharper than usual after a hard week, as if the difficulty made room for it. One did not arrive without the other. — after Thich Nhat Hanh
- **buddhist-016**: Somewhere between the eyes and the base of the skull, the day has been quietly storing itself since morning. It only becomes obvious once attention actually lands there. — after Jon Kabat-Zinn
- **buddhist-017**: The stride shortens and quickens walking toward a hard conversation, the feet already arguing the case the mouth has not opened yet. A few steps later, they slow down on their own. — after Thich Nhat Hanh
- **buddhist-018**: Legs have been asking to move for the last few minutes, a small static underneath the stillness. It is just a sensation asking to be felt, not obeyed. — after Jon Kabat-Zinn
- **buddhist-019**: Something in the face has softened slightly at the thought of an old friend, without being asked to. The body arrived there before any decision was made. — after Thich Nhat Hanh
- **buddhist-020**: A phone notification chimes in the middle of a sentence, and for one instant before the hand reaches for it, the sound is just a sound, nothing yet decided about it. Then it becomes an errand again. — after Thich Nhat Hanh
  - ⚑ quote-risk fix — the other of the two interbeing-parable duplicates; rewritten around the mindfulness-bell theme instead.
- **buddhist-021**: The traffic is not moving, and no amount of checking the phone is going to change that. Underneath the frustration, the car is simply stopped, the way it already is. — after Jon Kabat-Zinn
- **buddhist-022**: This body sitting here is not quite the same one that woke up this morning, cell by cell, breath by breath. Something has already changed since this sentence started. — Buddhist teaching
- **buddhist-023**: This chair, this particular light, this unremarkable afternoon — none of it is a rehearsal for some realer moment still to come. It has been the actual moment the whole time. — after Thich Nhat Hanh
  - ⚑ quote-risk fix — reworded away from home/arriving language that directly echoed Thich Nhat Hanh's I-have-arrived-I-am-home gatha.
- **buddhist-024**: A doorknob gets turned a thousand times without ever really being seen. This time, for half a second, the hand notices metal, warmth, an actual shape. — after Jon Kabat-Zinn
- **buddhist-025**: Thirst has been signaling quietly from somewhere in the body for the last hour, underneath three back-to-back meetings. It is still there, patient, waiting to be trusted before the glass gets filled. — after Jon Kabat-Zinn
- **buddhist-026**: Hands have been gripping the steering wheel harder than the road actually requires for the last several minutes. Somewhere past the last red light, they loosened, slightly, on their own. — after Jon Kabat-Zinn
- **buddhist-027**: A particular way of tilting the head while listening showed up just now, inherited from somewhere further back than memory can reach. It arrived unasked, carrying someone else's face. — after Thich Nhat Hanh
- **buddhist-028**: The phone buzzes once, and for a half second before checking it, the room reappears exactly as it already was. That half second was the whole point. — after Thich Nhat Hanh
- **buddhist-029**: Hands sit in warm water washing the same three dishes as always, mind already three rooms ahead, until the warmth itself pulls it back into the sink. — after Thich Nhat Hanh
- **buddhist-030**: A reply is already forming halfway through what the other person is saying, quietly drowning out the second half of their sentence. Nothing has actually been heard past that point yet. — after Thich Nhat Hanh
- **buddhist-031**: In the half-second right after someone wounds you, before anger fully forms, there is a flicker of recognition that they are suffering too. — after the Dalai Lama
- **buddhist-032**: Something in you feels warmly toward a stranger's grief today but flinches from your own, as if kindness were a language spoken fluently everywhere except at home. — after the Dalai Lama
- **buddhist-033**: Right after a sharp word lands, there is a brief pause where you can feel yourself deciding whether to tend the hurt or let it curdle into a grudge. The pause itself is the practice. — after the Dalai Lama
- **buddhist-034**: Underneath the ease of an ordinary morning sits a quiet debt to a hundred people you will never meet: the driver, the farmer, the stranger who fixed the road you drove on. — after the Dalai Lama
- **buddhist-035**: Anger shows up hot in the chest before any thought does, and underneath it, a moment later, a quieter question surfaces about what it's actually trying to protect. — after the Dalai Lama
- **buddhist-036**: A strange twin lives underneath the tightness in your stomach when a rival succeeds: a thin, stubborn thread tying your own wellbeing to theirs, whether you like it or not. — after the Dalai Lama
- **buddhist-037**: Warmth for your own child arrives without effort; the same warmth for a stranger's child takes a quiet, deliberate stretch, and that stretch is apparently trainable. — after the Dalai Lama
- **buddhist-038**: A private conviction that no one else carries a weight like yours can dissolve in a single second on the train, watching a stranger's face hold something just as heavy, just as unseen. — after the Dalai Lama
- **buddhist-039**: Sitting with a friend crying about a breakup, there are two different kinds of calm available: one that quietly wants the crying to wrap up, and one that can just stay in the room with it. — after the Dalai Lama
  - ⚑ quality fix — grounded a previously abstract claim (the calm that lets you stay vs. the calm that avoids) in one concrete scene.
- **buddhist-040**: The instant something uncomfortable rises in the chest, a hand is already reaching for the phone — that reach is the running. The feeling itself was never the actual problem. — after Pema Chödrön
- **buddhist-041**: A plan falls through and the ground genuinely feels like it's moving. Somewhere under the falling, though, there's an odd, small steadiness that doesn't require anything to be fixed first. — after Pema Chödrön
- **buddhist-042**: A flinch arrives right before opening a message you suspect is bad news — and underneath the flinch, the feeling itself is already survivable, before a single word is read. — after Pema Chödrön
- **buddhist-043**: Before you've let yourself feel the discomfort of just sitting beside a friend's pain, unfixed, for one uncomfortable minute, the urge to hand over advice usually arrives first. — after Pema Chödrön
- **buddhist-044**: Somewhere behind the ribs, a hook catches right before the old argument starts again — and for half a second, right there, another way through is still open. — after Pema Chödrön
- **buddhist-045**: A quiet hope keeps insisting that handling this feeling correctly will finally make it stop coming back. Underneath the hope sits a stranger possibility: it was never asking to be handled, only felt. — after Pema Chödrön
- **buddhist-046**: Sitting with someone in pain, a strange impulse shows up: to breathe their hurt in rather than push it away, as if it might be lighter shared than left alone. — after Pema Chödrön
- **buddhist-047**: A lump rises in the throat during a commercial that has no business being that moving, gone as quickly as it came. That soft catch is not weakness surfacing — it's just how open the heart already was. — after Pema Chödrön
  - ⚑ duplicate-pair fix — replaces the second of two Pema Chödrön entries that both landed on the identical this-doesnt-need-managing-only-feeling insight; rewritten around the soft spot/bodhichitta theme.
- **buddhist-048**: A surprising tenderness shows up toward your own mistake the moment you stop demanding it hadn't happened — as if the error were finally allowed to just be an error. — after Pema Chödrön
- **buddhist-049**: Trying to escape a dull, uncomfortable meeting by disappearing into your head runs into a quiet fact: there is actually nowhere else for the mind to go. — after Pema Chödrön
- **buddhist-050**: Total confidence arrives with the thought this is simply who I am — though the version of you from ten years ago would have argued the opposite, just as certainly. — Buddhist teaching
- **buddhist-051**: A thought arrives, sits for a moment, and leaves again on its own, without you doing anything at all to keep it or push it out the door. — Zen tradition
- **buddhist-052**: Watch how the urge to grip a good moment tighter arrives right as the moment is already sliding into memory — the grip changes nothing about it, only how tense the holding feels afterward. — Buddhist teaching
- **buddhist-053**: The tea goes cold in your hand while the mind is already three arguments ahead of the one actually happening in the room right now. — Zen tradition
- **buddhist-054**: For three steps on the walk to the mailbox you've taken a thousand times, something feels oddly unfamiliar, as if part of you is seeing the ordinary driveway for the first time. — Zen tradition
- **buddhist-055**: Some part of you can watch your own frustration the way you would watch weather move across a valley: close enough to feel it, far enough not to become the storm. — Buddhist teaching

### Taoist (Lao Tzu, Zhuangzi) — 25 entries

- **taoist-001**: The urge to force the conversation before the other person is ready is its own kind of gripping. Watch how the words you are rehearsing keep changing shape, refusing to sit still. — after Lao Tzu
- **taoist-002**: There is a specific ache in the hand that keeps holding a plan the day has already outgrown. The grip is optional. The day changed its shape hours ago. — after Lao Tzu
- **taoist-003**: Every slot in the calendar is filled, and still nothing is getting done. The one blank hour left standing is the only reason any of it works at all. — after Lao Tzu
- **taoist-004**: An unplanned Saturday morning feels almost unbearable before it feels like anything at all. Something in you wants to carve it into a purpose before it has even started. — after Lao Tzu
- **taoist-005**: Notice the knuckles gone white on the wheel while the traffic ahead stays exactly as slow either way. The gripping changes nothing about the road, only the hands. — after Lao Tzu
- **taoist-006**: Trying harder to fall asleep at three in the morning is the surest way to stay awake until four. The effort itself has become the obstacle it was meant to clear. — after Lao Tzu
- **taoist-007**: There is a small itch to mention who actually fixed the problem before anyone asks. Watch it pass. The fix is still standing whether your name is attached or not. — after Lao Tzu
- **taoist-008**: The pasta sauce did not need three more adjustments after it was already fine. Something in the hand keeps reaching for the spoon anyway, unable to leave a good thing alone. — after Lao Tzu
- **taoist-009**: Five open bags of the same cracker, and still a low simmer of dread at deciding what to eat. Fullness of options is not the same as ease. — after Lao Tzu
- **taoist-010**: The clay walls of the cup are not what hold the tea, it is the hollow space inside them. The guest room stayed empty all spring, and the house felt more livable for it, not less. — after Lao Tzu
  - ⚑ quote-risk fix — replaces one of two Lao Tzu entries both restating the Tao Te Ching's famous water-flows-to-low-ground image.
- **taoist-011**: The zipper on the overstuffed bag only closed once the tugging stopped and the fabric was left to settle on its own. Force had been making the gap wider, not smaller. — after Lao Tzu
  - ⚑ quote-risk fix — replaces the other water-image duplicate; rewritten around wu wei/non-forcing with a fresh everyday scene.
- **taoist-012**: The cousin who never chased a promotion is the only one of you not flinching at the phone right now. His crooked branch was never going to be cut down for lumber. — after Zhuangzi
- **taoist-013**: For a few seconds after the daydream broke, you genuinely were not sure which was more real, the meeting or the daydream. Both felt equally borrowed. — after Zhuangzi
- **taoist-014**: The knife is moving through the onion before any decision about how to move it gets made. Some part of you learned this so completely it no longer needs you. — after Zhuangzi
- **taoist-015**: The rejection that felt like a verdict six months ago now reads like the thing that saved you from the wrong ten years. Same event, entirely different judgment. — Taoist tradition
  - ⚑ attribution downgrade — the old-man-lost-his-horse relativity-of-fortune trope is documented as originating in the Huainanzi, not Zhuangzi's own text; downgraded to Taoist tradition.
- **taoist-016**: You have already decided, with total confidence, exactly why she has not texted back. Standing on the bridge looking at the water is not the same as being the fish. — after Zhuangzi
- **taoist-017**: Something in you keeps waiting for the ended job to still feel like a loss instead of a season that simply turned. Grief is allowed to change shape without asking permission first. — after Zhuangzi
- **taoist-018**: The stumble on the stage happened exactly like you feared, and it barely registered. The version of you that had spent all week bracing for it never got to be right. — Taoist tradition
  - ⚑ attribution downgrade — not confidently traceable to a specific Zhuangzi passage; downgraded to Taoist tradition.
- **taoist-019**: Three tasks moved from tonight to tomorrow morning and suddenly the whole week feels lighter, though the exact same list still has to get done. Nothing changed but the order it was named in. — after Zhuangzi
- **taoist-020**: The walls of the well you have lived in quietly widen after one long talk with someone whose week looks nothing like yours. You had mistaken your view of the sky for the sky. — after Zhuangzi
- **taoist-021**: For the length of the song you forgot you were someone who could play it well or badly. The moment it ended, the grading returned, uninvited and immediate. — after Zhuangzi
- **taoist-022**: The tide does not apologize for going out, it just goes and comes back on its own time. A flat, low-energy Tuesday is not a verdict on the rest of the week. — Taoist tradition
- **taoist-023**: Walking into the wind on the way home takes twice the effort of the walk that got you there. Some evenings the mood you are pushing against is exactly that kind of wind. — Taoist tradition
- **taoist-024**: No one watches a houseplant turn toward the window and calls it effort. Something in you has been quietly turning toward the people and hours that actually feed you, just as slowly. — Taoist tradition
- **taoist-025**: The stream never petitions the boulder to move, it simply finds the gap beside it and keeps going. The plan that stalled this week may simply need a different gap, not more force. — Taoist tradition

### Impermanence (Bill Perkins/Die With Zero, memento mori tradition — replaces diewithzero) — 35 entries

- **impermanence-001**: Money for this trip finally exists, but the two clear weeks to take it do not. That gap feels ordinary instead of temporary, and it rarely gets questioned. — after Bill Perkins
- **impermanence-002**: A memory from years ago surfaced again today, unprompted, and it still feels warm. Whatever it cost is long spent, but the return has never stopped arriving. — after Bill Perkins
- **impermanence-003**: You crouched down to retie a shoe and stood back up without your knees making an announcement of it, an ease that plenty of people your age no longer have. — after Bill Perkins
  - ⚑ duplicate-pair fix — replaces one of two entries both making the unremarked-physical-ease-taken-for-granted point.
- **impermanence-004**: There is a call you keep filing under next week, because next week always seems available. It is, until the particular week it turns out not to be. — memento mori tradition
- **impermanence-005**: Something in you treats this Tuesday as a stand-in for any other Tuesday. It is not a stand-in. It is the only version of today that will ever happen. — core principle
- **impermanence-006**: A hike with your father is something you keep assuming can happen whenever you finally get around to it. His body is not required to hold that window open indefinitely. — after Bill Perkins
- **impermanence-007**: Somewhere in that account, the balance keeps climbing quietly, while the years left to spend it keep shrinking just as quietly, unremarked in either direction. — after Bill Perkins
- **impermanence-008**: The same cabin gets booked again for next August before this year's trip is even finished unpacking, as if the reservation itself keeps the whole tradition guaranteed. — memento mori tradition
  - ⚑ duplicate-pair fix — replaces one of two entries both making the assumed-annual-continuity point.
- **impermanence-009**: Whatever help you are planning to leave them eventually would mean something different arriving now, while you were still there to see what it does. — after Bill Perkins
- **impermanence-010**: Nobody took the photo, because everyone assumed there would be another visit exactly like this one. There may not be another one exactly like it. — memento mori tradition
- **impermanence-011**: At some point recently your child stopped needing a hand to cross the street, and neither of you marked the day that actually happened. — memento mori tradition
- **impermanence-012**: That backpacking trip at twenty-three ran on a bus pass and a hostel bunk, when only the ticket price mattered. Booking the same route now, the ticket costs nothing to you, and the ten-hour bus is the obstacle. — after Bill Perkins
  - ⚑ quote-risk fix — narrowed from restating Bill Perkins's entire life-stage thesis (time/health when young, money when old) to one concrete scene.
- **impermanence-013**: You checked the time twice at that overlook, already thinking about the next stop, as if this exact view would be waiting for a second visit. — memento mori tradition
- **impermanence-014**: Watch how easily a disagreement gets left half finished, the way it usually does, on the quiet assumption that there will be time later to circle back. — core principle
- **impermanence-015**: That long trip fits a version of you that exists for maybe another decade. It will not fit the version of you at seventy, and that is just arithmetic. — after Bill Perkins
- **impermanence-016**: Light coming through that window right now will never fall at exactly this angle again. It rarely occurs to anyone sitting in the room. — core principle
- **impermanence-017**: You worked late again tonight to get ahead, without pausing to ask what exactly you were getting ahead of, or when that account gets settled. — after Bill Perkins
- **impermanence-018**: Another birthday arrived, and for a moment before the cake and the singing, something in you noted quietly that this year already looks different from the last one. — core principle
  - ⚑ tone fix — original one-fewer-of-a-finite-number countdown framing read as alarming/numeric; softened toward a gentler, non-numeric observation.
- **impermanence-019**: This ordinary dinner with old friends is already turning into something you will replay later, though nobody at the table is thinking of it that way yet. — after Bill Perkins
- **impermanence-020**: You already know, somewhere, that this story will not always be around to hear again, even while it repeats at dinner and your attention drifts halfway through. — memento mori tradition
- **impermanence-021**: You took the stairs two at a time without thinking about it, the way you have for years. That ease is true right now, not permanently promised. — core principle
- **impermanence-022**: This exact group of friends being in the same city at the same time will not last many more years. The coordination gets harder with every year that passes. — after Bill Perkins
- **impermanence-023**: There used to be more names active in the group chat than there are now. Nobody announced the change; it simply happened a little at a time. — memento mori tradition
- **impermanence-024**: Underneath an ordinary visit to that childhood house was the fact that it would be the last one, though nothing about the moment announced it. — memento mori tradition
- **impermanence-025**: The gear for the backcountry ski trip finally fits the budget this year, but the knees that used to handle a full day of moguls do not answer the same way anymore. — after Bill Perkins
  - ⚑ duplicate-pair fix — replaces one of two entries both making the trip-deferred-to-a-later-decade point.
- **impermanence-026**: The goodnight routine got rushed again tonight, the way it does most nights, on the unspoken assumption that there will always be another one to rush through. — memento mori tradition
- **impermanence-027**: The specific weight of your child falling asleep against your shoulder tonight will not be available at this size again. Next year has a different child in it. — memento mori tradition
- **impermanence-028**: Vacation days keep accumulating on the books instead of turning into anything lived, each one quietly expiring the way unused things tend to. — after Bill Perkins
- **impermanence-029**: The card gets signed see you next year without a second thought, a phrase that assumes something it actually has no power to guarantee. — memento mori tradition
- **impermanence-030**: Photos of your parent from ten years apart sit side by side now, and the accumulation is only visible once someone lines them up. — memento mori tradition
- **impermanence-031**: Bringing home a puppy that will need a decade of morning walks is a quiet bet on a decade of mornings you cannot actually see yet. — core principle
- **impermanence-032**: Learning that instrument keeps getting pushed into eventually, as though eventually were an actual date on a calendar rather than a way of not choosing. — core principle
- **impermanence-033**: A candle on the table burns down a little more with each course, and no one at dinner is thinking of it as a small model of anything else. — memento mori tradition
- **impermanence-034**: A corner table at that cafe feels like it will always be there for a Sunday morning exactly like this one. Nothing about it is actually promised to stay. — memento mori tradition
- **impermanence-035**: The whispered reminder that once followed victorious generals through the streets does not follow anyone through an ordinary afternoon now, but the fact it pointed at has not changed. — memento mori tradition

### Attention (Cal Newport — replaces focus) — 35 entries

- **attention-001**: Reaching for the phone mid-sentence while writing, then returning to the page a minute later, the sentence still feels harder than it should, like something is still catching up. — after Cal Newport
- **attention-002**: Something in you keeps attending the meeting for a few minutes after it ends, still replying to points nobody is making anymore. — after Cal Newport
- **attention-003**: Standing in a checkout line, the phone is already out before there is a reason for it, before the boredom even had time to register. — after Cal Newport
- **attention-004**: A red light goes on and the hand moves toward the pocket before the eyes even reach the pocket, some decision already made without you. — attention research
  - ⚑ attribution downgrade — generic pre-conscious habit-loop territory, not a specific Cal Newport argument; downgraded to attention research.
- **attention-005**: Ten minutes into something hard, the mind starts negotiating for a short break. That negotiation is the whole muscle being asked to work. — after Cal Newport
- **attention-006**: The inbox reads empty by noon, and there is a real satisfaction in that, even though the one piece of work that matters has not been touched. — after Cal Newport
- **attention-007**: The pull to keep an app around for the one time it might help outweighs, in the moment, the small toll it takes every single day it stays. — after Cal Newport
- **attention-008**: The phone was chosen for messages from people who matter, but somehow spends most of its day delivering things nobody asked for. — after Cal Newport
- **attention-009**: An unscheduled hour on the calendar looks like an error before it looks like a gift. What feels normal now says something about the baseline. — after Cal Newport
- **attention-010**: Part of the mind insists a half-formed thought will vanish if it is not written down this second, though most thoughts, given a minute, come back on their own. — core principle
  - ⚑ attribution downgrade — tracks GTD/capture-anxiety territory, not specifically Newport; downgraded to attention research.
- **attention-011**: After closing every open tab at once, the sudden quiet left on the screen feels almost too loud to sit inside. — after Cal Newport
- **attention-012**: The same three apps open in the same order, one after another, without a single one of them ever being decided on. — after Cal Newport
- **attention-013**: Someone across the train car is reading a paperback with no phone anywhere in sight, and the sight registers as strange before it registers as ordinary. — after Cal Newport
- **attention-014**: Lying down at night, some unfinished thread from the day is still open somewhere, refusing to close just because the day already has. — after Cal Newport
- **attention-015**: A sentence on the page gets slightly difficult, and the eyes are already sliding toward the phone before the difficulty has even been named. — after Cal Newport
- **attention-016**: There is a small relief in answering the easy message fast, a relief the harder, still-unanswered question underneath never quite gets. — after Cal Newport
- **attention-017**: The first stretch of working without interruption feels unproductive, almost wasted, right up until it stops feeling that way. — after Cal Newport
- **attention-018**: One hour spent fully absorbed in a single problem outproduces the entire distracted afternoon around it, once the two are actually compared side by side. — after Cal Newport
- **attention-019**: A break spent scrolling does not leave the same feeling of rest as a break spent staring out a window. One refills something, the other only fills time. — after Cal Newport
- **attention-020**: The urge to fill a few seconds of waiting arrives before the kettle has even had a chance to boil, the hand already reaching for the phone. — after Cal Newport
  - ⚑ voice fix — removed the imperative Watch how fast... opener; rephrased as a plain description with no command.
- **attention-021**: A day spent answering messages leaves something to point to by evening. A day spent on one hard problem can look, from the outside, like nothing happened. — after Cal Newport
- **attention-022**: Sitting with one problem for a full hour without checking anything else has quietly become a specific, almost uncommon skill, not a given. — after Cal Newport
- **attention-023**: The show keeps playing while the phone gets scrolled, and afterward neither the plot nor the messages come back clearly. — attention research
- **attention-024**: Flicking back and forth between two open tabs, the work on each one comes out slower and rougher than either would have alone. — attention research
- **attention-025**: A buzz is felt in the pocket, distinct and certain, and the phone sitting on the table across the room has not moved at all. — attention research
- **attention-026**: You already know, before you check, that the page has not changed, and the refresh happens anyway, a second time in ten seconds. — attention research
- **attention-027**: A small red dot in the corner of the screen pulls the eyes toward it before any actual decision is made to look. — attention research
- **attention-028**: The phone is unlocked and lit up before the reason for unlocking it has even finished forming in the mind. — core principle
- **attention-029**: A phone buzzes across the room, clearly someone else's, and the whole body still turns toward it first, faster than thought. — attention research
- **attention-030**: By mid-afternoon, focus is already thin, worn down by a morning of small interruptions that each felt harmless enough on its own. — core principle
- **attention-031**: Three lines of a page get read and none of them land, the eyes moving steadily while the mind is somewhere else entirely. — attention research
- **attention-032**: A new tab opens with no particular question behind it, already open before anyone decided what it was even for. — core principle
- **attention-033**: Underneath the quick check of the phone, nothing was actually retrieved, decided, or needed. The hand just wanted something to do. — core principle
- **attention-034**: The thumb keeps moving down the screen well after whatever it was originally looking for has stopped being interesting. — attention research
- **attention-035**: A waiting room with nothing playing and no screen lit starts to feel like something is missing, though nothing actually is. — core principle

### Relationships (Dale Carnegie) — 30 entries

- **relationships-001**: Something in you already knows the difference between asking how someone is doing and actually waiting to hear the answer. Most days you skip the second part without noticing. — after Dale Carnegie
- **relationships-002**: A name said back to someone mid-conversation changes something in their face, small and immediate, though the name you were just given rarely gets used again before the conversation ends. — after Dale Carnegie
  - ⚑ voice fix — cut the Notice how rarely... command tail (systemic issue: this whole rewrite exists to eliminate instruction-style tails).
- **relationships-003**: Between the end of their sentence and the start of yours there is a gap filled only with the reply you were rehearsing. Nothing they said actually crossed it. — after Dale Carnegie
- **relationships-004**: Everyone across the table is quietly hoping to matter in this conversation, the same way you are. It is easy to forget you are not the only one hoping that. — after Dale Carnegie
- **relationships-005**: The urge to top their story with a bigger one of your own arrives before you have even finished being glad for them, already halfway formed. — after Dale Carnegie
  - ⚑ voice fix — cut the Watch it arrive, and let it pass urge-surfing technique instruction.
- **relationships-006**: Winning the argument and keeping the friendship rarely happen in the same conversation, and your voice already picks one of them the moment it gets firmer. — after Dale Carnegie
  - ⚑ voice fix — cut the Notice which one you are actually reaching for command tail.
- **relationships-007**: Right after you realize you were wrong, there is a small window before pride finds a way to soften it. What you do in that window says more than the mistake did. — after Dale Carnegie
- **relationships-008**: In the middle of a disagreement about something small, the exact same fact can be said in a way that backs them into a corner or leaves them room to move. — after Dale Carnegie
  - ⚑ voice fix — replaces an entry whose command tail (Notice which version you reach for first) was cut and rewritten as a standalone observation.
- **relationships-009**: Sometimes the smallest compliment is the one you almost do not bother saying out loud, and it is usually the one that lands hardest. — after Dale Carnegie
- **relationships-010**: Before you decide someone is being difficult, there is a version of events where they are simply frightened or tired in a way you cannot see from your side. — after Dale Carnegie
- **relationships-011**: Watch how often you finish other people's sentences for them, certain you already know where they were headed. Sometimes you are wrong, and they notice. — after Dale Carnegie
- **relationships-012**: Pointing out their mistake can happen in front of everyone, or quietly between the two of you instead, and one of those two is already the reflex. — after Dale Carnegie
  - ⚑ voice fix — cut a Notice which version... command tail.
- **relationships-013**: Your face arranges itself into something guarded before you have even decided the other person deserves it, the guard already up before the verdict is. — after Dale Carnegie
  - ⚑ voice fix — cut a double command (Notice the guard go up, and ask if it was necessary).
- **relationships-014**: The question you just asked them was really a doorway to something you wanted to say about yourself, the curiosity about their answer only a small part of it. — after Dale Carnegie
  - ⚑ voice fix — cut a Notice which one it was command tail.
- **relationships-015**: An idea lands differently depending on whose name is attached to it in the room, even when the idea itself has not changed at all. — core principle
  - ⚑ voice fix + attribution downgrade — cut a Notice whose name... command tail; also downgraded from Dale Carnegie to core principle (status/credit bias is general social psychology, not a specific Carnegie principle).
- **relationships-016**: A particular brightness crosses someone's face when they finally get to talk about the thing they actually care about, gone again the moment the topic changes. — after Dale Carnegie
  - ⚑ voice fix — cut a Notice how rarely you make room for it command tail.
- **relationships-017**: They mentioned three weeks ago that something was hard, and you have not asked about it since, though you meant to. The meaning to was real, and it was not enough. — after Dale Carnegie
- **relationships-018**: Your hand moves toward the phone in your pocket during a pause that was not actually empty, just quiet for a second. That quiet was still part of the conversation. — core principle
- **relationships-019**: Something in you starts building a defense before anyone has actually said you did something wrong, already arguing against an accusation no one made. — core principle
  - ⚑ voice fix — cut a Notice how much of that defending... command tail.
- **relationships-020**: The person who refilled the coffee or held the door rarely gets looked at long enough to be truly seen doing it, the glance already moving past them. — core principle
  - ⚑ voice fix — cut a Notice how automatic it is... command tail.
- **relationships-021**: The cashier or the driver has an entire life you will never ask about, and today you will probably pass through it without a single real question. — after Dale Carnegie
- **relationships-022**: You can still recall, years later, the one person who made you feel like the most interesting thing in the room. That memory outlasted almost everything else from that day. — after Dale Carnegie
- **relationships-023**: Just before you respond in a disagreement there is a half second where you could soften what you are about to say. Usually you do not take it. — after Dale Carnegie
- **relationships-024**: Their problem sounds small to you because it is not yours, which is exactly why it needs a different kind of attention than the one you are giving it. — after Dale Carnegie
- **relationships-025**: You have met this person twice now and still reach for their name at the last second, hoping it arrives before you have to admit it did not. — after Dale Carnegie
- **relationships-026**: You just spoke more patiently to a stranger on the phone than you did to the person who lives with you an hour ago, though the second one needed it more. — core principle
  - ⚑ voice fix — cut a Notice which one actually needed the patience more command tail.
- **relationships-027**: Your arms are crossed and your eyes have drifted to the clock twice while they are still explaining something that clearly matters to them. Your body already left the conversation. — core principle
- **relationships-028**: Underneath the urge to solve their problem for them is a smaller, quieter option: just letting them finish describing it without offering anything at all. — after Dale Carnegie
- **relationships-029**: Somewhere near the end of the conversation you realize you did not ask a single question, and they carried the entire thing without seeming to mind. — after Dale Carnegie
- **relationships-030**: Someone's shoulders drop slightly midway through explaining something, right at the point where they realize no one is about to cut them off. — core principle
  - ⚑ voice fix — replaces an entry that opened with the imperative Watch... and presupposed the reader had already changed their behavior; rewritten as something observed happening, not staged.

### Growth (Carol Dweck, Kristin Neff, Brené Brown) — 30 entries

- **growth-001**: A single bad review lands, and some part of the mind starts drafting a permanent story about your talent instead of reading it as one data point from one day. — after Carol Dweck
- **growth-002**: A rejection email gets reread three times before lunch, each pass searching less for the words on the page and more for proof that this is who you are now. — after Carol Dweck
  - ⚑ quote-risk fix — replaces an entry embedding Carol Dweck's single most famous branded phrase (not yet vs. not ever, from her Power of Yet TED talk).
- **growth-003**: Avoiding the hard problem in front of other people, so no one sees you struggle, is the fixed mindset protecting an idea of you that was never true to begin with. — after Carol Dweck
- **growth-004**: In a meeting, someone answers instantly and the mind quietly files that as raw talent, without ever seeing the years of unglamorous repetition that produced the instant answer. — after Carol Dweck
- **growth-005**: Two years of visible improvement can vanish from memory the instant one new mistake happens, as if the progress did not count until it was finished. — after Carol Dweck
- **growth-006**: An unfinished draft can sit hidden in a folder far longer than it needs to, as if its rough edges were proof of insufficient ability rather than an ordinary, unfinished stage. — after Carol Dweck
- **growth-007**: Being told you are naturally smart feels better in the moment than being told you worked hard, even though only one of those comments describes something repeatable. — after Carol Dweck
- **growth-008**: Comparing where you are now to where someone else stands after five years of practice, the mind reads the distance as a talent gap instead of a time gap. — after Carol Dweck
- **growth-009**: Comforting a friend who missed the deadline comes out warm and forgiving; comforting yourself for the identical mistake, an hour later, comes out closer to contempt. — after Kristin Neff
- **growth-010**: A particular struggle can feel uniquely shameful right up until the moment you learn someone else has been quietly carrying the same one, unasked and unremarked on, for years. — after Kristin Neff
- **growth-011**: Saying at least it is not as bad as what other people deal with sounds like perspective, but it often just skips past actually attending to your own pain. — after Kristin Neff
- **growth-012**: Scrolling past someone else's highlight reel at midnight, it is easy to forget that the version of a life shown online is never the whole, unedited one, including the difficult parts. — self-compassion research
  - ⚑ attribution downgrade — the highlight-reel social-comparison framing isn't part of Kristin Neff's documented self-kindness/common-humanity/mindfulness framework; downgraded to self-compassion research.
- **growth-013**: Being gentle with yourself after a mistake can feel like letting yourself off the hook, as though kindness and accountability were opposites instead of two things that can coexist. — after Kristin Neff
- **growth-014**: One clumsy line in an email can occupy an entire evening of replay, as though sitting with the discomfort for a single clean minute were not allowed. — after Kristin Neff
- **growth-015**: You already know, somewhere, that pushing through a hard feeling rather than admitting it hurts treats kindness toward yourself like a reward that has to be earned first. — after Kristin Neff
- **growth-016**: Pushing through exhaustion without ever naming it as exhaustion, as though noticing your own limit were itself a form of failure rather than an honest signal. — after Kristin Neff
- **growth-017**: There is a version of you performing competence at the meeting while a quieter, less composed version sits underneath, and the distance between them takes real effort to maintain. — after Brené Brown
- **growth-018**: Before anyone can ask twice, the reflex is to say I am fine, and that reflex is not really about them — it is about how exposed the truth would leave you feeling. — after Brené Brown
- **growth-019**: Something in the chest loosens halfway through admitting the hard thing out loud, well before the other person has even had time to respond. — after Brené Brown
  - ⚑ quote-risk fix — replaces an entry closely paraphrasing Brené Brown's widely-quoted line that shame cannot survive being spoken.
- **growth-020**: Underneath the polished version of the week that gets told at dinner, there is an edited-out version with the parts that felt too messy to say out loud. — after Brené Brown
- **growth-021**: The fear is rarely about the mistake itself. It is about what the mistake might reveal, if anyone actually saw it, about whether you are enough underneath it. — after Brené Brown
- **growth-022**: Right after the mistake at work gets noticed, the voice in your head skips past what happened and goes straight for some verdict about who you are. — after Brené Brown
  - ⚑ quote-risk fix — replaces an entry near-verbatim echoing Brené Brown's famous guilt-is-I-did-something-bad/shame-is-I-am-bad formula.
- **growth-023**: Worthiness quietly gets treated as something that has to be earned through the next achievement, rather than as something already true underneath whatever you did or did not finish today. — after Brené Brown
- **growth-024**: The urge to rehearse an explanation before admitting a struggle out loud is really just the mind trying to control how much of you gets seen. — after Brené Brown
- **growth-025**: A setback lands, and something in you starts sorting it before you've decided to: proof you're not cut out for this, or simply information to use next time. — growth-mindset research
  - ⚑ voice fix — replaces third-person research reportage (Research following students found...) with a first-person present-tense noticed moment.
- **growth-026**: The sentence I am just not a numbers person arrives fully formed in an instant, while the more accurate I have not had much practice with numbers takes a second longer to construct. — growth-mindset research
- **growth-027**: Across study after study, effort and repeated struggle predict later ability better than early talent does, though the mind keeps treating that early talent as the whole story. — growth-mindset research
- **growth-028**: Right after a setback, the voice that speaks up first can sound like a harsh critic or like someone actually worth caring for, and the second one gets you back on your feet faster. — self-compassion research
  - ⚑ voice fix — replaces third-person research reportage (the people who recover fastest...) with an observation in the reader's own voice.
- **growth-029**: Scrolling past someone else's win, the first measure that kicks in is how you stack up against them, not how you treat yourself now that the comparison already stings. — self-compassion research
  - ⚑ voice fix — replaces exposition of a research construct (self-esteem vs. self-compassion) with an actual instant of comparison.
- **growth-030**: Right after a mistake, going easy on yourself does not seem to shrink the responsibility you feel for it, the ownership stays even as the self-attack quiets down. — self-compassion research
  - ⚑ voice fix — replaces a studies-comparing-responses research summary with something the reader notices about their own reaction to a mistake.

### Money (Morgan Housel — replaces wealth) — 25 entries

- **money-001**: There is a number you once named as enough, quietly crossed months ago, replaced already by a bigger one before you thought to celebrate. — after Morgan Housel
- **money-002**: Something in you trusts that the next raise will finally quiet the wanting, though a smaller raise once made the identical promise and did not keep it. — after Morgan Housel
- **money-003**: The salary that once sounded unreal when you were twenty-five is just the baseline now, the same way this year's number will look ordinary from a few years further out. — after Morgan Housel
  - ⚑ duplicate-pair fix — replaces one of two entries both making the goalpost-keeps-moving point.
- **money-004**: The calm of feeling settled about money rarely survives contact with someone else's number — that is usually where the wanting starts again. — after Morgan Housel
- **money-005**: A friend mentions their savings over dinner, almost in passing, and for the rest of the night your own number feels smaller than it did an hour ago. — after Morgan Housel
- **money-006**: Scrolling through a stranger's renovated kitchen at midnight, you feel a specific kind of behind that has nothing to do with your actual house. — after Morgan Housel
- **money-007**: The sale price on the house two doors down popped up on your phone this morning, and for a second your own place felt worth less than it did yesterday. — after Morgan Housel
  - ⚑ duplicate-pair fix — replaces one of two entries both making the hearing-someone-elses-number point.
- **money-008**: Somewhere above whatever you have, there is always someone with more, and the strange certainty that reaching them would finally be enough never quite survives arrival. — after Morgan Housel
- **money-009**: The best thing that extra bit of savings ever bought wasn't a purchase at all, just the freedom to turn down a Tuesday you didn't want. — after Morgan Housel
  - ⚑ duplicate-pair fix — replaces one of two entries both making the invisible-restraint point.
- **money-010**: You already know, somewhere, that the neighbor eyeing your driveway is not scoring you at all — he is only measuring it against his own. — after Morgan Housel
- **money-011**: The bigger apartment you toured last month and quietly decided against will never show up on anyone's radar, only in an account that stays a little healthier for it. — after Morgan Housel
  - ⚑ quote-risk fix — replaces an entry restating Morgan Housel's famous Man in the Car Paradox almost beat for beat.
- **money-012**: The trip you quietly postponed this spring is already forgotten by nearly everyone, including you most days, yet it is still doing its work. — after Morgan Housel
- **money-013**: Restraint does not photograph well. The dinner skipped, the bag left on the shelf — none of it will ever show up anywhere you can be seen. — after Morgan Housel
- **money-014**: Watch how easily a stranger's car becomes, in your mind, a measure of what they have, when it only ever shows you what they spent. — after Morgan Housel
- **money-015**: There is a particular restlessness in checking, again, whether a slow and boring plan is working, when the honest answer will not arrive for years. — after Morgan Housel
- **money-016**: Right before a dull, reliable plan was about to pay off, there is often a pull toward something exciting and unproven instead. — after Morgan Housel
- **money-017**: It was never brilliance that grew the account steadily over the years — mostly it was just leaving it alone on the days you wanted to touch it. — after Morgan Housel
- **money-018**: A market headline can trigger a flicker of dread that feels like proof something went wrong, when it is closer to the turbulence expected partway through a long flight still headed where it was going. — after Morgan Housel
  - ⚑ quote-risk fix — a toll for staying in the game was a thin synonym-swap of Housel's famous fee-not-a-fine metaphor; reworked.
- **money-019**: Underneath the satisfaction of a good year in your savings sits something else too — a quiet itch to measure that number against everyone else's. — after Morgan Housel
- **money-020**: By evening after a hard day, the itch to buy something rarely has much to do with the thing itself — it is relief looking for a shape. — core principle
- **money-021**: Some days, the sting of a price tag has more to do with how the day has gone than with the number printed on it. — core principle
- **money-022**: Contentment tends to show up in the least remarkable moments — folding laundry, waiting for coffee — never once tied to anything you bought. — core principle
- **money-023**: During an anxious week, the account gets checked twice as often, as if watching the number closely enough might change what it says. — core principle
- **money-024**: After a purchase, the reasons for it have a habit of arriving late, dressed up to look like they came first. — core principle
- **money-025**: There is a version of you, a few years back, who would have found this exact bank balance more than enough — a comparison you rarely make. — core principle

### Voices (Jay Shetty, Barack Obama, Michelle Obama, Nelson Mandela, Desmond Tutu, Fred Rogers, Viktor Frankl, Naval Ravikant) — 40 entries

- **voices-001**: A decision aimed at impressing someone you are picturing and a decision aimed at what you actually value can feel identical in the moment. Only one of them still feels right once that imagined audience is gone. — after Jay Shetty
  - ⚑ attribution-confidence fix — replaces an invented likes-counting scenario with Jay Shetty's actually-documented validation-vs-values theme; also cut a command tail.
- **voices-002**: In a waiting room the mind drifts to the phone within seconds, then back, then away again. That drift is not a flaw — it is a muscle, and it answers to practice. — after Jay Shetty
- **voices-003**: Turning attention toward what someone else actually needs does not resolve whatever has been looping in your own head all morning. For as long as the helping lasts, though, the loop itself seems to have nowhere to run. — after Jay Shetty
  - ⚑ attribution-confidence fix — replaces an invented bags-up-the-stairs scene with Jay Shetty's documented service/seva-heals-rumination theme.
- **voices-004**: A path that scores well by every outside measure and a life that actually fits a person are not always the same path. Some quiet arithmetic between the two keeps running underneath, long after the excitement has settled. — after Jay Shetty
  - ⚑ attribution-confidence fix — replaces an invented job-offer scenario with Jay Shetty's documented values-vs-external-validation framework.
- **voices-005**: Half-listening to a friend while composing your reply is its own kind of absence, one most conversations quietly run on. There is a difference you can feel when attention actually lands. — after Jay Shetty
- **voices-006**: Some nights the argument against yourself is more convincing than any critic could manage, running long after the house has gone quiet. It rarely holds up quite as well by morning. — after Barack Obama
- **voices-007**: Sitting in a marriage counselor's office and hearing that you have not really been listening is a specific kind of tiring. The discipline is staying in the chair anyway and actually hearing the sentence before answering it. — after Barack Obama
  - ⚑ political-neutrality fix — replaces an adversarial-negotiation framing (read as political-opposition-adjacent) with Obama's own well-documented, non-political marriage-counseling anecdote.
- **voices-008**: Waking a child at four in the morning to work through an English lesson book before the school day starts is its own kind of devotion. Years later, the pace of that early patience is still the one being copied. — after Barack Obama
  - ⚑ attribution-confidence fix — replaces an unconfirmed invented vignette with a specifically documented detail (his mother's pre-dawn homeschool English lessons in Indonesia).
- **voices-009**: An hour of pickup basketball does not solve whatever demanding, undefined work is still waiting afterward, but something in the shoulders unclenches that a full night of worrying never managed. — after Barack Obama
  - ⚑ political-neutrality fix — removed back-at-the-desk/office-pressure framing, replaced with generic demanding work.
- **voices-010**: Two years spent organizing a neighborhood produced changes small enough that plenty of people said so out loud, again and again. Staying steady through that kind of stretch is a different skill entirely from managing one bad hour. — after Barack Obama
  - ⚑ political-neutrality fix — replaces a season of sustained public criticism (approval-rating-adjacent) with his pre-political Chicago community-organizing history.
- **voices-011**: Someone in a position to know better once decided you were not cut out for a room you were about to earn a seat in. Notice how long that verdict outlives the person who gave it. — after Michelle Obama
- **voices-012**: There is the version of the morning a camera would choose and the version that actually happened — tired, uncertain, real. Only one of them is sturdy enough to actually stand on. — after Michelle Obama
- **voices-013**: Even after every credential is earned and framed on the wall, some rooms still produce the old feeling of being the one who snuck in. Notice how little that feeling tracks with the facts. — after Michelle Obama
- **voices-014**: A few minutes of real attention from someone further along changes more than a whole semester of advice aimed at a room. The quiet version of help rarely gets noticed by anyone but the person who received it. — after Michelle Obama
- **voices-015**: Smoothing your voice into whatever a room seems to expect is exhausting in a way that is hard to name until the smoothing stops. The relief afterward is its own kind of evidence. — after Michelle Obama
- **voices-016**: A small patch of prison soil, tended for years for a handful of tomatoes, was never really about the tomatoes. Patience practiced on something small keeps its shape when something larger finally arrives. — after Nelson Mandela
- **voices-017**: Forgiveness rarely arrives as a warm feeling washing over a person all at once. More often it is a decision remade every single morning, long before the feeling agrees to follow along. — after Nelson Mandela
- **voices-018**: Nearly three decades of being addressed without respect never decided how respect got returned once freedom came. Dignity held under pressure turns out to be dignity rehearsed first, alone, where no one was watching. — after Nelson Mandela
- **voices-019**: Learning the language of the very people holding the keys was slow, deliberate, and looked like nothing was happening. Decades later that particular patience turned out to be exactly the point. — after Nelson Mandela
- **voices-020**: Inviting a former guard to sit at the table years later is not the same as forgetting a single day of what happened in that cell. One is memory. The other is a choice made anyway. — after Nelson Mandela
- **voices-021**: Splitting a meal with someone who showed up empty-handed was never filed under generosity so much as just how people behaved. Depending on people you did not choose runs in both directions, whether anyone notices or not. — after Desmond Tutu
  - ⚑ quote-risk fix — replaces an entry closely restating Desmond Tutu's single most famous ubuntu line (a person is a person through other persons).
- **voices-022**: Treating another person as less than human costs the person doing the treating something too, whether or not they notice the bill arriving. Cruelty rarely leaves the one performing it untouched. — after Desmond Tutu
- **voices-023**: Forgiving a person and excusing what a person did are two separate motions, easy to confuse from a distance. One releases a grip. The other was never actually required. — after Desmond Tutu
- **voices-024**: Telling a hard story out loud to someone who does not flinch or look away changes something about the story, even though none of the facts have changed. Being heard all the way through is its own kind of repair. — after Desmond Tutu
  - ⚑ political-neutrality fix — removed Truth and Reconciliation Commission testimony framing (an official state body); recentered on a personal, non-institutional instance of being heard.
- **voices-025**: Laughter showing up in the middle of a genuinely heavy conversation is not disrespect toward the grief in the room. Sometimes it is only further proof that the people in it are still fully alive. — after Desmond Tutu
- **voices-026**: Getting all the way down to a child's actual eye level before answering a question changes what counts as a serious question. Most answers change once the height in the room evens out. — after Fred Rogers
- **voices-027**: Changing into a different pair of shoes before starting the actual work of the day is a small ritual, and also a complete one. It marks the exact moment attention actually arrives somewhere. — after Fred Rogers
- **voices-028**: A full uninterrupted minute of quiet, held on purpose in the middle of a broadcast, felt unbearably long to some and like the only honest part to others. Silence held that long says something on its own. — after Fred Rogers
- **voices-029**: Feeding the fish on camera took the actual amount of time feeding fish takes, with no cut to speed it along. The unhurried version was the whole point, not a delay before one. — after Fred Rogers
- **voices-030**: A number on the scale that never changed for thirty years was not a coincidence anyone stumbled into; it was chosen and then kept, morning after morning, on purpose. Some rituals matter because nothing about them is left to chance. — after Fred Rogers
  - ⚑ quality fix — differentiates two thematically repetitive Fred Rogers entries (both built around a full/undivided minute) using his well-documented 143-pound-for-30-years ritual instead.
- **voices-031**: Even with almost nothing left to give, some prisoners in the camp still gave away their last piece of bread. That kind of giving was never about the bread — it was proof that some part of them remained theirs. — after Viktor Frankl
  - ⚑ quote-risk fix — reworded the second sentence, which paraphrased Viktor Frankl's single most famous line (the last of the human freedoms, to choose one's attitude) too closely.
- **voices-032**: A task finished carefully with no one checking can carry its own kind of meaning, separate from any reward attached to it. On some days that turns out to be the only proof of meaning available, and it holds. — after Viktor Frankl
  - ⚑ misattribution fix — replaces an entry built on the space-between-stimulus-and-response line, a well-documented misattribution to Frankl (confirmed by the Viktor Frankl Institute; he never wrote or said it) — dropped entirely, not softened.
- **voices-033**: Marching for miles with no idea whether a loved one is even still alive, the mind can still hold an entire conversation with that face. Sometimes an imagined conversation is the exact thing that keeps a person upright. — after Viktor Frankl
- **voices-034**: A hard afternoon does not owe anyone an explanation for why it turned out this way; it arrived, and it is still sitting there waiting to be responded to. What gets done with it is the only part still undecided. — after Viktor Frankl
  - ⚑ quote-risk fix — reworded away from closely paraphrasing one of Frankl's most-quoted passages (stop asking what you expect from life...).
- **voices-035**: Digging through frozen ground for no visible reason breaks a person faster than the same labor done for a reason that actually matters to them. The task barely changes; what the task is for changes everything. — after Viktor Frankl
- **voices-036**: Wanting the next thing shows up first as a kind of restlessness in the body, well before it turns into a thought with a name attached. The want quiets for a moment the instant it is noticed instead of chased. — after Naval Ravikant
  - ⚑ quote-risk fix — dropped the contract/choice framing that echoed Naval Ravikant's most-repeated line about desire as a contract to be unhappy.
- **voices-037**: Sitting in a genuinely pleasant place while the mind is already halfway to the next plan is a specific, common kind of absence. The body is the only one still actually there. — after Naval Ravikant
- **voices-038**: Scrolling past a stranger's new car or new trip can manufacture a want in about four seconds that was not there five seconds earlier. Notice how fast an entire craving gets built from nothing. — after Naval Ravikant
- **voices-039**: Peace rarely announces itself as a feeling; more often it looks like an ordinary minute passing without anything in it feeling urgent to fix. Nothing was added to the minute — it simply was not interrupted by anything else. — after Naval Ravikant
  - ⚑ quote-risk fix — reworded away from Naval Ravikant's specific, widely-quoted peace-is-happiness-at-rest subtraction formula.
- **voices-040**: Getting the thing that was wanted rarely ends the wanting for long; it just clears space for the next one to move in. The wanting itself turns out to be the more permanent resident. — after Naval Ravikant

### Grounding (universal sensory/body observations, no named attribution — new in v1.14) — 35 entries

- **grounding-001**: Heat is leaving the mug in your hand by degrees, and the palm has been tracking every one without telling you. — core principle
- **grounding-002**: The last swallow moved down your throat with a small sound only you could hear, then vanished as if it had never happened. — core principle
- **grounding-003**: The coffee smelled strong for the first few breaths and then it didn't, not because it changed but because the nose stopped reporting it. — core principle
- **grounding-004**: There is a faint sweetness still sitting on the back of the tongue, the last trace of whatever was eaten, fading on its own schedule. — core principle
- **grounding-005**: Everything at the edge of your vision right now is soft and undefined, a blur the eyes gave up sharpening the moment you stopped looking there directly. — core principle
- **grounding-006**: One shoulder has been carrying more than the other all day, a small tilt the spine adjusted for so quietly you never had to decide it. — core principle
- **grounding-007**: There is a brief stillness at the top of every breath, a hinge between filling and emptying that the body passes through without announcing it. — core principle
- **grounding-008**: Fingers tied that knot without asking the mind for instructions, the same loop and pull made thousands of times before this one. — core principle
- **grounding-009**: Underneath the calm face, the jaw has been holding a clench for who knows how long, teeth resting against teeth in a grip nobody remembers agreeing to. — core principle
- **grounding-010**: Somewhere between one thought and the next, the shoulders climbed a little closer to the ears, and they are still there now. — core principle
- **grounding-011**: Right now the soles of the feet are pressing against something solid, whether shoe, floor, or the rail of a chair, holding still without effort. — core principle
- **grounding-012**: The room sounds different with the eyes closed than with them open, nearer in some directions and farther in others, though nothing in it has actually moved. — core principle
- **grounding-013**: The tongue has a resting place against the roof of the mouth that it returns to constantly, a habit older than any memory of learning it. — core principle
- **grounding-014**: Dozens of blinks have already happened while you read this far, each one erasing the world for a fraction of a second you never noticed missing. — core principle
- **grounding-015**: Somewhere on the skin right now, fabric is pressing a little harder than everywhere else, a waistband or a collar the body adjusted to and forgot. — core principle
- **grounding-016**: One patch of skin is warmer than the rest of the body right now, wherever the light happens to be landing, and it will move without asking. — core principle
- **grounding-017**: Whatever you are sitting on has slowly changed shape to match the body pressing into it, a give that happened without a single decision from you. — core principle
- **grounding-018**: Feel how the hand holding this is gripping harder than it needs to, a small excess of effort the fingers have been spending without a reason. — core principle
- **grounding-019**: The thumb has its own rhythm when it scrolls, a pace it settled into long before you thought to pay attention to it. — core principle
- **grounding-020**: The smell of rain on hot pavement arrives before you have decided to pay attention to it, already halfway to a memory by the time you notice. — core principle
- **grounding-021**: Something in the neck has been balancing the head, which weighs roughly as much as a bowling ball, in place this entire time without a single wobble you noticed. — core principle
- **grounding-022**: Behind closed eyelids the dark is never fully dark, more a shifting red or amber, a color that only exists in that particular kind of blindness. — core principle
- **grounding-023**: The inner ear keeps supplying a felt sense of up and down without being asked, which is why the floor still seems level even with the eyes closed. — core principle
- **grounding-024**: There is a brief pause the body takes before rising from a chair, a small gathering of weight and balance that happens faster than thought. — core principle
- **grounding-025**: Air is moving in through one nostril more easily than the other right now, a small asymmetry the body has been running for years unnoticed. — core principle
- **grounding-026**: Footsteps sound different indoors than outdoors, a change in pitch and echo the ear adjusts for automatically, before you ever thought to compare them. — core principle
- **grounding-027**: Standing still is not actually still, the weight keeps shifting in tiny amounts between the two feet, a balancing act nobody assigned but the body performs anyway. — core principle
- **grounding-028**: After a heavy bag is set down, the arm still expects the weight for a few seconds, a lightness that briefly registers as wrong. — core principle
- **grounding-029**: A pulse is moving through the wrist right now, small and steady, doing the same job it has done every second since before you could count. — core principle
- **grounding-030**: Chewing sounds louder inside your own head than it would to anyone across the table, a private volume the jaw broadcasts only to itself. — core principle
- **grounding-031**: A faint chemical taste from toothpaste can still be sitting on the tongue hours later, quietly changing how everything else tastes without being noticed as its own flavor. — core principle
- **grounding-032**: The floor underfoot has its own temperature, cooler or warmer than the air in the room, registering on the soles the whole time you were looking elsewhere. — core principle
- **grounding-033**: A cold glass sweats in the hand before the mind registers that the drink is cold, water gathering on the outside faster than thought can name it. — core principle
- **grounding-034**: The feet know the height of a familiar staircase before the eyes check it, and stumble is what happens on the one step that is different. — core principle
- **grounding-035**: In a truly quiet room, the ears manufacture their own faint ringing, a sound the body makes for itself when nothing else fills in the silence. — core principle


## Shifts (retired in v1.12, replaced by Journal prompts below)

Kept in full below as the historical record of this pool's authoring/QA work (real editorial
decisions — duplicate cognitive moves caught and reworded, two near-verbatim-quote risks
found and fixed) even though the `shifts` data no longer ships in `cards.json`. Live feedback
called the Shift card "not so helpful"; retired in favor of Journal, a mindful reflection
prompt — see the new "Journal prompts" section immediately after this one.

- **shift-001**: Proving I belong → Deciding what is worth building
- **shift-002**: Clearing the inbox → Choosing what earns a reply
  - ⚑ v1.7 Fable audit: original resolution ("Finishing one thing that matters") nearly duplicated shift-001's resolution in spirit. Reworded to keep the inbox-clearing frame while naming a judgment being exercised, not a productivity outcome. See `audits/decisions.md`.
- **shift-003**: Reacting to the day → Writing the day before it starts
- **shift-004**: More hours → Fewer, sharper commitments
- **shift-005**: What could go wrong → What I would do next
- **shift-006**: Being right → Getting it right
- **shift-007**: Counting outcomes → Counting reps
- **shift-008**: Waiting to feel ready → Starting the smallest true step
- **shift-009**: Managing impressions → Managing attention
- **shift-010**: Someday → A date on the calendar
- **shift-011**: Winning the argument → Understanding the other person
- **shift-012**: Spending what is left → Saving before you spend
- **shift-013**: I cannot do this → I cannot do this yet
- **shift-014**: Wishing the past were different → Working with what is now
- **shift-015**: Living for the weekend → Noticing this actual day
- **shift-016**: Multitasking through the morning → Single-tasking one block at a time
- **shift-017**: Keeping score with people → Keeping trust with people
- **shift-018**: Chasing a bigger salary → Lowering your fixed costs
- **shift-019**: Hiding my mistakes → Studying my mistakes
- **shift-020**: Craving other people's approval → Trusting your own judgment
- **shift-021**: Replaying yesterday's conversation → Attending to this one
- **shift-022**: Checking the phone reflexively → Checking it on a schedule
- **shift-023**: Assuming they know you appreciate them → Saying it out loud today
  - ⚑ Duplicate cognitive move vs shift-039: original (Talking to be heard / Listening to understand them) and shift-039 (Half-listening while you plan your reply / Fully listening before you respond) both just restate 'stop focusing on yourself, listen to understand' during conversation. Rewrote shift-023 to a distinct relational move (proactively expressing appreciation instead of assuming it's known) so it no longer overlaps with shift-039 and adds theme variety.
- **shift-024**: Net income → Net worth
- **shift-025**: Comparing yourself to others → Measuring growth against your own past
  - ⚑ The 'to' side (Comparing yourself to yesterday) read close enough in substance to the widely circulated quote 'Don't compare yourself to others, compare yourself to who you were yesterday' that it risked being a quotation rather than an original paraphrase. Reworded to 'Measuring growth against your own past' to keep the same idea in clearly different words.
- **shift-026**: Expecting the day to go as planned → Adjusting the plan as things change
  - ⚑ Duplicate cognitive move vs shift-014: original (Demanding the day go smoothly / Meeting the day as it is) and shift-014 (Wishing the past were different / Working with what is now) are the same Stoic-acceptance move ('stop wishing/demanding reality were different, accept it') just applied to two different objects (today vs the past). Rewrote shift-026 as an adaptive-planning move (adjusting the plan as things change) which is genuinely distinct and also reduces over-clustering on the acceptance theme (which already includes shift-014, shift-029, shift-032, shift-038).
- **shift-027**: Eating while scrolling → Eating while tasting the food
- **shift-028**: Working from a to-do list → Working from a time-blocked calendar
- **shift-029**: Fixing what is wrong with someone → Accepting the person as they are
- **shift-030**: Buying things to look successful → Buying assets that produce income
- **shift-031**: Avoiding the hard problem → Seeking the right amount of difficulty
- **shift-032**: Blaming the situation → Examining your own reaction
- **shift-033**: Rehearsing tomorrow's conversation → Finishing today's conversation first
- **shift-034**: Consuming more information → Producing more work
- **shift-035**: Assuming you know their reasons → Asking what actually happened
- **shift-036**: Relying on a single paycheck → Diversifying where income comes from
  - ⚑ The 'to' side (Making money work for you) reads as a near-verbatim match to the well-known personal-finance maxim ('make your money work for you', central to Kiyosaki-style teaching) -- close enough to substance-quote it. Also overlapped conceptually with shift-030 (buying income-producing assets). Rewrote to a distinct wealth facet: income-source diversification (Relying on a single paycheck / Diversifying where income comes from), in original wording.
- **shift-037**: Avoiding harsh feedback → Requesting the harshest feedback
- **shift-038**: Resenting the traffic jam → Using the wait to think
- **shift-039**: Half-listening while you plan your reply → Fully listening before you respond
- **shift-040**: Reacting to every request → Protecting one deep work block

## Journal prompts (added v1.12, replaces Shifts above)

Retires the Shift card (a "From X → To Y" reframe, present since v1.0) in favor of a mindful
reflection prompt, after live feedback that Shift "seems to be not so helpful." Each entry is
one open-ended question meant to be actually sat with — second person, concrete, no yes/no
questions. All 40 were pre-validated against `verify.mjs`'s exact word-cap (≤25w, raised from
Shift's 8w since a real question needs more room)/quote-glyph/platitude rules before writing.
No independent second-pass QA review was run beyond that mechanical validation — these are
original questions, not paraphrases of a named thinker's ideas, so there's no attribution-
confidence or closeness-to-source risk the way anchors carry.

- **journal-01**: What's one thing you're avoiding right now, and what is it costing you to keep avoiding it?
- **journal-02**: Where did you feel most like yourself this week, and what made that moment different?
- **journal-03**: What would you do today if you trusted yourself completely?
- **journal-04**: Which relationship in your life needs more attention than you've been giving it?
- **journal-05**: What's a belief about yourself you've outgrown but still act on?
- **journal-06**: If today were the only chance to say something to someone you love, what would you say?
- **journal-07**: What's the smallest true step you could take on the thing you keep postponing?
- **journal-08**: What did you learn this month that changed how you see something?
- **journal-09**: Where in your life are you choosing comfort over growth?
- **journal-10**: What would you forgive yourself for if no one else needed to know?
- **journal-11**: What's one assumption about your future you've never actually questioned?
- **journal-12**: Who in your life deserves a thank you they haven't received yet?
- **journal-13**: What does your ideal ordinary Tuesday actually look like?
- **journal-14**: What's something you did today purely because you wanted to, not because you had to?
- **journal-15**: Where are you spending energy on something that no longer matters to you?
- **journal-16**: What would change if you stopped waiting for permission to start?
- **journal-17**: What's a fear you've been treating as a fact?
- **journal-18**: If you described today to your future self, what would you want to be proud of?
- **journal-19**: What's one habit that quietly shapes more of your life than you realize?
- **journal-20**: Who taught you something important without knowing they were teaching you?
- **journal-21**: What are you tolerating that you have the power to change?
- **journal-22**: When did you last do something difficult and feel glad afterward?
- **journal-23**: What's the story you tell yourself about why you can't, and is it still true?
- **journal-24**: Where do you feel busy but not actually productive?
- **journal-25**: What would you attempt if failing at it cost you nothing?
- **journal-26**: What's a conversation you've been putting off, and what's really stopping you?
- **journal-27**: What does enough look like for you, specifically?
- **journal-28**: What part of your day do you rush through that deserves more attention?
- **journal-29**: What's something you used to love doing that quietly disappeared from your life?
- **journal-30**: Whose opinion of you do you weigh more than it deserves?
- **journal-31**: What would you do differently this week if you knew it would be remembered?
- **journal-32**: What's a small discomfort you've been avoiding that would probably teach you something?
- **journal-33**: Where in your life do you already have enough, but act like you don't?
- **journal-34**: What did today ask of you that yesterday didn't?
- **journal-35**: What's something you're proud of that you've never told anyone?
- **journal-36**: If your stress had a message for you, what would it be trying to say?
- **journal-37**: What's one thing you can simplify this week without losing anything that matters?
- **journal-38**: Who do you need to stop comparing yourself to?
- **journal-39**: What would it look like to trust the process instead of needing the outcome now?
- **journal-40**: What's the kindest thing you did today, and did you notice it at the time?

## Word of the Day (added v1.10, replaces the Fresh reserve/offline-fallback pool)

Retires the Fresh card entirely (a daily RSS/YouTube pick, disliked in live feedback) in favor
of a self-authored, deterministic third card: one word worth knowing, its origin, and a
one-line sense of its meaning (not a lifted dictionary definition). All 30 entries were
pre-validated against `verify.mjs`'s exact word-cap (≤20w meaning)/quote-glyph/platitude rules
before writing, via a throwaway Node script reimplementing those checks. **v1.11 addendum:**
each entry also carries a `lang` BCP-47 tag (mapped 1:1 from `origin` below, e.g. Japanese →
`ja-JP`) feeding the new pronunciation button's `SpeechSynthesisUtterance.lang` — see
`decisions.md`'s v1.11 entry for the full origin→lang mapping table. No independent QA
pass was run beyond that mechanical validation — these are single-word etymological/
philosophical concepts, not paraphrases of a named thinker's ideas, so the attribution-
confidence and closeness-to-source concerns that drive the anchors' second-pass review don't
apply the same way here.

- **word-01** — Wabi-sabi (Japanese): Finding beauty in what is imperfect, weathered, and incomplete.
- **word-02** — Ikigai (Japanese): The reason you get up in the morning, where purpose meets daily life.
- **word-03** — Amor fati (Latin): Loving your fate entirely, including the parts you did not choose.
- **word-04** — Ubuntu (Nguni): I am because we are; a self formed through community, not apart from it.
- **word-05** — Hygge (Danish): A deliberate, unhurried coziness, usually shared with people you trust.
- **word-06** — Sisu (Finnish): Quiet, stubborn resolve that keeps going once willpower alone runs out.
- **word-07** — Meraki (Greek): Doing something with so much soul that a piece of you ends up in it.
- **word-08** — Saudade (Portuguese): A wistful longing for something absent, held without needing it resolved.
- **word-09** — Komorebi (Japanese): Sunlight filtering through leaves, dappling the ground beneath a tree.
- **word-10** — Waldeinsamkeit (German): The particular solitude of standing alone among trees.
- **word-11** — Lagom (Swedish): Not too much, not too little; exactly enough.
- **word-12** — Ataraxia (Greek): A settled calm, free of disturbance and anxious craving alike.
- **word-13** — Eudaimonia (Greek): A life that flourishes because it is well lived, not merely a happy one.
- **word-14** — Apatheia (Stoic Greek): Freedom from being ruled by disordered passion, not an absence of feeling.
- **word-15** — Mono no aware (Japanese): A gentle sadness at the passing of things, aware that beauty is fleeting.
- **word-16** — Gemütlichkeit (German): Warmth and belonging, the feeling of being unhurried among friends.
- **word-17** — Kaizen (Japanese): Continuous improvement through many small, deliberate changes.
- **word-18** — Wu wei (Chinese): Effortless action that moves with circumstance instead of forcing it.
- **word-19** — Dharma (Sanskrit): The right conduct proper to who you are and the moment you are in.
- **word-20** — Satori (Japanese): A sudden flash of understanding that arrives outside ordinary reasoning.
- **word-21** — Filoxenia (Greek): Warmth extended to a stranger; hospitality treated as a form of love.
- **word-22** — Sprezzatura (Italian): Making something difficult look effortless, without calling attention to the effort.
- **word-23** — Duende (Spanish): A heightened, trembling passion that art can summon in whoever witnesses it.
- **word-24** — Tsundoku (Japanese): Acquiring books faster than you read them, and letting them wait.
- **word-25** — Fernweh (German): An ache for a distant place you have never actually seen.
- **word-26** — Ren (Confucian Chinese): Benevolence toward others, treated as the root of genuine character.
- **word-27** — Shibumi (Japanese): Understated, effortless elegance; beauty that does not ask to be noticed.
- **word-28** — Metanoia (Greek): A change of heart that reorders what you value, not just what you think.
- **word-29** — Sophrosyne (Greek): A disciplined self-awareness that keeps every impulse in proportion.
- **word-30** — Firgun (Hebrew): Unselfish delight in someone else's good fortune, with no envy attached.

## Values

Cut from 10 to 5 in v1.2 per live human feedback (ten read as a checklist, not a short list of
what actually matters). The 5 shipped values:

- **Consistency**: Show up on the scheduled day, especially the unremarkable ones. — *The habit happens on its calendar day, inspired or not.*
- **Ownership**: If it lands on you, it is yours to move. — *Fixes the small broken thing instead of just mentioning it.*
- **Patience**: Let compounding do the heavy lifting. — *Holds the position through the boring middle without checking hourly.*
- **Focus**: One thing, protected, finished. — *Phone sits in another room during the deep work block.*
- **Presence**: Be where your feet are. — *Puts the phone face down and asks the second question.*

Cut (were always marked "reserve, held back for later curation" in the source content — not a
new deletion, just never promoted): Courage under visibility, Temperance, Honesty with self,
Long-game relationships, Health as the base asset.
