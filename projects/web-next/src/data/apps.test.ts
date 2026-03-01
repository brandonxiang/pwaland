import { describe, it, expect } from "vitest"
import {
  buildCategories,
  getAppsByCategory,
  getFeaturedApps,
  searchApps,
  CATEGORY_META,
  type PWAApp,
} from "./apps"

const mockApps: PWAApp[] = [
  {
    id: "app-1",
    name: "Twitter Lite",
    description: "Fast social network",
    category: "social",
    icon: "/icon1.png",
    developer: "Twitter Inc",
    rating: 4.5,
    url: "https://twitter.com",
    featured: true,
    color: "#1DA1F2",
    tags: ["social", "twitter"],
  },
  {
    id: "app-2",
    name: "Todoist",
    description: "Task manager for productivity",
    category: "productivity",
    icon: "/icon2.png",
    developer: "Doist",
    rating: 4.8,
    url: "https://todoist.com",
    featured: false,
    color: "#E44332",
    tags: ["productivity", "tasks"],
  },
  {
    id: "app-3",
    name: "Slack",
    description: "Team communication",
    category: "productivity",
    icon: "/icon3.png",
    developer: "Slack Technologies",
    rating: 4.2,
    url: "https://slack.com",
    featured: true,
    color: "#4A154B",
    tags: ["productivity", "communication"],
  },
]

describe("buildCategories", () => {
  it("builds categories from app list with correct counts", () => {
    const categories = buildCategories(mockApps)
    expect(categories).toHaveLength(2)

    const social = categories.find((c) => c.id === "social")
    expect(social).toBeDefined()
    expect(social!.count).toBe(1)
    expect(social!.name).toBe("Social")

    const productivity = categories.find((c) => c.id === "productivity")
    expect(productivity!.count).toBe(2)
  })

  it("uses CATEGORY_META for known categories", () => {
    const categories = buildCategories(mockApps)
    const social = categories.find((c) => c.id === "social")!
    expect(social.icon).toBe(CATEGORY_META.social.icon)
    expect(social.color).toBe(CATEGORY_META.social.color)
  })

  it("generates fallback meta for unknown categories", () => {
    const apps: PWAApp[] = [
      { ...mockApps[0], category: "unknowncategory123" },
    ]
    const categories = buildCategories(apps)
    expect(categories[0].name).toBe("Unknowncategory123")
    expect(categories[0].icon).toBe("📂")
  })

  it("returns empty array for empty app list", () => {
    expect(buildCategories([])).toEqual([])
  })
})

describe("getAppsByCategory", () => {
  it("filters apps by category", () => {
    const result = getAppsByCategory(mockApps, "productivity")
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.category === "productivity")).toBe(true)
  })

  it("returns empty array for non-existent category", () => {
    expect(getAppsByCategory(mockApps, "nonexistent")).toEqual([])
  })
})

describe("getFeaturedApps", () => {
  it("returns only featured apps", () => {
    const result = getFeaturedApps(mockApps)
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.featured)).toBe(true)
  })
})

describe("searchApps", () => {
  it("searches by name (case-insensitive)", () => {
    const result = searchApps(mockApps, "twitter")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-1")
  })

  it("searches by description", () => {
    const result = searchApps(mockApps, "task manager")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-2")
  })

  it("searches by developer", () => {
    const result = searchApps(mockApps, "doist")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-2")
  })

  it("searches by tags", () => {
    const result = searchApps(mockApps, "twitter")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("app-1")
  })

  it("returns empty array for no match", () => {
    expect(searchApps(mockApps, "zzzznotfound")).toEqual([])
  })

  it("returns all apps for empty query", () => {
    expect(searchApps(mockApps, "")).toHaveLength(3)
  })
})
