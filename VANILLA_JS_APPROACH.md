# Vanilla JavaScript Application Approach

A guide to building client-side web applications with vanilla JavaScript, browser persistence, and a scalable three-layer UI architecture.

## Overview

This approach combines three technologies for maintainable, performant UI development without frameworks:

1. **HTML `<template>` elements** — Static markup definitions, inspectable and separate from logic
2. **`ui.js` interface functions** — Runtime helpers that manage DOM creation and lifecycle
3. **Global `<script>` tags** — Feature modules and services, no bundler, no module syntax

This pattern is suitable for:
- Static site hosting (GitHub Pages, Netlify, etc.)
- Browser-only persistence (IndexedDB, localStorage)
- Single-page applications with feature-based organization
- Projects where bundle size and development simplicity matter

## Project Structure

```text
/public
  index.html                      — Single HTML page with templates
  styles.css                      — Global styles
  
/src
  main.js                         — App entry point
  app-init.js                     — Bootstrap and wiring
  shared/
    events.js                     — Event bus or publisher/subscriber
    ids.js                        — ID generation (UUIDs)
    dates.js                      — Date utilities
    constants.js                  — App-wide constants
  ui/
    ui.js                         — UI interface functions (primary)
  data/
    db.js                         — IndexedDB initialization
    stores.js                     — Object store definitions
    mappers.js                    — Record-to-entity mapping
  domain/
    entities.js                   — Entity schemas and validators
    validators.js                 — Write validation logic
  features/
    feature-name/
      feature-name-page.js        — Page render orchestration
      feature-name-service.js     — Business logic and persistence calls
      feature-name-state.js       — Feature-local state management
```

## The Three-Layer Architecture

### Layer 1: HTML Templates

Define all UI structure in `index.html` using native `<template>` elements. Templates are inert and reusable.

```html
<!-- In index.html -->
<template id="list-item-template">
  <div class="list-item">
    <input type="text" class="item-name" placeholder="Item name" />
    <input type="text" class="item-qty" placeholder="Qty" />
    <button class="btn-remove">Remove</button>
  </div>
</template>

<template id="list-row-template">
  <div class="list-row">
    <h3 class="list-name"></h3>
    <button class="btn-edit">Edit</button>
    <button class="btn-delete">Delete</button>
  </div>
</template>
```

**Benefits:**
- Markup is visible and editable in the HTML file
- No markup strings in JavaScript
- Easy to inspect structure and styling
- Templates are evaluated only when cloned, no performance overhead

### Optional: Feature Template Fragments

You can keep one runtime page (`index.html`) and still define feature-specific templates in separate HTML fragment files.

Recommended pattern:

1. Keep shared/global templates in `index.html`
2. Store feature templates in files such as `templates/lists.templates.html`, `templates/templates.templates.html`, and `templates/recipes.templates.html`
3. Load those fragment files at startup, parse them, and append only `<template>` nodes into the active document

Example fragment file:

```html
<!-- templates/lists.templates.html -->
<template id="lists-item-row-template">
  <div class="list-row">
    <span class="list-name"></span>
    <button class="btn-edit">Edit</button>
    <button class="btn-delete">Delete</button>
  </div>
</template>
```

Example loader:

```javascript
// In src/ui/template-loader.js
async function LoadTemplateFragments(paths) {
  for (const path of paths) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('Failed to load template fragment: ' + path);
    }

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const templates = parsed.querySelectorAll('template[id]');

    templates.forEach((templateEl) => {
      const existing = document.getElementById(templateEl.id);
      if (existing) {
        throw new Error('Duplicate template id detected: ' + templateEl.id);
      }
      document.body.appendChild(templateEl);
    });
  }
}

window.LoadTemplateFragments = LoadTemplateFragments;
```

Example startup usage:

```javascript
// In src/main.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await LoadTemplateFragments([
      '/templates/lists.templates.html',
      '/templates/templates.templates.html',
      '/templates/recipes.templates.html'
    ]);

    await AppInit.initialize();
  } catch (error) {
    console.error('App initialization failed:', error);
  }
});
```

Notes:

- This keeps your app single-page while letting templates stay feature-local
- Use a clear id prefix convention such as `lists-*`, `templates-*`, and `recipes-*`
- Ensure fragments are loaded before any `New*()` or `Add*()` UI function is called

### Layer 2: `ui.js` Interface Functions

All DOM operations go through a centralized interface. Functions follow a naming convention:
- `New*()` — Pure builder functions that return a prepared node (no side effects)
- `Add*()` — Mounting functions that accept a container and append themselves

