// Browser-like User-Agent to avoid being blocked
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FETCH_TIMEOUT = 15_000;

export interface ManifestIcon {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: string;
}

export interface ManifestData {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  icons?: ManifestIcon[];
  [key: string]: unknown;
}

export interface CheckResult {
  pass: boolean;
  detail: string;
}

export interface PwaCheckResponse {
  isPwa: boolean;
  url: string;
  checks: {
    https: CheckResult;
    manifest: CheckResult & { data?: ManifestData };
    serviceWorker: CheckResult;
    icons: CheckResult & { bestIcon?: string };
    display: CheckResult;
  };
  suggestion: {
    title: string;
    icon: string;
    description: string;
    link: string;
  };
}

/**
 * Fetch a URL with timeout and browser-like headers
 */
export async function safeFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract manifest link from HTML source
 */
export function extractManifestLink(html: string): string | null {
  const patterns = [
    /<link[^>]*rel\s*=\s*["']manifest["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']manifest["'][^>]*\/?>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract meta description from HTML source
 */
export function extractMetaDescription(html: string): string | null {
  const patterns = [
    /<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    /<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["'][^>]*\/?>/i,
    /<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i,
    /<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["'][^>]*\/?>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Detect service worker registration patterns in HTML source
 */
export function detectServiceWorker(html: string): { found: boolean; detail: string } {
  const patterns = [
    /navigator\s*\.\s*serviceWorker\s*\.\s*register/,
    /serviceWorker\s*in\s*navigator/,
    /navigator\s*\[\s*['"]serviceWorker['"]\s*\]/,
    /workbox/i,
    /sw\.js/i,
    /service-worker\.js/i,
    /service_worker\.js/i,
    /sw-register/i,
    /registerSW/i,
    /__precacheManifest/,
  ];

  const matchedPatterns: string[] = [];

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length > 0) {
    return {
      found: true,
      detail: `Service Worker registration detected (${matchedPatterns.length} pattern(s) matched)`,
    };
  }

  return {
    found: false,
    detail: 'No Service Worker registration patterns found in HTML source',
  };
}

/**
 * Find the best icon from the manifest icons array.
 * Prefer larger icons (192x192, 512x512).
 */
export function findBestIcon(icons: ManifestIcon[], baseUrl: string): string | null {
  if (!icons || icons.length === 0) return null;

  const preferredSizes = ['512x512', '384x384', '256x256', '192x192', '144x144', '128x128', '96x96', '72x72'];

  for (const size of preferredSizes) {
    const icon = icons.find(i => i.sizes?.includes(size));
    if (icon?.src) {
      return resolveUrl(icon.src, baseUrl);
    }
  }

  const fallback = icons.find(i => i.src);
  return fallback ? resolveUrl(fallback.src, baseUrl) : null;
}

/**
 * Resolve a potentially relative URL against a base URL
 */
export function resolveUrl(url: string, base: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

/**
 * Perform a lightweight PWA check on the given URL
 */
export async function checkPwa(inputUrl: string): Promise<PwaCheckResponse> {
  const url = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;

  const result: PwaCheckResponse = {
    isPwa: false,
    url,
    checks: {
      https: { pass: false, detail: '' },
      manifest: { pass: false, detail: '' },
      serviceWorker: { pass: false, detail: '' },
      icons: { pass: false, detail: '' },
      display: { pass: false, detail: '' },
    },
    suggestion: { title: '', icon: '', description: '', link: url },
  };

  // Check 1: HTTPS
  if (url.startsWith('https://')) {
    result.checks.https = { pass: true, detail: 'Site is served over HTTPS' };
  } else {
    result.checks.https = { pass: false, detail: 'Site is not served over HTTPS' };
  }

  // Fetch HTML
  let html: string;
  try {
    const response = await safeFetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    html = await response.text();
  } catch (err: any) {
    result.checks.manifest = { pass: false, detail: `Failed to fetch page: ${err.message}` };
    result.checks.serviceWorker = { pass: false, detail: 'Could not analyze page' };
    result.checks.icons = { pass: false, detail: 'Could not analyze page' };
    result.checks.display = { pass: false, detail: 'Could not analyze page' };
    return result;
  }

  // Check 2: Web App Manifest
  const manifestHref = extractManifestLink(html);
  let manifestData: ManifestData | undefined;

  if (!manifestHref) {
    result.checks.manifest = { pass: false, detail: 'No <link rel="manifest"> found in HTML' };
  } else {
    const manifestUrl = resolveUrl(manifestHref, url);
    try {
      const manifestResponse = await safeFetch(manifestUrl);
      if (!manifestResponse.ok) {
        throw new Error(`HTTP ${manifestResponse.status}`);
      }
      manifestData = await manifestResponse.json() as ManifestData;

      if (!manifestData.name && !manifestData.short_name) {
        result.checks.manifest = {
          pass: false,
          detail: 'Manifest found but missing both "name" and "short_name"',
          data: manifestData,
        };
      } else {
        result.checks.manifest = {
          pass: true,
          detail: `Valid manifest found: "${manifestData.name || manifestData.short_name}"`,
          data: manifestData,
        };
      }
    } catch (err: any) {
      result.checks.manifest = {
        pass: false,
        detail: `Manifest link found but failed to fetch/parse: ${err.message}`,
      };
    }
  }

  // Check 3: Service Worker
  const swCheck = detectServiceWorker(html);
  result.checks.serviceWorker = {
    pass: swCheck.found,
    detail: swCheck.detail,
  };

  // Check 4: Icons
  if (manifestData?.icons && manifestData.icons.length > 0) {
    const bestIcon = findBestIcon(manifestData.icons, url);
    if (bestIcon) {
      result.checks.icons = {
        pass: true,
        detail: `${manifestData.icons.length} icon(s) defined in manifest`,
        bestIcon,
      };
    } else {
      result.checks.icons = {
        pass: false,
        detail: 'Icons defined but no valid src found',
      };
    }
  } else {
    result.checks.icons = {
      pass: false,
      detail: manifestData ? 'No icons defined in manifest' : 'Cannot check icons without manifest',
    };
  }

  // Check 5: Display mode
  if (manifestData?.display) {
    const validModes = ['standalone', 'fullscreen', 'minimal-ui'];
    if (validModes.includes(manifestData.display)) {
      result.checks.display = {
        pass: true,
        detail: `Display mode: "${manifestData.display}"`,
      };
    } else {
      result.checks.display = {
        pass: false,
        detail: `Display mode "${manifestData.display}" does not support installability (need standalone, fullscreen, or minimal-ui)`,
      };
    }
  } else {
    result.checks.display = {
      pass: false,
      detail: manifestData ? 'No display mode specified in manifest' : 'Cannot check display mode without manifest',
    };
  }

  // Determine overall isPwa: requires HTTPS + manifest + service worker
  result.isPwa =
    result.checks.https.pass &&
    result.checks.manifest.pass &&
    result.checks.serviceWorker.pass;

  // Build suggestion from manifest data, with meta description as fallback
  const manifestDescription = manifestData?.description || '';
  const metaDescription = extractMetaDescription(html);
  const finalDescription = manifestDescription || metaDescription || '';

  result.suggestion = {
    title: manifestData?.name || manifestData?.short_name || '',
    icon: result.checks.icons.bestIcon || '',
    description: finalDescription,
    link: url,
  };

  return result;
}
