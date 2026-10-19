# Project history and provenance

## Original undergraduate project

AmirNBK developed DiscoverHub as a bachelor's university project in 2023. Its existing commits remain intact, with their original authorship and timestamps.

The repository state immediately before the modernization is commit [`0028f72d4f7617477db52f3c0ed3541cdf4d581e`](https://github.com/AmirNBK/discover-hub/commit/0028f72d4f7617477db52f3c0ed3541cdf4d581e), dated August 28, 2023. The annotated tag `archive/pre-modernization` preserves that state. This reference identifies the last existing repository snapshot, not a verified university submission milestone.

That version contains the original Next.js application, travel-oriented interface, Leaflet map and routing integration, browser-side place/image API integration, and forms connected to an external account backend. The original report, presentation, or assessment materials should be used to establish the exact scope delivered to the university.

## Subsequent modernization

The changes on `amirHossein/modernized-and-refactored` were made after the original undergraduate project. They include dependency upgrades, interface redesign, replacement of the external account-server dependency with SQLite-backed accounts and contact storage, changes to place discovery and directions, saved destinations, image replacement and optimization, automated checks, and operating documentation.

These additions and changes should not be represented as part of the original 2023 submission. In particular, the current local backend and the original external-backend integration are different implementations. Existing remote accounts were not migrated. Live nearby discovery needs a current provider key; saved places and contact storage have the behaviours described in the README.

## Git history

The later `amirHossein/django-mongodb-backend` branch replaces the refresh's SQLite backend with Python/Django and MongoDB through the official Django MongoDB backend. Accounts, hashed sessions, contact messages, validation, provider requests, and rate limits run in Django. A read-only migration command supports the previous local database. The same branch subsequently moves destination metadata into MongoDB, adds server-side catalogue queries and imports, and syncs bookmarks to accounts while retaining guest saves. This work is recorded separately from both the 2023 project and the first refresh; the original stack should be established from the original backend source or university materials.

The refresh is committed on its own branch and submitted through a pull request to `main`. A merge commit preserves both the branch commits and their relationship to the original history. The modernization branch is retained after merging. No original commits are rewritten, squashed, or backdated.

The README distinguishes the original university work from the later refresh. [Refresh notes](REFRESH.md), [image measurements](IMAGES.md), and the automated checks describe the current implementation. The existing commit and pull request records are preserved unchanged, including the original branch name recorded at merge time.
