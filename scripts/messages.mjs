import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
const file = resolve(process.env.DATABASE_PATH || "data/discover-hub.sqlite");
if (!existsSync(file)) {
  console.log("No database yet. Start the app first.");
  process.exit(0);
}
const db = new DatabaseSync(file, { readOnly: true });
const exists = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='messages'",
  )
  .get();
console.log(
  exists
    ? db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 100").all()
    : "No messages yet.",
);
db.close();
