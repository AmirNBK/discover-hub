import { test, expect } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

test("photos stay sharp at the screen density and within download budgets", async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(120000);
  mkdirSync("artifacts", { recursive: true });
  const records: {
    route: string;
    image: string;
    format: string;
    bytes: number;
    pixels: string;
    density: number;
    screenDensity: number;
  }[] = [];
  const bodies = new Map<
    string,
    { bytes: number; width: number; height: number; format: string }
  >();
  for (const route of [
    "/",
    "/destinations/lake-braies",
    "/destinations/lake-garda",
    "/destinations/koh-lipe",
    "/destinations/cappadocia",
    "/about-us",
    "/login",
    "/sign-up",
  ]) {
    await page.goto(route);
    if (route === "/") await expect(page.locator(".place-card")).toHaveCount(4);
    const routeUrls = new Set<string>();
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      const info = await image.evaluate((element) => {
        const img = element as HTMLImageElement,
          box = img.getBoundingClientRect();
        return {
          url: img.currentSrc,
          width: box.width,
          height: box.height,
          dpr: window.devicePixelRatio,
          alt: img.alt,
        };
      });
      expect(info.url).toContain("/_next/image?");
      const selected = new URL(info.url).searchParams;
      expect(selected.get("q")).toBe("80");
      if (route.startsWith("/destinations/"))
        expect(selected.get("url")).toContain(
          testInfo.project.name === "mobile" ? "-card." : "-detail.",
        );
      routeUrls.add(info.url);
      if (!bodies.has(info.url)) {
        const response = await request.get(info.url, {
          headers: { Accept: "image/avif,image/webp" },
        });
        expect(response.ok()).toBeTruthy();
        expect(response.headers()["content-type"]).toBe("image/avif");
        expect(response.headers()["cache-control"]).toContain("max-age=");
        const body = await response.body(),
          meta = await sharp(body).metadata();
        bodies.set(info.url, {
          bytes: body.length,
          width: meta.width!,
          height: meta.height!,
          format: response.headers()["content-type"],
        });
      }
      const photo = bodies.get(info.url)!;
      // object-fit: cover must have enough pixels in BOTH axes, including
      // tall mobile banners where a wide source would otherwise be stretched.
      const density = Math.min(
        photo.width / info.width,
        photo.height / info.height,
      );
      expect(
        density,
        `${route}: ${info.alt} is being upscaled`,
      ).toBeGreaterThanOrEqual(info.dpr * 0.94);
      expect(photo.bytes, `${route}: photo exceeds 300 KiB`).toBeLessThan(
        300 * 1024,
      );
      records.push({
        route,
        image: info.alt,
        ...photo,
        pixels: `${photo.width}×${photo.height}`,
        density: Math.round(density * 100) / 100,
        screenDensity: info.dpr,
      });
    }
    if (route === "/") {
      const total = [...routeUrls].reduce(
        (sum, url) => sum + bodies.get(url)!.bytes,
        0,
      );
      expect(
        total,
        "All homepage photos should total less than 768 KiB",
      ).toBeLessThan(768 * 1024);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({
        path: `artifacts/photos-${testInfo.project.name}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `artifacts/photos-preview-${testInfo.project.name}.png`,
      });
    }
  }
  const fallback = await request.get([...bodies.keys()][0], {
    headers: { Accept: "image/webp" },
  });
  expect(fallback.headers()["content-type"]).toBe("image/webp");
  mkdirSync("artifacts", { recursive: true });
  const report = JSON.stringify(records, null, 2);
  writeFileSync(
    `artifacts/image-delivery-${testInfo.project.name}.json`,
    report,
  );
  await testInfo.attach("image-delivery", {
    body: report,
    contentType: "application/json",
  });
});
