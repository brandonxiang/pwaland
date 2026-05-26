import { describe, expect, it } from "vite-plus/test";
import { normalizeCategoryId, normalizeCategoryTags } from "./categories";

describe("normalizeCategoryId", () => {
  it("maps Chinese labels and display names to English category ids", () => {
    expect(normalizeCategoryId("开发工具")).toBe("tools");
    expect(normalizeCategoryId("Developer Tools")).toBe("tools");
    expect(normalizeCategoryId("影音图片")).toBe("entertainment");
    expect(normalizeCategoryId("Health & Fitness")).toBe("health");
  });

  it("falls back unknown or empty values to other", () => {
    expect(normalizeCategoryId("Auto-discovered")).toBe("other");
    expect(normalizeCategoryId("")).toBe("other");
    expect(normalizeCategoryId()).toBe("other");
  });
});

describe("normalizeCategoryTags", () => {
  it("deduplicates normalized tags and defaults to other", () => {
    expect(normalizeCategoryTags(["开发工具", "Developer Tools", "新闻资讯"])).toEqual([
      "tools",
      "news",
    ]);
    expect(normalizeCategoryTags([])).toEqual(["other"]);
  });
});
