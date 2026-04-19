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

---

## Requirement Cards

### Card 1: Version Visibility and Navigation

**Experience**
- I can clearly tell which recipe version I am viewing.
- I can intentionally create a new version without accidentally overwriting the current one.

**Behavior Support**

Version header:
- Recipe name displayed prominently.
- Current version shown near name: "Version (n)".
- Three-dot menu (always available) with actions:
  1. Version Note
  2. New Version
  3. Clone Recipe

New Version modal:
- Opens when "New Version" is selected.
- Shows recipe name at top.
- Shows next version number (current + 1).
- Includes description input with placeholder:
  - "Too much salt in version 1. Also adding basil this time."
- Saving creates new version based on currently selected effective state.
- Version note is optional.

Clone Recipe:
- Copies only the currently effective state (not full version history).
- Creates a new Recipe with a new Version 1.
- Default version note: "Clone of <recipe name> on <local date time>."

**Model Support**

- Recipe identity record (stable across all versions).
- Version records linked by parent version ID (null for Version 1).
- New Version always inherits from selected version's effective state.
- Clone creates a new Recipe identity with Version 1 containing effective state.
- Version note field is optional (allows empty string).

**Acceptance Checks**

- [ ] Version number is displayed in recipe header.
- [ ] Three-dot menu is accessible from header.
- [ ] Selecting "New Version" opens modal with correct recipe name and next version number.
- [ ] Description input has correct placeholder text.
- [ ] Saving new version does not overwrite current version.
- [ ] Clone Recipe creates a new recipe with its own identity.
- [ ] Clone default note includes recipe name and current local date/time.
- [ ] Version note is optional (user can save without entering text).

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
