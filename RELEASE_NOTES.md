# Kitchen & Pantry Release Notes

## Overview
This release implements cache busting for all assets to ensure users always receive the latest version of the application without stale file caching.

## Technical Changes
- **Asset Cache Busting**: All stylesheets and scripts now include version query parameters (`v=2026-04-11-16-33`), preventing browsers from serving outdated cached files and ensuring users always load the latest application build.

## Installation
1. Clone or pull the latest code from the repository
2. Open `src/index.html` or `docs/index.html` in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
