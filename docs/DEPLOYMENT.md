# Free deployment: Vercel and MongoDB Atlas

Deployment target: two Vercel Hobby projects from this repository and one MongoDB Atlas Free (M0) cluster. This preserves Next.js, Django, and MongoDB without a paid web server. Free allowances, personal/non-commercial eligibility, function cold starts, and Atlas inactivity limits apply. A custom domain is optional; the supplied Vercel addresses work with HTTPS.

This file describes the configuration. It does not confirm that a deployment or hosted database has been created. Check `/api/health` on the public frontend to verify the actual running stack.

## Database

Create an Atlas **Free / M0** cluster, not a trial of a paid tier. Use a dedicated database such as `discoverhub`. Create a database user with access to that database; migrations need collection/index administration as well as read/write access. The `initdb` command applies migrations, seeds missing original destinations without overwriting edits, and configures session/rate-window TTL indexes.

Atlas must allow the deployment's outbound network connections. Vercel Hobby does not provide a fixed application egress address. If using Atlas's allow-from-anywhere network setting, retain TLS and a strong, unique, database-scoped username/password; the cluster still requires authentication. Do not put the database URI in browser variables or repository files. Use separate databases and credentials for production and previews.

Local accounts and messages stay local. A hosted deployment starts with its own accounts and the original destination seed; copying personal local records is a separate data migration.

## Django project

Import this repository as a second Vercel project, with **Root Directory `backend`** and **Framework Preset Django**. Python 3.13, the WSGI entrypoint, and dependencies are specified by `.python-version`, `pyproject.toml`, and `uv.lock`. `backend/vercel.json` runs `python manage.py initdb` during the build. No MongoDB process runs inside a Vercel function.

Set these server-side variables before deploying:

| Variable                      | Value                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                 | Authenticated Atlas connection URI.                                                                                                             |
| `MONGODB_DATABASE`            | Production database name; use another value for previews.                                                                                       |
| `DJANGO_DEBUG`                | `false`                                                                                                                                         |
| `DJANGO_SECRET_KEY`           | Random secret of at least 50 characters.                                                                                                        |
| `BACKEND_PROXY_TOKEN`         | Random secret of at least 32 characters; use the identical value in the frontend.                                                               |
| `REQUIRE_BACKEND_PROXY_TOKEN` | `true`                                                                                                                                          |
| `DJANGO_COOKIE_SECURE`        | `true`                                                                                                                                          |
| `DJANGO_ALLOWED_HOSTS`        | Exact backend production hostname, without scheme. Vercel's deployment/production/branch hostnames are also accepted from its system variables. |
| `FRONTEND_ORIGINS`            | Exact permitted frontend HTTPS origins, separated by commas. Initially `https://discover-hub-beryl.vercel.app`.                                 |
| `FOURSQUARE_API_KEY`          | Optional current service key for live nearby discovery.                                                                                         |

On Vercel, Django refuses to start with debug enabled, missing hosted configuration, or weak/missing service secrets. It does not load the local `.env.local`. MongoDB pools are limited to 10 connections per function process with idle connections released after one minute.

Direct calls to Django return 403 without the shared service token, including health checks. The frontend is the public application entry point. Keep deployment protection enabled for previews when possible. If the backend's Vercel deployment protection also applies to server-to-server requests, configure its automation bypass secret on the frontend as described below; application service authentication remains required independently.

## Existing frontend project

Keep the existing project's repository root at `.` and its Next.js preset. The root `vercel.json` explicitly selects Next.js, installs with `npm ci`, and builds with `npm run build`. Do not use the local all-services launcher as a cloud start command.

Configure:

| Variable                           | Value                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `BACKEND_URL`                      | The Django project's stable HTTPS production URL.                              |
| `BACKEND_PROXY_TOKEN`              | The same random token used by Django.                                          |
| `BACKEND_PROTECTION_BYPASS_SECRET` | Optional automation bypass secret belonging to the **backend** Vercel project. |

None of these variables should have a `NEXT_PUBLIC_` prefix. Both API forwarding and server-rendered destination pages authenticate to Django. Requests retain the frontend's session cookies; the browser talks only to its own origin. Client identity comes from Vercel's platform-set header on Vercel, or the actual connection address locally. Arbitrary client-provided identity, service-token, and bypass headers are never forwarded.

Frontend previews must target the preview backend/database, and their exact browser origins must be allowed by that backend. Do not point ordinary previews at the production database or allow every `*.vercel.app` origin.

## Publish and verify

1. Deploy the configured Django project first. Confirm its authenticated health response identifies Django/MongoDB and that the catalogue is seeded.
2. Configure the frontend's backend URL and secrets, then deploy a preview with the matching origins/database. Verify catalogue search, detail pages, maps, registration/login/logout, account saves, guest import, and contact storage. Live nearby discovery requires its separate provider key.
3. Once the full stack passes, merge the existing pull request with a merge commit and deploy the production frontend. Retain the feature branch and original Git history.
4. Run the read-only public smoke check:

   ```sh
   npm run check:deployment -- https://discover-hub-beryl.vercel.app
   ```

Never publish a frontend configured with a localhost backend. Cloud builds must succeed before replacing the current production deployment. Keep the previous production deployment available for rollback. Check the deployed site's dynamic functions; a successful static page build alone does not verify database connectivity.

References: [Vercel Django support](https://vercel.com/docs/frameworks/full-stack/django), [Hobby allowances](https://vercel.com/docs/plans/hobby), [Atlas Free limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/), [Vercel request headers](https://vercel.com/docs/headers/request-headers).
