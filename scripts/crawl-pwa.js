#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sources } from "./pwa-sources.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../data/pwa.json");
const CONCURRENCY = 5;
const REQUEST_TIMEOUT = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function findManifestHref(html) {
  // Match <link rel="manifest" href="..."> with flexible attribute ordering
  const patterns = [
    /<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']manifest["'][^>]*\/?>/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function resolveUrl(base, href) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function pickBestIcon(icons, baseUrl) {
  if (!icons || !icons.length) return null;

  // Prefer larger icons (192 or 512), fall back to whatever is available
  const sorted = [...icons].sort((a, b) => {
    const sizeA = parseInt(a.sizes?.split("x")[0]) || 0;
    const sizeB = parseInt(b.sizes?.split("x")[0]) || 0;
    return sizeB - sizeA;
  });

  const src = sorted[0]?.src;
  if (!src) return null;
  return resolveUrl(baseUrl, src);
}

// ---------------------------------------------------------------------------
// Core checker
// ---------------------------------------------------------------------------

async function checkPwa(url) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const manifestHref = findManifestHref(html);
  if (!manifestHref) throw new Error("No manifest link found");

  const manifestUrl = resolveUrl(url, manifestHref);
  if (!manifestUrl) throw new Error("Invalid manifest URL");

  const mRes = await fetchWithTimeout(manifestUrl);
  if (!mRes.ok) throw new Error(`Manifest HTTP ${mRes.status}`);

  const text = await mRes.text();
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch {
    throw new Error("Manifest is not valid JSON");
  }

  const title = manifest.name || manifest.short_name;
  if (!title) throw new Error("Manifest has no name");

  const icon = pickBestIcon(manifest.icons, manifestUrl);
  if (!icon) throw new Error("Manifest has no usable icon");

  const entry = { title, link: url, icon };
  if (manifest.short_name && manifest.short_name !== title) {
    entry.short_name = manifest.short_name;
  }
  if (manifest.description) {
    entry.description = manifest.description;
  }

  return entry;
}

// ---------------------------------------------------------------------------
// Concurrency pool
// ---------------------------------------------------------------------------

async function runPool(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const existing = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const knownDomains = new Set(existing.map((e) => getDomain(e.link)));

  // Deduplicate sources themselves by domain, then filter against existing
  const seen = new Set();
  const candidates = [];
  for (const url of sources) {
    const domain = getDomain(url);
    if (knownDomains.has(domain) || seen.has(domain)) continue;
    seen.add(domain);
    candidates.push(url);
  }

  console.log(
    `Found ${candidates.length} new candidates (${sources.length} total sources, ${existing.length} existing entries)\n`
  );

  if (candidates.length === 0) {
    console.log("Nothing new to check.");
    return;
  }

  const newEntries = [];
  let okCount = 0;
  let failCount = 0;

  const tasks = candidates.map((url, i) => async () => {
    const label = `[${i + 1}/${candidates.length}]`;
    const domain = getDomain(url);
    try {
      const entry = await checkPwa(url);
      newEntries.push(entry);
      okCount++;
      console.log(`${label} ${domain} ... OK  "${entry.title}"`);
    } catch (err) {
      failCount++;
      console.log(`${label} ${domain} ... FAIL  ${err.message}`);
    }
  });

  await runPool(tasks, CONCURRENCY);

  console.log("");
  console.log("--- Summary ---");
  console.log(`Checked: ${candidates.length}  |  OK: ${okCount}  |  Failed: ${failCount}`);
  console.log(`newEntries collected: ${newEntries.length}`);

  if (newEntries.length === 0) {
    console.log("No new PWAs found.");
    return;
  }

  // Deduplicate new entries by domain (e.g. typo pinterst.com -> pinterest.com)
  const seenNew = new Set();
  const deduped = [];
  for (const entry of newEntries) {
    const domain = getDomain(entry.link);
    if (!seenNew.has(domain)) {
      seenNew.add(domain);
      deduped.push(entry);
    }
  }

  const merged = [...existing, ...deduped];
  console.log(`Writing ${deduped.length} new entries to ${DATA_PATH}`);
  writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  console.log(`Done. Total: ${merged.length} entries in data/pwa.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
