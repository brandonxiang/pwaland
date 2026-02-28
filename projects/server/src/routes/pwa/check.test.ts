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

    expect(res.statusCode).toBe(400)
    await app.close()
  })
})
