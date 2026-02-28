# Frontend & Backend Unit Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive unit tests for both the Fastify backend (`projects/server`) and React frontend (`projects/web-next`), covering pure utility functions, service logic, route handlers, and React hooks.

**Architecture:** Backend uses Vitest with Fastify's `inject()` for route-level integration tests and direct imports for unit tests. Frontend uses Vitest + happy-dom + @testing-library/react for utility tests, service tests (mocked fetch), and hook tests. All pure functions are tested first, then mocked-dependency layers, following TDD style.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/react-hooks (via @testing-library/react), happy-dom

---

## Phase 1: Backend Test Infrastructure

### Task 1: Install Vitest for the backend

**Files:**
- Modify: `projects/server/package.json`
- Create: `projects/server/vitest.config.ts`

**Step 1: Install vitest**

```bash
cd projects/server
pnpm add -D vitest
```

**Step 2: Create vitest config**

Create `projects/server/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
```

**Step 3: Verify vitest runs (no tests yet)**

Run: `cd projects/server && pnpm test`
Expected: "No test files found" or similar clean exit

**Step 4: Commit**

```bash
git add projects/server/package.json projects/server/vitest.config.ts pnpm-lock.yaml
git commit -m "chore(server): add vitest test infrastructure"
```

---

## Phase 2: Backend Unit Tests — Pure Functions

### Task 2: Test `src/utils/index.ts`

**Files:**
- Create: `projects/server/src/utils/index.test.ts`
- Reference: `projects/server/src/utils/index.ts`

**Step 1: Write the failing tests**

Create `projects/server/src/utils/index.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { success, fail, parseJson, sequence } from "./index"

describe("success", () => {
  it("returns data with ret=0 and msg=ok by default", () => {
    const result = success({ foo: 1 })
    expect(result.data).toEqual({ foo: 1 })
    expect(result.ret).toBe(0)
    expect(result.msg).toBe("ok")
    expect(result.timestamp).toBeTypeOf("number")
  })

  it("accepts custom ret and msg", () => {
    const result = success("data", 2, "custom")
    expect(result.ret).toBe(2)
    expect(result.msg).toBe("custom")
  })
})

describe("fail", () => {
  it("returns null data with ret=1 by default", () => {
    const result = fail("something broke")
    expect(result.data).toBeNull()
    expect(result.ret).toBe(1)
    expect(result.msg).toBe("something broke")
    expect(result.timestamp).toBeTypeOf("number")
  })

  it("accepts custom ret code", () => {
    const result = fail("err", 42)
    expect(result.ret).toBe(42)
  })
})

describe("parseJson", () => {
  it("parses valid JSON string", () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 })
  })

  it("returns undefined for invalid JSON", () => {
    expect(parseJson("not json")).toBeUndefined()
  })

  it("returns undefined for undefined input", () => {
    expect(parseJson(undefined)).toBeUndefined()
  })

  it("returns undefined for empty string", () => {
    expect(parseJson("")).toBeUndefined()
  })
})

describe("sequence", () => {
  it("executes promise factories sequentially", async () => {
    const order: number[] = []
    const tasks = [1, 2, 3].map(
      (n) => () =>
        new Promise<number>((resolve) => {
          order.push(n)
          resolve(n * 10)
        }),
    )

    const result = await sequence(tasks)
    expect(result).toEqual([10, 20, 30])
    expect(order).toEqual([1, 2, 3])
  })

  it("returns empty array for empty list", async () => {
    const result = await sequence([])
    expect(result).toEqual([])
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/server && pnpm test`
Expected: All 8 tests PASS

**Step 3: Commit**

```bash
git add projects/server/src/utils/index.test.ts
git commit -m "test(server): add unit tests for utils (success, fail, parseJson, sequence)"
```

---

### Task 3: Test `src/services/pwa-checker.ts` — pure helper functions

**Files:**
- Create: `projects/server/src/services/pwa-checker.test.ts`
- Reference: `projects/server/src/services/pwa-checker.ts`

These tests cover the pure/synchronous functions only (no network calls).

**Step 1: Write the failing tests**

