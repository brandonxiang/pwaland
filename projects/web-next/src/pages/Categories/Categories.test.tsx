import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AppData } from "@/services/appService";

vi.mock("@/services/appService", () => ({
  fetchAllApps: vi.fn(),
}));

vi.mock("@/utils/cache", () => ({
  getCache: vi.fn(() => null),
  setCache: vi.fn(),
  getStaleCacheData: vi.fn(() => null),
}));

import { fetchAllApps } from "@/services/appService";
import Categories from "./index";

const mockFetchAllApps = vi.mocked(fetchAllApps);

const fakeData: AppData = {
  apps: [
    {
      id: "entertainment-app",
      name: "Movie PWA",
      description: "Watch movies",
      category: "entertainment",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://movie.example.com",
      color: "#8B5CF6",
      tags: ["entertainment"],
    },
    {
      id: "tools-app",
      name: "Tool PWA",
      description: "Build things",
      category: "tools",
      icon: "",
      developer: "",
      rating: 0,
      url: "https://tool.example.com",
      color: "#64748B",
      tags: ["tools"],
    },
  ],
  categories: [
    {
      id: "entertainment",
      name: "Entertainment",
      icon: "🎬",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
      count: 1,
    },
    {
      id: "tools",
      name: "Tools",
      icon: "🔧",
      color: "#64748B",
      gradient: "linear-gradient(135deg, #64748B, #475569)",
      count: 1,
    },
  ],
};

describe("Categories page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAllApps.mockResolvedValue(fakeData);
  });

  it("defaults to the entertainment category", async () => {
    render(<Categories />);

    const entertainmentButton = await screen.findByRole("button", { name: /Entertainment/i });

    expect(entertainmentButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Movie PWA")).toBeInTheDocument();
    expect(screen.queryByText("Tool PWA")).not.toBeInTheDocument();
  });

  it("filters apps when a category is clicked", async () => {
    render(<Categories />);

    const toolsButton = await screen.findByRole("button", { name: /Tools/i });
    fireEvent.click(toolsButton);

    await waitFor(() => {
      expect(toolsButton).toHaveAttribute("aria-pressed", "true");
    });

    expect(screen.getByText("Tool PWA")).toBeInTheDocument();
    expect(screen.queryByText("Movie PWA")).not.toBeInTheDocument();
  });

  it("shows all apps when All categories is clicked", async () => {
    render(<Categories />);

    const allButton = await screen.findByRole("button", { name: /All categories/i });
    fireEvent.click(allButton);

    expect(within(allButton).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Movie PWA")).toBeInTheDocument();
    expect(screen.getByText("Tool PWA")).toBeInTheDocument();
  });
});
