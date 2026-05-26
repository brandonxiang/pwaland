import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const queryMock = vi.hoisted(() => vi.fn());

vi.mock("@notionhq/client", () => ({
  Client: vi.fn(function Client() {
    return {
      databases: {
        query: queryMock,
      },
    };
  }),
}));

const setNotionEnv = () => {
  process.env.NOTION_API_KEY = "test-key";
  process.env.NOTION_PWA_DATABASE_ID = "pwa-db";
  process.env.NOTION_STARTER_DATABASE_ID = "starter-db";
};

describe("fetchNotionData cache", () => {
  beforeEach(() => {
    vi.resetModules();
    queryMock.mockReset();
    setNotionEnv();
    delete process.env.NOTION_LIST_CACHE_TTL_MS;
  });

  it("reuses a cached first-page response within the TTL", async () => {
    const response = { results: [], has_more: false, next_cursor: null };
    queryMock.mockResolvedValue(response);

    const { fetchNotionData } = await import("./notion");

    const first = await fetchNotionData("pwa-db");
    const second = await fetchNotionData("pwa-db");

    expect(first).toBe(response);
    expect(second).toBe(response);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("uses a separate cache entry for each cursor", async () => {
    queryMock
      .mockResolvedValueOnce({ results: ["first"], has_more: true, next_cursor: "next" })
      .mockResolvedValueOnce({ results: ["second"], has_more: false, next_cursor: null });

    const { fetchNotionData } = await import("./notion");

    await fetchNotionData("pwa-db");
    await fetchNotionData("pwa-db", "next");

    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it("can disable caching with NOTION_LIST_CACHE_TTL_MS=0", async () => {
    process.env.NOTION_LIST_CACHE_TTL_MS = "0";
    queryMock
      .mockResolvedValueOnce({ results: ["first"], has_more: false, next_cursor: null })
      .mockResolvedValueOnce({ results: ["second"], has_more: false, next_cursor: null });

    const { fetchNotionData } = await import("./notion");

    await fetchNotionData("pwa-db");
    await fetchNotionData("pwa-db");

    expect(queryMock).toHaveBeenCalledTimes(2);
  });
});
