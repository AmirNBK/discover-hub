# Django / MongoDB backend

Python 3.13, Django 5.2 LTS, MongoDB 8.0, and the [official Django MongoDB Backend](https://www.mongodb.com/docs/languages/python/django-mongodb/v5.2/). Python dependencies and hashes are pinned in `uv.lock`; `.venv` and local runtimes are not committed.

## Data flow

The React client requests `/api/*` on the Next.js origin. `pages/api/[...path].ts` forwards the request and cookies to Django using a server-only `BACKEND_URL`. It contains no account, provider, or persistence logic. Django validates input, checks methods and origins, applies limits, operates on its models, and returns JSON. MongoDB stores the documents; response IDs are strings representing MongoDB ObjectIds.

| Model / collection            | Data and constraints                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `User` / `users`              | Name, unique normalized email, salted password hash, creation time.                                                     |
| `Session` / `sessions`        | Unique SHA-256 token hash, user relation, expiry; expired sessions are rejected even before MongoDB's TTL cleanup runs. |
| `ContactMessage` / `messages` | Name, email, message, creation time, optional legacy import ID.                                                         |
| `RateWindow` / `rate_windows` | Unique scope/IP/minute key, atomic request counter, expiry.                                                             |

Django migrations create collections and indexes. `manage.py initdb` also converts the expiry indexes to MongoDB TTL indexes. Run it after schema migrations, including on an externally hosted database. MongoDB's TTL monitor is asynchronous.

The curated destination catalogue and licensed image imports remain frontend content. Saved places remain browser-local. These are explicit current behaviours rather than additional MongoDB collections.

## API contract

Paths deliberately have no trailing slash.

| Method | Path                      | Result                                                                                         |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/api/health`             | Real database connectivity check; returns Django/MongoDB identity.                             |
| POST   | `/api/auth/register`      | `{name, email, password}` → 201 `{user}` and session cookie.                                   |
| POST   | `/api/auth/login`         | `{email, password}` → 200 `{user}` and session cookie.                                         |
| GET    | `/api/auth/me`            | `{user}` or `{user: null}`.                                                                    |
| POST   | `/api/auth/logout`        | Invalidates the session and expires its cookie.                                                |
| POST   | `/api/contact`            | `{name, email, message}` → 201 confirmation.                                                   |
| GET    | `/api/places?lat=…&lng=…` | Validated, normalized Foursquare nearby results; 503 if unconfigured, 502 on provider failure. |

Errors are JSON `{error}`. APIs require JSON for mutations; arbitrary cross-origin mutations are rejected. Responses are not cached. The Next.js adapter caps request bodies at 32 KiB and never exposes the backend URL or service key to the browser.

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

The launcher generates a shared `BACKEND_PROXY_TOKEN` for the two services. With a matching token, Django accepts the frontend's actual connection IP for rate limiting; arbitrary forwarded headers and invalid tokens cannot select a different identity. Separate deployments must set the same secret on both services, protect the internal connection, and configure any CDN's trusted identity/edge controls. Without that token, Django uses its own connection address. Contact mail delivery, password reset, email verification, a Django admin dashboard, and cloud-synced favourites are outside the current implementation.
