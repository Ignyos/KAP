# Release v2026-04-13-20-07

## Overview
This release adds global item categories and a template target-list workflow to speed up recurring list building. It also improves modal behavior and fixes migration and item-update reliability issues.

## New Features
- **Global Categories**: Adds shared categories that can be created, selected, and deleted while adding or editing items in Grocery Lists and Pantry & Fridge.
- **Category Grouped Views**: Adds per-record category grouping with an Uncategorized bucket and alphabetical grouping/sorting when enabled.
- **Template Target List**: Adds per-template target list selection so tapping a template item adds or increments that item on the configured grocery list.
- **Template Usage Pills**: Adds list-usage pills on template items so you can see where each template item is currently used.

## Improvements
- **Edit Item Flow**: Simplifies list/template item editing to name and notes while preserving the existing quantity value.
- **Category View Defaults**: Sets Grocery Lists to show categories by default and Pantry & Fridge templates to hide categories by default.
- **Category Dropdown UX**: Improves category suggestions so the dropdown opens on focus, closes on outside click or Escape, and is less intrusive on modal load.
- **Template Detail Layout**: Refines template item row structure and action alignment for clearer scanning of quantity, name, and usage context.

## Bug Fixes
- **IndexedDB Upgrade Reliability**: Fixes upgrade failures by using the active versionchange transaction during schema upgrades.
- **Category Update Resilience**: Fixes "Item not found" failures when editing some existing list/template entries by recovering missing backing item records.

## Technical Changes
- **Schema Update**: Bumps IndexedDB schema to version 3 and adds a dedicated categories store and indexes.
- **Category Service Layer**: Adds a categories service for search/create/resolve/delete operations and item uncategorization on category delete.
- **Record Settings Persistence**: Adds persisted per-record category view preferences in settings.
- **Template Service Enhancements**: Adds template target-list configuration and per-item list-usage aggregation support.

## Installation
1. Clone or pull the latest code from the repository
2. Open src/index.html or docs/index.html in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