Create `projects/server/src/services/pwa-checker.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import {
  extractManifestLink,
  extractMetaDescription,
  detectServiceWorker,
  findBestIcon,
  resolveUrl,
} from "./pwa-checker"

describe("extractManifestLink", () => {
  it("extracts href when rel comes before href", () => {
    const html = '<link rel="manifest" href="/manifest.json">'
    expect(extractManifestLink(html)).toBe("/manifest.json")
  })

  it("extracts href when href comes before rel", () => {
    const html = '<link href="/app.webmanifest" rel="manifest">'
    expect(extractManifestLink(html)).toBe("/app.webmanifest")
  })

  it("returns null when no manifest link exists", () => {
    const html = "<html><head><title>Test</title></head></html>"
    expect(extractManifestLink(html)).toBeNull()
  })

  it("handles self-closing tag", () => {
    const html = '<link rel="manifest" href="/m.json" />'
    expect(extractManifestLink(html)).toBe("/m.json")
  })
})

describe("extractMetaDescription", () => {
  it("extracts name=description meta tag", () => {
    const html = '<meta name="description" content="A cool PWA">'
    expect(extractMetaDescription(html)).toBe("A cool PWA")
  })

  it("extracts og:description meta tag", () => {
    const html = '<meta property="og:description" content="OG desc">'
    expect(extractMetaDescription(html)).toBe("OG desc")
  })

  it("returns null when no description exists", () => {
    const html = "<html><head></head></html>"
    expect(extractMetaDescription(html)).toBeNull()
  })
})

describe("detectServiceWorker", () => {
  it("detects navigator.serviceWorker.register pattern", () => {
    const html = "<script>navigator.serviceWorker.register('/sw.js')</script>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(true)
  })

  it("detects workbox pattern", () => {
    const html = "<script src='workbox-sw.js'></script>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(true)
  })

  it("returns found=false when no SW patterns", () => {
    const html = "<html><body>Hello</body></html>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(false)
  })
})

describe("resolveUrl", () => {
  it("returns absolute URL unchanged", () => {
    expect(resolveUrl("https://example.com/icon.png", "https://base.com")).toBe(
      "https://example.com/icon.png",
    )
  })

  it("resolves relative URL against base", () => {
    expect(resolveUrl("/icons/icon.png", "https://example.com")).toBe(
      "https://example.com/icons/icon.png",
    )
  })

  it("returns original URL on parse failure", () => {
    expect(resolveUrl("://broken", "://also-broken")).toBe("://broken")
  })
})

describe("findBestIcon", () => {
  const baseUrl = "https://example.com"

  it("prefers 512x512 icon", () => {
    const icons = [
      { src: "/icon-192.png", sizes: "192x192" },
      { src: "/icon-512.png", sizes: "512x512" },
    ]
    expect(findBestIcon(icons, baseUrl)).toBe("https://example.com/icon-512.png")
  })

  it("falls back to first icon with src if no preferred size", () => {
    const icons = [{ src: "/icon-any.png", sizes: "48x48" }]
    expect(findBestIcon(icons, baseUrl)).toBe("https://example.com/icon-any.png")
  })

  it("returns null for empty array", () => {
    expect(findBestIcon([], baseUrl)).toBeNull()
  })

  it("returns null for undefined", () => {
    expect(findBestIcon(undefined as any, baseUrl)).toBeNull()
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/server && pnpm test`
Expected: All tests PASS (previous + new)

**Step 3: Commit**

```bash
git add projects/server/src/services/pwa-checker.test.ts
git commit -m "test(server): add unit tests for pwa-checker pure functions"
```

---

### Task 4: Test `src/services/domain-sources.ts` — pure helper functions

**Files:**
- Create: `projects/server/src/services/domain-sources.test.ts`
- Reference: `projects/server/src/services/domain-sources.ts`

Only `mergeAndDeduplicate` is exported and pure. The private helpers (`extractUrlsFromMarkdown`, `cleanUrl`, `isValidAppUrl`) are tested indirectly.

**Step 1: Write the failing tests**

