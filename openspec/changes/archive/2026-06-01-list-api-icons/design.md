## Context

The PWA listing app (PWALand) fetches app data from a Notion database via a server-side API (`/api/client/list`). Each app entry in Notion has an `icon` property containing a URL to the app's icon image. The backend passes this through as `icon` in the `NotionAppProperty` response, and `transformNotionApp` maps it to `PWAApp.icon`.

Currently, both the Home page (`pages/Home/index.tsx`) and Categories page (`pages/Categories/index.tsx`) define a local `AppIcon` component that:

- Checks if `icon` is a URL via `isUrl()`
- If URL: shows the first character of the app name (uppercased)
- If not URL (emoji): shows the raw `icon` string
- Falls back to the first letter if icon is empty

This means URL icons from the API are discarded visually. The Notion data supports external image URLs (uploaded or linked), but the UI never renders them.

The `FeaturedCard` component on the Home page has the same pattern inline.

## Goals / Non-Goals

**Goals:**

- Create a shared `AppIcon` component in `components/AppIcon/` that can be used across pages
- Render API-provided icon URLs as `<img>` elements in the shared component
- Replace all inline `AppIcon` definitions in Home and Categories pages with the shared component
- Apply the same rendering to `FeaturedCard`'s icon
- Preserve the letter-based fallback when icon is empty or not a valid URL

**Non-Goals:**

- No backend API changes — the API already returns `icon` URLs correctly
- No changes to how categories derive icons (category icons remain hardcoded in `CATEGORY_META`)
- No lazy loading or optimization for icon images beyond standard `<img>` attributes
- No changes to the submit flow or icon upload mechanism

## Decisions

**1. Extract shared AppIcon component**

- Current: Two identical `AppIcon` implementations in Home and Categories pages + inline pattern in FeaturedCard
- Decision: Create `components/AppIcon/index.tsx` + `index.module.scss`
- Rationale: Eliminates duplication, keeps future icon rendering changes in one place

**2. Render URL icons as `<img>` tags**

- Current: `isUrl(icon) ? name.charAt(0).toUpperCase() : icon`
- Decision: Use `<img src={icon} alt={name} />` when icon is a valid URL, with fallback to the current letter-on-colored-background behavior
- Rationale: Standard web pattern; img tags are universally supported and work with caching/CDN

**3. Pass `color` for fallback background, use transparent bg for image icons**

- When rendering an `<img>`, the container background should remain visible behind the image but the `<img>` itself fills the space
- The fallback background color (`app.color`) is only needed when the icon is missing

**4. Keep existing Home and Categories page imports — only replace the local AppIcon**

- The shared component's API: `<AppIcon icon={app.icon} color={app.color} name={app.name} />`
- Matches the current usage pattern exactly, so no prop signature changes needed

**5. CSS module per component**

- Create `index.module.scss` alongside the component for styles

## Risks / Trade-offs

- [Broken images] → Use `onError` handler to fall back to the letter display, so a dead image URL doesn't leave a blank space
- [Image loading delay] → Unavoidable for external URLs; the colored background stays visible behind the loading image, maintaining layout stability
- [Mixed content] → Some icons may be `http://` on an `https://` site; images loaded from HTTP will be blocked by browsers. Acceptable — app submitters should provide HTTPS URLs
