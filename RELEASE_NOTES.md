# Release v2026-04-14-21-12

## Overview
This release adds an About experience in the main menu and improves how release version information is displayed in-app. It also updates the release workflow to use UTC-based version timestamps and adds post-push cleanup steps.

## New Features
- **About Menu Option**: Adds an About action in the main menu for quick access to app information.
- **About Dialog Content**: Adds an About modal that includes company attribution to Ignyos, a link to Ignyos.com, and the current app version.

## Improvements
- **Version Display Format**: Updates displayed release versions to a more readable date-time format.
- **About Dialog Layout**: Centers About dialog text and improves spacing for clearer presentation.

## Bug Fixes
- **No New User-Facing Fixes**: This release focuses on About dialog enhancements and release workflow updates.

## Technical Changes
- **UTC Release Versioning**: Updates release timestamp generation to use UTC so tags and release versions are consistent across environments.
- **Post-Push Cleanup Automation**: Adds release workflow cleanup that clears docs content and removes RELEASE_NOTES.md after successful pushes.
- **Release Notes File Recovery**: Adds automatic recreation of RELEASE_NOTES.md when missing at workflow start.
- **UI Modal API Extension**: Adds a dedicated `ShowAboutModal` UI helper and wires it into main menu handling.

## Installation
1. Clone or pull the latest code from the repository
2. Open src/index.html or docs/index.html in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
