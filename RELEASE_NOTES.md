# Release v2026-04-14-16-52

## Overview
This release updates the Edit Pantry flow so Target List suggestions are no longer filtered while typing. It makes list selection more predictable when managing pantry entry configuration.

## New Features
- **No New Features**: This release focuses on refining existing Target List selection behavior.

## Improvements
- **Edit Pantry Target List Suggestions**: Shows the full Grocery List set in the Target List dropdown instead of filtering by typed text.

## Bug Fixes
- **Target List Option Visibility**: Fixes cases where expected Grocery Lists could be hidden by dropdown filtering during pantry entry edits.

## Technical Changes
- **Template Config List Search**: Updates template config `searchLists` handling to return all lists for the Edit Pantry Target List selector.

## Installation
1. Clone or pull the latest code from the repository
2. Open src/index.html or docs/index.html in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
