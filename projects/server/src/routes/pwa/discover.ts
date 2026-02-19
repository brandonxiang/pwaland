import { FastifyInstance } from 'fastify';
import { fail, success } from '../../utils';
import { checkPwa, PwaCheckResponse } from '../../services/pwa-checker';
import { checkDuplicate, addPwaToNotion } from '../../services/pwa-store';
import { fetchTranco, fetchAwesomePwa, mergeAndDeduplicate } from '../../services/domain-sources';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to save intermediate results
const RESULTS_DIR = path.join(__dirname, '..', '..', '..', 'data');
const RESULTS_FILE = path.join(RESULTS_DIR, 'discover-results.json');

interface DiscoverBody {
  source: 'tranco' | 'github' | 'all';
  limit?: number;
  offset?: number;
  concurrency?: number;
  dryRun?: boolean;
}

interface DiscoverResult {
  domain: string;
  isPwa: boolean;
  added: boolean;
  skipped: boolean;
  error?: string;
  title?: string;
}

interface DiscoverSummary {
  source: string;
  totalDomains: number;
  checked: number;
  found: number;
  added: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
  results: DiscoverResult[];
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save results to disk for persistence
 */
function saveResults(summary: DiscoverSummary): void {
  try {
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    // Append to existing results or create new file
    let existing: DiscoverSummary[] = [];
    if (fs.existsSync(RESULTS_FILE)) {
      try {
        const raw = fs.readFileSync(RESULTS_FILE, 'utf-8');
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }

    existing.push({
      ...summary,
      // Only keep found PWAs in the saved file to save space
      results: summary.results.filter(r => r.isPwa),
    });

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error('Failed to save discover results:', err);
  }
}

/**
 * Process a single domain: check PWA, dedup, optionally insert to Notion
 */
async function processDomain(
  domain: string,
  dryRun: boolean,
  logger: { info: (...args: any[]) => void; error: (...args: any[]) => void },
): Promise<DiscoverResult> {
  const result: DiscoverResult = {
    domain,
    isPwa: false,
    added: false,
    skipped: false,
  };

  try {
    const check: PwaCheckResponse = await checkPwa(domain);
    result.isPwa = check.isPwa;

    if (!check.isPwa) {
      return result;
    }

    result.title = check.suggestion.title;
    logger.info(`Found PWA: ${check.suggestion.title} (${domain})`);

    if (dryRun) {
      result.skipped = true;
      return result;
    }

    // Check for duplicates before inserting
    const link = check.suggestion.link;
    const exists = await checkDuplicate(link);

    if (exists) {
      result.skipped = true;
      logger.info(`Skipped duplicate: ${link}`);
      return result;
    }

    // Only insert if we have a valid title and icon
    if (!check.suggestion.title || !check.suggestion.icon) {
      result.skipped = true;
      logger.info(`Skipped (missing title or icon): ${domain}`);
      return result;
    }

    await addPwaToNotion({
      title: check.suggestion.title,
      link: check.suggestion.link,
      icon: check.suggestion.icon,
      description: check.suggestion.description,
      tags: ['Auto-discovered'],
    });

    result.added = true;
    logger.info(`Added to Notion: ${check.suggestion.title}`);
  } catch (err: any) {
    result.error = err.message;
  }

  return result;
}

export default (fastify: FastifyInstance, _: any, done: any) => {
  fastify.post<{
    Body: DiscoverBody;
  }>('/discover', {
    schema: {
      body: {
        type: 'object',
        required: ['source'],
        properties: {
          source: { type: 'string', enum: ['tranco', 'github', 'all'] },
          limit: { type: 'number', default: 500 },
          offset: { type: 'number', default: 0 },
          concurrency: { type: 'number', default: 3 },
          dryRun: { type: 'boolean', default: false },
        },
      },
    },
  }, async (req, res) => {
    const {
      source,
      limit = 500,
      offset = 0,
      concurrency = 3,
      dryRun = false,
    } = req.body;

    const logger = fastify.log;

    try {
      // Step 1: Fetch domains from selected source(s)
      logger.info(`Starting PWA discovery: source=${source}, limit=${limit}, offset=${offset}, concurrency=${concurrency}, dryRun=${dryRun}`);

      const domainLists: string[][] = [];

      if (source === 'tranco' || source === 'all') {
        logger.info('Fetching Tranco domain list...');
        try {
          const trancoDomains = await fetchTranco(limit + offset);
          domainLists.push(trancoDomains);
          logger.info(`Fetched ${trancoDomains.length} domains from Tranco`);
        } catch (err: any) {
          logger.error(`Failed to fetch Tranco: ${err.message}`);
        }
      }

      if (source === 'github' || source === 'all') {
        logger.info('Fetching GitHub awesome-pwa lists...');
        try {
          const githubDomains = await fetchAwesomePwa();
          domainLists.push(githubDomains);
          logger.info(`Fetched ${githubDomains.length} domains from GitHub`);
        } catch (err: any) {
          logger.error(`Failed to fetch GitHub sources: ${err.message}`);
        }
      }

      if (domainLists.length === 0 || domainLists.every(l => l.length === 0)) {
        return res.send(fail('No domains could be fetched from any source'));
      }

      // Step 2: Merge and deduplicate
      const allDomains = mergeAndDeduplicate(...domainLists);
      logger.info(`Total unique domains after merge: ${allDomains.length}`);

      // Step 3: Slice by offset and limit
      const domainsToCheck = allDomains.slice(offset, offset + limit);
      logger.info(`Checking ${domainsToCheck.length} domains (offset=${offset}, limit=${limit})`);

      // Step 4: Process in batches with concurrency and rate limiting
      const summary: DiscoverSummary = {
        source,
        totalDomains: allDomains.length,
        checked: 0,
        found: 0,
        added: 0,
        skipped: 0,
        failed: 0,
        dryRun,
        results: [],
      };

      for (let i = 0; i < domainsToCheck.length; i += concurrency) {
        const batch = domainsToCheck.slice(i, i + concurrency);

        // Process batch concurrently using Promise.allSettled
        const batchResults = await Promise.allSettled(
          batch.map(domain => processDomain(domain, dryRun, logger))
        );

        for (const settled of batchResults) {
          if (settled.status === 'fulfilled') {
            const result = settled.value;
            summary.results.push(result);
            summary.checked++;

            if (result.isPwa) summary.found++;
            if (result.added) summary.added++;
            if (result.skipped) summary.skipped++;
            if (result.error) summary.failed++;
          } else {
            summary.checked++;
            summary.failed++;
            summary.results.push({
              domain: batch[0] || 'unknown',
              isPwa: false,
              added: false,
              skipped: false,
              error: settled.reason?.message || 'Unknown error',
            });
          }
        }

        // Log progress every batch
        const progress = Math.min(i + concurrency, domainsToCheck.length);
        logger.info(`Progress: ${progress}/${domainsToCheck.length} checked, ${summary.found} PWAs found, ${summary.added} added`);

        // Save intermediate results every 10 batches
        if ((i / concurrency) % 10 === 0 && i > 0) {
          saveResults(summary);
        }

        // Rate limit: wait between batches (skip for the last batch)
        if (i + concurrency < domainsToCheck.length) {
          await sleep(1500);
        }
      }

      // Step 5: Save final results
      saveResults(summary);

      logger.info(`Discovery complete: ${summary.checked} checked, ${summary.found} found, ${summary.added} added, ${summary.skipped} skipped, ${summary.failed} failed`);

      return res.send(success({
        totalDomains: summary.totalDomains,
        checked: summary.checked,
        found: summary.found,
        added: summary.added,
        skipped: summary.skipped,
        failed: summary.failed,
        dryRun: summary.dryRun,
        // Only return found PWAs in the response to keep it manageable
        foundPwas: summary.results.filter(r => r.isPwa).map(r => ({
          domain: r.domain,
          title: r.title,
          added: r.added,
          skipped: r.skipped,
        })),
      }));
    } catch (err: any) {
      logger.error(err, 'PWA discovery failed');
      return res.send(fail(`Discovery failed: ${err.message}`));
    }
  });

  done();
};
