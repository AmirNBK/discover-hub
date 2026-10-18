import { test, expect } from "@playwright/test";

test("API validates input, methods, origins and optional service configuration", async ({
  request,
}) => {
  expect((await request.get("/api/contact")).status()).toBe(405);
  expect(
    (
      await request.post("/api/contact", {
        data: { name: "A", email: "invalid", message: "short" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/contact", {
        headers: { Origin: "https://untrusted.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/auth/login", {
        data: { email: "bad", password: "123" },
      })
    ).status(),
  ).toBe(400);
  expect((await request.get("/api/places?lat=&lng=0")).status()).toBe(400);
  expect((await request.get("/api/places?lat=100&lng=0")).status()).toBe(400);
  expect((await request.get("/api/places?lat=51.5&lng=0")).status()).toBe(503);
  expect((await request.get("/api/auth/nonexistent")).status()).toBe(404);
});

test("sessions use secure cookies, duplicates and wrong passwords are rejected", async ({
  request,
}) => {
  const email = `api-${Date.now()}@example.com`;
  const registration = await request.post("/api/auth/register", {
    data: { name: "API Explorer", email, password: "a-secure-test-password" },
  });
  expect(registration.status()).toBe(201);
  const cookie = registration.headers()["set-cookie"];
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("SameSite=Lax");
  expect(cookie).toContain("Secure");
  expect(
    (
      await request.post("/api/auth/register", {
        data: {
          name: "Another Name",
          email,
          password: "a-secure-test-password",
        },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.post("/api/auth/login", {
        data: { email, password: "wrong-password" },
      })
    ).status(),
  ).toBe(401);
  expect((await request.post("/api/auth/logout", { data: {} })).status()).toBe(
    200,
  );
  expect((await (await request.get("/api/auth/me")).json()).user).toBeNull();
});
