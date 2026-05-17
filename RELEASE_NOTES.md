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
