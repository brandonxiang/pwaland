import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function normalizeExternalHttpUrl(input: string | URL): URL {
  const raw = input instanceof URL ? input.href : input.trim();
  if (!raw) {
    throw new Error('URL is required');
  }

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw);
  const url = new URL(hasProtocol ? raw : `https://${raw}`);

  if (!HTTP_PROTOCOLS.has(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }

  if (url.username || url.password) {
    throw new Error('URLs with embedded credentials are not allowed');
  }

  return url;
}

export function isPrivateIpAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    const parts = address.split('.').map(Number);
    const [a, b] = parts;

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (version === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) {
      return isPrivateIpAddress(normalized.slice('::ffff:'.length));
    }

    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80') ||
      normalized.startsWith('ff')
    );
  }

  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local');
}

export async function assertSafeExternalUrl(input: string | URL): Promise<URL> {
  const url = normalizeExternalHttpUrl(input);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  if (isBlockedHostname(hostname)) {
    throw new Error('Local hostnames are not allowed');
  }

  if (isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error('Private IP addresses are not allowed');
    }
    return url;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) {
    throw new Error('Hostname did not resolve');
  }

  for (const record of records) {
    if (isPrivateIpAddress(record.address)) {
      throw new Error('Hostname resolves to a private IP address');
    }
  }

  return url;
}
