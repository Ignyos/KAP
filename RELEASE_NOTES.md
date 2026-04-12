# Kitchen & Pantry Release Notes

## Overview
This release improves the Pantry & Fridge section with clearer guidance and a new inline help tooltip, while refining accordion presentation for a cleaner experience.

## Improvements
- **Pantry & Fridge Guidance**: Added contextual helper text that explains what Pantry & Fridge lists are for and how they can be used as checklist-driven starters for shopping lists.
- **Header Help Icon**: Added a blue `?` info icon in the Pantry & Fridge accordion header with a styled tooltip that matches the site theme.
- **Accordion Header Simplification**: Removed list-count badges from Grocery Lists and Pantry & Fridge headers so attention stays on section actions and content.
- **Accordion Visual Polish**: Updated accordion section/header styling to improve rounded-corner presentation and first-row border behavior.

## Technical Changes
- **Tooltip Rendering Behavior**: Updated accordion overflow and tooltip layering rules so the Pantry & Fridge tooltip can render outside collapsed headers without clipping.

## Installation
1. Clone or pull the latest code from the repository
2. Open `src/index.html` or `docs/index.html` in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
