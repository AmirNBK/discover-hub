# DiscoverHub

A tourism platform with a **React / Next.js frontend, Python / Django backend, and MongoDB database**. Browse destinations, explore a Leaflet map, save places, create an account, and submit contact messages.

## Project history

DiscoverHub was originally developed by AmirNBK as a bachelor's university project in 2023. Original commits are preserved at [archive/pre-modernization](https://github.com/AmirNBK/discover-hub/tree/archive/pre-modernization), the repository's August 28, 2023 snapshot. That snapshot is a historical reference, not a verified university submission date.

The later interface and dependency refresh is preserved on `amirHossein/modernized-and-refactored`. The subsequent `amirHossein/django-mongodb-backend` migration replaces that refresh's temporary SQLite/Next.js backend with Django and MongoDB. These are later implementation changes, recorded separately from the undergraduate work. See [history and provenance](docs/HISTORY.md), [refresh findings](docs/REFRESH.md), and [backend architecture](backend/README.md).

## Run locally

Use **Node.js 24+**. On Windows x64, setup downloads project-local uv, Python 3.13, and MongoDB 8.0.34 from their official distributions. It does not install a Windows service or change PATH. On macOS/Linux, install uv and MongoDB first, or provide an existing MongoDB URI.

```sh
npm ci
npm run setup
npm run dev
```

