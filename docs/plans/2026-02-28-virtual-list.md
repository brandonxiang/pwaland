# Virtual List + On-Demand Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current "fetch all pages upfront" pattern with on-demand paginated loading + virtual list rendering, so the Home page makes only ONE API call initially and loads more pages as the user scrolls.

**Architecture:** The current `fetchAllApps()` loops through ALL Notion cursor pages (N sequential `POST /api/client/list` calls). We replace this with a single-page `fetchAppsPage()`, wire it into a `useInfiniteApps()` hook that tracks cursor state, and render the app grid with `@tanstack/react-virtual` for row-level virtualization. An IntersectionObserver sentinel at the bottom triggers the next page fetch. Client-side search/category filtering still works on loaded data, with a "load all" affordance when `hasMore` is true.

**Tech Stack:** `@tanstack/react-virtual` (row virtualizer), React 19, Vitest + @testing-library/react, IntersectionObserver

---

## Task 1: Install @tanstack/react-virtual

**Files:**
- Modify: `projects/web-next/package.json`

**Step 1: Install the dependency**

```bash
cd projects/web-next
pnpm add @tanstack/react-virtual
```

**Step 2: Verify installation**

Run: `pnpm ls @tanstack/react-virtual`
Expected: Shows installed version (3.x)

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @tanstack/react-virtual for virtual list rendering"
```

---

## Task 2: Create `fetchAppsPage()` service function

**Files:**
- Modify: `projects/web-next/src/services/appService.ts`
- Test: `projects/web-next/src/services/appService.test.ts`

**Step 1: Write the failing tests**

Add to `projects/web-next/src/services/appService.test.ts`:

```typescript
describe("fetchAppsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches a single page without cursor", async () => {
    mockPostRaw.mockResolvedValueOnce({
      properties: [
        {
          title: "Page App",
          description: "A paged app",
          tags: ["Tools"],
          link: "https://paged.com",
          icon: "",
        },
      ],
      has_more: true,
      next_cursor: "cursor-abc",
    })

    const result = await fetchAppsPage()
    expect(mockPostRaw).toHaveBeenCalledTimes(1)
    expect(mockPostRaw).toHaveBeenCalledWith("/api/client/list", {
      start_cursor: undefined,
    })
    expect(result.apps).toHaveLength(1)
    expect(result.apps[0]).toMatchObject({ id: "page-app", name: "Page App" })
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe("cursor-abc")
  })

  it("fetches a specific page with cursor", async () => {
    mockPostRaw.mockResolvedValueOnce({
      properties: [
        {
          title: "Second Page",
          description: "",
          tags: ["Social"],
          link: "https://second.com",
          icon: "",
        },
      ],
      has_more: false,
      next_cursor: null,
    })

    const result = await fetchAppsPage("cursor-xyz")
    expect(mockPostRaw).toHaveBeenCalledWith("/api/client/list", {
      start_cursor: "cursor-xyz",
    })
    expect(result.apps).toHaveLength(1)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeNull()
  })

  it("makes exactly ONE API call per invocation", async () => {
    mockPostRaw.mockResolvedValueOnce({
      properties: [],
      has_more: true,
      next_cursor: "more-cursor",
    })

    await fetchAppsPage()
    expect(mockPostRaw).toHaveBeenCalledTimes(1)
  })
})
```

Also add the import at the top alongside the existing `fetchAllApps` import:

```typescript
import { fetchAllApps, fetchAppsPage } from "./appService"
```

**Step 2: Run tests to verify they fail**

Run: `cd projects/web-next && pnpm vitest run src/services/appService.test.ts`
Expected: FAIL — `fetchAppsPage` is not exported

**Step 3: Implement `fetchAppsPage()`**

Add to `projects/web-next/src/services/appService.ts` after the `AppData` export:

```typescript
export interface PageResult {
  apps: PWAApp[];
  hasMore: boolean;
  nextCursor: string | null;
}

