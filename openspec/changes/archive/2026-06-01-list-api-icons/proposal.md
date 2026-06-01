## Why

The Notion database stores an `icon` URL for each app, and the API returns it via `/api/client/list`. However, the `AppIcon` component (used in Home and Categories pages) treats URL icons the same as empty strings — showing only the first letter of the app name. This wastes visual information that could make the list more recognizable and polished.

## What Changes

- Update `AppIcon` (in both Home and Categories pages) to render the API-provided icon URL as an `<img>` element when the icon is a valid URL, instead of showing a first-letter fallback
- Update `FeaturedCard`'s icon to render the API-provided icon URL the same way
- Extract a shared `AppIcon` component into `components/` so the same logic isn't duplicated across pages
- Keep `isUrl()` fallback: when icon is empty or not a URL, fall back to showing the app name's first letter on the colored background (current behavior)

## Capabilities

### New Capabilities

- `api-icon-rendering`: render app icons from API-provided image URLs in all list and featured card views

### Modified Capabilities

(none)

## Impact

- **Frontend**: Home (`/pages/Home/index.tsx`), Categories (`/pages/Categories/index.tsx`), and `VirtualAppGrid` — all render `AppIcon`
- **New shared component**: `components/AppIcon/index.tsx` to deduplicate `isUrl` logic
- **No API changes**: the backend already returns `icon` as a URL; this is purely a frontend rendering change
