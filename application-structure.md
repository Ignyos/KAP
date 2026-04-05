# Application Structure Outline

## Document Status

- Status: Draft
- Last updated: 2026-04-05
- Purpose: Outline a vanilla JavaScript application structure for implementation planning

## Confirmed Constraints (From requirements.md)

- Hosting target: GitHub Pages (static site)
- Runtime: Browser
- Persistence: IndexedDB
- In-scope domains:
  - Shopping Lists
  - Shopping List Templates
  - Versioned Recipes
- Shared data model requirements:
  - Shared Item catalog
  - Shared ListRecord entity with type discriminator (List | Template | Recipe)
  - Join records for ListRecord-Item with relationship-specific quantity and description

## Proposed Implementation Direction (Pending Confirmation)

- Language: Vanilla JavaScript — plain script files loaded via `<script>` tags, no bundler, no import/export module syntax
- Build/deploy: Pure static files, no build step, ready for GitHub Pages as-is
- Data access: IndexedDB wrapper script to isolate persistence concerns
- UI approach: Component-like plain JS scripts and rendering helpers (no frontend framework)

## Folder Structure (Vanilla JS)

```text
/public
  index.html                      — Single HTML page with global templates
  styles.css                      — Global stylesheet
  /templates
    lists.templates.html          — Feature-specific templates (optional)
    templates.templates.html
    recipes.templates.html

/src
  main.js                         — App entry point
  app-init.js                     — Bootstrap and wiring
  
  /shared
    events.js                     — Event bus or publisher/subscriber
    ids.js                        — ID generation (UUIDs)
    dates.js                      — Date utilities
    constants.js                  — App-wide constants
  
  /ui
    ui.js                         — UI interface functions (core layer)
    template-loader.js            — Template fragment loader
  
  /data
    db.js                         — IndexedDB initialization
    stores.js                     — Object store definitions
    mappers.js                    — Record-to-entity mapping
  
  /domain
    entities.js                   — Entity schemas
    validators.js                 — Write validation logic
  
  /features
    /lists
      lists-page.js              — Render orchestration
      lists-service.js           — Business logic & persistence
      lists-state.js             — Local state management
    /templates
      templates-page.js
      templates-service.js
      templates-state.js
    /recipes
      recipes-page.js
      recipes-service.js
      recipe-versioning.js       — Diff-style versioning logic
      recipes-state.js
    /items
      items-service.js           — Shared item catalog operations
      item-suggestions.js        — Type-ahead lookup
```

## Three-Layer Architecture

This project uses a three-layer architecture separating concerns and making the app maintainable without a framework:

### Layer 1: HTML Templates (`index.html` + feature fragments)

Templates define all UI structure as native `<template>` elements. They are inert, reusable, and contain no logic.

**Global templates** live in `index.html`:
- Navigation, layout, shared UI components

**Feature-specific templates** live in fragment files like `templates/lists.templates.html` and are loaded at startup:
- Feature-scoped rows, forms, sections

See [VANILLA_JS_APPROACH.md](VANILLA_JS_APPROACH.md) for template patterns and the fragment loader.

### Layer 2: `ui.js` Interface Functions

All DOM operations go through this centralized interface. Functions clone templates, populate them, attach event listeners, and return or mount nodes.

**Naming convention:**
- `New*()` — Pure builder: returns a prepared node (caller decides where to mount)
- `Add*()` — Mounting function: accepts a container and appends itself
- `Replace*()` — Bulk operation: clears container and populates with items
- `Clear*()` — Empties a container
- `Get*()` — Extracts data from a rendered node

Example:
```javascript
function NewListRow(list) {
  const node = document.getElementById('list-row-template').content.cloneNode(true);
  node.querySelector('.list-name').textContent = list.name;
  node.querySelector('.btn-edit').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('list:edit', { detail: list.id }));
  });
  return node;
}

function AddListRow(container, list) {
  const row = NewListRow(list);
  container.appendChild(row);
  return row;
}
```

### Layer 3: Feature Scripts (pages, services, state)

Feature modules coordinate rendering, business logic, and state. They wire together services, state, and UI functions.

**Pattern:**
1. Load data from service/database
2. Render using `ui.js` helpers
3. Attach event listeners
4. On state change, reload and re-render

