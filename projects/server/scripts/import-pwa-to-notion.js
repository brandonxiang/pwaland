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

async function checkDuplicate(link) {
  const response = await notion.databases.query({
    database_id: PWADatabaseId,
    filter: {
      property: 'link',
      url: {
        equals: link,
      },
    },
  });
  return response.results.length > 0;
}

async function addPwaToNotion(data) {
  const { title, link, icon, description, tags } = data;

  const multiSelect = (tags && tags.length > 0)
    ? tags.map(name => ({ name }))
    : [{ name: 'Imported' }];

  const response = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: PWADatabaseId,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      link: {
        type: 'url',
        url: link,
      },
      icon: {
        type: 'url',
        url: icon,
      },
      description: {
        type: 'rich_text',
        rich_text: [
          {
            text: {
              content: description || '',
            },
          },
        ],
      },
      tags: {
        type: 'multi_select',
        multi_select: multiSelect,
      },
    },
  });

  return { id: response.id };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const concurrency = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '3', 10);

  const pwaJsonPath = path.join(__dirname, '..', '..', '..', 'data', 'pwa.json');
  const raw = await readFile(pwaJsonPath, 'utf-8');
  const pwas = JSON.parse(raw);

  console.log(`Found ${pwas.length} PWAs in pwa.json`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log('---');

  const summary = {
    total: pwas.length,
    added: 0,
    skipped: 0,
    failed: 0,
  };

  for (let i = 0; i < pwas.length; i += concurrency) {
    const batch = pwas.slice(i, i + concurrency);

    const results = await Promise.allSettled(
      batch.map(async (pwa) => {
        const { title, link, icon, description, short_name } = pwa;

        if (!title || !link || !icon) {
          console.log(`[SKIP] Missing required fields: ${title || link || 'unknown'}`);
          return { status: 'skipped', reason: 'missing_fields' };
        }

        try {
          const exists = await checkDuplicate(link);
          if (exists) {
            console.log(`[SKIP] Duplicate: ${title} (${link})`);
            return { status: 'skipped', reason: 'duplicate' };
          }

          if (dryRun) {
            console.log(`[DRY RUN] Would add: ${title} (${link})`);
            return { status: 'dry_run' };
          }

          await addPwaToNotion({
            title,
            link,
            icon,
            description,
            tags: ['Imported'],
          });

          console.log(`[ADDED] ${title} (${link})`);
          return { status: 'added' };
        } catch (err) {
          console.error(`[ERROR] ${title}: ${err.message}`);
          return { status: 'failed', error: err.message };
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { status } = result.value;
        if (status === 'added') summary.added++;
        else if (status === 'skipped' || status === 'dry_run') summary.skipped++;
        else if (status === 'failed') summary.failed++;
      } else {
        summary.failed++;
      }
    }

    const progress = Math.min(i + concurrency, pwas.length);
    console.log(`--- Progress: ${progress}/${pwas.length} ---`);

    if (i + concurrency < pwas.length) {
      await sleep(500);
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Total: ${summary.total}`);
  console.log(`Added: ${summary.added}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
