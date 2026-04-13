# Kitchen & Pantry Release Notes

## Overview
This release improves day-to-day list management with inline quantity controls, simplifies item editing, and updates header navigation for Settings.

## Improvements
- **Inline Quantity Controls**: Adds + and - controls in item overflow menus for Grocery Lists and Pantry & Fridge so quantities can be adjusted without reopening dialogs.
- **Item Edit Simplification**: Updates item Edit dialogs to focus on Item Name and Description while preserving quantity from the list entry.
- **Default Add Quantity**: Sets new list/template item entries to start at quantity 1 by default.
- **Settings Access Menu**: Replaces the header settings button with a menu that includes a Settings action and supports keyboard and outside-click close behavior.
- **Detail View Polish**: Updates detail rows with quantity pills, cleaner spacing/borders, and sticky detail headers for easier scanning while scrolling.

## Technical Changes
- **Quantity Service Methods**: Adds dedicated increment/decrement quantity operations for list and template item records, with decrement clamped to a minimum of 1.
- **Settings State Cleanup**: Removes the unused "Remember position" setting key and UI toggle.
- **Build Tooling**: Adds a clean.ps1 script and a VS Code Clean launch profile to clear generated docs output before rebuilds.

## Installation
1. Clone or pull the latest code from the repository
2. Open src/index.html or docs/index.html in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
