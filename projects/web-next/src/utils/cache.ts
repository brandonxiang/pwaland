interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable - silently ignore
  }
}

/**
 * Read cached data regardless of TTL expiry (for stale-while-revalidate).
 */
export function getStaleCacheData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function isCacheExpired(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() > entry.expiresAt;
  } catch {
    return true;
  }
}