Create `projects/server/src/services/domain-sources.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { mergeAndDeduplicate } from "./domain-sources"

describe("mergeAndDeduplicate", () => {
  it("deduplicates identical domains", () => {
    const result = mergeAndDeduplicate(
      ["google.com", "youtube.com"],
      ["google.com", "twitter.com"],
    )
    expect(result).toEqual(["google.com", "youtube.com", "twitter.com"])
  })

  it("extracts hostname from full URLs for dedup", () => {
    const result = mergeAndDeduplicate(
      ["https://example.com/page"],
      ["example.com"],
    )
    // First entry wins: https://example.com/page is kept, example.com is deduped
    expect(result).toHaveLength(1)
    expect(result[0]).toBe("https://example.com/page")
  })

  it("strips www. prefix for dedup", () => {
    const result = mergeAndDeduplicate(
      ["www.example.com"],
      ["example.com"],
    )
    expect(result).toHaveLength(1)
  })

  it("filters out entries without a dot", () => {
    const result = mergeAndDeduplicate(["localhost", "example.com"])
    expect(result).toEqual(["example.com"])
  })

  it("handles empty lists", () => {
    const result = mergeAndDeduplicate([], [])
    expect(result).toEqual([])
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/server && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/server/src/services/domain-sources.test.ts
git commit -m "test(server): add unit tests for mergeAndDeduplicate"
```

---

## Phase 3: Backend Route Integration Tests

### Task 5: Test `/api/pwa/check` route

**Files:**
- Create: `projects/server/src/routes/pwa/check.test.ts`
- Reference: `projects/server/src/routes/pwa/check.ts`, `projects/server/src/services/pwa-checker.ts`

Uses Fastify's `inject()` to test route handling without starting an HTTP server. Mocks the `checkPwa` service.

**Step 1: Write the tests**

Create `projects/server/src/routes/pwa/check.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import Fastify from "fastify"
import PwaCheckRouter from "./check"

vi.mock("../../services/pwa-checker", () => ({
  checkPwa: vi.fn(),
}))

import { checkPwa } from "../../services/pwa-checker"
const mockCheckPwa = vi.mocked(checkPwa)

describe("POST /check", () => {
  const buildApp = async () => {
    const app = Fastify()
    app.register(PwaCheckRouter, { prefix: "/api/pwa" })
    await app.ready()
    return app
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns success with check result", async () => {
    const fakeResult = {
      isPwa: true,
      url: "https://example.com",
      checks: {},
      suggestion: {},
    }
    mockCheckPwa.mockResolvedValue(fakeResult as any)

    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/check",
      payload: { url: "https://example.com" },
    })

    const body = JSON.parse(res.body)
    expect(res.statusCode).toBe(200)
    expect(body.ret).toBe(0)
    expect(body.data.isPwa).toBe(true)
    await app.close()
  })

  it("returns fail when checkPwa throws", async () => {
    mockCheckPwa.mockRejectedValue(new Error("network error"))

    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/check",
      payload: { url: "https://example.com" },
    })

    const body = JSON.parse(res.body)
    expect(body.ret).toBe(1)
    expect(body.msg).toContain("network error")
    await app.close()
  })

  it("returns 400 when url is missing from body", async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/check",
      payload: {},
    })

    // Fastify schema validation returns 400
    expect(res.statusCode).toBe(400)
    await app.close()
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/server && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/server/src/routes/pwa/check.test.ts
git commit -m "test(server): add integration tests for POST /api/pwa/check"
```

---

### Task 6: Test `/api/pwa/add` route

**Files:**
- Create: `projects/server/src/routes/pwa/add.test.ts`
- Reference: `projects/server/src/routes/pwa/add.ts`, `projects/server/src/services/pwa-store.ts`

**Step 1: Write the tests**

