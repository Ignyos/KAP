# DB Change Deployment Gate Checklist

## Purpose
Use this checklist before deploying any branch that changes database schema, DB access behavior, or data write/read workflow.

## Release Gate
1. Import/export feature exists on the currently deployed data shape.
2. Export can complete successfully for real user data volume.
3. Import can restore a previously exported file into a clean app state.
4. Export/import round-trip preserves all critical records and relationships.
5. A manual backup is taken from the current production-like app state before deployment.
6. Backup file can be opened and sanity-checked (non-empty, expected sections/records).
7. Restore drill is performed at least once before deployment decision.
8. Deployment branch passes smoke tests on a clean database.
9. Deployment branch passes smoke tests on migrated data from a prior version.
10. No unhandled IndexedDB errors occur during startup, create, edit, delete, and navigation flows.
11. Recipe, list, template, category, and item data remain readable after migration.
12. Versioned recipe data (ingredients/instructions/tags) remains intact after migration.
13. Any new optional fields have backward-safe defaults for existing records.
14. Service worker and asset cache-busting versions are updated for release artifacts.
15. Rollback path is defined and tested (install previous build + restore backup).

## Smoke Test Scope (Minimum)
1. Create, edit, delete grocery list.
2. Create, edit, delete pantry entry; add item to target list.
3. Create recipe; add/edit/remove ingredient; add/edit/remove instruction.
4. Open recipe versions and switch versions.
5. Navigate home and section detail pages without runtime errors.

## Backup/Restore Procedure (Operator)
1. Open stable build (pre-DB-change branch) on isolated origin/profile.
2. Run export and save file with timestamp.
3. Copy backup file to a second location.
4. Install candidate build on test origin/profile.
5. Run import using backup file.
6. Execute smoke tests and validate record counts/spot checks.

## Go/No-Go Criteria
- Go only if all Release Gate items are checked.
- No-Go if any data-loss, unreadable-record, or startup/runtime DB error occurs.

## Notes
- Git branches do not isolate IndexedDB data.
- Use separate browser profiles or separate origins/ports when validating multiple branches.
