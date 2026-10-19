import { test, expect } from "@playwright/test";
import { backendHeaders, backendURL, connectionAddress } from "../lib/backend";

test("backend transport uses service secrets and platform-verified client identity", () => {
  const names = [
    "VERCEL",
    "BACKEND_URL",
    "BACKEND_PROXY_TOKEN",
    "BACKEND_PROTECTION_BYPASS_SECRET",
  ];
  const original = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  try {
    for (const name of names) delete process.env[name];
    const req = {
      headers: {
        "x-vercel-forwarded-for": "192.0.2.10",
        "x-forwarded-for": "192.0.2.99",
      },
      socket: { remoteAddress: "127.0.0.1" },
    };
    expect(connectionAddress(req)).toBe("127.0.0.1");
    process.env.VERCEL = "1";
    expect(connectionAddress(req)).toBe("192.0.2.10");
    expect(
      connectionAddress({
        ...req,
        headers: { "x-vercel-forwarded-for": "invalid" },
      }),
    ).toBe("127.0.0.1");
    expect(() => backendURL("/api/health")).toThrow();
    expect(() => backendHeaders()).toThrow();
    process.env.BACKEND_URL = "http://backend.example";
    expect(() => backendURL("/api/health")).toThrow();
    process.env.BACKEND_URL = "https://backend.example";
    process.env.BACKEND_PROXY_TOKEN = "p".repeat(64);
    process.env.BACKEND_PROTECTION_BYPASS_SECRET = "backend-only-bypass";
    expect(backendURL("/api/health").href).toBe(
      "https://backend.example/api/health",
    );
    expect(backendHeaders().get("X-DiscoverHub-Proxy-Token")).toBe(
      "p".repeat(64),
    );
    expect(backendHeaders().get("x-vercel-protection-bypass")).toBe(
      "backend-only-bypass",
    );
  } finally {
    for (const name of names) {
      const value = original[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("the frontend reaches protected Django while direct unauthenticated requests fail", async ({
  request,
}) => {
  expect((await request.get("http://127.0.0.1:8100/api/health")).status()).toBe(
    403,
  );
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({
    backend: "django",
    database: "mongodb",
  });
  expect(
    (
      await request.post("/api/contact", {
        data: { message: "x".repeat(33000) },
      })
    ).status(),
  ).toBe(413);
});

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
