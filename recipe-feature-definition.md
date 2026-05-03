# Recipe Feature Definition (Working Draft)

## Document Status

- **Purpose:** Design and refine recipe feature requirements through UX-first conversation.
- **Scope:** High-level user experience, behavior, and supporting data model.
- **Status:** In-progress; items here are candidate requirements until promoted to requirements.md.
- **Last updated:** 2026-04-19

## Overview

A Recipe is a versioned cooking artifact with:
- Long-term identity (recipes persist across edits).
- Changes tracked by version (each edit creates a new version).
- Mutable content (ingredients, instructions, notes can change per version).
- Stable instruction identity (an instruction can be edited over time while remaining traceable).
- Independent versions (each version is a complete copy that can be edited or deleted independently).
- User-named versions (each version has a user-editable name, defaulting to creation date/time).

---

## Requirement Cards

### Card 1: Version Visibility and Navigation

**Experience**
- I can clearly tell which recipe version I am viewing.
- I can intentionally create a new version without accidentally overwriting the current one.

**Behavior Support**

Version header:
- Recipe name displayed prominently.
- Current version name shown near name (e.g., "2026-05-03 14:30" or user-specified name).
- Three-dot menu (always available) with actions:
  1. Version Note
  2. New Version
  3. Clone Recipe

Version Name Editing:
- Version name is displayed and editable in the Versions accordion.
- Default name format: YYYY-MM-DD HH:MM (creation date/time).
- Users can edit the name directly with a text input and save button.
- Version name is required (cannot be empty).

New Version modal:
- Opens when "New Version" is selected.
- Shows recipe name at top.
- Includes version name input (pre-filled with current date/time).
- Shows which version is being used as base.
- Includes optional version note input.
- Saving creates new version based on currently selected effective state.

Clone Recipe:
- Copies only the currently effective state (not full version history).
- Creates a new Recipe with a new Version 1.
- Default version note: "Clone of <recipe name> on <local date time>."

**Model Support**

- Recipe identity record (stable across all versions).
- Version records with:
  - `versionName` (string): User-editable name, defaults to YYYY-MM-DD HH:MM format
  - `versionNote` (string, optional): Creator notes about version changes
  - `snapshotItems` and `snapshotInstructions`: Complete independent data
  - `createdDate` and `updatedDate`: Timestamps for sorting and history
- New Version always creates a complete independent copy of the selected version's effective state.
- Clone creates a new Recipe identity with Version 1 containing effective state.
- Each version can be edited or deleted independently (except the latest version cannot be deleted, and at least one version must exist).
- Versions are sorted by creation date (oldest first in the version selector).

**Acceptance Checks**

- [ ] Version name (not number) is displayed in recipe header.
- [ ] Version name can be edited in the Versions accordion with a text input and save button.
- [ ] Version name defaults to YYYY-MM-DD HH:MM format for new versions.
- [ ] Version name is required (cannot save empty name).
- [ ] Three-dot menu is accessible from header.
- [ ] Selecting "New Version" opens modal with version name and optional note inputs.
- [ ] New Version modal pre-fills name with current date/time.
- [ ] Saving new version does not overwrite current version.
- [ ] Clone Recipe creates a new recipe with its own identity.
- [ ] Clone default note includes recipe name and current local date/time.
- [ ] Version names are unique per version (each version has its own editable name).

---

## Confirmed Inputs

References from requirements.md:
- Recipe versioning must be diff-style with inheritance.
- Instruction identity must be stable across versions.
- The model must support creator version notes.
- Recipe is a supported ListRecord type.

---

## Open Questions

(To be filled as conversation progresses.)

---

## Session Log

- **2026-04-19:** Added Card 1 (Version Visibility and Navigation) with three sub-behaviors: version header display, New Version modal, Clone Recipe.
