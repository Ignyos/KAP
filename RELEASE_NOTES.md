# Release v2026-04-13-20-44

## Overview
This release adds Progressive Web App support so Kitchen & Pantry can be installed and used more reliably across devices. It also adds a guided install menu flow for cases where browser install prompts are not immediately available.

## New Features
- **Progressive Web App Support**: Adds a web app manifest, installable app icons, and a service worker so Kitchen & Pantry can be installed as an app.
- **Install App Menu Action**: Adds an app-level Install App menu item that triggers the browser install prompt when available.

## Improvements
- **Install Guidance UX**: Improves install guidance by showing platform-aware help text when the native install prompt is unavailable.
- **Install State Feedback**: Updates the menu item state to show when the app is already installed and disables re-install actions.
- **Modal Footer Button Layout**: Narrows confirmation buttons and keeps them right-aligned for cleaner dialog actions.

## Bug Fixes
- **Local File Install Confusion**: Clarifies install prerequisites in fallback guidance by noting HTTPS or localhost requirements for install support.

## Technical Changes
- **Manifest and Icons**: Adds `manifest.webmanifest` and new app icon assets for install metadata.
- **Service Worker Registration**: Registers a service worker at startup in secure contexts to support app-shell caching.
- **Offline App Shell Caching**: Adds cache install/activate/fetch handling for core app assets and navigation fallback.

## Installation
1. Clone or pull the latest code from the repository
2. Serve the app over HTTPS or `http://localhost` and open `src/index.html` or `docs/index.html` in a web browser

## Requirements
- Modern web browser with ES5 JavaScript support
- LocalStorage and IndexedDB support for data persistence
- Service Worker and Web App Manifest support for install/offline behavior

## Documentation
For feature documentation and usage guides, see [application-structure.md](application-structure.md).
