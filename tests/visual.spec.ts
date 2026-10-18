import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("capture the finished home and map layouts", async ({
  page,
}, testInfo) => {
  mkdirSync("artifacts", { recursive: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `artifacts/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/map?place=lake-braies");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible({
    timeout: 15000,
  });
  await page.screenshot({
    path: `artifacts/map-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
