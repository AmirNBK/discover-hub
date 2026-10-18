import { test, expect } from "@playwright/test";

test("map and interactive navigation load without missing application scripts", async ({
  page,
}) => {
  const scriptFailures: string[] = [],
    errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("/_next/static/") && response.status() >= 400) {
      scriptFailures.push(
        `${response.status()} ${new URL(response.url()).pathname}`,
      );
    }
  });
  await page.goto("/map?place=lake-braies");
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 30000,
  });
  await expect(page).toHaveTitle("Explore the map | DiscoverHub");
  await expect(page.locator(".map-result.selected")).toContainText(
    "Lake Braies",
  );
  await page.locator('.leaflet-marker-icon[title="Lake Braies"]').click();
  await expect(page.locator(".leaflet-popup")).toContainText("Lake Braies");
  await page
    .getByRole("button", { name: "Save Lake Braies", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(page.locator(".map-result")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Unsave Lake Braies", exact: true })
    .click();
  await expect(page.locator(".map-results .empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page
    .getByRole("link", { name: "DiscoverHub home", exact: true })
    .click();
  await page.getByLabel("Where would you like to go?").fill("Italy");
  await page
    .getByRole("button", { name: "Search destinations", exact: true })
    .click();
  await expect(page.locator(".map-result")).toHaveCount(2);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  expect(scriptFailures).toEqual([]);
  expect(errors).toEqual([]);
});
