import type { NextApiRequest, NextApiResponse } from "next";
import { backendHeaders, backendURL, connectionAddress } from "@/lib/backend";

export const config = { api: { bodyParser: false } };

// Same-origin transport only. Validation, accounts, sessions, provider access
// and persistence belong to the Django service, not this frontend adapter.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const path = req.query.path;
    if (
      !Array.isArray(path) ||
      path.some(
        (part) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part) || part.length > 80,
      )
    )
      return res.status(404).json({ error: "Not found." });
    const incoming = new URL(req.url || "/", "http://localhost");
    const target = backendURL(`/api/${path.join("/")}`);
    target.search = incoming.search;
    const headers = backendHeaders();
    // Only Django can verify this service token; incoming identity headers
    // are replaced with the frontend's actual connection address.
    const address = connectionAddress(req);
    if (process.env.BACKEND_PROXY_TOKEN && address) {
      headers.set("X-DiscoverHub-Client-IP", address);
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
