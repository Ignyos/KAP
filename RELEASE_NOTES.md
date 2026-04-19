# Release v2026-04-19-20-30

## Overview
This release focuses on improving Pantry & Fridge item click reliability when adding items to a target Grocery List. Rapid repeated clicks now process more consistently.

## New Features
- **No New Features**: This release focuses on a targeted Pantry & Fridge interaction fix.

## Improvements
- **Pantry & Fridge Click Handling**: Improves repeated click handling so quick taps on the same item are processed in order.

## Bug Fixes
- **Pantry Item Re-Clicking**: Fixes an issue where the second rapid click on a Pantry & Fridge item could be ignored, requiring a third click to apply the next quantity update.

## Technical Changes
- **Queued Click Processing**: Replaces single in-progress click blocking with per-item queued click processing for target-list adds.
- **Template State Refresh**: Reads the latest template record before applying add-to-list actions to avoid stale target-list state.

## Installation
1. Clone or pull the latest code from the repository
2. Open src/index.html or docs/index.html in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
- See `WORK_IN_PROGRESS.md` for active UX tasks and implementation status.
- See `recipe-feature-definition.md` for recipe feature planning notes.
- For feature documentation and usage guides, see [application-structure.md](application-structure.md).
