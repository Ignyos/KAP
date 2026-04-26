# Work In Progress

## Document Status

- **Purpose:** Track bugs, improvements, and refinements currently in development.
- **Scope:** Changes not yet in master; separate from confirmed requirements.
- **Last updated:** 2026-04-19

---

## Active Issues and Tasks

### Task 6: Recipe Versions Accordion in Recipe Detail

**Status:** 🚧 IN PROGRESS

**Description**
Replace recipe version actions hidden in the detail overflow menu with a dedicated Versions accordion directly below the recipe detail header.

**Current Behavior**
- Recipe detail exposes version actions through the overflow menu.
- Version selection uses prompt-based entry.
- Version note is shown in the summary card but not as an always-available editable area.
- Clone uses a fixed generated name and does not explain clone behavior inline.

**Desired Behavior**
- Add a Versions accordion directly below the detail header.
- Collapsed summary row shows `Versions` and `vN (Current) • X total`.
- Accordion body includes:
  1. Version dropdown sorted newest-to-oldest.
  2. Note access action for the selected version.
  3. New Version primary action.
  4. Always-available version note editing with explicit Save.
  5. Clone Recipe action with explanatory tooltip.
- Remove version-specific actions from the detail overflow menu.
- Remove separate Edit Recipe action from the detail overflow menu.
- Keep recipe content editable only when the latest version is selected.
- Keep Delete confirmation in the detail overflow menu.

**Implementation Notes**
- Accordion expansion is remembered per recipe for the current browser session.
- First open for a recipe in a session defaults to expanded.
- New Version always creates the next numeric version from the currently selected version's effective state.
- New Version keeps the accordion open and focuses the version note editor.
- Clone prompts for a name with default `<recipe name> - copy` and preserves the existing clone note behavior.
- Reviewable version note history is not part of this task and remains a follow-up requirement.

**Acceptance Checks**
- [ ] Versions accordion renders directly below the recipe detail header.
- [ ] Overflow menu no longer contains Select Version, Version Note, New Version, Clone Recipe, or Edit.
- [ ] Version dropdown is sorted newest-to-oldest and loads the selected version immediately.
- [ ] Older versions render recipe content read-only.
- [ ] New Version creates the next version from the selected version and focuses the note editor.
- [ ] Version note can be saved empty and shows `No note yet.` when blank.
- [ ] Clone Recipe opens with default name `<recipe name> - copy` and explanatory tooltip text.
- [ ] Delete remains available with confirmation.

**Code References**
- [src/features/recipes/recipes-page.js](src/features/recipes/recipes-page.js) - recipe detail versions UI
- [src/features/recipes/recipes-service.js](src/features/recipes/recipes-service.js) - clone naming support and version actions
- [src/ui/ui.js](src/ui/ui.js) - clone naming modal
- [src/styles.css](src/styles.css) - recipe versions accordion styling

---

### Task 1: Multiple Open Accordions on Main Page

**Status:** ✅ COMPLETED

**Description**
Currently, when a user opens one accordion section on the main page, other closed sections may collapse or behave unexpectedly. Allow all accordion sections to be open simultaneously.

**Current Behavior (Before)**
- Accordion sections toggle individually but only one can be open at a time.

**Desired Behavior**
- User can open Lists, Templates, and Recipes accordions at the same time.
- Each section opens/closes independently.

**Fix Applied**
- Changed state from single `expandedSectionId` to array `expandedSectionIds`.
- Updated `getSavedExpandedSection()` → `getSavedExpandedSections()` to return array.
- Updated `handleSectionToggle()` to add/remove section ID from array instead of replacing.
- Added new settings key `EXPANDED_ACCORDION_SECTIONS` in settings.js.
- Updated default value to empty array `[]`.

**Code References**
- [src/features/main/main-page.js](src/features/main/main-page.js) - accordion state and toggle logic
- [src/shared/settings.js](src/shared/settings.js) - new settings key and default

**Acceptance Checks**
- [x] Open one accordion section.
- [x] Open a second accordion section without closing the first.
- [x] Both sections remain open and functional.
- [x] Close one section without affecting the other.
- [x] Expanded state persists across page reloads.

---

### Task 2: Persist Scroll Position on Main Page

**Status:** ✅ IMPLEMENTED (pending manual UX verification)

**Description**
When user returns to the main page (home), scroll position should be restored to where they left off.

**Current Behavior**
- Page scrolls to top on navigation back to home.

**Desired Behavior**
- Scroll position is saved when user leaves main page.
- Scroll position is restored when user returns to main page.

**Fix Applied**
- Added persisted setting key `MAIN_PAGE_SCROLL_TOP`.
- Save scroll position when route changes away from home.
- Restore saved scroll position after home view finishes rendering.
- Added helpers in main page module to sanitize and persist scroll values.