Create `projects/server/src/routes/pwa/add.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import Fastify from "fastify"
import PwaAddRouter from "./add"

vi.mock("../../services/pwa-store", () => ({
  checkDuplicate: vi.fn(),
  addPwaToNotion: vi.fn(),
}))

import { checkDuplicate, addPwaToNotion } from "../../services/pwa-store"
const mockCheckDuplicate = vi.mocked(checkDuplicate)
const mockAddPwaToNotion = vi.mocked(addPwaToNotion)

describe("POST /add", () => {
  const buildApp = async () => {
    const app = Fastify()
    app.register(PwaAddRouter, { prefix: "/api/pwa" })
    await app.ready()
    return app
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("adds a PWA successfully", async () => {
    mockCheckDuplicate.mockResolvedValue(false)
    mockAddPwaToNotion.mockResolvedValue({ id: "page-123" })

    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/add",
      payload: {
        title: "My PWA",
        link: "https://my-pwa.com",
        icon: "https://my-pwa.com/icon.png",
      },
    })

    const body = JSON.parse(res.body)
    expect(body.ret).toBe(0)
    expect(body.data.id).toBe("page-123")
    await app.close()
  })

  it("rejects duplicate links", async () => {
    mockCheckDuplicate.mockResolvedValue(true)

    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/add",
      payload: {
        title: "Dup PWA",
        link: "https://exists.com",
        icon: "https://exists.com/icon.png",
      },
    })

    const body = JSON.parse(res.body)
    expect(body.ret).toBe(1)
    expect(body.msg).toContain("already exists")
    await app.close()
  })

  it("returns 400 for missing required fields", async () => {
    const app = await buildApp()
    const res = await app.inject({
      method: "POST",
      url: "/api/pwa/add",
      payload: { title: "No link" },
    })

    expect(res.statusCode).toBe(400)
    await app.close()
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/server && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/server/src/routes/pwa/add.test.ts
git commit -m "test(server): add integration tests for POST /api/pwa/add"
```

---

## Phase 4: Frontend Test Infrastructure

### Task 7: Install Vitest + Testing Library for the frontend

**Files:**
- Modify: `projects/web-next/package.json`
- Create: `projects/web-next/vitest.config.ts`

**Step 1: Install test dependencies**

```bash
cd projects/web-next
pnpm add -D vitest happy-dom @testing-library/react @testing-library/jest-dom
```

**Step 2: Create vitest config**

Create `projects/web-next/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Step 3: Create test setup file**

Create `projects/web-next/src/test-setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest"
```

**Step 4: Add test scripts to package.json**

Add to `projects/web-next/package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Step 5: Verify vitest runs (no tests yet)**

Run: `cd projects/web-next && pnpm test`
Expected: "No test files found" or similar clean exit

**Step 6: Commit**

```bash
git add projects/web-next/package.json projects/web-next/vitest.config.ts projects/web-next/src/test-setup.ts pnpm-lock.yaml
git commit -m "chore(web-next): add vitest + testing-library test infrastructure"
```

---

## Phase 5: Frontend Unit Tests — Pure Functions

### Task 8: Test `src/data/apps.ts`

**Files:**
- Create: `projects/web-next/src/data/apps.test.ts`
- Reference: `projects/web-next/src/data/apps.ts`

**Step 1: Write the tests**