Open [localhost:3000](http://localhost:3000). The launcher starts MongoDB on loopback port 27018, Django on 8000, and Next.js on 3000. Keep it running while browsing; Ctrl+C stops the stack. Frontend changes reload automatically; restart after Python changes. Accounts, messages, destinations, and account bookmarks persist in `data/mongodb/`.

Setup honours `HTTPS_PROXY` if your connection needs a proxy. Existing installations can supply `MONGOD_BIN`, `PYTHON_BIN`, or `MONGODB_URI` instead of the bundled runtimes. MongoDB must remain available for the catalogue, accounts, sessions, saved places, and contact submissions.

To check the actual open localhost server, run `npm run check:local` in another terminal. It verifies map initialization, marker popups, saved-place filtering, zoom, and search navigation, and checks for missing scripts.

For a local production build:

```sh
npm run build
npm start
```

Development uses `.next-dev/`, separate from production `.next/`, so production checks do not replace files used by the development server. Stop a production server before rebuilding, then restart it. Replacing its build while it is running can leave interactive pages on their loading screen.

## Features

- Responsive home, about, contact, sign-in, registration, privacy, saved places, destination detail, photo credits, and 404 pages.
- Database-driven destinations with server-side search, dynamic categories, pagination, map links, and detail pages that work for new records without rebuilding.
- Account-synced saved places, browser-local guest saves, and an explicit option to copy guest saves into an account.
- Browser-only Leaflet map, marker selection, permission-aware geolocation, and external Google Maps directions.
- Django registration, sign-in, session persistence, and sign-out backed by MongoDB. Passwords use salted Django PBKDF2 hashes. Session tokens are stored as hashes, expire after seven days, and use HTTP-only, SameSite=Lax cookies, Secure in production.
- Validated contact submissions stored in MongoDB; read the latest 100 using `npm run messages`.
- Optional live nearby discovery through a server-side Foursquare integration.
- Licensed high-resolution local photographs delivered in responsive AVIF/WebP sizes with separate card and banner crops. See [photo credits](assets/photos/CREDITS.md) and [image measurements](docs/IMAGES.md).

Four existing destinations are seeded into MongoDB when missing at startup. Subsequent launches preserve catalogue edits. Guest saves stay on the device; signed-in saves belong to the account and refresh when the browser window regains focus. The saved places page offers an explicit import of device saves. Confirmed imports are removed from guest storage; unavailable records stay on the device. Failed syncs show an error without claiming a place was saved.

Contact messages are stored rather than emailed. Search queries the published catalogue; it is not a worldwide city geocoder. Without a Foursquare key, location still centres the map and sorts the current page of curated destinations by straight-line distance.

## Managing destinations

Copy `backend/explorer/fixtures/destinations.json` to a local JSON file and edit or add records. Use a unique lowercase ID, descriptive fields, coordinates, a category, highlights, and travel tips. Categories appear automatically. Then validate and import:

```sh
npm run backend -- import_destinations data/destinations.json --dry-run
npm run backend -- import_destinations data/destinations.json
```

Existing records are preserved by default. Add `--update` to apply edits, including `published: false` to hide a destination. Unpublishing hides its detail page, map marker, and saved card while retaining account bookmarks for republishing. The importer validates the entire file before writing; repeated runs are safe. A file can contain 1–1000 records; imports do not delete records omitted from the file.

For new destinations, set `photoKey: ""` to show a designed placeholder. The four existing photo keys refer to licensed, optimized local assets and must match the destination ID. New photography needs an appropriate licensed asset, responsive crops, and a photo-registry entry; unrelated photos and arbitrary remote image URLs are rejected. See the full [catalogue format and API contract](backend/README.md).

## Configuration

Copy `.env.example` to `.env.local` if you need to change the defaults, then restart the stack. Explicit shell variables take priority. All secrets below stay on the server.

| Variable               | Purpose                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`          | Defaults to `mongodb://127.0.0.1:27018`. The launcher manages this local server; other URIs must already be available. |
| `MONGODB_DATABASE`     | Defaults to `discoverhub`.                                                                                             |
| `BACKEND_URL`          | Django URL when running the frontend separately; defaults to `http://127.0.0.1:8000`.                                  |
| `BACKEND_PROXY_TOKEN`  | Shared server-only token for authenticated connection-IP forwarding; generated by the local launcher.                  |
| `DJANGO_DEBUG`         | Defaults to `true` for local use; set `false` in production.                                                           |
| `DJANGO_SECRET_KEY`    | Required random secret when debug is disabled.                                                                         |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated backend hostnames.                                                                                     |
| `FRONTEND_ORIGINS`     | Exact allowed origins for JSON mutations. Local defaults include ports 3000 and 3100.                                  |
| `DJANGO_COOKIE_SECURE` | Defaults to true outside debug mode. Use HTTPS in production.                                                          |
| `FOURSQUARE_API_KEY`   | A fresh Foursquare **Service API key** for live nearby discovery.                                                      |

The provider uses the [current Foursquare Places endpoint](https://docs.foursquare.com/fsq-developers-places/reference/place-search), Bearer authentication, and version `2025-06-17`. The original V3 endpoint [was deprecated](https://docs.foursquare.com/developer/reference/upcoming-changes). Old browser-embedded keys were removed from current source; the owner must rotate them because they remain in Git history.

Run `npm run backend -- initdb` to apply migrations and MongoDB expiry indexes manually. The normal stack launcher also does this without resetting data.

## Migrating the previous local data

Back up the previous SQLite file, then run:

```sh
npm run backend -- import_sqlite data/discover-hub.sqlite
```

The importer opens the source read-only. It preserves existing MongoDB accounts, avoids duplicate message imports, and copies valid sessions for imported accounts. Legacy scrypt passwords continue working and upgrade to Django PBKDF2 after a successful sign-in. Use one original source database: legacy message IDs identify repeat imports from that source. Old remote-backend users are not available to this importer.

## Verification

```sh
npm run typecheck
npm run lint
npm run backend -- check
npm run backend -- test explorer --noinput
npm run build
npx playwright install chromium
npm test
npm audit --omit=dev
```

The browser suite starts a production frontend on 3100 and Django on 8100, with a unique `discoverhub_e2e_*` MongoDB database. Application data is not reset. The launcher cleans test data on graceful shutdown; forced process termination may leave an isolated test database. Django tests use `test_discoverhub` by default; point tests at a dedicated MongoDB deployment if that database name already contains data you need.

Desktop, mobile, API, and retina checks cover sessions, forms, search, filters, favourites, every page, images, overflow, map interactions, geolocation denial, unavailable services, nearby results, and tile failures. Django tests additionally cover database persistence, expired sessions, unique accounts, shared limits, provider mapping, SQLite import compatibility, catalogue queries/imports/publication, and account bookmark isolation. Browser coverage includes explicit guest import, account sync across separate contexts, failed syncs, pagination, and session-connection retries. Reports and visual captures are ignored by Git.

If Chromium downloads are unavailable, use an installed browser:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome' # or 'msedge'
npm test
```

## Hosting and data

The public application is [DiscoverHub](https://discover-hub-beryl.vercel.app). Hosting uses two Vercel Hobby projects (Next.js and Django/Python) plus a dedicated MongoDB Atlas Free M0 cluster. Production and previews use separate databases and credentials. Production configuration, environment variables, publication order, and verification are documented in [deployment instructions](docs/DEPLOYMENT.md). `BACKEND_URL` is read at runtime by the frontend adapter; hosted requests use the cloud database rather than local processes. Free-plan usage limits and cold starts apply.

Use HTTPS, disable Django debug mode, set a random secret, configure allowed hosts/origins, and enable secure cookies. Use authenticated MongoDB connections restricted to your service network. Django can run with Waitress; its database-backed rate limiter is shared across workers. When hosted separately, set the same `BACKEND_PROXY_TOKEN` on Next.js and Django. On Vercel, every backend request requires this token, including server-rendered destination requests. Client identity uses Vercel's platform-set header on Vercel and the actual socket locally. Client-supplied forwarded headers cannot bypass limits. If a CDN sits in front of Next.js, configure trusted edge identity and abuse controls for that deployment.

`data/`, `.runtime/`, and virtual environments are ignored by Git. Back up MongoDB using supported database backup tools; stop the stack cleanly before copying local database files. Never put database files under `public/`.

Password recovery and email verification/delivery are not implemented. The operator manages deletion requests, backups, and retention. Do not delete database files to troubleshoot sign-in.

Map tiles come from [OpenStreetMap](https://www.openstreetmap.org/copyright), with visible attribution and failure messages. Follow its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and use a dedicated provider for substantial traffic. Tiles and external directions need network access; production geolocation requires HTTPS.

## Source layout

- `pages/`: Next.js routes and a same-origin API transport adapter.
- `backend/`: Django models, migrations, API views, management commands, tests, and a locked Python environment.
- `components/`: shared layout, forms, map, cards, and browser state.
- `lib/destinations.ts` and `lib/catalogue.ts`: destination types, optimized photo registry, and paginated catalogue requests.
- `styles/globals.css`: responsive design and accessibility styles.
- `scripts/`: local setup and service lifecycle commands.
- `tests/`: Playwright browser/API coverage.

Run `npm run format` for frontend formatting. Format Python with `.runtime/uv/uv.exe run --project backend ruff format backend` on Windows, or `uv run --project backend ruff format backend` with an installed uv.
