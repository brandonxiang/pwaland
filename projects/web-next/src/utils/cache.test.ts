import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

const store = new Map<string, string>()
const localStorageMock: Storage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value) },
  removeItem: (key: string) => { store.delete(key) },
  clear: () => { store.clear() },
  get length() { return store.size },
  key: (index: number) => Array.from(store.keys())[index] ?? null,
}

vi.stubGlobal("localStorage", localStorageMock)

import { getCache, setCache, getStaleCacheData, isCacheExpired } from "./cache"

describe("cache utilities", () => {
  beforeEach(() => {
    store.clear()
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
      store.set("bad", "not-json{{{")
      expect(getCache("bad")).toBeNull()
      expect(store.has("bad")).toBe(false)
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
