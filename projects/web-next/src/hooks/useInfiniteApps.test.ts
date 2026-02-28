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
