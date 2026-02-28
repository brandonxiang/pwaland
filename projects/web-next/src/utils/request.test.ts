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
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    )
  })

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 500, "Internal Server Error"))
    await expect(request("/api/fail")).rejects.toThrow("HTTP Error: 500")
  })

  it("throws when ret !== 0", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ data: null, ret: 1, msg: "bad input", timestamp: 0 }),
    )
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
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      }),
    )
  })
})

describe("postRaw", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns raw JSON response (no ret check)", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ properties: [], has_more: false }),
    )

    const result = await postRaw("/api/raw", { cursor: null })
    expect(result).toEqual({ properties: [], has_more: false })
  })

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 404, "Not Found"))
    await expect(postRaw("/api/missing", {})).rejects.toThrow("HTTP Error: 404")
  })
})
