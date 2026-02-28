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
