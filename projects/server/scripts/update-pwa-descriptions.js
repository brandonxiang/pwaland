#!/usr/bin/env node

import { Client } from '@notionhq/client';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PWADatabaseId = 'a39d3843c07f43cfa79c43ff7cf88c47';
const notionApiKey = 'secret_G3MTRaQ29phFKeohjPVzQTfdhS7m841NgUqtRpmMWyw';

const notion = new Client({
  auth: notionApiKey,
});

function isEnglish(text) {
  if (!text || text.trim() === '') return true;
  const englishPattern = /^[a-zA-Z0-9\s\-.,!?()'":;%$/@#&*+=<>[\]{}|^~`\\u00C0-\u024F]+$/;
  return englishPattern.test(text);
}

function isEmptyOrHelloOrNonEnglish(description) {
  if (!description || description.trim() === '') return true;
  const lower = description.toLowerCase().trim();
  if (lower === 'hello') return true;
  if (!isEnglish(description)) return true;
  return false;
}

function generateDescription(title, fetchedDescription) {
  if (fetchedDescription && isEnglish(fetchedDescription)) {
    return fetchedDescription;
  }
  return `${title} is a powerful web application offering excellent functionality and user experience.`;
}

async function fetchSeoDescription(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();

    const patterns = [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  } catch (err) {
    console.log(`  [WARN] Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

async function fetchAllPWAs() {
  const allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: PWADatabaseId,
      start_cursor: startCursor,
      page_size: 100,
    });

    allResults.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allResults.map(page => {
    const props = page.properties;
    const title = props.title?.title?.[0]?.plain_text || '';
    const link = props.link?.url || '';
    const description = props.description?.rich_text?.[0]?.plain_text || '';

    return {
      id: page.id,
      title,
      link,
      description,
    };
  });
}

async function updateDescription(pageId, newDescription) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      description: {
        type: 'rich_text',
        rich_text: [
          {
            text: {
              content: newDescription,
            },
          },
        ],
      },
    },
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const concurrency = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '3', 10);

  console.log('Fetching PWAs from Notion...');
  const pwas = await fetchAllPWAs();
  console.log(`Found ${pwas.length} PWAs in Notion`);

  const needUpdate = pwas.filter(pwa => isEmptyOrHelloOrNonEnglish(pwa.description));
  console.log(`Found ${needUpdate.length} PWAs with empty/hello/non-English descriptions`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log('---');

  if (needUpdate.length === 0) {
    console.log('No PWAs need description update!');
    return;
  }

  const summary = {
    total: needUpdate.length,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  for (let i = 0; i < needUpdate.length; i += concurrency) {
    const batch = needUpdate.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(async (pwa) => {
        await sleep(1000);
        const seoDesc = await fetchSeoDescription(pwa.link);
        const newDescription = generateDescription(pwa.title, seoDesc);

        if (dryRun) {
          console.log(`[DRY RUN] Would update: ${pwa.title}`);
          console.log(`  Old: "${pwa.description}"`);
          console.log(`  Fetched SEO: "${seoDesc || 'none'}"`);
          console.log(`  New: "${newDescription}"`);
          return { status: 'dry_run' };
        }

        try {
          await updateDescription(pwa.id, newDescription);
          if (seoDesc) {
            console.log(`[UPDATED] ${pwa.title} (from SEO)`);
          } else {
            console.log(`[UPDATED] ${pwa.title} (fallback)`);
          }
          return { status: 'updated' };
        } catch (err) {
          console.error(`[ERROR] ${pwa.title}: ${err.message}`);
          return { status: 'failed', error: err.message };
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { status } = result.value;
        if (status === 'updated') summary.updated++;
        else if (status === 'dry_run') summary.skipped++;
        else if (status === 'failed') summary.failed++;
      } else {
        summary.failed++;
      }
    }

    const progress = Math.min(i + concurrency, needUpdate.length);
    console.log(`--- Progress: ${progress}/${needUpdate.length} ---`);

    if (i + concurrency < needUpdate.length) {
      await sleep(2000);
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Total needing update: ${summary.total}`);
  console.log(`Updated: ${summary.updated}`);
  console.log(`Skipped (dry run): ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
