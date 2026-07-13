#!/usr/bin/env node
// scripts/generate-daily.mjs — the daily pipeline (BUILD-PLAN.md §7)
// Run locally as: NODE_USE_ENV_PROXY=1 node scripts/generate-daily.mjs
// (GitHub Actions runners need no flag — no proxy there.)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hktDateString, hktDayNumber, pickIndex } from "../lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Resolved and identity-verified in Stage 4 (see audits/decisions.md) — Rob Dial's feed via
// the Apple Podcasts Search API, Ali Abdaal's channel ID via the canonical <link>/og:url on
// the handle page (not the first bare "channelId" string match, which pointed elsewhere).
const SOURCES = [
  { source: "Daily Stoic", url: "https://dailystoic.com/feed/" },
  { source: "Farnam Street", url: "https://fs.blog/feed/" },
  { source: "Huberman Lab", url: "https://feeds.megaphone.fm/hubermanlab" },
  { source: "The Mindset Mentor", url: "https://feeds.simplecast.com/rpKQEwel" },
  { source: "Ali Abdaal", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCoOae5nYA7VqaXzerajD0lg" },
];

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Minimal regex parse of the first <item> (RSS) or <entry> (Atom) — no XML libraries
// (invariant 4). Only accepts https:// links, per the fresh-card safety requirement (§6.1).
function parseFirstItem(xml) {
  const block = (xml.match(/<item\b[\s\S]*?<\/item>/i) || xml.match(/<entry\b[\s\S]*?<\/entry>/i) || [])[0];
  if (!block) return null;

  const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) return null;
  const title = decodeEntities(titleMatch[1]);
  if (!title) return null;

  let link = null;
  const linkTextMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (linkTextMatch && /^https:\/\//.test(linkTextMatch[1].trim())) {
    link = linkTextMatch[1].trim();
  } else {
    const linkHrefMatch = block.match(/<link\b[^>]*\bhref=["'](https:\/\/[^"']+)["'][^>]*\/?>/i);
    if (linkHrefMatch) link = linkHrefMatch[1];
  }
  if (!link) return null;

  const dateMatch =
    block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
    block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
    block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
  if (!dateMatch) return null;
  const publishedDate = new Date(dateMatch[1].trim());
  if (Number.isNaN(publishedDate.getTime())) return null;

  return { title, url: link, publishedISO: publishedDate.toISOString() };
}

async function main() {
  const now = new Date();
  const dateHKT = hktDateString(now);
  const dayNumber = hktDayNumber(now);

  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, "data/cards.json"), "utf8"));
  const anchor = cards.anchors[pickIndex(cards.anchors.length, dayNumber, "anchor")];
  const shift = cards.shifts[pickIndex(cards.shifts.length, dayNumber, "shift")];

  const historyPath = path.join(ROOT, "state/fresh-history.json");
  let history = [];
  if (fs.existsSync(historyPath)) {
    try { history = JSON.parse(fs.readFileSync(historyPath, "utf8")); } catch (e) { history = []; }
  }
  // Exclude today's own (possibly already-upserted, from an earlier same-day run) entry when
  // computing "recently used" sources — otherwise a same-day re-run sees today's own prior pick
  // as recent-to-avoid and flips the Fresh pick every time it re-runs, which is not idempotent.
  const priorHistory = history.filter((h) => h.dateHKT !== dateHKT);
  const recentSources = new Set(priorHistory.slice(-3).map((h) => h.source).filter(Boolean));

  const candidates = [];
  for (const { source, url } of SOURCES) {
    try {
      const xml = await fetchWithTimeout(url, 8000);
      const item = parseFirstItem(xml);
      if (!item) { console.log(`[generate-daily] ${source}: no parseable item, skipping`); continue; }
      const ageMs = now.getTime() - new Date(item.publishedISO).getTime();
      if (ageMs > 14 * 24 * 3600 * 1000 || ageMs < -3600 * 1000) {
        console.log(`[generate-daily] ${source}: item outside 14-day window (${item.publishedISO}), skipping`);
        continue;
      }
      candidates.push({ source, ...item, preferred: !recentSources.has(source) });
      console.log(`[generate-daily] ${source}: candidate "${item.title}" (${item.publishedISO})`);
    } catch (e) {
      console.log(`[generate-daily] ${source}: fetch/parse failed — ${e.message}`);
    }
  }

  let fresh = null;
  if (candidates.length) {
    const preferred = candidates.filter((c) => c.preferred);
    const pool = preferred.length ? preferred : candidates;
    pool.sort((a, b) => new Date(b.publishedISO) - new Date(a.publishedISO));
    const pick = pool[0];
    fresh = { title: pick.title, url: pick.url, source: pick.source, publishedISO: pick.publishedISO };
  } else {
    console.log("[generate-daily] no source produced a valid candidate — fresh: null (this is a supported outcome)");
  }

  const daily = {
    version: 1,
    dateHKT,
    generatedAtISO: now.toISOString(),
    anchorId: anchor.id,
    shiftId: shift.id,
    fresh,
  };
  fs.writeFileSync(path.join(ROOT, "data/daily.json"), JSON.stringify(daily, null, 2) + "\n");

  // Upsert (not append) by dateHKT so a same-day re-run — which Stage 4 performs once locally
  // and once via the dispatched workflow — is genuinely idempotent (§7 step 4).
  history = history.filter((h) => h.dateHKT !== dateHKT);
  history.push({ dateHKT, source: fresh ? fresh.source : null });
  history = history.slice(-7);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");

  console.log(`[generate-daily] wrote daily.json for ${dateHKT} — fresh: ${fresh ? fresh.source : "null"}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("[generate-daily] unexpected failure:", e); process.exit(1); });
