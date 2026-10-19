# Refresh notes — 18 October 2026

These findings describe an inspection and modernization of a 2023 undergraduate project. They are not a retrospective assessment of what was submitted or working in 2023. See [project history and provenance](HISTORY.md).

## Original project findings

Reviewed every route, component, stylesheet, configuration file, and dependency manifest, and inspected the bundled imagery.

- Next.js 13.4.9 and the old lockfile produced 48 audit findings: 7 critical, 23 high, 17 moderate, and 1 low.
- Map modules imported browser-only Leaflet code into the server-rendered page. Routing dereferenced a null location and used an empty destination before either was available.
- Geolocation ran automatically on entry and left destinations empty when permission or the provider failed.
- Nearby discovery called the retired Foursquare V3 API with a key embedded in the browser. Pexels keys were embedded in multiple components, making unused requests.
- Account requests relied on an external backend that timed out during investigation. The API helper was under `pages/api` without a route handler, mixed browser storage with API logic, and swallowed errors.
- Login error handling could throw another error on network failures. There was no usable sign-out or account state in navigation.
- Contact inputs were not connected to a submission handler. Several buttons, gallery controls, footer labels, and detail links had no action or pointed to an undefined URL.
- Destination ratings were random; testimonials and branding were inconsistent. Large fixed widths, oversized padding, nested CSS, and component-library overrides made responsive layouts unreliable.
- Unused UI frameworks, styling engines, a video loader, and routing dependencies increased the dependency and maintenance surface.

## Changes

Updated to Next.js 16.4.2 and React 19.3.1, retained the Pages Router, modernised TypeScript and ESLint configuration, and removed the unused package families. See the official [Next.js upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16).

Rebuilt the interface with a consistent forest-green and ivory palette, serif headings, shared navigation/footer, destination cards, responsive layouts, accessible labels, keyboard focus, and reduced-motion support. Removed placeholder ratings and testimonials. Added destination detail pages, saved places, privacy information, and a branded 404 page. Subsequently replaced the low-resolution bundled photographs with licensed high-resolution images and responsive AVIF/WebP delivery; see [image measurements](IMAGES.md).

Search, categories, saved places, marker selection, details, and directions are connected. Map code loads only in the browser. Geolocation is requested on a deliberate action; denied permission, absent services, invalid coordinates, provider failure, empty results, and tile failure have clear handling. Distances use kilometres and are labelled as straight-line estimates.

Replaced the unresponsive account-server dependency with a local SQLite backend. Accounts use scrypt password hashes, random sessions stored as hashes, HTTP-only cookies, seven-day expiry, validation, origin checks, and request limits. Contact messages are persisted and can be read with the operator CLI. Old remote users were not migrated.

Live nearby discovery now uses the [current Foursquare API](https://docs.foursquare.com/fsq-developers-places/reference/place-search) with a server-side service key. It is optional; no valid key was available for a live provider test. The original exposed keys must be rotated by the owner; deleting them from current source does not erase Git history.

### Catalogue and account collections — 19 October 2026

Moved destination metadata from frontend constants into MongoDB. Django now serves published destinations with search, database categories, pagination, and individual detail records. A validated operator import command adds or updates destinations; startup seeds preserve existing edits. Detail pages render newly added slugs without a frontend build. The map fetches bounded pages and resolves deep links to the page containing the selected destination.

Account bookmarks use unique user/destination relations. Guest saves remain local and import only through an explicit action. Account state refreshes on window focus, private bookmarks are cleared from client memory on logout, and failed or stale writes cannot silently become guest saves. Existing optimized photos retain their delivery settings; new records use a designed placeholder until licensed photography is installed.

## Verification

### Local runtime follow-up

A localhost map stuck at “Getting your map ready…” was traced to a production server still running after its build was replaced. The HTML loaded but three JavaScript manifests returned 404. Development now uses `.next-dev/`, separate from the production `.next/` output. A production server must still be stopped before rebuilding and restarted afterwards.

The new browser regression checks the actual localhost server with `npm run check:local`, including map initialization, marker popups, saved-place filtering, zooming, and navigation back through home search. It also caught a Leaflet CSS zoom completion timer accessing a removed map during route changes. CSS zoom transitions are disabled and result fitting is immediate; destination selection still uses `flyTo`. Page titles now use a single React text child, and the document declares smooth scrolling for Next.js route transitions.

### Full checks

The Django/MongoDB migration and catalogue follow-up pass twelve backend integration tests against real MongoDB, 42 production browser/API/image tests (one desktop copy of the mobile-navigation test is intentionally skipped), and both actual-localhost checks. TypeScript, ESLint, Ruff, Django system/migration checks, the production build, and the Node production dependency audit also pass. The backend tests cover persisted accounts/sessions/messages, session expiry, request limits, provider mapping/failure, repeatable read-only SQLite import with password upgrades, catalogue imports/search/pagination/publication, and account bookmark isolation/imports. An additional isolated 55-record catalogue check verifies new detail routes, pagination, dynamic categories, map focus beyond its first page, and unpublished 404 responses without changing application data. Python dependencies are pinned with hashes in `backend/uv.lock`.

The earlier SQLite refresh also passed the production build, TypeScript checking, ESLint, production dependency audit, and browser tests with a separate SQLite database. The current browser suite instead uses isolated MongoDB databases; see the generated Playwright report for the latest run.

The full development dependency audit still reports five high advisories through `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. The latest published `braces` version checked was 3.0.3; it remains covered by the advisory. The suggested forced audit fix downgrades the Next.js lint configuration to 14, so it was not applied. These are lint-tool dependencies, not production dependencies. Some of Next's bundled lint plugins still declare ESLint 9 peer ranges, producing installation warnings with ESLint 10; lint execution was verified.

### Free deployment preparation

Added separate Vercel configurations for the Next.js frontend and Python/Django backend, with Atlas Free as the database target. Both frontend API requests and server-rendered destination pages authenticate to the backend. Hosted settings require explicit secrets/database configuration, disable debug, force secure cookies, accept exact Vercel hostnames, and bound MongoDB connection pools. Tests run against a protected backend, including direct-access rejection and Vercel client-identity handling. The read-only `check:deployment` command verifies public health, catalogue records, detail pages, and basic routes. See [deployment instructions](DEPLOYMENT.md).

These changes prepare hosting; they do not establish that accounts are connected or that the hosted stack has been provisioned and verified. The current production site must stay on its existing deployment until the new backend/database are ready.

## Operational limits

The later Django/MongoDB migration supersedes the SQLite runtime described above. The initial refresh remains preserved in Git. The current [backend notes](../backend/README.md) document models, indexes, API contracts, import compatibility, local launch commands, tests, and deployment requirements.

- Current operation needs Node 24+, Python 3.13, and persistent MongoDB. A frontend-only deployment must be connected to a separately hosted Django service.
- Contact submissions are stored locally; email delivery, email verification, and password recovery are not configured.
- Guest saves stay in the browser; signed-in saves sync through MongoDB. Device saves are imported only by an explicit action.
- Four existing destinations seed the database. Validated imports add or update catalogue records without rebuilding the frontend; metadata search and pagination run in Django. Live nearby places require a fresh Foursquare service key.
- Tile delivery and external directions need network access. Production geolocation and secure sessions require HTTPS.
- A public deployment should use suitable reverse-proxy abuse protection, data retention, backups, and an appropriate tile-provider plan.

See the README for setup and data handling details.
