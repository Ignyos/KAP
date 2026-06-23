# Release v2026-06-23-00-56

## Overview
This release improves recipe entry, grocery list cleanup, and database reliability. You can now enter fractional ingredient quantities, mark ingredients as optional, and confirm destructive list cleanup actions before they run.

## New Features
- **Optional Ingredients**: Recipe ingredient entry and editing now support an optional flag, and optional items are labeled in recipe details.
- **Fractional Quantities**: Ingredient quantity fields now accept fractions like `1/2`, and recipe detail views preserve the quantity text you entered.
- **New Recipe Flow**: Creating a recipe now prompts for the recipe name and opens the new recipe immediately after it is created.

## Improvements
- **Ingredient Display**: Recipe rows now show the entered quantity text in the quantity pill, making fractions easier to read.
- **Template Item Adds**: Adding a template item now uses the latest template detail record, which helps avoid stale item data when clicking repeatedly.
- **Database Resilience**: IndexedDB access now retries through reopening when a connection is closing, reducing failures during normal navigation and data updates.

## Bug Fixes
- **Clear Crossed-Off Items**: Clearing crossed-off grocery list items now asks for confirmation before deleting them.
- **Recipe Editing**: Recipe ingredient add and edit flows now preserve quantity text and optional state when saving changes.

## Technical Changes
- Added `quantityText` and `isOptional` fields to recipe item records and version snapshots.
- Added fractional quantity validation helpers for item entry.
- Added `withDatabase()` connection handling and open-state recovery in the DB layer.
- Added `db-change-deployment-gate-checklist.md` and `recipe-scaling-requirements.md` to document deployment and recipe scaling follow-up work.

## Installation
1. Clone or pull the latest code from the repository.
2. Open `src/index.html` or `docs/index.html` in a web browser.

## Requirements
- Modern web browser with ES5 JavaScript support.
- LocalStorage and IndexedDB support for data persistence.

## Documentation
- Release history is available on GitHub Releases: https://github.com/Ignyos/KAP/releases
- For feature documentation and usage guides, see `application-structure.md`.
- For recipe feature planning notes, see `recipe-feature-definition.md`.
- Deployment checklist: `requirements/db-change-deployment-gate-checklist.md`
- Recipe scaling requirements: `requirements/recipe-scaling-requirements.md`

---

# Release v2026-06-23-00-25

## Overview
This release introduces comprehensive data import and export capabilities with intelligent sync support. You can now backup and restore your data, or merge imported data with existing records to keep both local and imported changes.

## New Features
- **Data Export**: Export all your app data (lists, recipes, categories, units, and more) to a JSON file with a single click from Settings > Data > Export.
- **Data Import with Merge Mode**: Import previously exported data and merge it with your current local data. Records are intelligently synced based on update timestamps—newer records always win.
- **Data Import with Replace Mode**: Restore a complete backup by replacing all local data with imported data. Available as a secondary option with explicit confirmation to prevent accidents.
- **Import Mode Selection Modal**: Single, clear modal showing both Merge and Replace options with descriptions so you understand the choice before proceeding. Merge is selected by default.
- **Delete Synchronization**: Deletions are now tracked and propagated during import so that records deleted on one device can be deleted on another during a merge.

## Improvements
- **Data Persistence**: Settings now includes a dedicated Data section with Export and Import controls in one place.
- **Import Summary**: After a successful import, a detailed summary shows how many records were inserted, updated, and skipped, plus how many deletions were applied.
- **Automatic Cleanup**: Tombstones (deletion records) older than 365 days are automatically purged during export and import to keep storage lean.
- **Responsive Import Controls**: Export and Import buttons stack vertically on mobile while remaining inline on larger screens.

## Technical Changes
- Upgraded IndexedDB schema version to 8.
- Added `syncTombstones` store to track deleted records with timestamps for deletion propagation.
- Added `KaPImportExportService` module handling export, import, and merge logic.
- Implemented Last-Write-Wins collision resolution: newer record timestamps override older ones during merge.
- Added `removeHard` and `replaceStores` database helpers to support import operations.
- Added `ShowImportModeModal` UI helper for the single-screen import mode choice.
- Export files are versioned (schema version 2) to support future format changes.
- Added README.md with getting-started documentation for new users.

## Installation
1. Clone or pull the latest code from the repository.
2. Open `src/index.html` or `docs/index.html` in a web browser.

## Requirements
- Modern web browser with ES5 JavaScript support.
- LocalStorage and IndexedDB support for data persistence.
- File system access to import/export JSON files.

## Documentation
- Release history is available on GitHub Releases: https://github.com/Ignyos/KAP/releases
- For feature documentation and usage guides, see `application-structure.md`.
- For recipe feature planning notes, see `recipe-feature-definition.md`.
- Getting started guide: see `README.md`.

