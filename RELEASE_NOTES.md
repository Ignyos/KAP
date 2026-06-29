# Release v2026-06-29-22-08

## Overview
This release expands recipe step editing so each step can include linked ingredients and an optional timer, and it improves quantity entry and display for fractional values. It also updates recipe detail labels and step presentation to make recipe workflows easier to scan.

## New Features
- **Step Editor Modal**: Adds a dedicated Add Step and Edit Step modal with step text, ingredient multi-select, optional timer toggle, hour/minute/second duration inputs, and optional timer label.
- **Step Ingredient Linking**: Lets each recipe step link to one or more recipe ingredients so step context can stay tied to ingredient usage.
- **Step Timer Support**: Lets each step store one optional timer with second-level precision and a custom label.
- **Step Metadata Badges**: Shows timer duration and linked ingredient badges directly in the instruction list.

## Improvements
- **Instruction Workflows**: Uses the new step editor for both latest recipe and version snapshot step add/edit flows.
- **Quantity Display Readability**: Displays numeric ingredient quantities as fractions or mixed fractions where possible (for example, `1/2` and `1 1/2`).
- **Quantity Input Guidance**: Adds inline quantity format help in recipe ingredient entry (examples include decimal, fraction, and mixed fraction formats).
- **Recipe Detail Tabs**: Renames the `Information` tab label to `Info` in recipe details.
- **Timer Input Visibility**: Improves timer duration input styling so typed values and caret remain visible.

## Bug Fixes
- **Mixed Fraction Validation**: Fixes quantity validation so mixed fractions like `1 1/2` are accepted.
- **Timer Label Layout**: Fixes timer field layout so `Timer Label (Optional)` remains on its own line below duration controls.

## Technical Changes
- Extended recipe instruction persistence and version snapshots to include `ingredientRefs` and `timer` data with normalization and comparison support.
- Updated recipe import/export handling to round-trip enriched instruction fields and validate timer duration values.
- Added shared normalization helpers for instruction ingredient references and timer payloads in recipe page and recipe service paths.
- Added two new requirements documents for step editor and future prepare-mode planning.

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
- Step editor requirements: `requirements/recipe-step-editor-requirements.md`.
- Prepare mode requirements draft: `requirements/prepare-recipe-mode-requirements.md`.
