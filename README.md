# DiscoverHub

A refreshed destination discovery app built with Next.js 16, React 19, TypeScript, and Leaflet. Browse a handpicked collection, filter and save destinations, explore the map, create an account, and submit contact messages.

## Project history

DiscoverHub was originally developed by AmirNBK as a bachelor's university project in 2023. The original commit history is preserved. The [pre-modernization snapshot](https://github.com/AmirNBK/discover-hub/tree/archive/pre-modernization) points to the repository's August 28, 2023 state; it is a historical reference, not a claim about the exact university submission date.

The later refresh was developed with AI assistance on `codex/modernize-discover-hub`. It updates dependencies, changes the interface, adds a local account/contact backend, and improves image delivery. These changes are separate from the original undergraduate implementation. See [the provenance notes](docs/HISTORY.md) for the scope of each version and [the refresh notes](docs/REFRESH.md) for technical findings and limitations.

## Run locally

Use **Node.js 24 or newer** (`.nvmrc` specifies 24). Node's built-in SQLite module supplies the database; no database server or API key is needed for the core app.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

For a production build:

```sh
npm run build
npm start
```

Keep the server running while using the app. No Google Fonts, image API, or external account backend is required. Node may print an experimental SQLite notice on versions where that API is still labelled experimental.

## Features

- Responsive home, about, contact, login, registration, privacy, saved places, destination detail, and 404 pages.
- Search by destination, region, country, or category across the curated collection.
- Category filters, empty states, and saved places that persist in this browser.
- Client-only Leaflet map, destination selection, markers, permission-aware geolocation, and external Google Maps directions.
- Registration, sign-in, session persistence, and sign-out backed by SQLite. Passwords use salted scrypt hashes. Session tokens are hashed in the database; cookies are HTTP-only, SameSite=Lax, and Secure in production.
- Validated contact submissions saved to the database. Read the latest 100 with `npm run messages`.
- Optional live nearby discovery using the current Foursquare Places API through a server-side endpoint.

Saved destinations are **device-local**, including when signed in. Contact messages are stored, not automatically emailed. Destination photographs are stored locally and served in responsive AVIF/WebP sizes, with separate card and banner crops. See [photo sources and licenses](assets/photos/CREDITS.md). Directions open a separate provider instead of the old public demo routing service.

## Configuration

Copy `.env.example` to `.env.local` and restart the server to change defaults:

| Variable             | Purpose                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `DATABASE_PATH`      | SQLite file. Defaults to `data/discover-hub.sqlite`.                                                              |
| `FOURSQUARE_API_KEY` | A fresh Foursquare **Service API key** for live nearby discovery. Server-only; never use a `NEXT_PUBLIC_` prefix. |

Without a key, choosing “Use my location” centres the map and explains that live nearby discovery is not connected. The handpicked collection remains available and is sorted by straight-line distance. Search filters this collection; it is not a worldwide city geocoder.

The integration uses the [current Foursquare Places endpoint](https://docs.foursquare.com/fsq-developers-places/reference/place-search), Bearer authentication, and version `2025-06-17`. The original V3 endpoint [has been deprecated](https://docs.foursquare.com/developer/reference/upcoming-changes). Old browser-embedded keys were removed from active source; rotate/revoke them in the provider dashboards because they remain in Git history.

If `DATABASE_PATH` is set only in `.env.local`, read messages with `node --env-file=.env.local scripts/messages.mjs`. Otherwise `npm run messages` uses the default file or the shell environment variable.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm test
npm audit --omit=dev
```

Tests start a production server on port 3100 using `data/test-discover-hub.sqlite`, separate from application data. Desktop, mobile, and API checks cover account sessions, forms, search, filters, favourites, navigation, every page, content images, overflow, geolocation denial, unavailable services, nearby results, and tile failures. Reports and traces are ignored by Git; visual captures go to `artifacts/`.

If the Chromium download is unavailable, use an installed browser:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome' # or 'msedge'
npm test
```

See [refresh notes and remaining advisories](docs/REFRESH.md) for the investigation and verification details.

## Hosting and data

Run as a **Node server with a writable, persistent disk**, with HTTPS in production. Set `DATABASE_PATH` to a file on that disk. The default database is intended for a single application instance. An ephemeral serverless filesystem or static export will not preserve accounts and messages. Use a managed database adapter before deploying to multiple instances or an ephemeral platform.

`data/` is ignored by Git. Back it up before moving or upgrading. For a simple consistent backup, stop the app and copy the entire data directory, including any SQLite WAL files. Never put the database in `public/`.

The old external account backend is no longer used. Existing remote accounts and messages were not imported. Password reset and email verification are not included. The operator manages data requests, backups, and retention; do not remove the database to fix a sign-in issue.

API handlers validate input, limit requests, check mutation origins, and use prepared statements. The in-memory limiter is intended for one process and uses the connection IP. A reverse proxy should preserve Host and provide public-facing abuse protection. For a public service, add email delivery/recovery and shared abuse protection as appropriate.

Map tiles come from [OpenStreetMap](https://www.openstreetmap.org/copyright), with visible attribution. A failed tile request produces a message while destination details and directions remain usable. Follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and use a dedicated provider for substantial traffic.

## Source layout

- `pages/`: public routes and server API handlers; retains the Pages Router.
- `components/`: layout, forms, cards, shared state, and dynamically loaded map.
- `lib/destinations.ts`: typed curated collection and filtering.
- `lib/server/`: SQLite, authentication, validation, request limiting.
- `styles/globals.css`: responsive design, focus states, reduced-motion support.
- `tests/`: Playwright browser and API coverage.

Run `npm run format` to format source and documentation.
