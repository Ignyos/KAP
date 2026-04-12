# Kitchen & Pantry Release Notes

## Overview
This release improves label consistency in the main navigation and refreshes asset versioning so users reliably load the latest build.

## Improvements
- **Navigation Labeling**: Updated the main section label from "Pantry / Fridge" to "Pantry & Fridge" for clearer, more consistent naming.

## Technical Changes
- **Asset Cache Busting**: Updated stylesheet and script asset query parameters to `v=2026-04-11-20-36`, helping browsers fetch the latest files instead of stale cached versions.

## Installation
1. Clone or pull the latest code from the repository
2. Open `src/index.html` or `docs/index.html` in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
