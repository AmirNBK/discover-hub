import type { NextApiRequest, NextApiResponse } from "next";
import {
  currentUser,
  endSession,
  hashPassword,
  startSession,
  verifyPassword,
} from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { allowMethod, rateLimit, text, validEmail } from "@/lib/server/http";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const action = req.query.action;
  if (!["me", "login", "register", "logout"].includes(String(action)))
    return res.status(404).json({ error: "Not found." });
  if (!allowMethod(req, res, action === "me" ? ["GET"] : ["POST"])) return;
  try {
    if (action === "me")
      return res.status(200).json({ user: currentUser(req) });
    if (action === "logout") {
      endSession(req, res);
      return res.status(200).json({ user: null });
    }
    if (!rateLimit(req, res, "auth", 12)) return;
    const email = text(req.body?.email).toLowerCase();
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";
    if (!validEmail(email) || password.length < 8 || password.length > 128)
      return res.status(400).json({
        error: "Use a valid email and a password between 8 and 128 characters.",
      });
    if (action === "register") {
      const name = text(req.body?.name);
      if (name.length < 2 || name.length > 100)
        return res
          .status(400)
          .json({ error: "Your name must be between 2 and 100 characters." });
      const passwordHash = await hashPassword(password);
      try {
        const result = db()
          .prepare(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
          )
          .run(name, email, passwordHash);
        startSession(res, Number(result.lastInsertRowid));
        return res
          .status(201)
          .json({ user: { id: Number(result.lastInsertRowid), name, email } });
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE"))
          return res.status(409).json({
            error: "An account with this email already exists. Try signing in.",
          });
        throw error;
      }
    }
    const user = db()
      .prepare(
        "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      )
      .get(email);
    const valid = await verifyPassword(
      password,
      user
        ? String(user.password_hash)
        : `${"0".repeat(32)}:${"0".repeat(128)}`,
    );
    if (!user || !valid)
      return res
        .status(401)
        .json({ error: "The email or password is incorrect." });
    startSession(res, Number(user.id));
    return res.status(200).json({
      user: {
        id: Number(user.id),
        name: String(user.name),
        email: String(user.email),
      },
    });
  } catch (error) {
    console.error(
      "Authentication failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return res
      .status(500)
      .json({ error: "We could not complete your request. Please try again." });
  }
}