export async function fetchAppsPage(cursor?: string): Promise<PageResult> {
  const res = await postRaw<ClientListResponse>('/api/client/list', {
    start_cursor: cursor,
  });

  const apps = res.properties.map(transformNotionApp);

  return {
    apps,
    hasMore: res.has_more,
    nextCursor: res.next_cursor,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm vitest run src/services/appService.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/services/appService.ts src/services/appService.test.ts
git commit -m "feat: add fetchAppsPage() for single-page data fetching"
```

---

## Task 3: Create `useInfiniteApps()` hook

**Files:**
- Create: `projects/web-next/src/hooks/useInfiniteApps.ts`
- Create: `projects/web-next/src/hooks/useInfiniteApps.test.ts`

**Step 1: Write the failing tests**

Create `projects/web-next/src/hooks/useInfiniteApps.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useInfiniteApps } from "./useInfiniteApps"

vi.mock("@/services/appService", () => ({
  fetchAppsPage: vi.fn(),
}))

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}))

import { fetchAppsPage } from "@/services/appService"
import { getCache, getStaleCacheData } from "@/utils/cache"

const mockFetchAppsPage = vi.mocked(fetchAppsPage)
const mockGetCache = vi.mocked(getCache)
const mockGetStaleCacheData = vi.mocked(getStaleCacheData)

const page1 = {
  apps: [
    {
      id: "app-1",
      name: "App 1",
      description: "First",
      category: "tools",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://a.com",
      color: "#000",
    },
  ],
  hasMore: true,
  nextCursor: "cursor-2",
}

const page2 = {
  apps: [
    {
      id: "app-2",
      name: "App 2",
      description: "Second",
      category: "social",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://b.com",
      color: "#111",
    },
  ],
  hasMore: false,
  nextCursor: null,
}

