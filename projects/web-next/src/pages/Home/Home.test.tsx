import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

vi.mock("@/services/appService", () => ({
  fetchAppsPage: vi.fn(),
}))

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}))

import { fetchAppsPage } from "@/services/appService"
import Home from "./index"

const mockFetchAppsPage = vi.mocked(fetchAppsPage)

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}
  observe = mockObserve
  unobserve = vi.fn()
  disconnect = mockDisconnect
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

  mockFetchAppsPage.mockResolvedValue({
    apps: [
      {
        id: "app-1",
        name: "Test PWA",
        description: "A test PWA app",
        category: "tools",
        icon: "",
        developer: "",
        rating: 0,
        url: "https://test.com",
        color: "#64748B",
        tags: ["tools"],
      },
    ],
    hasMore: false,
    nextCursor: null,
  })
})

describe("Home page", () => {
  it("renders loaded apps after fetch completes", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Test PWA")).toBeInTheDocument()
    })
  })

  it("shows the hero section", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText("Discover the Best")).toBeInTheDocument()
  })
})
