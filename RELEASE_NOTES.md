# Release v2026-04-19-20-21

## Overview
This release improves day-to-day list and pantry workflows by reducing extra clicks and preserving context on the home screen. It also adds lightweight planning documentation for upcoming recipe work.

## New Features
- **Work Tracking Document**: Adds a `WORK_IN_PROGRESS.md` file to track active UX tasks, bug fixes, and rollout status.
- **Recipe Planning Draft**: Adds `recipe-feature-definition.md` as a working draft for recipe UX, behavior, and model planning.
- **About Dialog Link**: Adds a Release Notes link in the About dialog for faster access to change history.

## Improvements
- **Main Page Accordions**: Allows multiple accordion sections to stay open at the same time.
- **Home Screen Context**: Preserves and restores main page scroll position when leaving and returning to home.
- **Crossed-Off Items Actions**: Replaces the crossed-off overflow menu with always-visible action buttons for deleting all crossed-off items and uncrossing all items.

## Bug Fixes
- **Pantry Item Re-Clicking**: Fixes an issue where quickly clicking the same Pantry & Fridge item could ignore the second click before quantity updated.

## Technical Changes
- **Settings Persistence Keys**: Adds settings storage keys for expanded accordion sections and main page scroll position.
- **Release Workflow Cleanup Step**: Removes post-push cleanup that deleted docs contents and `RELEASE_NOTES.md`.
- **About Modal Config**: Extends About modal configuration to accept and render a release notes URL.

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
