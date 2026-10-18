import { test, expect } from "@playwright/test";

test("nearby results and directions work when the service responds", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (value: unknown) => void) =>
          success({ coords: { latitude: 51.5, longitude: -0.1 } }),
      },
    });
  });
  await page.route("**/api/places?*", (route) =>
    route.fulfill({
      json: {
        places: [
          {
            id: "test-place",
            name: "Neighbourhood Garden",
            category: "Park",
            latitude: 51.501,
            longitude: -0.11,
            address: "London",
          },
        ],
      },
    }),
  );
  await page.goto("/map");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.locator(".map-result")).toHaveCount(1);
  await expect(page.locator(".map-result")).toContainText(
    "Neighbourhood Garden",
  );
  await expect(
    page.locator(".map-result").getByRole("link", { name: "Directions" }),
  ).toHaveAttribute("href", /destination=51.501,-0.11/);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".map-result")).toHaveCount(4);
});

test("map reports tile failures and keeps directions usable", async ({
  page,
}) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.goto("/map");
  await expect(page.locator(".tile-error")).toBeVisible();
  await expect(page.locator(".map-result")).toHaveCount(4);
  await expect(
    page
      .locator(".map-result")
      .first()
      .getByRole("link", { name: "Directions" }),
  ).toBeVisible();
});

test("home search opens filtered map and selection works", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) =>
    errors.push(`${page.url()}: ${error.message}`),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little curiosity.",
  );
  await page.getByLabel("Where would you like to go?").fill("Italy");
  await page
    .getByRole("button", { name: "Search destinations", exact: true })
    .click();
  await expect(page).toHaveURL(/map\?q=Italy/);
  await expect(page.locator(".map-result")).toHaveCount(2);
  await page.locator(".map-result-main").first().click();
  await expect(page.locator(".map-result.selected")).toHaveCount(1);
  await expect(page.locator(".leaflet-container")).toBeVisible();
  expect(errors).toEqual([]);
});

test("category filters, search, and empty state work", async ({ page }) => {
  await page.goto("/#destinations");
  await expect(page.locator(".place-card")).toHaveCount(4);
  await page.getByRole("button", { name: "Coast", exact: true }).click();
  await expect(page.locator(".place-card")).toHaveCount(1);
  await expect(page.locator(".place-title")).toContainText("Koh Lipe");
  await page.getByLabel("Filter destinations").fill("nowhere");
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Browse all places" }).click();
  await expect(page.locator(".place-card")).toHaveCount(4);
});

test("saved places persist and can be removed", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Save Lake Braies", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unsave Lake Braies" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved");
  await expect(page.locator(".place-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".place-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Unsave Lake Braies" }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
});

test("destination detail links to its map and directions", async ({ page }) => {
  await page.goto("/destinations/lake-braies");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lake Braies",
  );
  await expect(
    page.getByRole("link", { name: "Open directions" }),
  ).toHaveAttribute("href", /destination=46.6943,12.0856/);
  await page.getByRole("link", { name: "See on the map" }).click();
  await expect(page).toHaveURL(/map\?place=lake-braies/);
  await expect(page.locator(".map-result.selected")).toContainText(
    "Lake Braies",
  );
});

test("map stays usable when location is declined", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          _success: unknown,
          error: (value: { code: number }) => void,
        ) => error({ code: 1 }),
      },
    });
  });
  await page.goto("/map");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Location permission was declined",
  );
  await expect(page.locator(".map-result")).toHaveCount(4);
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("map handles nearby service being unconfigured", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (value: unknown) => void) =>
          success({ coords: { latitude: 51.5, longitude: -0.1 } }),
      },
    });
  });
  await page.goto("/map");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.locator(".map-status")).toContainText(
    "Live nearby discovery is not connected",
  );
  await expect(page.locator(".map-result")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Use my location" }),
  ).toBeEnabled();
});

test("contact form saves the message and shows confirmation", async ({
  page,
}) => {
  await page.goto("/contact-us");
  await page.getByLabel("Your name").fill("Browser Test");
  await page.getByLabel("Email address").fill("browser@example.com");
  await page
    .getByLabel("Your message")
    .fill("A browser test message for the DiscoverHub team.");
  await page.getByRole("button", { name: "Send your message" }).click();
  await expect(
    page.getByRole("heading", { name: "Message received." }),
  ).toBeVisible();
});

test("registration, session refresh, logout and login work", async ({
  page,
}) => {
  const email = `browser-${Date.now()}@example.com`;
  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill("Curious Explorer");
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("A-strong-test-password!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".user-greeting")).toHaveText("Hi, Curious");
  await page.reload();
  await expect(page.locator(".user-greeting")).toHaveText("Hi, Curious");
  await page
    .locator(".header-account")
    .getByRole("button", { name: "Sign out" })
    .click();
  await expect(page.locator(".user-greeting")).toHaveCount(0);
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("A-strong-test-password!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".user-greeting")).toHaveText("Hi, Curious");
});

test("all routes render without runtime errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) =>
    errors.push(`${page.url()}: ${error.message}`),
  );
  for (const route of [
    "/",
    "/about-us",
    "/contact-us",
    "/login",
    "/sign-up",
    "/saved",
    "/privacy",
    "/destinations/lake-garda",
    "/destinations/koh-lipe",
    "/destinations/cappadocia",
    "/map",
    "/not-a-page",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(route === "/not-a-page" ? 404 : 200);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      `${route} overflows`,
    ).toBeTruthy();
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      expect(
        await image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
  }
  expect(errors).toEqual([]);
});

test("mobile menu works and closes after navigation", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile navigation only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Our story", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL("/about-us");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});
