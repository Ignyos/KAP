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
