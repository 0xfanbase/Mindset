#!/usr/bin/env node
// scripts/generate-daily.mjs — the daily pipeline (BUILD-PLAN.md §7)
// Run locally as: NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs
// (GitHub Actions runners need no flag — no proxy there.)
//
// v1.10: the third card (Fresh, an external RSS pick) was replaced with Word of the Day,
// a deterministic pick from cards.json's own wordOfDay pool — same rotation mechanism as
// anchor/shift. There is no longer anything to fetch over the network; this script just
// stamps today's three picks and a generatedAtISO timestamp, which the client compares
// against to detect a stale/un-deployed daily.json (the staleness chip, §4.5.4).
// v1.12: the second card (Shift, a from->to reframe) was replaced with a mindful Journal
// prompt, same deterministic pool-rotation approach.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hktDateString, hktDayNumber, pickIndex } from "../lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function main() {
  const now = new Date();
  const dateHKT = hktDateString(now);
  const dayNumber = hktDayNumber(now);

  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, "data/cards.json"), "utf8"));
  const anchor = cards.anchors[pickIndex(cards.anchors.length, dayNumber, "anchor")];
  const journal = cards.journal[pickIndex(cards.journal.length, dayNumber, "journal")];
  const word = cards.wordOfDay[pickIndex(cards.wordOfDay.length, dayNumber, "word")];

  const daily = {
    version: 1,
    dateHKT,
    generatedAtISO: now.toISOString(),
    anchorId: anchor.id,
    journalId: journal.id,
    wordId: word.id,
  };
  fs.writeFileSync(path.join(ROOT, "data/daily.json"), JSON.stringify(daily, null, 2) + "\n");
  console.log(`[generate-daily] wrote daily.json for ${dateHKT}`);
}

try {
  main();
  process.exit(0);
} catch (e) {
  console.error("[generate-daily] unexpected failure:", e);
  process.exit(1);
}