Create `projects/web-next/src/data/apps.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import {
  buildCategories,
  getAppsByCategory,
  getFeaturedApps,
  searchApps,
  CATEGORY_META,
  type PWAApp,
} from "./apps"

const mockApps: PWAApp[] = [
  {
    id: "app-1",
    name: "Twitter Lite",
    description: "Fast social network",
    category: "social",
    icon: "/icon1.png",
    developer: "Twitter Inc",
    rating: 4.5,
    url: "https://twitter.com",
    featured: true,
    color: "#1DA1F2",
  },
  {
    id: "app-2",
    name: "Todoist",
    description: "Task manager for productivity",
    category: "productivity",
    icon: "/icon2.png",
    developer: "Doist",
    rating: 4.8,
    url: "https://todoist.com",
    featured: false,
    color: "#E44332",
  },
  {
    id: "app-3",
    name: "Slack",
    description: "Team communication",
    category: "productivity",
    icon: "/icon3.png",
    developer: "Slack Technologies",
    rating: 4.2,
    url: "https://slack.com",
    featured: true,
    color: "#4A154B",
  },
]

describe("buildCategories", () => {
  it("builds categories from app list with correct counts", () => {
    const categories = buildCategories(mockApps)
    expect(categories).toHaveLength(2)

    const social = categories.find((c) => c.id === "social")
    expect(social).toBeDefined()
    expect(social!.count).toBe(1)
    expect(social!.name).toBe("Social")

    const productivity = categories.find((c) => c.id === "productivity")
    expect(productivity!.count).toBe(2)
  })

  it("uses CATEGORY_META for known categories", () => {
    const categories = buildCategories(mockApps)
    const social = categories.find((c) => c.id === "social")!
    expect(social.icon).toBe(CATEGORY_META.social.icon)
    expect(social.color).toBe(CATEGORY_META.social.color)
  })

  it("generates fallback meta for unknown categories", () => {
    const apps: PWAApp[] = [
      { ...mockApps[0], category: "unknowncategory123" },
    ]
    const categories = buildCategories(apps)
    expect(categories[0].name).toBe("Unknowncategory123")
    expect(categories[0].icon).toBe("📂")
  })

  it("returns empty array for empty app list", () => {
    expect(buildCategories([])).toEqual([])
  })
})

describe("getAppsByCategory", () => {
  it("filters apps by category", () => {
    const result = getAppsByCategory(mockApps, "productivity")
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.category === "productivity")).toBe(true)
  })

  it("returns empty array for non-existent category", () => {
    expect(getAppsByCategory(mockApps, "nonexistent")).toEqual([])
  })
})

describe("getFeaturedApps", () => {
  it("returns only featured apps", () => {
    const result = getFeaturedApps(mockApps)
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.featured)).toBe(true)
  })
})

describe("searchApps", () => {
  it("searches by name (case-insensitive)", () => {
    const result = searchApps(mockApps, "twitter")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-1")
  })

  it("searches by description", () => {
    const result = searchApps(mockApps, "task manager")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-2")
  })

  it("searches by developer", () => {
    const result = searchApps(mockApps, "doist")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-2")
  })

  it("returns empty array for no match", () => {
    expect(searchApps(mockApps, "zzzznotfound")).toEqual([])
  })

  it("returns all apps for empty query", () => {
    expect(searchApps(mockApps, "")).toHaveLength(3)
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/web-next/src/data/apps.test.ts
git commit -m "test(web-next): add unit tests for data/apps utility functions"
```

---

### Task 9: Test `src/utils/cache.ts`

**Files:**
- Create: `projects/web-next/src/utils/cache.test.ts`
- Reference: `projects/web-next/src/utils/cache.ts`

**Step 1: Write the tests**

Create `projects/web-next/src/utils/cache.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { getCache, setCache, getStaleCacheData, isCacheExpired } from "./cache"

describe("cache utilities", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("setCache / getCache", () => {
    it("stores and retrieves data", () => {
      setCache("key1", { value: 42 })
      expect(getCache("key1")).toEqual({ value: 42 })
    })

    it("returns null for expired cache", () => {
      setCache("key2", "data", 1000)
      vi.advanceTimersByTime(1500)
      expect(getCache("key2")).toBeNull()
    })

    it("returns null for non-existent key", () => {
      expect(getCache("nope")).toBeNull()
    })

    it("returns null and cleans up on corrupt data", () => {
      localStorage.setItem("bad", "not-json{{{")
      expect(getCache("bad")).toBeNull()
      expect(localStorage.getItem("bad")).toBeNull()
    })
  })

  describe("getStaleCacheData", () => {
    it("returns data even after TTL expires", () => {
      setCache("stale", { fresh: true }, 1000)
      vi.advanceTimersByTime(5000)
      expect(getStaleCacheData("stale")).toEqual({ fresh: true })
    })

    it("returns null for non-existent key", () => {
      expect(getStaleCacheData("missing")).toBeNull()
    })
  })

  describe("isCacheExpired", () => {
    it("returns false for fresh cache", () => {
      setCache("fresh", "data", 60_000)
      expect(isCacheExpired("fresh")).toBe(false)
    })

    it("returns true for expired cache", () => {
      setCache("old", "data", 1000)
      vi.advanceTimersByTime(2000)
      expect(isCacheExpired("old")).toBe(true)
    })

    it("returns true for non-existent key", () => {
      expect(isCacheExpired("missing")).toBe(true)
    })
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/web-next/src/utils/cache.test.ts
git commit -m "test(web-next): add unit tests for cache utilities"
```

---