**Code References**
- [src/features/main/main-page.js](src/features/main/main-page.js) - `onRouteChange()`, `renderHome()`
- [src/shared/settings.js](src/shared/settings.js) - `MAIN_PAGE_SCROLL_TOP` key/default

**Acceptance Checks**
- [ ] User scrolls down on main page.
- [ ] User navigates to a list, template, or settings.
- [ ] User navigates back to home.
- [ ] Scroll position is restored to previous position.

---

### Task 3: Sticky Accordion Headers (Stacking)

**Status:** ↩️ ROLLED BACK

**Description**
Accordion headers should remain visible as the user scrolls, stacking visually so the user always knows which section they are currently viewing.

**Current Behavior**
- Accordion headers scroll out of view.

**Desired Behavior**
- Each accordion header becomes sticky when its section is scrolled to the top of the viewport.
- Headers stack below each other as user scrolls through sections.
- User always sees a visual indicator of the current section context.

**Rollback Note**
- Sticky stacked header implementation was tested and then reverted.
- Accordion headers now use non-sticky behavior again.
- Task remains open for a future, revised approach.

**CSS/Layout References**
- [src/features/main/main-page.js](src/features/main/main-page.js) - accordion render behavior
- [src/styles.css](src/styles.css) - accordion header styling

**Acceptance Checks**
- [ ] Scroll down through expanded accordion sections.
- [ ] First accordion header becomes sticky at top of viewport.
- [ ] Scroll to second section; second header stacks below first and becomes sticky.
- [ ] Visual stacking clearly shows section hierarchy during scroll.

---

### Task 4: Crossed-Off Items Action Buttons

**Status:** ✅ COMPLETED

**Description**
In the "Crossed Off Items" section within a Grocery List detail view, replace the section menu with two persistent action buttons.

**Current Behavior (Before)**
- "Crossed Off Items" section header had a three-dot menu with actions hidden.

**Desired Behavior**
- Remove the three-dot menu from "Crossed Off Items" header.
- Add two buttons directly below the "Crossed Off Items" section:
  1. "Delete all crossed-off" (left side, 50% width)
  2. "Uncross-off all items" (right side, 50% width)
- Buttons are always visible when the section is expanded.
- Buttons take up 100% of container width, split 50/50.

**Fix Applied**
- Refactored `appendCrossedOffSection()` to remove menu-related code.
- Created `.crossed-off-actions` flex container placed after items list.
- Created `.crossed-off-action-button` class with 50% flex width and gap.
- Added CSS hover states for both buttons, with red highlight for delete button.
- Buttons only show when there are crossed-off items (conditional in function).

**Code References**
- [src/features/lists/lists-page.js](src/features/lists/lists-page.js) - `appendCrossedOffSection()` refactored
- [src/styles.css](src/styles.css) - `.crossed-off-actions`, `.crossed-off-action-button` classes added

**Acceptance Checks**
- [x] Open a Grocery List detail view.
- [x] Cross off some items.
- [x] Find the "Crossed Off Items" section.
- [x] Verify no three-dot menu is present on the section header.
- [x] Two action buttons are visible (50% width each).
- [x] "Delete all crossed-off" button is functional.
- [x] "Uncross-off all items" button is functional.
- [x] Buttons are always visible when section is expanded.
- [x] Buttons visible only when there are crossed-off items.

---

### Task 5: Bug Fix — Item Click Double-Click Issue in Pantry & Fridge

**Status:** ✅ COMPLETED

**Description**
When clicking an item in a Pantry & Fridge (template) list more than once in quick succession, the second click does nothing. User has to click a third time to add a second quantity increment.

**Current Behavior**
- Click item once: quantity becomes 1.
- Click item second time: nothing happens (expected: quantity becomes 2).
- Click item third time: quantity becomes 2.

**Root Cause**
- Rapid duplicate clicks were firing before the async operation completed and DOM re-rendered, causing a state sync issue.

**Fix Applied**
- Added debounce flag at module scope: `isProcessingTemplateItemClick`.
- Added guard in `addTemplateItemToTargetList()` to prevent execution if another operation is in progress.
- Wrapped implementation in try/finally to ensure flag always resets.

**Code References**
- [src/features/templates/templates-page.js](src/features/templates/templates-page.js) - `addTemplateItemToTargetList()` now includes debounce protection.

**Acceptance Checks**
- [x] Click an item once: quantity increments to 1.
- [x] Click the same item immediately: quantity increments to 2.
- [x] Click subsequent times: each click increments quantity by 1.
- [x] No console errors on repeated clicks.

---

## Session Log

- **2026-04-25:** Added Task 6 for replacing recipe version menu actions with a dedicated Versions accordion in recipe detail.
- **2026-04-19:** Added five tasks: multiple open accordions, scroll persistence, sticky headers, crossed-off items buttons, template item click bug.