Example:
```javascript
let listState = [];

async function initListsPage() {
  const container = document.getElementById('lists-container');
  listState = await ListsService.getAllLists();
  
  // Render
  listState.forEach(list => AddListRow(container, list));
  
  // Listen for changes
  window.addEventListener('list:created', async () => {
    listState = await ListsService.getAllLists();
    container.innerHTML = '';
    listState.forEach(list => AddListRow(container, list));
  });
}
```

## Confirmed Data Modeling Notes

- List and Template use shared ListRecord with Type discriminator
- Item is shared and reused across List, Template, and Recipe
- Quantity is stored on relationship records (not Item)
- Recipe versioning is diff-style with inheritance from parent version
- Version 1 stores base state as Added changes

## Confirmed Architectural Decisions

### Platform & Persistence
- Hosting: GitHub Pages (pure static files)
- Runtime: Browser only
- Database: IndexedDB with a centralized DB wrapper module
- No build step, no bundler, no module syntax — all scripts loaded via `<script>` tags in order

### UI Architecture
- Three-layer approach: Templates + `ui.js` interface + Feature scripts
- HTML templates define all structure (no markup in JavaScript)
- Feature-specific templates loaded from fragment files at startup
- All DOM operations funnel through `ui.js` interface functions
- `ui.js` naming convention distinguishes pure builders (`New*`) from mounting functions (`Add*`)
- Event-driven communication via `window.dispatchEvent()` and global event listeners

### Application Flow
- Single-page application with internal state only (no hash routing)
- Feature pages managed individually; feature services coordinate persistence
- Global stylesheet; feature-scoped state on each page
- Script load order: shared dependencies → `ui.js` → data/domain → features → app-init → main.js

### Data Model
- Shared Item catalog across Lists, Templates, and Recipes
- ListRecord entity with Type discriminator (List | Template | Recipe)
- Quantity stored on relationship records, not Item
- Recipe versioning is diff-style with inheritance from parent versions

### Testing & Quality
- Phase 1: Unit tests for domain logic only (entities, validators)
- No test requirements for UI or IndexedDB integration in phase 1
- Browser DevTools for debugging render state and event flow

### Code Style & Generation
- All UI code generation via AI must use `ui.js` functions (no raw `document.createElement` or `innerHTML`)
- Feature naming: `feature-name-page.js`, `feature-name-service.js`, `feature-name-state.js`
- Template IDs: Feature prefix like `lists-*`, `templates-*`, `recipes-*`
- HTML element classes: Functional kebab-case like `btn-remove`, `list-name`

## Module Responsibilities

| Module | Responsibility |
|--------|-----------------|
| `main.js` | Entry point; triggers DOMContentLoaded and app initialization |
| `app-init.js` | Loads template fragments, opens database, initializes features |
| `ui/ui.js` | Centralized DOM interface for all template cloning, population, and event attachment |
| `ui/template-loader.js` | Fetches, parses, and injects feature template fragments into document |
| `data/db.js` | IndexedDB initialization, transaction wrappers, and query/save helpers |
| `data/stores.js` | Defines object store schemas and indexes for ListRecord, Item, RecipeVersion, etc. |
| `data/mappers.js` | Maps raw store records to domain entity objects |
| `domain/entities.js` | Canonical entity shapes for ListRecord, Item, RecipeVersion, diffs, notes |
| `domain/validators.js` | Write validation: name length, quantity format, state consistency |
| `features/lists/lists-page.js` | Render orchestration, event wiring for list feature |
| `features/lists/lists-service.js` | CRUD operations and persistence calls for lists |
| `features/lists/lists-state.js` | Local state cache and change notifications for list feature |
| `features/items/items-service.js` | CRUD and search operations on shared Item catalog |
| `features/recipes/recipe-versioning.js` | Diff inheritance resolution and version-aware reconstruction logic |

## Implementation Resources

For full guidance on patterns, code examples, testing approaches, debugging, and performance considerations, see [VANILLA_JS_APPROACH.md](VANILLA_JS_APPROACH.md).

## Next Steps

1. Create a phased implementation checklist with phase 1 covering domain entities, validators, and IndexedDB setup.
2. Create a Copilot instructions file (`.instructions.md` or similar) that enforces the `ui.js` interface and naming conventions for AI-assisted code generation.
3. Initialize the folder structure and create boilerplate files for main.js, db.js, ui.js, and the first feature (lists).