```javascript
// In ui.js

// Pure builder: returns a node, caller decides what to do with it
function NewListItemRow(item) {
  const template = document.getElementById('list-item-template');
  const node = template.content.cloneNode(true);
  
  node.querySelector('.item-name').value = item.name;
  node.querySelector('.item-qty').value = item.quantity || '';
  
  node.querySelector('.btn-remove').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('item:remove', { detail: item.id }));
  });
  
  return node;
}

// Mounting function: accepts a container and mounts itself
function AddListItemRow(container, item) {
  const row = NewListItemRow(item);
  container.appendChild(row);
  return row;
}

// Utility: clear a container and repopulate it
function ReplaceListItems(container, items) {
  container.innerHTML = '';
  items.forEach(item => AddListItemRow(container, item));
}
```

**Benefits:**
- Single point of change for UI structure
- Pure builders are testable and composable
- Mounting functions reduce boilerplate at call sites
- Event listeners attached at creation time
- No `innerHTML` with unsanitized data (safe by default)

### Layer 3: Feature Scripts

Feature modules handle state, business logic, and orchestration. They wire together services, state, and UI functions.

```javascript
// In features/lists/lists-page.js

let listState = [];

async function initListsPage() {
  const container = document.getElementById('lists-container');
  
  // Load initial data
  listState = await ListsService.getAllLists();
  
  // Render
  ReplaceListItems(container, listState);
  
  // Wire events
  window.addEventListener('item:remove', async (e) => {
    await ListsService.removeItem(e.detail);
    listState = await ListsService.getAllLists();
    ReplaceListItems(container, listState);
  });
  
  window.addEventListener('list:created', async (e) => {
    listState = await ListsService.getAllLists();
    ReplaceListItems(container, listState);
  });
}

// Export for app-init.js to call
window.initListsPage = initListsPage;
```

**Pattern:**
1. Load data from service/database
2. Render using `ui.js` helpers
3. Attach event listeners
4. On state change, reload and re-render

## Naming Conventions

### UI Functions (`ui.js`)

| Pattern | Example | Behavior |
|---------|---------|----------|
| `New*` | `NewListRow(data)` | Pure builder; returns a node; no side effects |
| `Add*` | `AddListRow(container, data)` | Mounts to container; returns the node |
| `Replace*` | `ReplaceListRows(container, items)` | Clears container and populates with items |
| `Clear*` | `ClearListRows(container)` | Empties a container |
| `Get*` | `GetListRowData(node)` | Extracts data from a rendered node |

### Feature Modules

| File | Purpose |
|------|---------|
| `feature-name-page.js` | Render orchestration, event wiring |
| `feature-name-service.js` | Business logic, persistence coordination |
| `feature-name-state.js` | Local state cache, change notifications |

### HTML IDs and Classes

- Template IDs: kebab-case `id="list-item-template"`
- Functional classes: kebab-case `class="btn-remove"`, `class="list-name"`
- Data attributes for structured selectors: `data-list-id="{{ id }}"`

## Common Patterns

### Pattern: Form with Item Addition

```html
<!-- In index.html -->
<template id="item-input-template">
  <form class="item-form">
    <input class="item-input" type="text" placeholder="Item name" />
    <button type="submit" class="btn-add">Add Item</button>
  </form>
</template>
```

```javascript
// In ui.js
function NewItemForm() {
  const template = document.getElementById('item-input-template');
  const form = template.content.cloneNode(true);
  
  const submitBtn = form.querySelector('.btn-add');
  const input = form.querySelector('.item-input');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (value) {
      window.dispatchEvent(new CustomEvent('item:add', { detail: { name: value } }));
      input.value = '';
    }
  });
  
  return form;
}
```

### Pattern: Edit Mode Toggle

```javascript
// In features/lists/lists-page.js
function EnableListNameEdit(listRow, listId) {
  const nameEl = listRow.querySelector('.list-name');
  const originalName = nameEl.textContent;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalName;
  
  nameEl.replaceWith(input);
  input.focus();
  
  const saveEdit = async () => {
    const newName = input.value.trim();
    if (newName && newName !== originalName) {
      await ListsService.updateListName(listId, newName);
      window.dispatchEvent(new CustomEvent('list:updated'));
    }
    input.replaceWith(nameEl);
  };
  
  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') input.replaceWith(nameEl);
  });
}
```

### Pattern: State and Re-render

```javascript
// In features/lists/lists-state.js
class ListState {
  constructor() {
    this.lists = [];
    this.listeners = [];
  }
  
  async load() {
    this.lists = await ListsService.getAllLists();
    this.notify();
  }
  
  async addList(name) {
    await ListsService.createList(name);
    await this.load();
  }
  
  subscribe(callback) {
    this.listeners.push(callback);
  }
  
  notify() {
    this.listeners.forEach(cb => cb(this.lists));
  }
}

const state = new ListState();

// In page initialization:
state.subscribe((lists) => {
  const container = document.getElementById('lists-container');
  ReplaceListRows(container, lists);
});

await state.load();
```

