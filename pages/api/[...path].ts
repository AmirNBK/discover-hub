import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false } };

// Same-origin transport only. Validation, accounts, sessions, provider access
// and persistence belong to the Django service, not this frontend adapter.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  const base = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const target = new URL(base);
    if (!["http:", "https:"].includes(target.protocol))
      throw new Error("Invalid backend URL");
    const path = req.query.path;
    if (!Array.isArray(path) || path.some((part) => !/^[a-z-]+$/.test(part)))
      return res.status(404).json({ error: "Not found." });
    const incoming = new URL(req.url || "/", "http://localhost");
    target.pathname = `/api/${path.join("/")}`;
    target.search = incoming.search;
    const headers = new Headers();
    // Only Django can verify this service token; incoming identity headers
    // are replaced with the frontend's actual connection address.
    if (process.env.BACKEND_PROXY_TOKEN && req.socket.remoteAddress) {
      headers.set("X-DiscoverHub-Proxy-Token", process.env.BACKEND_PROXY_TOKEN);
      headers.set("X-DiscoverHub-Client-IP", req.socket.remoteAddress);
    }
    for (const name of ["content-type", "cookie", "origin"]) {
      const value = req.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 32768)
        return res.status(413).json({ error: "This request is too large." });
      chunks.push(Buffer.from(chunk));
    }
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method || "GET")
        ? undefined
        : Buffer.concat(chunks),
      signal: AbortSignal.timeout(15000),
      redirect: "manual",
    });
    for (const name of ["content-type", "allow", "retry-after"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    return res.status(upstream.status).send(await upstream.text());
  } catch {
    return res.status(503).json({
      error: "The server is temporarily unavailable. Please try again shortly.",
    });
  }
}
