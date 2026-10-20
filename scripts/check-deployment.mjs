// Read-only verification: this command does not create accounts or messages.
const input = process.argv[2];
if (!input)
  throw new Error(
    "Usage: npm run check:deployment -- https://your-site.vercel.app",
  );
const origin = new URL(input);
if (
  origin.protocol !== "https:" ||
  origin.username ||
  origin.password ||
  origin.search ||
  origin.hash ||
  origin.pathname !== "/"
)
  throw new Error(
    "Provide the public HTTPS website origin, without credentials, path, or query.",
  );
const check = async (path, expected = 200) => {
  const response = await fetch(new URL(path, origin), {
    signal: AbortSignal.timeout(30000),
    redirect: "manual",
  });
  if (response.status !== expected)
    throw new Error(
      `${path}: expected ${expected}, received ${response.status}. Check the deployment and backend connection.`,
    );
  return response;
};
const health = await (await check("/api/health")).json();
if (
  health.status !== "ok" ||
  health.backend !== "django" ||
  health.database !== "mongodb"
)
  throw new Error(
    "The public site is not connected to the expected Django/MongoDB backend.",
  );
const catalogue = await (await check("/api/destinations?limit=2")).json();
if (
  !Array.isArray(catalogue.destinations) ||
  catalogue.destinations.length === 0 ||
  typeof catalogue.total !== "number"
)
  throw new Error("The published destination catalogue is empty or invalid.");
for (const place of catalogue.destinations) {
  if (
    typeof place.id !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(place.id)
  )
    throw new Error("The catalogue returned an invalid destination ID.");
  const detail = await (await check(`/api/destinations/${place.id}`)).json();
  if (detail.destination?.id !== place.id)
    throw new Error("Destination detail and catalogue records do not match.");
  await check(`/destinations/${place.id}`);
}
for (const path of ["/", "/map", "/saved", "/login", "/sign-up", "/contact-us"])
  await check(path);
await check("/api/contact", 405);
await check("/api/saved", 401);
console.log(
  JSON.stringify(
    {
      site: origin.origin,
      backend: health.backend,
      database: health.database,
      destinations: catalogue.total,
      checkedDetails: catalogue.destinations.length,
      status: "passed",
    },
    null,
    2,
  ),
);
