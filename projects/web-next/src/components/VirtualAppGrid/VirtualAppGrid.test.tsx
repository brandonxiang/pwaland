import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { VirtualAppGrid } from "./index"
import type { PWAApp, Category } from "@/data/apps"

const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

const makeApps = (count: number): PWAApp[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `app-${i}`,
    name: `App ${i}`,
    description: `Description ${i}`,
    category: "tools",
    icon: "",
    developer: "",
    rating: 0,
    url: `https://app${i}.com`,
    color: "#000",
  }))

const categories: Category[] = [
  { id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 10 },
]

const defaultRenderCard = (app: PWAApp) => (
  <div key={app.id} data-testid={`card-${app.id}`}>
    <span>{app.name}</span>
  </div>
)

describe("VirtualAppGrid", () => {
  it("renders app cards for the provided apps", () => {
    const apps = makeApps(3)
    render(
      <VirtualAppGrid
        apps={apps}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    )
    expect(screen.getByText("App 0")).toBeInTheDocument()
    expect(screen.getByText("App 1")).toBeInTheDocument()
    expect(screen.getByText("App 2")).toBeInTheDocument()
  })

  it("shows loading indicator when loadingMore is true", () => {
    render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={true}
        loadingMore={true}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    )
    expect(screen.getByText("Loading more apps...")).toBeInTheDocument()
  })

  it("renders sentinel element when hasMore is true", () => {
    const { container } = render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={true}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    )
    expect(container.querySelector("[data-testid='load-more-sentinel']")).toBeInTheDocument()
  })

  it("does not render sentinel when hasMore is false", () => {
    const { container } = render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    )
    expect(container.querySelector("[data-testid='load-more-sentinel']")).not.toBeInTheDocument()
  })

  it("renders empty state when no apps provided", () => {
    render(
      <VirtualAppGrid
        apps={[]}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    )
    expect(screen.getByText("No apps found")).toBeInTheDocument()
  })
})
