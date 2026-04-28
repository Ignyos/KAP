# Release v2026-04-28-20-08

## Overview
This release adds recipe tagging, recipe search by tag or name, and new personalization settings for theme and text size. It also improves recipe version rendering so older versions display their own snapshot data.

## New Features
- **Theme Setting**: Adds five selectable themes in Settings (Dark, Spring, Summer, Autumn, Winter).
- **Text Size Setting**: Adds Small, Medium, and Large text size controls in Settings.
- **Recipe Tags**: Adds tag management in recipe detail with add/select and remove actions, and support for multiple tags per recipe.
- **Recipe Search**: Adds recipe filtering on the main Recipes section by tag or recipe name.

## Improvements
- **Saved Preferences on Startup**: Applies saved theme and text size when the app initializes.
- **Tag Picker Behavior**: Shows only tags not already assigned to the current recipe and filters results while typing.
- **Tag Styling**: Updates recipe tag chips with improved spacing and an explicit remove button.
- **UI Consistency**: Refines spacing and responsive styling across settings, recipe detail, and accordion views.

## Bug Fixes
- **Recipe Version Data Display**: Restores version-specific snapshot rendering for non-current versions so ingredients and instructions match the selected version.
- **Recipe Version Editing Guardrails**: Removes edit mode for non-current versions to prevent unintended changes to the latest version.
- **Version Actions Display**: Shows `+ New Version` only when the Versions accordion is expanded.

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
- For quantity and unit-of-measure planning, see `QUANTITY_UOM.md`.
