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
