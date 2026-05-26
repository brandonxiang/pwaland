# PWALand Optimization Plan

## Overview

This plan captures the current optimization work for PWALand. The first goal is to make the project safer and easier to validate: remove committed secrets, protect server-side URL fetching, align commands with Vite+, and restore a reliable type-check baseline. Performance and UI polish follow after the foundation is clean.

## Current Baseline

- `vp install` succeeds.
- `vp check` succeeds.
- `vp run --filter './projects/*' test` succeeds.
- `vp run --filter './projects/*' build` succeeds, with a server packaging deprecation warning.
- Direct root `vp test run` succeeds with workspace-aware configuration.
- Explicit workspace type checks succeed.

## Architecture Decisions

- Use Vite+ commands for package management, builds, tests, and dependency updates.
- Keep Notion credentials and database identifiers in environment variables, not source files.
- Validate external URLs before any server-side fetch to reduce SSRF risk.
- Keep API response cleanup incremental: existing raw endpoints stay compatible until their callers are migrated.
- Treat type-check failures as build health work, separate from user-facing feature changes.

## Task List

### Phase 1: Security Foundation

#### Task 1: Move Notion Configuration To Environment Variables

**Description:** Remove hardcoded Notion API credentials and database ids from runtime and maintenance scripts.

**Acceptance criteria:**

- [x] Source code contains no committed Notion secret token.
- [x] Runtime code reads Notion config from environment variables.
- [x] Maintenance scripts fail clearly when required environment variables are missing.

**Verification:**

- [x] `rg "secret_" projects/server` returns no results.
- [x] `vp run --filter './projects/*' test` passes.
- [x] `vp check` passes.

**Dependencies:** None

**Files likely touched:**

- `projects/server/src/model/notion.ts`
- `projects/server/scripts/import-pwa-to-notion.js`
- `projects/server/scripts/update-pwa-descriptions.js`
- `projects/server/.env.example`

**Estimated scope:** Medium

#### Task 2: Harden Server-Side URL Fetching

**Description:** Validate and normalize URLs before PWA checks, block local/private/link-local hosts, and avoid following redirects to unsafe targets.

**Acceptance criteria:**

- [x] PWA check rejects localhost and private IP targets.
- [x] Redirect targets are validated before following.
- [x] Tests cover unsafe URL rejection.

**Verification:**

- [x] `vp run --filter './projects/server' test` passes.
- [x] `vp check` passes.

**Dependencies:** Task 1

**Files likely touched:**

- `projects/server/src/services/pwa-checker.ts`
- `projects/server/src/services/url-safety.ts`
- `projects/server/src/services/url-safety.test.ts`

**Estimated scope:** Medium

### Phase 2: Toolchain Baseline

#### Task 3: Align Scripts With Vite+

**Description:** Replace direct package-manager commands in scripts and deployment config with Vite+ wrappers.

**Acceptance criteria:**

- [x] Root scripts use `vp run` for workspace tasks.
- [x] Server helper scripts use `vp` wrappers for dependency tasks and dev callbacks.
- [x] Vercel build command uses Vite+ from the workspace root.

**Verification:**

- [x] `vp run --filter './projects/*' test` passes.
- [x] `vp run --filter './projects/*' build` passes.

**Dependencies:** None

**Files likely touched:**

- `package.json`
- `projects/server/package.json`
- `projects/web-next/vercel.json`

**Estimated scope:** Small

#### Task 4: Restore Root Test And Type-Check Health

**Description:** Make root-level test invocation reliable and fix TypeScript errors in both workspaces.

**Acceptance criteria:**

- [x] Direct `vp test run` from the repository root passes.
- [x] `vp run --filter './projects/server' type-check` passes.
- [x] `vp run --filter './projects/web-next' type-check` passes.

**Verification:**

- [x] `vp test run` passes.
- [x] Both workspace type-check commands pass.
- [x] `vp check` passes.

**Dependencies:** Task 3

**Estimated scope:** Medium

### Phase 3: Data And Performance

#### Task 5: Cache Notion List Reads

**Description:** Add a small server-side cache for Notion list endpoints to reduce latency and Notion API pressure.

**Acceptance criteria:**

- [x] Repeated list calls within the TTL reuse cached data.
- [x] Pagination remains correct.
- [x] Cache can be bypassed or expires predictably.

**Verification:**

- [x] Server model tests cover cache hit, cursor separation, and disabled-cache behavior.
- [x] `vp run --filter './projects/server' test` passes.

**Dependencies:** Task 4

**Estimated scope:** Medium

#### Task 6: Review Frontend Bundle And Virtual Grid

**Description:** Either implement real virtualization with the existing dependency or remove unused dependencies and rename the grid.

**Acceptance criteria:**

- [x] `@tanstack/react-virtual` is either used by `VirtualAppGrid` or removed.
- [x] Unused frontend dependencies are removed.
- [x] App grid behavior remains covered by tests.

**Verification:**

- [x] `vp run --filter './projects/web-next' test` passes.
- [x] `vp run --filter './projects/web-next' build` passes.

**Dependencies:** Task 4

**Estimated scope:** Medium

## Risks And Mitigations

| Risk                                                  | Impact | Mitigation                                                                        |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Removing hardcoded Notion config breaks local startup | High   | Add `.env.example` and fail with clear missing-variable errors                    |
| URL validation blocks legitimate domains              | Medium | Allow public HTTP/HTTPS hosts and cover private-host rejection with focused tests |
| Vite+ command changes affect deployment               | Medium | Verify workspace build locally after script changes                               |
| Type-check fixes uncover deeper stale code            | Medium | Fix in small batches and keep behavior changes separate                           |

## Open Questions

- Should public write endpoints like `/api/pwa/add` require an admin token immediately, or should that be a separate deploy step with environment setup?
- What cache TTL is acceptable for Notion list data in production?
- Should legacy crawler/parse endpoints remain public API, or be moved behind admin-only tooling?
