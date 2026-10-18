import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "./db";

const scrypt = promisify(scryptCallback);
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return (
    expected.length === actual.length * 2 &&
    timingSafeEqual(actual, Buffer.from(expected, "hex"))
  );
}
const cookie = (token: string, maxAge: number) =>
  `dh_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
export function startSession(res: NextApiResponse, userId: number) {
  const token = randomBytes(32).toString("hex");
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db()
    .prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(hashToken(token), userId, Date.now() + 7 * 86400000);
  res.setHeader("Set-Cookie", cookie(token, 7 * 86400));
}
export function currentUser(req: NextApiRequest) {
  const token = req.cookies.dh_session;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = db()
    .prepare(
      "SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires_at > ?",
    )
    .get(hashToken(token), Date.now());
  return row
    ? { id: Number(row.id), name: String(row.name), email: String(row.email) }
    : null;
}
export function endSession(req: NextApiRequest, res: NextApiResponse) {
  if (req.cookies.dh_session)
    db()
      .prepare("DELETE FROM sessions WHERE token_hash = ?")
      .run(hashToken(req.cookies.dh_session));
  res.setHeader("Set-Cookie", cookie("", 0));
}
