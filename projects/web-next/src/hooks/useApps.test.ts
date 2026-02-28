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
  categories: [
    { id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 1 },
  ],
}

describe("useApps", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    expect(result.current.loading).toBe(false)
    expect(result.current.apps).toHaveLength(1)
  })
})