---

# Release v2026-05-17-00-59

## Overview
This release introduces a dedicated Units of Measure page with full group and unit management, replacing the limited UoM section that was previously embedded in Settings.

## New Features
- **Units of Measure Page**: A new top-level page accessible from the main navigation menu. Displays all units organized by group and supports adding, editing, and removing units and groups.
- **Group Management**: Each group now has a `…` action menu with Move Up, Move Down, Rename, and Remove options. Remove is disabled when the group still contains units.
- **Add Group**: A new "+ Add Group" button on the Units of Measure page allows creating empty groups before populating them with units.
- **Edit Any Unit**: All units, including seeded ones, can now be fully edited from the Units of Measure page.
- **Remove Unit**: Units can be removed individually via a confirmation prompt from the unit's action menu.

## Improvements
- **Edit Unit Modal**: Now includes a Group field so users can move a unit to a different group while editing.
- **Create Unit Modal**: Group selector now uses the current list of known groups rather than a fixed hardcoded set.
- **Group Display Order**: The order of groups on the Units of Measure page is saved per-device and persists across sessions.
- **Empty Group Placeholder**: Groups with no units display a placeholder row so the card layout renders correctly.

## Bug Fixes
- **Recipe Tags Dropdown on Mobile**: The tags dropdown no longer opens off-screen to the left on small displays.

## Technical Changes
- Added `deleteUnitOfMeasure` and `renameGroup` APIs to the recipe service.
- Added `/uom` route to the app router.
- Added `UOM_GROUP_ORDER` setting key (`uomGroupOrder`, default `[]`) for persisting group display order.
- Removed the Units of Measure section from the Settings page.
- Added `uom-page.js` to both `src/` and `docs/` and registered it in `index.html`.
- Removed the `isSeeded` edit restriction from `updateUnitOfMeasure`.

## Installation
1. Clone or pull the latest code from the repository.
2. Open `src/index.html` or `docs/index.html` in a web browser.

## Requirements
- Modern web browser with ES5 JavaScript support.
- LocalStorage and IndexedDB support for data persistence.

## Documentation
- Release history is available on GitHub Releases: https://github.com/Ignyos/KAP/releases
- For feature documentation and usage guides, see `application-structure.md`.
- For recipe feature planning notes, see `recipe-feature-definition.md`.

---

# Release v2026-05-03-20-40

## Overview
This release adds complete quantity and unit-of-measure support to recipe ingredients, including seeded units, add/edit flows, and ingredient display updates.

## New Features
- **Ingredient Unit Selection**: Add and edit ingredient flows now include a Unit selector next to Quantity.
- **Custom Units in Ingredient Modal**: Unit selection now supports inline `+ Add Unit...` creation without leaving the ingredient modal.
- **Units Management in Settings**: Settings now includes a Units of Measure section to view grouped units, add custom units, and edit non-seeded units.
- **Seeded Unit Catalog**: Recipes now include seeded Imperial, Metric, Unit, and Size units with behavior metadata.

## Improvements
- **Decimal Quantity Support**: Ingredient quantities now store decimal values for recipe and version items.
- **Ingredient Row Quantity Badge**: Recipe ingredient rows now display quantity with unit abbreviation in a compact badge.
- **Add to Grocery List Context**: Ingredient selection in Add to Grocery List now shows quantity and unit badges for clearer review before adding.
- **Quantity Input Layout**: Quantity and Unit controls now share a single row for faster entry and editing.

## Bug Fixes
- **Unit Dropdown Loading**: Unit lists now load reliably by reading all units and filtering active records in code.
- **Version Ingredient Editing**: Non-latest version ingredient edits now correctly save updated quantity and unit values.

## Technical Changes
- Bumped IndexedDB schema version to 7.
- Added `unitOfMeasures` store, indexes, and idempotent seed migration.
- Added recipe service APIs for unit retrieval, creation, and updates.
- Extended recipe/version item snapshots and detail records with `quantityValue` and `unitOfMeasureId`.
- Removed recipe ingredient `More/Less` quantity actions from the row action menu.
- Removed the completed quantity/UOM planning doc (`QUANTITY_UOM.md`).

## Installation
1. Clone or pull the latest code from the repository.
2. Open `src/index.html` or `docs/index.html` in a web browser.

## Requirements
- Modern web browser with ES5 JavaScript support.
- LocalStorage and IndexedDB support for data persistence.

## Documentation
- Release history is available on GitHub Releases: https://github.com/Ignyos/KAP/releases
- For feature documentation and usage guides, see `application-structure.md`.
- For recipe feature planning notes, see `recipe-feature-definition.md`.