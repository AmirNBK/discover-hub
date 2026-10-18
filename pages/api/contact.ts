import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/server/db";
import { allowMethod, rateLimit, text, validEmail } from "@/lib/server/http";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethod(req, res, ["POST"]) || !rateLimit(req, res, "contact", 5))
    return;
  const name = text(req.body?.name),
    email = text(req.body?.email),
    message = text(req.body?.message);
  if (
    name.length < 2 ||
    name.length > 100 ||
    !validEmail(email) ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return res.status(400).json({
      error:
        "Add your name, a valid email, and a message between 10 and 5,000 characters.",
    });
  }
  try {
    db()
      .prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)")
      .run(name, email, message);
    return res.status(201).json({
      message:
        "Your message has been received. Thank you for getting in touch.",
    });
  } catch {
    return res
      .status(500)
      .json({ error: "Your message could not be saved. Please try again." });
  }
}
