# Release v2026-04-26-15-09

## Overview
This release introduces full Recipes support, including recipe detail pages, version history workflows, and ingredient-to-list actions. It also improves item management behavior and clarifies crossed-off list handling.

## New Features
- **Recipes Section**: Adds a fully functional Recipes area on the home page, including recipe creation and recipe detail navigation.
- **Recipe Detail Experience**: Adds editable ingredients and instructions for current versions, plus read-only viewing for historical snapshots by default.
- **Recipe Versioning**: Adds version records, version selection, new version creation, version notes, and recipe cloning from selected versions.
- **Versions Accordion UI**: Adds a dedicated versions accordion with version picker, note editing, and clone guidance directly in recipe detail.
- **Add To Grocery List**: Adds a modal flow to send selected recipe ingredients to an existing list or a newly created grocery list.

## Improvements
- **Instruction Actions UI**: Moves per-step instruction actions into a compact overflow menu for cleaner instruction rows.
- **Ingredient Selection Quality**: Excludes ingredients already on the current recipe from Add Ingredient suggestions.
- **Ingredient Row Alignment**: Keeps quantity spacing consistent so ingredient names align in both view-only and editable states.
- **Crossed-Off Section Behavior**: Shows the crossed-off area only when crossed-off items exist and simplifies its action to Clear Crossed-Off.

## Bug Fixes
- **Instruction Reordering**: Fixes Move Up and Move Down behavior so instruction order updates correctly.
- **Repeated Item Selection Prevention**: Prevents selecting duplicate existing ingredients from the Add Ingredient suggestion dropdown.

## Technical Changes
- **Data Model**: Updates IndexedDB schema to version 5 and adds recipeVersions and recipeInstructions stores with supporting indexes.
- **Routing**: Adds recipe route parsing and navigation support for /recipe/:id paths.
- **UI API Surface**: Adds shared modal APIs for new version, recipe clone, and add-to-list workflows, plus shared overflow menu helpers.
- **PWA Bootstrapping**: Moves manifest link creation to runtime for supported protocols and tightens service worker registration checks.

## Installation
1. Clone or pull the latest code from the repository.
2. Open src/index.html or docs/index.html in a web browser.

## Requirements
- Modern web browser with ES5 JavaScript support.
- LocalStorage and IndexedDB support for data persistence.

## Documentation
- See WORK_IN_PROGRESS.md for active UX tasks and implementation status.
- See recipe-feature-definition.md for recipe feature planning notes.
- For feature documentation and usage guides, see application-structure.md.
