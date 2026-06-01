## 1. Create shared AppIcon component

- [x] 1.1 Create `components/AppIcon/index.tsx` with image-rendering logic and onError fallback
- [x] 1.2 Create `components/AppIcon/index.module.scss` with styles for both icon modes (image + letter fallback)
- [x] 1.3 Add `components/AppIcon/index.ts` barrel export

## 2. Update Home page to use shared AppIcon

- [x] 2.1 Remove local `AppIcon` definition from `pages/Home/index.tsx`
- [x] 2.2 Remove local `isUrl` helper from `pages/Home/index.tsx`
- [x] 2.3 Import shared `AppIcon` and use it in `AppCard`
- [x] 2.4 Update `FeaturedCard` to use shared `AppIcon` (replace inline icon rendering)

## 3. Update Categories page to use shared AppIcon

- [x] 3.1 Remove local `AppIcon` definition from `pages/Categories/index.tsx`
- [x] 3.2 Remove local `isUrl` helper from `pages/Categories/index.tsx`
- [x] 3.3 Import shared `AppIcon` and use it in `AppCard`
