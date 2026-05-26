import { useState, useEffect, useCallback, useRef } from "react";
import type { PWAApp, Category } from "@/data/apps";
import { buildCategories } from "@/data/apps";
import { fetchAppsPage } from "@/services/appService";
import { getCache, setCache, getStaleCacheData } from "@/utils/cache";

const CACHE_KEY = "pwaland_infinite_apps";

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

export function useInfiniteApps(query = ""): UseInfiniteAppsResult {
  const normalizedQuery = query.trim();
  const cacheKey = normalizedQuery ? `${CACHE_KEY}:${normalizedQuery}` : CACHE_KEY;

  function getScopedStaleData(): CachedInfiniteData | null {
    return getStaleCacheData<CachedInfiniteData>(cacheKey);
  }

  const [apps, setApps] = useState<PWAApp[]>(() => {
    return getScopedStaleData()?.apps ?? [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    return getScopedStaleData()?.categories ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return getScopedStaleData() === null;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return getScopedStaleData()?.hasMore ?? true;
  });
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(getScopedStaleData()?.nextCursor ?? null);
  const loadingMoreRef = useRef(false);

  const updateCache = useCallback(
    (newApps: PWAApp[], cats: Category[], more: boolean, cursor: string | null) => {
      setCache<CachedInfiniteData>(cacheKey, {
        apps: newApps,
        categories: cats,
        hasMore: more,
        nextCursor: cursor,
      });
    },
    [cacheKey],
  );

  const loadInitial = useCallback(async () => {
    const stale = getStaleCacheData<CachedInfiniteData>(cacheKey);
    setLoading(!stale || stale.apps.length === 0);
    setLoadingMore(false);
    loadingMoreRef.current = false;

    try {
      const cached = getCache<CachedInfiniteData>(cacheKey);
      if (cached) {
        setApps(cached.apps);
        setCategories(cached.categories);
        setHasMore(cached.hasMore);
        cursorRef.current = cached.nextCursor;
        setLoading(false);
      }

      const result = await fetchAppsPage(undefined, normalizedQuery || undefined);
      const cats = buildCategories(result.apps);
      setApps(result.apps);
      setCategories(cats);
      setHasMore(result.hasMore);
      cursorRef.current = result.nextCursor;
      setError(null);
      updateCache(result.apps, cats, result.hasMore, result.nextCursor);
    } catch (err) {
      const cached = getStaleCacheData<CachedInfiniteData>(cacheKey);
      if (!cached || cached.apps.length === 0) {
        setApps([]);
        setCategories([]);
        setError(err instanceof Error ? err.message : "Failed to load apps");
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, normalizedQuery, updateCache]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current || !cursorRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    fetchAppsPage(cursorRef.current, normalizedQuery || undefined)
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
        setError(err instanceof Error ? err.message : "Failed to load more");
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, normalizedQuery, updateCache]);

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