describe("useInfiniteApps", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetStaleCacheData.mockReturnValue(null)
    mockGetCache.mockReturnValue(null)
  })

  it("loads the first page on mount", async () => {
    mockFetchAppsPage.mockResolvedValueOnce(page1)

    const { result } = renderHook(() => useInfiniteApps())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.apps).toHaveLength(1)
    expect(result.current.apps[0].id).toBe("app-1")
    expect(result.current.hasMore).toBe(true)
    expect(result.current.error).toBeNull()
    expect(mockFetchAppsPage).toHaveBeenCalledTimes(1)
    expect(mockFetchAppsPage).toHaveBeenCalledWith(undefined)
  })

  it("loads the next page when loadMore is called", async () => {
    mockFetchAppsPage
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2)

    const { result } = renderHook(() => useInfiniteApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.apps).toHaveLength(1)
    expect(result.current.hasMore).toBe(true)

    await act(async () => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false)
    })

    expect(result.current.apps).toHaveLength(2)
    expect(result.current.apps[1].id).toBe("app-2")
    expect(result.current.hasMore).toBe(false)
    expect(mockFetchAppsPage).toHaveBeenCalledTimes(2)
    expect(mockFetchAppsPage).toHaveBeenNthCalledWith(2, "cursor-2")
  })

  it("does not loadMore when hasMore is false", async () => {
    mockFetchAppsPage.mockResolvedValueOnce({ ...page1, hasMore: false, nextCursor: null })

    const { result } = renderHook(() => useInfiniteApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      result.current.loadMore()
    })

    expect(mockFetchAppsPage).toHaveBeenCalledTimes(1)
  })

  it("does not loadMore when already loading more", async () => {
    let resolveSecond: (v: any) => void
    const secondPromise = new Promise((r) => { resolveSecond = r })

    mockFetchAppsPage
      .mockResolvedValueOnce(page1)
      .mockReturnValueOnce(secondPromise as any)

    const { result } = renderHook(() => useInfiniteApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => { result.current.loadMore() })

    expect(result.current.loadingMore).toBe(true)

    act(() => { result.current.loadMore() })

    expect(mockFetchAppsPage).toHaveBeenCalledTimes(2)

    await act(async () => { resolveSecond!(page2) })
  })

  it("sets error when initial fetch fails", async () => {
    mockFetchAppsPage.mockRejectedValueOnce(new Error("API down"))

    const { result } = renderHook(() => useInfiniteApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("API down")
  })

  it("builds categories incrementally from loaded apps", async () => {
    mockFetchAppsPage.mockResolvedValueOnce(page1)

    const { result } = renderHook(() => useInfiniteApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories.length).toBeGreaterThanOrEqual(1)
    expect(result.current.categories.find((c) => c.id === "tools")).toBeTruthy()
  })

  it("uses stale cache for initial render", async () => {
    const cachedData = {
      apps: page1.apps,
      categories: [{ id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 1 }],
      hasMore: true,
      nextCursor: "cursor-2",
    }
    mockGetStaleCacheData.mockReturnValue(cachedData)
    mockFetchAppsPage.mockResolvedValueOnce(page1)

    const { result } = renderHook(() => useInfiniteApps())

    expect(result.current.loading).toBe(false)
    expect(result.current.apps).toHaveLength(1)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd projects/web-next && pnpm vitest run src/hooks/useInfiniteApps.test.ts`
Expected: FAIL — module not found

**Step 3: Implement `useInfiniteApps()`**

Create `projects/web-next/src/hooks/useInfiniteApps.ts`:

```typescript
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

export function useInfiniteApps(): UseInfiniteAppsResult {
  const [apps, setApps] = useState<PWAApp[]>(() => {
    const stale = getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
    return stale?.apps ?? [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const stale = getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
    return stale?.categories ?? [];
  });
  const [loading, setLoading] = useState(() => {
    return getStaleCacheData<CachedInfiniteData>(CACHE_KEY) === null;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    const stale = getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
    return stale?.hasMore ?? true;
  });
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(() => {
    const stale = getStaleCacheData<CachedInfiniteData>(CACHE_KEY);
    return stale?.nextCursor ?? null;
  });

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
```

**Step 4: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm vitest run src/hooks/useInfiniteApps.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/hooks/useInfiniteApps.ts src/hooks/useInfiniteApps.test.ts
git commit -m "feat: add useInfiniteApps hook for paginated on-demand loading"
```

---

## Task 4: Create `VirtualAppGrid` component

**Files:**
- Create: `projects/web-next/src/components/VirtualAppGrid/index.tsx`
- Create: `projects/web-next/src/components/VirtualAppGrid/index.module.scss`
- Create: `projects/web-next/src/components/VirtualAppGrid/VirtualAppGrid.test.tsx`

**Step 1: Write the failing test**

Create `projects/web-next/src/components/VirtualAppGrid/VirtualAppGrid.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { VirtualAppGrid } from "./index"
import type { PWAApp, Category } from "@/data/apps"

const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
}

class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    // Simulate an initial call with a 900px container
    setTimeout(() => {
      callback(
        [{ contentRect: { width: 900 } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    }, 0)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

const makeApps = (count: number): PWAApp[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `app-${i}`,
    name: `App ${i}`,
    description: `Description ${i}`,
    category: "tools",
    icon: "",
    developer: "",
    rating: 0,
    url: `https://app${i}.com`,
    color: "#000",
  }))

const categories: Category[] = [
  { id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 10 },
]

describe("VirtualAppGrid", () => {
  it("renders app cards for the provided apps", () => {
    const apps = makeApps(3)
    render(
      <VirtualAppGrid
        apps={apps}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    )
    expect(screen.getByText("App 0")).toBeInTheDocument()
    expect(screen.getByText("App 1")).toBeInTheDocument()
    expect(screen.getByText("App 2")).toBeInTheDocument()
  })

  it("shows loading indicator when loadingMore is true", () => {
    render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={true}
        loadingMore={true}
        onLoadMore={vi.fn()}
      />,
    )
    expect(screen.getByText("Loading more apps...")).toBeInTheDocument()
  })

  it("renders sentinel element when hasMore is true", () => {
    const { container } = render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={true}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    )
    expect(container.querySelector("[data-testid='load-more-sentinel']")).toBeInTheDocument()
  })

  it("does not render sentinel when hasMore is false", () => {
    const { container } = render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    )
    expect(container.querySelector("[data-testid='load-more-sentinel']")).not.toBeInTheDocument()
  })

  it("renders empty state when no apps provided", () => {
    render(
      <VirtualAppGrid
        apps={[]}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    )
    expect(screen.getByText("No apps found")).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd projects/web-next && pnpm vitest run src/components/VirtualAppGrid/VirtualAppGrid.test.tsx`
Expected: FAIL — module not found

**Step 3: Create the SCSS module**

Create `projects/web-next/src/components/VirtualAppGrid/index.module.scss`:

```scss
@use '../../style/variable.scss' as *;
@use '../../style/mixin.scss' as *;

.virtualContainer {
  position: relative;
  width: 100%;
}

.virtualRow {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $space-5;

  @include mobile {
    grid-template-columns: 1fr;
    gap: $space-4;
  }
}

.sentinel {
  width: 100%;
  height: 1px;
}

.loadingMore {
  text-align: center;
  padding: $space-8 $space-4;
  color: $text-tertiary;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  :global(:root.dark) & {
    color: rgba(255, 255, 255, 0.4);

    p {
      color: rgba(255, 255, 255, 0.55);
    }
  }
}

.emptyState {
  text-align: center;
  padding: $space-16 $space-4;
}

.emptyIcon {
  font-size: 48px;
  display: block;
  margin-bottom: $space-4;
}

.emptyTitle {
  font-family: $font-heading;
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $space-2;

  :global(:root.dark) & {
    color: rgba(255, 255, 255, 0.95);
  }
}
```

**Step 4: Implement the `VirtualAppGrid` component**

Create `projects/web-next/src/components/VirtualAppGrid/index.tsx`:

```tsx
import { useRef, useEffect, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { LoadingOutlined } from '@ant-design/icons';
import type { PWAApp, Category } from '@/data/apps';
import styles from './index.module.scss';

interface VirtualAppGridProps {
  apps: PWAApp[];
  categories: Category[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  renderCard: (app: PWAApp, allCategories: Category[]) => React.ReactNode;
}

const ESTIMATED_ROW_HEIGHT = 130;

export function VirtualAppGrid({
  apps,
  categories,
  hasMore,
  loadingMore,
  onLoadMore,
  renderCard,
}: VirtualAppGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (apps.length === 0 && !loadingMore) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>No apps found</h3>
      </div>
    );
  }

  return (
    <div className={styles.virtualContainer}>
      <div className={styles.virtualRow}>
        {apps.map((app) => renderCard(app, categories))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          data-testid="load-more-sentinel"
          className={styles.sentinel}
        />
      )}

      {loadingMore && (
        <div className={styles.loadingMore}>
          <LoadingOutlined style={{ fontSize: 24 }} />
          <p>Loading more apps...</p>
        </div>
      )}
    </div>
  );
}
```

> **Note:** We start with a simple IntersectionObserver-based infinite scroll. The `useWindowVirtualizer` from `@tanstack/react-virtual` can be added in a follow-up if the loaded dataset grows large enough to need DOM virtualization. The IntersectionObserver approach keeps the grid's responsive `auto-fill` layout working without row-calculation complexity. The dependency is installed for future use.

**Step 5: Run test to verify it passes**

Run: `cd projects/web-next && pnpm vitest run src/components/VirtualAppGrid/VirtualAppGrid.test.tsx`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/components/VirtualAppGrid/
git commit -m "feat: add VirtualAppGrid component with IntersectionObserver infinite scroll"
```

---

## Task 5: Integrate into Home page

**Files:**
- Modify: `projects/web-next/src/pages/Home/index.tsx`

**Step 1: Replace `useApps` with `useInfiniteApps`**

In `projects/web-next/src/pages/Home/index.tsx`, change the import and hook usage:

Replace:
```tsx
import { useApps } from '@/hooks/useApps';
```
With:
```tsx
import { useInfiniteApps } from '@/hooks/useInfiniteApps';
```

Replace:
```tsx
const { apps, categories, loading, error } = useApps();
```
With:
```tsx
const { apps, categories, loading, loadingMore, hasMore, error, loadMore } = useInfiniteApps();
```

**Step 2: Import `VirtualAppGrid`**

Add import:
```tsx
import { VirtualAppGrid } from '@/components/VirtualAppGrid';
```

**Step 3: Replace the App Grid section**

Replace the entire "App Grid Section" block (lines ~348-378):

```tsx
{/* ── App Grid Section ─────────────────────── */}
{apps.length > 0 && (
  <section className={styles.section}>
    <div className={styles.container}>
      {filteredApps.length > 0 ? (
        <div className={styles.appGrid}>
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} allCategories={categories} />
          ))}
        </div>
      ) : (
        /* ... empty state ... */
      )}
    </div>
  </section>
)}
```

With:

```tsx
{/* ── App Grid Section ─────────────────────── */}
{(apps.length > 0 || loadingMore) && (
  <section className={styles.section}>
    <div className={styles.container}>
      <VirtualAppGrid
        apps={filteredApps}
        categories={categories}
        hasMore={!searchQuery && !activeCategory ? hasMore : false}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        renderCard={(app, cats) => (
          <AppCard key={app.id} app={app} allCategories={cats} />
        )}
      />
    </div>
  </section>
)}
```

Key detail: `hasMore` is only passed as `true` when no search/category filter is active. When filtering, we only show loaded data (since filtering is client-side on partial data).

**Step 4: Verify the dev server**

Run: `cd projects/web-next && pnpm dev`
Expected: Page loads, shows first page of apps, scrolling to bottom loads more.

**Step 5: Run all existing tests**

Run: `cd projects/web-next && pnpm vitest run`
Expected: ALL PASS (existing `useApps` tests still pass since that hook is untouched)

**Step 6: Commit**

```bash
git add src/pages/Home/index.tsx
git commit -m "feat: integrate VirtualAppGrid with infinite scroll into Home page"
```

---

## Task 6: Add Home page integration test

**Files:**
- Create: `projects/web-next/src/pages/Home/Home.test.tsx`

**Step 1: Write the integration test**

Create `projects/web-next/src/pages/Home/Home.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import Home from "./index"

const page1Result = {
  apps: [
    {
      id: "app-1",
      name: "Test PWA",
      description: "A test PWA app",
      category: "tools",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://test.com",
      color: "#64748B",
    },
  ],
  hasMore: false,
  nextCursor: null,
}

vi.mock("@/services/appService", () => ({
  fetchAppsPage: vi.fn().mockResolvedValue(page1Result),
}))

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}))

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}
  observe = mockObserve
  unobserve = vi.fn()
  disconnect = mockDisconnect
}

class MockResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

describe("Home page", () => {
  it("renders loaded apps after fetch completes", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Test PWA")).toBeInTheDocument()
    })
  })

  it("shows the hero section", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText("Discover the Best")).toBeInTheDocument()
  })
})
```

**Step 2: Run test**

Run: `cd projects/web-next && pnpm vitest run src/pages/Home/Home.test.tsx`
Expected: ALL PASS

**Step 3: Run the full test suite**

Run: `cd projects/web-next && pnpm vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/pages/Home/Home.test.tsx
git commit -m "test: add Home page integration tests for infinite loading"
```

---

## Task 7: Browser verification with agent-browser

**Files:** None (manual verification)

**Step 1: Start the dev server**

```bash
cd projects/web-next && pnpm dev
```

Expected: Vite dev server starts on localhost (typically port 5173)

**Step 2: Open the Home page in agent-browser**

Use agent-browser to navigate to `http://localhost:5173/`.

**Verify the following:**

1. **Initial load**: Page renders the first batch of PWA apps (up to 100) with only ONE `/api/client/list` API call
2. **Scroll to bottom**: Scrolling near the bottom of the app grid triggers loading of the next batch — observe a "Loading more apps..." indicator appearing
3. **Search works**: Type in the search box — apps filter among loaded data
4. **Category filter works**: Click a category — apps filter among loaded data
5. **No errors in console**: Check browser console for React errors or uncaught exceptions

**Step 3: Take screenshots**

Capture:
1. Initial page load with first batch of apps
2. Loading indicator while fetching next page
3. After all pages loaded
4. Search filtering in action

**Step 4: Commit any fixes**

If browser testing reveals issues, fix and commit:

```bash
git add -A
git commit -m "fix: address issues found during browser verification"
```

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `@tanstack/react-virtual` |
| `src/services/appService.ts` | Modify | Add `fetchAppsPage()` single-page fetcher |
| `src/services/appService.test.ts` | Modify | Add tests for `fetchAppsPage()` |
| `src/hooks/useInfiniteApps.ts` | Create | Infinite pagination hook with cursor state |
| `src/hooks/useInfiniteApps.test.ts` | Create | Tests for infinite loading behavior |
| `src/components/VirtualAppGrid/index.tsx` | Create | Grid component with IntersectionObserver |
| `src/components/VirtualAppGrid/index.module.scss` | Create | Styles for virtual grid and loading states |
| `src/components/VirtualAppGrid/VirtualAppGrid.test.tsx` | Create | Component tests |
| `src/pages/Home/index.tsx` | Modify | Wire up `useInfiniteApps` + `VirtualAppGrid` |
| `src/pages/Home/Home.test.tsx` | Create | Integration test for Home page |

**Before → After:**
- Before: `fetchAllApps()` makes N sequential API calls on page load (e.g., 3 calls for 300 apps)
- After: First page loads with 1 API call; additional pages load on scroll only when needed
- Existing `useApps` hook and its tests are **untouched** for backward compatibility
