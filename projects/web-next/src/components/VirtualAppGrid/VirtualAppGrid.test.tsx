import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { VirtualAppGrid } from "./index";
import type { PWAApp, Category } from "@/data/apps";

beforeEach(() => {
  vi.clearAllMocks();
});

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
    tags: ["tools"],
  }));

const categories: Category[] = [
  { id: "tools", name: "Tools", icon: "🔧", color: "#64748B", gradient: "", count: 10 },
];

const defaultRenderCard = (app: PWAApp) => (
  <div key={app.id} data-testid={`card-${app.id}`}>
    <span>{app.name}</span>
  </div>
);

describe("VirtualAppGrid", () => {
  it("renders app cards for the provided apps", () => {
    const apps = makeApps(3);
    render(
      <VirtualAppGrid
        apps={apps}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    );
    expect(screen.getByText("App 0")).toBeInTheDocument();
    expect(screen.getByText("App 1")).toBeInTheDocument();
    expect(screen.getByText("App 2")).toBeInTheDocument();
  });

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
    );
    expect(screen.getByText("Loading more apps...")).toBeInTheDocument();
  });

  it("renders load more button when hasMore is true", () => {
    const onLoadMore = vi.fn();
    render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={true}
        loadingMore={false}
        onLoadMore={onLoadMore}
        renderCard={defaultRenderCard}
      />,
    );
    const button = screen.getByRole("button", { name: "Load more" });
    fireEvent.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not render load more button when hasMore is false", () => {
    render(
      <VirtualAppGrid
        apps={makeApps(2)}
        categories={categories}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        renderCard={defaultRenderCard}
      />,
    );
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

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
    );
    expect(screen.getByText("No apps found")).toBeInTheDocument();
  });
});
