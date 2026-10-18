import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

// Exercise the server the developer is actually browsing, rather than silently
// starting a separate fresh server that cannot expose stale-runtime problems.
export default defineConfig({
  ...config,
  webServer: undefined,
  testMatch: "bootstrap.spec.ts",
  use: { ...config.use, baseURL: "http://localhost:3000" },
  projects: config.projects?.filter((project) =>
    ["desktop", "mobile"].includes(project.name || ""),
  ),
});
