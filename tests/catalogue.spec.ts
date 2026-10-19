import { test, expect } from "@playwright/test";

test("guest import is explicit and account saves sync across browser sessions", async ({
  page,
  browser,
}, testInfo) => {
  const email = `collection-${testInfo.project.name}-${Date.now()}@example.com`;
  const password = "a-secure-test-password";
  await page.goto("/");
  await page
    .getByRole("button", { name: "Save Lake Braies", exact: true })
    .click();
  await page.goto("/sign-up");
  await page.getByLabel("Your name").fill("Collection Explorer");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await page.goto("/saved");
  await expect(page.locator(".empty-state")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy device saves to account" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Copy device saves to account" })
    .click();
  await expect(page.locator(".place-card")).toHaveCount(1);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("discoverhub:saved") || "[]"),
    ),
  ).toEqual([]);

  const device = await browser.newContext({ baseURL: "http://localhost:3100" });
  try {
    const login = await device.request.post("/api/auth/login", {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const otherPage = await device.newPage();
    await otherPage.goto("/saved");
    await expect(otherPage.locator(".place-title")).toHaveText("Lake Braies");
    await otherPage.getByRole("button", { name: "Unsave Lake Braies" }).click();
    await expect(otherPage.locator(".empty-state")).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.locator(".empty-state")).toBeVisible();

    await page.goto("/");
    await page.route("**/api/saved", (route) =>
      route.fulfill({
        status: 503,
        json: { error: "Could not sync. Please try again." },
      }),
    );
    await page
      .getByRole("button", { name: "Save Lake Garda", exact: true })
      .click();
    await expect(page.locator(".toast")).toContainText("Could not sync");
    await expect(
      page.getByRole("button", { name: "Save Lake Garda", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("discoverhub:saved") || "[]"),
      ),
    ).toEqual([]);
    await page.unroute("**/api/saved");
    await page
      .getByRole("button", { name: "Save Lake Garda", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Unsave Lake Garda" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page
      .locator(".header-account")
      .getByRole("button", { name: "Sign out" })
      .click();
    await expect(page.locator(".user-greeting")).toHaveCount(0);
    await page.goto("/saved");
    await expect(page.locator(".empty-state")).toBeVisible();
    await otherPage.reload();
    await expect(otherPage.locator(".place-title")).toHaveText("Lake Garda");
  } finally {
    await device.close();
  }
});

test("catalogue failures can be retried without pretending the collection is empty", async ({
  page,
}) => {
  await page.route("**/api/destinations", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Catalogue temporarily unavailable." },
    }),
  );
  await page.goto("/#destinations");
  await expect(page.locator(".catalogue-status[role=alert]")).toContainText(
    "Catalogue temporarily unavailable",
  );
  await expect(page.locator(".empty-state")).toHaveCount(0);
  await page.unroute("**/api/destinations");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".place-card")).toHaveCount(4);
});

test("catalogue pagination and categories render server results", async ({
  page,
}) => {
  await page.route("**/api/destinations", async (route) => {
    const params = route.request().postDataJSON();
    const pageOffset = params.offset || 0;
    const destinations = Array.from(
      { length: pageOffset ? 1 : 12 },
      (_, index) => ({
        id: `test-culture-${pageOffset + index}`,
        name: `Culture place ${pageOffset + index}`,
        category: "Culture",
        region: "Region",
        country: "Country",
        latitude: 10,
        longitude: 20,
        photoKey: "",
        imageAlt: "",
        tagline: "Discover somewhere new.",
        description: "A catalogue destination.",
        highlights: ["Explore on foot"],
        tip: "Check local information.",
      }),
    );
    await route.fulfill({
      json: {
        destinations,
        total: 13,
        offset: pageOffset,
        limit: 12,
        categories: ["Culture"],
      },
    });
  });
  await page.goto("/#destinations");
  await expect(page.locator(".place-card")).toHaveCount(12);
  await expect(
    page.getByRole("button", { name: "Culture", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".place-photo img")).toHaveCount(0);
  await page.getByRole("button", { name: "Next places" }).click();
  await expect(page.locator(".place-card")).toHaveCount(1);
  await expect(page.locator(".place-title")).toHaveText("Culture place 12");
  await page.getByRole("button", { name: "Culture", exact: true }).click();
  await expect(page.locator(".place-card")).toHaveCount(12);
  await expect(
    page.getByRole("button", { name: "Previous places" }),
  ).toBeDisabled();
});

test("unknown account status blocks saves until the connection is retried", async ({
  page,
}) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 503, json: { error: "Unavailable" } }),
  );
  await page.goto("/");
  const save = page.getByRole("button", {
    name: "Save Lake Braies",
    exact: true,
  });
  await expect(save).toBeDisabled();
  await expect(page.locator(".connection-warning")).toContainText(
    "Reconnect to save places",
  );
  await page.unroute("**/api/auth/me");
  await page
    .getByRole("button", { name: "Retry connection", exact: true })
    .click();
  await expect(save).toBeEnabled();
  await save.click();
  await expect(
    page.getByRole("button", { name: "Unsave Lake Braies" }),
  ).toHaveAttribute("aria-pressed", "true");
});
