import type { NextApiRequest, NextApiResponse } from "next";

export function allowMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  methods: string[],
) {
  res.setHeader("Cache-Control", "no-store");
  if (!methods.includes(req.method || "")) {
    res.setHeader("Allow", methods.join(", "));
    res.status(405).json({ error: "Method not allowed." });
    return false;
  }
  if (req.method === "POST") {
    if (!req.headers["content-type"]?.startsWith("application/json")) {
      res.status(415).json({ error: "Send JSON data." });
      return false;
    }
    const origin = req.headers.origin;
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.host)
          throw new Error("origin");
      } catch {
        res
          .status(403)
          .json({ error: "This request must come from this website." });
        return false;
      }
    }
  }
  return true;
}

const attempts = new Map<string, { count: number; until: number }>();
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: string,
  limit: number,
) {
  const now = Date.now();
  // Use the socket address, never a client-supplied forwarded IP.
  const key = `${scope}:${req.socket.remoteAddress || "unknown"}`;
  if (attempts.size > 10000)
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const entry = attempts.get(key);
  if (!entry || entry.until < now) {
    attempts.set(key, { count: 1, until: now + 60000 });
    return true;
  }
  entry.count++;
  if (entry.count <= limit) return true;
  res.setHeader("Retry-After", Math.ceil((entry.until - now) / 1000));
  res
    .status(429)
    .json({ error: "Too many requests. Please try again in a minute." });
  return false;
}

export const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
