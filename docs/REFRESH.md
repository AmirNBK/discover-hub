# Refresh notes — 18 October 2026

These findings describe an inspection and AI-assisted modernization of a 2023 undergraduate project. They are not a retrospective assessment of what was submitted or working in 2023. See [project history and provenance](HISTORY.md).

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

## Verification

Production build, strict TypeScript checking, ESLint, and production dependency audit pass. `npm audit --omit=dev` reports zero vulnerabilities. Playwright runs against the production build with a separate SQLite database, testing desktop and mobile layouts, account and contact flows, destination search/filter/save behaviour, page rendering, content images, overflow, and map failure handling. See the generated Playwright report for the latest run.

The full development dependency audit still reports five high advisories through `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. The latest published `braces` version checked was 3.0.3; it remains covered by the advisory. The suggested forced audit fix downgrades the Next.js lint configuration to 14, so it was not applied. These are lint-tool dependencies, not production dependencies. Some of Next's bundled lint plugins still declare ESLint 9 peer ranges, producing installation warnings with ESLint 10; lint execution was verified.

## Operational limits

- SQLite needs Node 24+ and a writable persistent disk. The default backend is for one server instance, not ephemeral serverless storage.
- Contact submissions are stored locally; email delivery, email verification, and password recovery are not configured.
- Saved destinations stay in the current browser; accounts do not sync favourites.
- The collection contains four destinations. Search filters that collection; live nearby places require a fresh Foursquare service key.
- Tile delivery and external directions need network access. Production geolocation and secure sessions require HTTPS.
- A public deployment should use suitable reverse-proxy abuse protection, data retention, backups, and an appropriate tile-provider plan.

See the README for setup and data handling details.
