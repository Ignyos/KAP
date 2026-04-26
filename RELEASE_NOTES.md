# Release v2026-04-26-22-04

## Overview
This release improves recipe version management and cleans up a few key UI details. It adds safer version deletion, clarifies empty version notes, and fixes version viewing behavior and About dialog links.

## New Features
- **Recipe Version Deletion**: Allows deleting older recipe versions while keeping the current version protected and preserving existing version numbers.

## Improvements
- **Version Notes**: Shows `No note yet.` when a version note is blank so empty notes are clearer at a glance.
- **About Dialog**: Removes unnecessary header action buttons for a simpler popup experience.
- **Release Notes Link**: Updates the About dialog link to open the GitHub Releases page.

## Bug Fixes
- **Recipe Version View**: Fixes view-only recipe version display so ingredients and instructions render consistently.
- **Version Delete Safeguards**: Prevents deleting the current recipe version and keeps at least one version available.

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