### Task 10: Test `src/utils/request.ts`

**Files:**
- Create: `projects/web-next/src/utils/request.test.ts`
- Reference: `projects/web-next/src/utils/request.ts`

**Step 1: Write the tests**

Create `projects/web-next/src/utils/request.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { request, post, postRaw } from "./request"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

function jsonResponse(data: any, status = 200, statusText = "OK") {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(data),
  }
}

describe("request", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns parsed response for successful request", async () => {
    const apiRes = { data: { id: 1 }, ret: 0, msg: "ok", timestamp: 123 }
    mockFetch.mockResolvedValue(jsonResponse(apiRes))

    const result = await request("/api/test")
    expect(result).toEqual(apiRes)
    expect(mockFetch).toHaveBeenCalledWith("/api/test", expect.objectContaining({
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
    }))
  })

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 500, "Internal Server Error"))
    await expect(request("/api/fail")).rejects.toThrow("HTTP Error: 500")
  })

  it("throws when ret !== 0", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: null, ret: 1, msg: "bad input", timestamp: 0 }))
    await expect(request("/api/bad")).rejects.toThrow("bad input")
  })
})

describe("post", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sends POST request with JSON body", async () => {
    const apiRes = { data: "ok", ret: 0, msg: "ok", timestamp: 0 }
    mockFetch.mockResolvedValue(jsonResponse(apiRes))

    await post("/api/create", { name: "test" })
    expect(mockFetch).toHaveBeenCalledWith("/api/create", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    }))
  })
})

describe("postRaw", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns raw JSON response (no ret check)", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ properties: [], has_more: false }))

    const result = await postRaw("/api/raw", { cursor: null })
    expect(result).toEqual({ properties: [], has_more: false })
  })

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 404, "Not Found"))
    await expect(postRaw("/api/missing", {})).rejects.toThrow("HTTP Error: 404")
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/web-next/src/utils/request.test.ts
git commit -m "test(web-next): add unit tests for request utilities"
```

---

## Phase 6: Frontend Service & Hook Tests

### Task 11: Test `src/services/appService.ts`

**Files:**
- Create: `projects/web-next/src/services/appService.test.ts`
- Reference: `projects/web-next/src/services/appService.ts`

**Step 1: Write the tests**

Create `projects/web-next/src/services/appService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/utils/request", () => ({
  postRaw: vi.fn(),
}))

import { postRaw } from "@/utils/request"
import { fetchAllApps } from "./appService"

const mockPostRaw = vi.mocked(postRaw)

describe("fetchAllApps", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("transforms Notion data into PWAApp format", async () => {
    mockPostRaw.mockResolvedValueOnce({
      properties: [
        {
          title: "My App",
          description: "A test app",
          tags: ["Social"],
          link: "https://myapp.com",
          icon: "https://myapp.com/icon.png",
        },
      ],
      has_more: false,
      next_cursor: null,
    })

    const result = await fetchAllApps()
    expect(result.apps).toHaveLength(1)
    expect(result.apps[0]).toMatchObject({
      id: "my-app",
      name: "My App",
      description: "A test app",
      category: "social",
      url: "https://myapp.com",
      icon: "https://myapp.com/icon.png",
    })
    expect(result.categories.length).toBeGreaterThanOrEqual(1)
  })

  it("handles pagination (multiple pages)", async () => {
    mockPostRaw
      .mockResolvedValueOnce({
        properties: [
          { title: "App 1", description: "", tags: ["Tools"], link: "https://a.com", icon: "" },
        ],
        has_more: true,
        next_cursor: "cursor-2",
      })
      .mockResolvedValueOnce({
        properties: [
          { title: "App 2", description: "", tags: ["Tools"], link: "https://b.com", icon: "" },
        ],
        has_more: false,
        next_cursor: null,
      })

    const result = await fetchAllApps()
    expect(result.apps).toHaveLength(2)
    expect(mockPostRaw).toHaveBeenCalledTimes(2)
    expect(mockPostRaw).toHaveBeenNthCalledWith(2, "/api/client/list", {
      start_cursor: "cursor-2",
    })
  })

  it("defaults category to 'other' when tags are empty", async () => {
    mockPostRaw.mockResolvedValueOnce({
      properties: [
        { title: "No Tags", description: "", tags: [], link: "https://x.com", icon: "" },
      ],
      has_more: false,
      next_cursor: null,
    })

    const result = await fetchAllApps()
    expect(result.apps[0].category).toBe("other")
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/web-next/src/services/appService.test.ts
git commit -m "test(web-next): add unit tests for appService"
```

