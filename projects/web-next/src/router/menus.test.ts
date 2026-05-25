import { describe, expect, it } from "vite-plus/test";
import { dataRoutes } from "./menus";

describe("dataRoutes", () => {
  it("includes the main public pages", () => {
    const paths = dataRoutes.map((route) => route.path);

    expect(paths).toContain("/");
    expect(paths).toContain("/categories");
    expect(paths).toContain("/submit");
    expect(paths).not.toContain("/about");
  });
});
