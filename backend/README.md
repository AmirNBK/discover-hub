# Django / MongoDB backend

Python 3.13, Django 5.2 LTS, MongoDB 8.0, and the [official Django MongoDB Backend](https://www.mongodb.com/docs/languages/python/django-mongodb/v5.2/). Python dependencies and hashes are pinned in `uv.lock`; `.venv` and local runtimes are not committed.

## Data flow

The React client requests `/api/*` on the Next.js origin. `pages/api/[...path].ts` forwards the request and cookies to Django using a server-only `BACKEND_URL`. It contains no account, provider, or persistence logic. Django validates input, checks methods and origins, applies limits, operates on its models, and returns JSON. MongoDB stores the documents; account IDs are strings representing MongoDB ObjectIds. Public destination IDs are stable slugs.

| Model / collection            | Data and constraints                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `User` / `users`              | Name, unique normalized email, salted password hash, creation time.                                                     |
| `Session` / `sessions`        | Unique SHA-256 token hash, user relation, expiry; expired sessions are rejected even before MongoDB's TTL cleanup runs. |
| `ContactMessage` / `messages` | Name, email, message, creation time, optional legacy import ID.                                                         |
| `RateWindow` / `rate_windows` | Unique scope/IP/minute key, atomic request counter, expiry.                                                             |

Django migrations create collections and indexes. `manage.py initdb` also converts the expiry indexes to MongoDB TTL indexes. Run it after schema migrations, including on an externally hosted database. MongoDB's TTL monitor is asynchronous.

`Destination` / `destinations` stores unique slugs, descriptions, categories, coordinates, highlights, travel tips, photo keys, publication state, ordering, and update timestamps. Its published/order/slug index supports catalogue browsing. `SavedPlace` / `saved_places` relates users to destinations with a unique user/destination constraint. Unpublished destinations are hidden from public results and account save lists without deleting bookmarks.

Only licensed photo assets remain in the frontend registry. The launcher seeds the four original destination records after migrations using `get_or_create`, preserving operator edits and publication changes. New destination detail pages are rendered from Django on each request; no build is required to publish metadata.

## API contract

Paths deliberately have no trailing slash.

| Method | Path                      | Result                                                                                         |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/api/health`             | Real database connectivity check; returns Django/MongoDB identity.                             |
| POST   | `/api/auth/register`      | `{name, email, password}` → 201 `{user, saved}` and session cookie.                            |
| POST   | `/api/auth/login`         | `{email, password}` → 200 `{user, saved}` and session cookie.                                  |
| GET    | `/api/auth/me`            | `{user, saved}` or `{user: null, saved: []}`.                                                  |
| POST   | `/api/auth/logout`        | Invalidates the session and expires its cookie.                                                |
| POST   | `/api/contact`            | `{name, email, message}` → 201 confirmation.                                                   |
| GET    | `/api/places?lat=…&lng=…` | Validated, normalized Foursquare nearby results; 503 if unconfigured, 502 on provider failure. |

Errors are JSON `{error}`. APIs require JSON for mutations; arbitrary cross-origin mutations are rejected. Responses are not cached. The Next.js adapter caps request bodies at 32 KiB and never exposes the backend URL or service key to the browser.

### Catalogue and saved places

- `GET /api/destinations` or `POST /api/destinations` with a JSON query: `q` (up to 100 characters), `category` (default `All places`), `limit` (1–50, default 12), and `offset` (0–1000000). Returns `{destinations, total, offset, limit, categories}` in stable `sortOrder`, then slug order. Offset is clamped to the last valid page after removals.
- Optional `focus` selects the page containing a destination when no offset is supplied, allowing map deep links into a catalogue larger than one page. The map fetches at most 50 records at once; distance sorting applies to the loaded page.
- `category: "Saved"` uses the signed-in session's bookmarks. An optional `accountId` must match the current account (or null for guests), rejecting stale account views. Guests can POST `ids`, an array of up to 200 slugs. Account saves ignore supplied IDs; no client-supplied user ID selects another account's data.
- `GET /api/destinations/<slug>` returns `{destination}` or 404 for absent/unpublished records. There is no public catalogue-write endpoint.
- `GET /api/saved` requires authentication and returns `{saved: [slug, ...], accountId}`.
- `POST /api/saved` accepts `{id, saved: boolean, accountId}` and idempotently adds/removes one bookmark. `accountId` must match the session and protects against stale tabs after an account switch; it never grants access by itself. Returns `{id, saved, accountId}`.
- `POST /api/saved/import` accepts `{ids, accountId}` and merges up to 200 existing published destinations, returning `{saved, accepted, accountId}`. Repeating an import cannot duplicate bookmarks. Unknown or unpublished slugs are omitted from `accepted`.

Account saves are held in React memory and MongoDB, without copying private IDs into guest local storage. Session refresh happens on window focus. The client blocks saves until account status is known, guards against stale responses after account changes, serializes writes to the same destination, and shows failures without silently converting account saves into guest saves. Guest saves are imported only through the saved places page; confirmed imports are removed from guest storage. Unavailable IDs stay on the device. Guest collections are limited to 200 IDs.

### Operator catalogue imports

```sh
npm run backend -- import_destinations data/destinations.json --dry-run
npm run backend -- import_destinations data/destinations.json
npm run backend -- import_destinations data/destinations.json --update
```

Use the seed JSON at `explorer/fixtures/destinations.json` as a schema example. Every record needs `id`, `name`, `region`, `country`, `category`, `latitude`, `longitude`, `tagline`, `description`, `highlights`, and `tip`. Optional fields are `photoKey` (default empty), `imageAlt`, `published` (default true), and `sortOrder` (default 100). IDs use lowercase letters/digits separated by hyphens (maximum 80 characters); coordinates must be finite and geographically valid. Highlights contain 1–12 strings. The entire file (1–1000 records) is validated before any database writes. Duplicate IDs, unknown fields, invalid coordinates, and unrelated photo keys are rejected.

Default imports preserve existing records; `--update` explicitly replaces their fields. Set `published: false` to unpublish. Omitted records are untouched. Imports are repeatable after interrupted writes but are not an all-or-nothing transaction. Back up the database before bulk updates.

The installed photo keys are `lake-braies`, `lake-garda`, `koh-lipe`, and `cappadocia`; they must match the record's ID and include `imageAlt`. New records use `photoKey: ""` and show a designed placeholder until a licensed, optimized photo is installed. Adding photography requires responsive crops, credits, a frontend photo registry entry, and an allowed key in `explorer/catalogue.py`. Arbitrary remote image URLs are not fetched.

## Commands

From the repository root:

```sh
npm run setup
npm run dev
npm run backend -- check
npm run backend -- makemigrations --check --dry-run
npm run backend -- test explorer --noinput
npm run messages
```

On Windows, Python is `backend/.venv/Scripts/python.exe`; elsewhere it is `backend/.venv/bin/python`. To run services separately, start MongoDB, run `python backend/manage.py initdb`, then `python backend/manage.py runserver 127.0.0.1:8000` and `npm run dev:frontend`. Substitute the virtual environment's Python path for `python` if it is not activated.

For a production WSGI process, run from `backend/`:

```sh
python -m waitress --host=127.0.0.1 --port=8000 config.wsgi:application
```

Put a suitable HTTPS reverse proxy in front. Provide production settings and an authenticated MongoDB URI. Do not use Django's development server for public production traffic. Start the deployed frontend with `npm run start:frontend` and the appropriate `BACKEND_URL`.

## Previous SQLite data

`import_sqlite` is a read-only, repeatable importer for the previous local implementation. Back up the source and run `npm run backend -- import_sqlite data/discover-hub.sqlite`. It does not overwrite MongoDB users. Messages deduplicate by legacy ID, so imports should refer to one original source database. Existing MongoDB users do not inherit sessions from an unrelated source account with the same email.

Imported passwords retain their Node scrypt salt/hash until the next successful login; the salt remains the original ASCII hex string. A successful legacy-password login replaces the hash with Django PBKDF2. Live imported sessions retain their existing hashed token and expiry. Original remote-backend records require a separate export and are not fabricated or imported automatically.

## Operating limits

The default MongoDB process binds to `127.0.0.1` and uses port 27018 to avoid taking over a standard installation. The launcher reuses an already listening local MongoDB server and only stops a process it created. Data survives application restarts. Forced termination can leave test databases or require MongoDB journal recovery.

The launcher generates a shared `BACKEND_PROXY_TOKEN` for the two services. With a matching token, Django accepts the frontend's actual connection IP for rate limiting; arbitrary forwarded headers and invalid tokens cannot select a different identity. Separate deployments must set the same secret on both services, protect the internal connection, and configure any CDN's trusted identity/edge controls. Locally, an absent token uses Django's own connection address. Hosted Vercel requests instead require the shared token and reject direct unauthenticated traffic. Contact mail delivery, password reset, email verification, and a Django admin dashboard are outside the current implementation. Catalogue editing is available through the validated operator import command. Account sync works across clients connected to the same backend/database; this local setup is not an online deployment.

## Free hosted deployment

A dedicated Vercel Django project can use this `backend/` directory, Python 3.13, the locked dependencies, and `config.wsgi:application`. Its build runs `initdb` against the configured Atlas Free database. Runtime requests require the shared service token; both Next.js API forwarding and destination server rendering send it. The Vercel settings reject missing configuration/debug mode, force secure cookies, and limit MongoDB pools. See [complete deployment instructions](../docs/DEPLOYMENT.md). Preparing these files does not provision or verify hosting.
