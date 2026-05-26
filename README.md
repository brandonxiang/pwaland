# PWALand

PWALand is a curated directory for discovering, validating, and submitting Progressive Web Apps. It helps users find installable, offline-capable web apps, and gives maintainers a workflow for checking PWA readiness before adding new entries.

[Chinese documentation](./README.zh-CN.md)

## Features

- Curated Progressive Web App directory with category browsing and keyword search.
- Featured app recommendations for high-quality PWAs.
- Submission page that checks whether a website meets core PWA requirements.
- Server-side PWA validation for HTTPS, web app manifest, service worker, icons, and display mode.
- Duplicate detection and Notion-backed storage integration for submitted apps.
- Batch discovery tooling for finding candidate PWAs from public domain sources.

## Project Structure

```text
pwaland/
├── projects/
│   ├── web-next/      # React Router frontend
│   └── server/        # Fastify API service
├── data/              # Curated and generated PWA data
├── scripts/           # Data and sitemap utility scripts
├── bruno-api/         # Bruno API collection
└── docs/              # Planning and optimization notes
```

## Tech Stack

- React 19 and React Router 7 for the web application.
- Ant Design 6 for interface components.
- Vite and Vite+ for local development, builds, linting, and tests.
- Fastify 5 for the API service.
- Vitest for unit tests.
- Notion API integration for PWA storage.

## Getting Started

### Prerequisites

- Node.js 22 or later is recommended.
- pnpm 10.33.0, as declared by the project package manager field.
- Vite+ CLI support through `vp`.

### Install Dependencies

```bash
pnpm install
```

### Run the Frontend

```bash
cd projects/web-next
pnpm run dev
```

Use the local API proxy when running the server locally:

```bash
cd projects/web-next
pnpm run dev:local
```

### Run the API Server

```bash
cd projects/server
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Test

```bash
pnpm run test
```

## API Collection

The `bruno-api/` directory contains Bruno requests for common API workflows:

- Check whether a URL is a PWA.
- Add a PWA to the directory.
- Discover PWA candidates from public sources.
- List existing clients or apps.

## Adding a PWA

The recommended workflow is:

1. Open the submit page in the web app.
2. Enter the website URL.
3. Review the PWA readiness result.
4. Complete or adjust the suggested title, icon, description, and tags.
5. Submit the app for storage.

For data-only contributions, update `data/pwa.json` with the required fields:

- `title`
- `icon`
- `link`

Additional metadata such as description, category, tags, developer, and rating may be added when available.

## Finding PWAs Manually

Chrome can show service-worker-enabled sites that you have visited:

```text
chrome://serviceworker-internals/
```

Modern Chrome versions may expose similar information through DevTools under Application -> Service Workers.

## License

[MIT](./LICENSE)
