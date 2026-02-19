# PWALand API - Bruno Collection

This folder contains Bruno API test files for the PWALand API endpoints.

## Setup

1. Install [Bruno](https://www.usebruno.com/) if you haven't already
2. Open Bruno and click "Open Collection"
3. Select this `bruno` folder

## Environment Variables

The requests use a `base_url` variable that is configured through environment files.

### Available Environments

- **Local**: `http://localhost:3000` (default for local development)
- **Production**: `https://pwaland.brandonxiang.top` (production server)

### How to Use

1. In Bruno, open the collection
2. Click on the environment selector (usually at the top right)
3. Select either "Local" or "Production" environment
4. All requests will automatically use the `base_url` from the selected environment

The environment files are located in the `environments/` folder:
- `environments/Local.bru.env` - Local development environment
- `environments/Production.bru.env` - Production environment

## Available Requests

### 1. Check PWA
- **File**: `Check PWA.bru`
- **Endpoint**: `POST /api/pwa/check`
- **Description**: Checks if a website qualifies as a PWA
- **Body**: `{ "url": "twitter.com" }`

### 2. Add PWA
- **File**: `Add PWA.bru`
- **Endpoint**: `POST /api/pwa/add`
- **Description**: Adds a validated PWA to the Notion database
- **Body**: `{ "title": "...", "link": "...", "icon": "...", "description": "...", "tags": [...] }`

### 3. Check PWA - Invalid URL
- **File**: `Check PWA - Invalid URL.bru`
- **Description**: Example request with invalid URL to test error handling

### 4. Add PWA - Missing Fields
- **File**: `Add PWA - Missing Fields.bru`
- **Description**: Example request with missing required fields to test validation

### 5. Get Client List
- **File**: `Get Client List.bru`
- **Endpoint**: `POST /api/client/list`
- **Description**: Retrieves a paginated list of PWAs from the Notion database
- **Body**: `{ "start_cursor": null }` (optional for first page)

### 6. Get Client List - Paginated
- **File**: `Get Client List - Paginated.bru`
- **Description**: Example request for fetching the next page using pagination cursor

### 7. Discover PWAs
- **File**: `Discover PWAs.bru`
- **Endpoint**: `POST /api/pwa/discover`
- **Description**: Batch-discover PWAs from Tranco + GitHub lists, validate, and insert to Notion
- **Body**: `{ "source": "all", "limit": 100, "dryRun": true }`

### 8. Discover PWAs - Tranco
- **File**: `Discover PWAs - Tranco.bru`
- **Description**: Discover PWAs from Tranco Top 500 and insert to Notion (production run)

## Usage

1. Make sure the Fastify server is running on `http://localhost:3000`
2. Select a request in Bruno
3. Click "Send" to execute the request
4. View the response in the response panel

## Notes

- The `Check PWA` endpoint performs lightweight HTTP checks (no browser automation)
- The `Add PWA` endpoint checks for duplicates before inserting
- The `Get Client List` endpoint supports pagination via `start_cursor` parameter
- The `Discover PWAs` endpoint runs batch checks with rate limiting (1.5s/batch) and saves progress to `data/discover-results.json`
- All endpoints return a standard response format: `{ data, ret, msg, timestamp }` (except `Get Client List` which returns `{ properties, has_more, next_cursor }`)