---

### Task 12: Test `src/hooks/useApps.ts`

**Files:**
- Create: `projects/web-next/src/hooks/useApps.test.ts`
- Reference: `projects/web-next/src/hooks/useApps.ts`

**Step 1: Write the tests**

Create `projects/web-next/src/hooks/useApps.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useApps } from "./useApps"

vi.mock("@/services/appService", () => ({
  fetchAllApps: vi.fn(),
}))

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}))

import { fetchAllApps } from "@/services/appService"
import { getCache, getStaleCacheData } from "@/utils/cache"

const mockFetchAllApps = vi.mocked(fetchAllApps)
const mockGetCache = vi.mocked(getCache)
const mockGetStaleCacheData = vi.mocked(getStaleCacheData)

const fakeData = {
  apps: [
    {
      id: "test",
      name: "Test App",
      description: "desc",
      category: "tools",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://test.com",
      color: "#000",
    },
  ],
  categories: [{ id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 1 }],
}

describe("useApps", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGetStaleCacheData.mockReturnValue(null)
    mockGetCache.mockReturnValue(null)
  })

  it("fetches apps and returns them", async () => {
    mockFetchAllApps.mockResolvedValue(fakeData)

    const { result } = renderHook(() => useApps())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.apps).toHaveLength(1)
    expect(result.current.apps[0].name).toBe("Test App")
    expect(result.current.error).toBeNull()
  })

  it("sets error when fetch fails and no cache exists", async () => {
    mockFetchAllApps.mockRejectedValue(new Error("Network fail"))

    const { result } = renderHook(() => useApps())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Network fail")
  })

  it("uses stale cache data during initial render", async () => {
    mockGetStaleCacheData.mockReturnValue(fakeData)
    mockFetchAllApps.mockResolvedValue(fakeData)

    const { result } = renderHook(() => useApps())

    // Should not be loading since stale cache is available
    expect(result.current.loading).toBe(false)
    expect(result.current.apps).toHaveLength(1)
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd projects/web-next && pnpm test`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add projects/web-next/src/hooks/useApps.test.ts
git commit -m "test(web-next): add unit tests for useApps hook"
```

---

## Phase 7: CI Integration

### Task 13: Add test steps to CI workflow

**Files:**
- Modify: `.github/workflows/active-base.yml`

**Step 1: Update the workflow to include test jobs**

Replace the content of `.github/workflows/active-base.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 2,5"

jobs:
  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test
        working-directory: projects/server

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test
        working-directory: projects/web-next

  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: curl test
        run: curl 'https://pwaland.brandonxiang.top/api/get-list'
```

**Step 2: Commit**

```bash
git add .github/workflows/active-base.yml
git commit -m "ci: add unit test jobs for server and web-next"
```

---

## Summary

| Phase | Task | Scope | Test Count (approx) |
|-------|------|-------|---------------------|
| 1 | Task 1 | Server infra setup | 0 |
| 2 | Task 2 | `utils/index.ts` | 8 |
| 2 | Task 3 | `pwa-checker.ts` (pure) | 13 |
| 2 | Task 4 | `domain-sources.ts` (pure) | 5 |
| 3 | Task 5 | Route: `/pwa/check` | 3 |
| 3 | Task 6 | Route: `/pwa/add` | 3 |
| 4 | Task 7 | Frontend infra setup | 0 |
| 5 | Task 8 | `data/apps.ts` | 10 |
| 5 | Task 9 | `utils/cache.ts` | 8 |
| 5 | Task 10 | `utils/request.ts` | 6 |
| 6 | Task 11 | `services/appService.ts` | 3 |
| 6 | Task 12 | `hooks/useApps.ts` | 3 |
| 7 | Task 13 | CI integration | - |
| **Total** | | | **~62 tests** |
