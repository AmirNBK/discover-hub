import { isIP } from "node:net";
import type { IncomingHttpHeaders } from "node:http";

// Server-only helpers, used by API routes and getServerSideProps.
export function backendURL(path: string) {
  const base = process.env.BACKEND_URL;
  if (process.env.VERCEL === "1" && !base)
    throw new Error("Configure BACKEND_URL before deploying.");
  const url = new URL(base || "http://127.0.0.1:8000");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (process.env.VERCEL === "1" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid backend URL.");
  return new URL(path, url);
}

export function backendHeaders() {
  const headers = new Headers();
  const token = process.env.BACKEND_PROXY_TOKEN;
  if (process.env.VERCEL === "1" && (!token || token.length < 32))
    throw new Error(
      "Configure the shared backend service token before deploying.",
    );
  if (token) headers.set("X-DiscoverHub-Proxy-Token", token);
  // Optional: use the BACKEND project's protection bypass, never the frontend's.
  const bypass = process.env.BACKEND_PROTECTION_BYPASS_SECRET;
  if (bypass) headers.set("x-vercel-protection-bypass", bypass);
  return headers;
}

export function connectionAddress(req: {
  headers: IncomingHttpHeaders;
  socket: { remoteAddress?: string };
}) {
  // This header is trusted only on Vercel, where the platform overwrites it.
  // Local/self-hosted requests always use the actual socket connection.
  const forwarded =
    process.env.VERCEL === "1"
      ? req.headers["x-vercel-forwarded-for"]
      : undefined;
  if (typeof forwarded === "string" && isIP(forwarded.trim()))
    return forwarded.trim();
  return req.socket.remoteAddress;
}
