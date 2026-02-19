import { useState, useEffect, useCallback } from 'react';
import type { PWAApp, Category } from '@/data/apps';
import { fetchAllApps, type AppData } from '@/services/appService';
import { getCache, setCache, getStaleCacheData } from '@/utils/cache';

const CACHE_KEY = 'pwaland_apps';

interface UseAppsResult {
  apps: PWAApp[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useApps(): UseAppsResult {
  const [data, setData] = useState<AppData>(() => {
    const stale = getStaleCacheData<AppData>(CACHE_KEY);
    return stale ?? { apps: [], categories: [] };
  });
  const [loading, setLoading] = useState(() => {
    return getStaleCacheData<AppData>(CACHE_KEY) === null;
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const fresh = await fetchAllApps();
      setData(fresh);
      setCache(CACHE_KEY, fresh);
      setError(null);
    } catch (err) {
      const cached = getStaleCacheData<AppData>(CACHE_KEY);
      if (!cached || cached.apps.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to load apps');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCache<AppData>(CACHE_KEY);
    if (cached) {
      setData(cached);
      setLoading(false);
    }
    load();
  }, [load]);

  return {
    apps: data.apps,
    categories: data.categories,
    loading,
    error,
    refresh: load,
  };
}
