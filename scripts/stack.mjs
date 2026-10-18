import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";
import { randomBytes } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
if (existsSync(resolve(root, ".env.local")))
  process.loadEnvFile(resolve(root, ".env.local"));
const mode = process.argv[2] || "dev";
const python =
  process.env.PYTHON_BIN ||
  resolve(
    root,
    process.platform === "win32"
      ? "backend/.venv/Scripts/python.exe"
      : "backend/.venv/bin/python",
  );
if (!existsSync(python))
  throw new Error("Python environment missing. Run npm run setup first.");
const children = [];
let mongoOwned = false;
let stopping = false;
const test = mode === "test";
const backendPort = test ? 8100 : 8000;
const env = {
  ...process.env,
  BACKEND_URL: `http://127.0.0.1:${backendPort}`,
  BACKEND_PROXY_TOKEN:
    process.env.BACKEND_PROXY_TOKEN || randomBytes(32).toString("hex"),
  ...(test
    ? {
        MONGODB_DATABASE: `discoverhub_e2e_${Date.now()}`,
        DJANGO_DEBUG: "false",
        DJANGO_SECRET_KEY: randomBytes(32).toString("hex"),
        DJANGO_COOKIE_SECURE: "true",
        DJANGO_ALLOWED_HOSTS: "localhost,127.0.0.1",
        FRONTEND_ORIGINS: "http://localhost:3100",
        FOURSQUARE_API_KEY: "",
      }
    : {}),
};

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error.message);
    void stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) void stop(code || 1);
  });
  return child;
}
function command(args) {
  return new Promise((accept, reject) => {
    const child = spawn(python, ["backend/manage.py", ...args], {
      cwd: root,
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? accept()
        : reject(new Error(`Django command failed (${code}).`)),
    );
  });
}
function listening(port) {
  return new Promise((accept) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      accept(true);
    });
    socket.once("error", () => accept(false));
    socket.once("timeout", () => {
      socket.destroy();
      accept(false);
    });
  });
}
async function waitFor(check, label) {
  for (let i = 0; i < 60; i++) {
    if (stopping) throw new Error("Startup interrupted.");
    if (await check()) return;
    await new Promise((accept) => setTimeout(accept, 500));
  }
  throw new Error(`${label} did not become ready.`);
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children.reverse()) {
    if (!child.pid || child.exitCode !== null) continue;
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    else child.kill("SIGTERM");
  }
  if (test)
    await command(["cleanup_test_database"]).catch((error) =>
      console.error(error.message),
    );
  // Only stop a MongoDB process this launcher created; shared servers stay up.
  if (mongoOwned) await command(["shutdown_local_mongo"]).catch(() => {});
  process.exit(code);
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

try {
  if (
    (!process.env.MONGODB_URI ||
      process.env.MONGODB_URI === "mongodb://127.0.0.1:27018") &&
    !(await listening(27018))
  ) {
    const mongod =
      process.env.MONGOD_BIN ||
      (process.platform === "win32"
        ? resolve(root, ".runtime/mongodb/bin/mongod.exe")
        : "mongod");
    mkdirSync(resolve(root, "data/mongodb"), { recursive: true });
    // MongoDB has its own graceful shutdown command and must outlive frontend
    // termination until that command has completed.
    const mongo = spawn(
      mongod,
      [
        "--bind_ip",
        "127.0.0.1",
        "--port",
        "27018",
        "--dbpath",
        resolve(root, "data/mongodb"),
        "--logpath",
        resolve(root, "data/mongodb.log"),
        "--logappend",
      ],
      { cwd: root, stdio: "ignore", windowsHide: true },
    );
    mongo.on("error", (error) => {
      console.error(error.message);
      void stop(1);
    });
    mongo.on("exit", (code) => {
      if (!stopping) {
        console.error(`MongoDB exited (${code}). See data/mongodb.log.`);
        void stop(1);
      }
    });
    mongoOwned = true;
    await waitFor(() => listening(27018), "MongoDB");
  }
  if (mode === "manage") {
    await command(process.argv.slice(3));
    await stop();
  } else {
    if (await listening(backendPort))
      throw new Error(
        `Port ${backendPort} is already in use. Stop the other Django server first.`,
      );
    await command(["initdb"]);
    start(
      python,
      mode === "dev"
        ? [
            "backend/manage.py",
            "runserver",
            `127.0.0.1:${backendPort}`,
            "--noreload",
          ]
        : [
            "-m",
            "waitress",
            "--host=127.0.0.1",
            `--port=${backendPort}`,
            "config.wsgi:application",
          ],
      mode === "dev" ? {} : { cwd: resolve(root, "backend") },
    );
    await waitFor(async () => {
      try {
        return (await fetch(`${env.BACKEND_URL}/api/health`)).ok;
      } catch {
        return false;
      }
    }, "Django");
    const nextArgs = [
      resolve(root, "node_modules/next/dist/bin/next"),
      mode === "dev" ? "dev" : "start",
      ...process.argv.slice(3),
    ];
    if (test) nextArgs.push("--port", "3100");
    start(process.execPath, nextArgs);
  }
} catch (error) {
  console.error(error.message);
  await stop(1);
}
