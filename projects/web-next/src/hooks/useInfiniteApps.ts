import { useState, useEffect, useCallback, useRef } from 'react';
import type { PWAApp, Category } from '@/data/apps';
import { buildCategories } from '@/data/apps';
import { fetchAppsPage } from '@/services/appService';
import { getCache, setCache, getStaleCacheData } from '@/utils/cache';

const CACHE_KEY = 'pwaland_infinite_apps';

interface CachedInfiniteData {
  apps: PWAApp[];
  categories: Category[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface UseInfiniteAppsResult {
  apps: PWAApp[];
  categories: Category[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => Promise<void>;
}

function getStaleData(): CachedInfiniteData | null {
  return getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
}

export function useInfiniteApps(): UseInfiniteAppsResult {
  const [apps, setApps] = useState<PWAApp[]>(() => {
    return getStaleData()?.apps ?? [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    return getStaleData()?.categories ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return getStaleData() === null;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return getStaleData()?.hasMore ?? true;
  });
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(getStaleData()?.nextCursor ?? null);
  const loadingMoreRef = useRef(false);

  const updateCache = useCallback((newApps: PWAApp[], cats: Category[], more: boolean, cursor: string | null) => {
    setCache<CachedInfiniteData>(CACHE_KEY, {
      apps: newApps,
      categories: cats,
      hasMore: more,
      nextCursor: cursor,
    });
  }, []);

  const loadInitial = useCallback(async () => {
    try {
      const cached = getCache<CachedInfiniteData>(CACHE_KEY);
      if (cached) {
        setApps(cached.apps);
        setCategories(cached.categories);
        setHasMore(cached.hasMore);
        cursorRef.current = cached.nextCursor;
        setLoading(false);
      }

      const result = await fetchAppsPage(undefined);
      const cats = buildCategories(result.apps);
      setApps(result.apps);
      setCategories(cats);
      setHasMore(result.hasMore);
      cursorRef.current = result.nextCursor;
      setError(null);
      updateCache(result.apps, cats, result.hasMore, result.nextCursor);
    } catch (err) {
      const cached = getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
      if (!cached || cached.apps.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to load apps');
      }
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current || !cursorRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    fetchAppsPage(cursorRef.current)
      .then((result) => {
        setApps((prev) => {
          const merged = [...prev, ...result.apps];
          const cats = buildCategories(merged);
          setCategories(cats);
          updateCache(merged, cats, result.hasMore, result.nextCursor);
          return merged;
        });
        setHasMore(result.hasMore);
        cursorRef.current = result.nextCursor;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load more');
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, updateCache]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    apps,
    categories,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh: loadInitial,
  };
}
