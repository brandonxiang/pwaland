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