## Script Loading and Initialization

### In `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>App Name</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- Templates here -->
  <template id="list-item-template">...</template>
  
  <!-- Main container -->
  <div id="app">
    <!-- Page content rendered here -->
  </div>
  
  <!-- Scripts in order: shared dependencies first, then features, then init -->
  <script src="/src/shared/constants.js"></script>
  <script src="/src/shared/ids.js"></script>
  <script src="/src/shared/events.js"></script>
  
  <script src="/src/ui/ui.js"></script>
  
  <script src="/src/data/db.js"></script>
  <script src="/src/data/stores.js"></script>
  <script src="/src/data/mappers.js"></script>
  
  <script src="/src/domain/entities.js"></script>
  <script src="/src/domain/validators.js"></script>
  
  <script src="/src/features/lists/lists-service.js"></script>
  <script src="/src/features/lists/lists-page.js"></script>
  
  <script src="/src/app/app-init.js"></script>
  <script src="/src/main.js"></script>
</body>
</html>
```

### In `src/main.js`:

```javascript
// Entry point
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await AppInit.initialize();
  } catch (error) {
    console.error('App initialization failed:', error);
  }
});
```

### In `src/app/app-init.js`:

```javascript
const AppInit = {
  async initialize() {
    // Open database
    await DB.open();
    
    // Initialize features
    await initListsPage();
    await initTemplatesPage();
    await initRecipesPage();
    
    // Show initial page (can be made dynamic later)
    document.getElementById('lists-page').style.display = 'block';
  }
};
```

## Persistence: IndexedDB

### Opening the Database

```javascript
// In src/data/db.js
const DB = {
  instance: null,
  
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('app-name', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.instance = request.result;
        resolve(this.instance);
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        // Define object stores
        if (!db.objectStoreNames.contains('lists')) {
          db.createObjectStore('lists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'id' });
        }
      };
    });
  },
  
  async query(storeName, key) {
    const tx = DB.instance.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  async save(storeName, data) {
    const tx = DB.instance.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }
};
```

## Testing

### Unit Tests (Domain Logic)

Test business logic independently of UI and persistence:

```javascript
// Test file: tests/validators.test.js
import { validateListName, validateItemQuantity } from '../src/domain/validators.js';

describe('Validators', () => {
  test('validateListName accepts non-empty strings', () => {
    expect(validateListName('My List')).toBe(true);
    expect(validateListName('')).toBe(false);
  });
  
  test('validateItemQuantity accepts positive numbers', () => {
    expect(validateItemQuantity('5')).toBe(true);
    expect(validateItemQuantity('-1')).toBe(false);
  });
});
```

### Integration Tests (UI + State)

Test feature pages with mock data:

```javascript
// Test file: tests/lists-page.integration.test.js
describe('Lists Page', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="lists-container"></div>';
    await initListsPage();
  });
  
  test('renders list items', async () => {
    const items = await ListsService.getAllLists();
    const rendered = document.querySelectorAll('.list-row');
    expect(rendered.length).toBe(items.length);
  });
});
```

## Debugging Tips

### Check the Render State

```javascript
// In browser console
console.log(document.getElementById('lists-container').innerHTML);
```

### Inspect Event Flow

```javascript
// In browser console, add a global listener
window.addEventListener('item:remove', (e) => console.log('item:remove', e));
```

### Trace Data Flow

```javascript
// In feature script, log state changes
state.subscribe((lists) => {
  console.log('State updated:', lists);
});
```

## Performance Considerations

1. **Minimize re-renders** — Only call `Replace*` when state actually changes
2. **Clone templates efficiently** — `cloneNode(true)` is fast, but do it in a loop only when necessary
3. **Debounce events** — Rate-limit input events to avoid excessive updates
4. **Lazy-load features** — Load feature scripts only when their page is first viewed
5. **Use delegation for many items** — For large lists, attach event listeners to the container, not each item

## Migration from Frameworks

If moving from React/Vue/Svelte:

1. Replace component JSX with `<template>` + `New*()` functions
2. Replace state management with simple objects + event bus
3. Replace `useState` side effects with event listeners
4. Keep domain entities and business logic (they are framework-agnostic)
5. Test domain logic independently as you did before

## Next Steps: Scaffolding

Future enhancement: PowerShell scripts to generate a new project with this structure:

```powershell
# Proposed future feature
New-VanillaJSApp -Name "my-app" -Features lists,templates,recipes
```

This would:
1. Create folder structure
2. Generate boilerplate `*.html`, `*.js`, `ui.js`
3. Wire up scripts in HTML in correct order
4. Add `.gitignore`, `README.md`, etc.
