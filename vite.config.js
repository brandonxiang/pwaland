import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite-plus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./projects/web-next/src"),
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["projects/**/*.test.{ts,tsx}"],
    setupFiles: [path.resolve(__dirname, "./projects/web-next/src/test-setup.ts")],
  },
});
