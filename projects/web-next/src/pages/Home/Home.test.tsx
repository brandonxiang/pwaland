import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("@/services/appService", () => ({
  fetchAppsPage: vi.fn(),
}));

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}));

import { fetchAppsPage } from "@/services/appService";
import Home from "./index";

const mockFetchAppsPage = vi.mocked(fetchAppsPage);

beforeEach(() => {
  vi.clearAllMocks();

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
  });
});

describe("Home page", () => {
  it("renders loaded apps after fetch completes", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test PWA")).toBeInTheDocument();
    });
  });

  it("shows the hero section", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText("Discover the Best")).toBeInTheDocument();
  });

  it("loads more apps only after clicking the load more button", async () => {
    mockFetchAppsPage
      .mockResolvedValueOnce({
        apps: [
          {
            id: "app-1",
            name: "First PWA",
            description: "First page",
            category: "tools",
            icon: "",
            developer: "",
            rating: 0,
            url: "https://first.com",
            color: "#64748B",
            tags: ["tools"],
          },
        ],
        hasMore: true,
        nextCursor: "cursor-2",
      })
      .mockResolvedValueOnce({
        apps: [
          {
            id: "app-2",
            name: "Second PWA",
            description: "Second page",
            category: "social",
            icon: "",
            developer: "",
            rating: 0,
            url: "https://second.com",
            color: "#64748B",
            tags: ["social"],
          },
        ],
        hasMore: false,
        nextCursor: null,
      });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("First PWA")).toBeInTheDocument();
    });

    expect(mockFetchAppsPage).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => {
      expect(screen.getByText("Second PWA")).toBeInTheDocument();
    });

    expect(mockFetchAppsPage).toHaveBeenNthCalledWith(2, "cursor-2", undefined);
  });

  it("sends search text to the backend page API", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Test PWA")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Search PWA apps"), {
      target: { value: "spotify" },
    });

    await waitFor(() => {
      expect(mockFetchAppsPage).toHaveBeenLastCalledWith(undefined, "spotify");
    });
  });
});
