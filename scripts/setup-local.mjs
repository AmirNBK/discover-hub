import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { crc32, inflateRawSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
if (existsSync(resolve(root, ".env.local")))
  process.loadEnvFile(resolve(root, ".env.local"));
const runtime = resolve(root, ".runtime");
export function run(command, args, options = {}) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? accept()
        : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

async function download(url, file, range) {
  const args = [
    "--fail",
    "--location",
    "--silent",
    "--show-error",
    "--retry",
    "2",
    "--output",
    file,
  ];
  if (range) args.push("--range", range);
  args.push(url);
  // curl honours HTTPS_PROXY, including an already configured local proxy.
  await run(process.platform === "win32" ? "curl.exe" : "curl", args);
  return readFile(file);
}

async function installMongo() {
  const binary = resolve(runtime, "mongodb/bin/mongod.exe");
  if (existsSync(binary)) return;
  const url =
    "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.34.zip";
  console.log("Downloading MongoDB 8.0.34 from MongoDB's official archive…");
  // The archive is mostly debugging symbols. Download only mongod.exe's ZIP
  // entry with HTTP ranges, preserving its ZIP CRC check and HTTPS source.
  const tail = await download(
    url,
    resolve(runtime, "mongo-directory.zip.part"),
    "-131072",
  );
  let entry;
  for (let i = 0; i < tail.length - 46; i++) {
    if (tail.readUInt32LE(i) !== 0x02014b50) continue;
    const length = tail.readUInt16LE(i + 28);
    const name = tail.subarray(i + 46, i + 46 + length).toString();
    if (!name.endsWith("/bin/mongod.exe")) continue;
    entry = {
      size: tail.readUInt32LE(i + 20),
      crc: tail.readUInt32LE(i + 16),
      offset: tail.readUInt32LE(i + 42),
      method: tail.readUInt16LE(i + 10),
    };
    break;
  }
  if (!entry)
    throw new Error(
      "MongoDB archive directory could not be read. Install MongoDB manually and set MONGOD_BIN.",
    );
  const header = await download(
    url,
    resolve(runtime, "mongo-header.zip.part"),
    `${entry.offset}-${entry.offset + 29}`,
  );
  if (header.readUInt32LE(0) !== 0x04034b50)
    throw new Error("Invalid MongoDB ZIP header.");
  const start =
    entry.offset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
  const compressed = await download(
    url,
    resolve(runtime, "mongo-binary.zip.part"),
    `${start}-${start + entry.size - 1}`,
  );
  const executable =
    entry.method === 8 ? inflateRawSync(compressed) : compressed;
  if (crc32(executable) !== entry.crc)
    throw new Error("MongoDB ZIP checksum failed.");
  if (
    createHash("sha256").update(executable).digest("hex") !==
    "4c9e9764cbac5be8eb92733e23ce7f70b52f8ae84b6879b4d5cc010c90ec6082"
  )
    throw new Error("MongoDB executable SHA-256 checksum failed.");
  await mkdir(resolve(runtime, "mongodb/bin"), { recursive: true });
  await writeFile(binary, executable);
  await run(binary, ["--version"]);
}

await mkdir(runtime, { recursive: true });
const uv = process.platform === "win32" ? resolve(runtime, "uv/uv.exe") : "uv";
if (process.platform === "win32" && !existsSync(uv)) {
  const zip = resolve(runtime, "uv.zip");
  const bytes = await download(
    "https://github.com/astral-sh/uv/releases/download/0.13.1/uv-x86_64-pc-windows-msvc.zip",
    zip,
  );
  if (
    createHash("sha256").update(bytes).digest("hex") !==
    "3b2661a463a5baea7f5076ea2b25ab71d77f36a6c0d809e5350651792f80a672"
  )
    throw new Error("uv archive checksum failed.");
  // Both paths are fixed project-local paths, not shell-generated user input.
  await run("powershell.exe", [
    "-NoProfile",
    "-Command",
    `Expand-Archive -LiteralPath '${zip.replaceAll("'", "''")}' -DestinationPath '${resolve(runtime, "uv").replaceAll("'", "''")}' -Force`,
  ]);
}
const env = {
  ...process.env,
  UV_PYTHON_INSTALL_DIR: resolve(runtime, "python"),
  UV_CACHE_DIR: resolve(runtime, "uv-cache"),
};
await run(
  uv,
  [
    "sync",
    "--project",
    "backend",
    ...(existsSync(resolve(root, "backend/uv.lock")) ? ["--locked"] : []),
  ],
  { env },
);
if (
  process.platform === "win32" &&
  !process.env.MONGOD_BIN &&
  (!process.env.MONGODB_URI ||
    process.env.MONGODB_URI === "mongodb://127.0.0.1:27018")
)
  await installMongo();
console.log(
  "Setup complete. Run npm run dev to start Next.js, Django and MongoDB.",
);
