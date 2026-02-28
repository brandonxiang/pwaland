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
