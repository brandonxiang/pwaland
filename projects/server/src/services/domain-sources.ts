import { safeFetch } from './pwa-checker';

/**
 * Fetch top domains from the Tranco list.
 * Tranco provides a research-oriented top sites list: https://tranco-list.eu/
 * We use the latest list CSV which has format: rank,domain
 */
export async function fetchTranco(limit: number = 10000): Promise<string[]> {
  // Tranco provides a simple CSV download
  // Use the latest list from their download page
  try {
    // Fetch the main page to find the latest list
    const pageRes = await safeFetch('https://tranco-list.eu/');
    const pageHtml = await pageRes.text();

    // Try to extract list ID from the page
    // Tranco lists are typically in format: /list/XXXXX or /download/XXXXX
    let listId: string | null = null;
    const patterns = [
      /\/list\/([A-Z0-9]+)/i,
      /\/download\/([A-Z0-9]+)/i,
      /list_id["']?\s*[:=]\s*["']?([A-Z0-9]+)/i,
    ];

    for (const pattern of patterns) {
      const match = pageHtml.match(pattern);
      if (match?.[1]) {
        listId = match[1];
        break;
      }
    }

    // If we found a list ID, try to download it
    // Otherwise, use a fallback: top 10k domains from a known working endpoint
    let csvUrl: string;
    if (listId) {
      csvUrl = `https://tranco-list.eu/download_daily/${listId}/top-1m.csv`;
    } else {
      // Fallback: use a static top sites list (top 10k)
      // This is a simpler approach - use a known good source
      csvUrl = 'https://tranco-list.eu/download_daily/top-1m.csv';
    }

    console.log(`Fetching Tranco list from: ${csvUrl}`);

    const response = await safeFetch(csvUrl);
    if (!response.ok) {
      // If that fails, use a hardcoded list of top domains as fallback
      console.log(`Tranco CSV download failed (${response.status}), using fallback top domains`);
      return getFallbackTopDomains(limit);
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    const domains: string[] = [];
    for (const line of lines) {
      if (domains.length >= limit) break;

      const parts = line.split(',');
      // CSV format: rank,domain
      const domain = parts.length >= 2 ? parts[1]?.trim() : parts[0]?.trim();
      if (domain && domain.includes('.')) {
        domains.push(domain);
      }
    }

    console.log(`Fetched ${domains.length} domains from Tranco`);
    return domains.length > 0 ? domains : getFallbackTopDomains(limit);
  } catch (err: any) {
    console.error(`Failed to fetch Tranco list: ${err.message}, using fallback`);
    return getFallbackTopDomains(limit);
  }
}

/**
 * Fallback: return a hardcoded list of top domains for testing
 */
function getFallbackTopDomains(limit: number): string[] {
  const topDomains = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'wikipedia.org', 'yahoo.com', 'reddit.com', 'amazon.com', 'netflix.com',
    'microsoft.com', 'apple.com', 'linkedin.com', 'pinterest.com', 'tumblr.com',
    'ebay.com', 'paypal.com', 'github.com', 'stackoverflow.com', 'adobe.com',
    'spotify.com', 'twitch.tv', 'discord.com', 'zoom.us', 'slack.com',
    'notion.so', 'figma.com', 'canva.com', 'trello.com', 'asana.com',
  ];
  return topDomains.slice(0, Math.min(limit, topDomains.length));
}

/**
 * Fetch PWA URLs from GitHub awesome-pwa lists.
 * Parses markdown files for URLs.
 */
export async function fetchAwesomePwa(): Promise<string[]> {
  const sources = [
    'https://raw.githubusercontent.com/hemanth/awesome-pwa/refs/heads/master/README.md',
    'https://raw.githubusercontent.com/sandermangel/awesome-pwa-ecommerce/refs/heads/master/README.md',
    'https://raw.githubusercontent.com/hzzheng/awesome-pwa/refs/heads/master/README.md',
    'https://raw.githubusercontent.com/sundway/awesome-pwa/refs/heads/master/README.md',
    'https://raw.githubusercontent.com/nabil6391/awesome-pwa/refs/heads/master/README.md',
  ];

  const allUrls: Set<string> = new Set();

  for (const sourceUrl of sources) {
    try {
      const response = await safeFetch(sourceUrl);
      if (!response.ok) {
        console.log(`Skipping source ${sourceUrl}: HTTP ${response.status}`);
        continue;
      }

      const markdown = await response.text();
      const urls = extractUrlsFromMarkdown(markdown);
      urls.forEach(url => allUrls.add(url));
      console.log(`Extracted ${urls.length} URLs from ${sourceUrl}`);
    } catch (err: any) {
      console.log(`Failed to fetch ${sourceUrl}: ${err.message}`);
    }
  }

  console.log(`Total unique URLs from GitHub sources: ${allUrls.size}`);
  return Array.from(allUrls);
}

/**
 * Extract URLs from markdown content.
 * Looks for URLs in markdown links [text](url) and bare https:// URLs.
 */
function extractUrlsFromMarkdown(markdown: string): string[] {
  const urls: Set<string> = new Set();

  // Match markdown links: [text](https://...)
  const linkPattern = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = cleanUrl(match[2]);
    if (url && isValidAppUrl(url)) {
      urls.add(url);
    }
  }

  // Match bare URLs
  const bareUrlPattern = /(?<!\()(https?:\/\/[^\s<>\[\](),"']+)/g;
  while ((match = bareUrlPattern.exec(markdown)) !== null) {
    const url = cleanUrl(match[1]);
    if (url && isValidAppUrl(url)) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}

/**
 * Clean a URL by removing trailing punctuation and fragments
 */
function cleanUrl(url: string): string {
  // Remove trailing punctuation that might be part of markdown
  url = url.replace(/[.,;:!?]+$/, '');
  // Remove fragment
  url = url.split('#')[0];
  return url;
}

/**
 * Check if a URL looks like a valid web app URL (not a GitHub/npm/docs link)
 */
function isValidAppUrl(url: string): boolean {
  // Skip common non-app URLs
  const skipPatterns = [
    /github\.com\/.*\/(issues|pull|blob|tree|commit|raw)/,
    /github\.com\/[^/]+\/[^/]+$/,  // GitHub repo pages (not apps)
    /npmjs\.(com|org)/,
    /developer\.mozilla\.org/,
    /web\.dev\//,
    /caniuse\.com/,
    /shields\.io/,
    /badge/,
    /img\.shields/,
    /travis-ci/,
    /circleci/,
    /coveralls/,
    /codecov/,
    /\.md$/,
    /\.json$/,
    /raw\.githubusercontent\.com/,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(url)) {
      return false;
    }
  }

  return true;
}

/**
 * Merge and deduplicate domain lists from multiple sources.
 * Normalizes domains by extracting hostname from full URLs.
 */
export function mergeAndDeduplicate(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const list of lists) {
    for (const entry of list) {
      let domain: string;

      // If it's a full URL, extract the hostname
      if (entry.startsWith('http')) {
        try {
          domain = new URL(entry).hostname;
        } catch {
          domain = entry;
        }
      } else {
        domain = entry.toLowerCase().trim();
      }

      // Remove www. prefix for dedup
      const normalized = domain.replace(/^www\./, '');

      if (!seen.has(normalized) && normalized.includes('.')) {
        seen.add(normalized);
        // Keep the original entry (full URL or domain)
        result.push(entry);
      }
    }
  }

  return result;
}
