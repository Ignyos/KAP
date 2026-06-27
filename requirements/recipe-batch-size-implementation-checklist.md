# Recipe Batch Size Controls - Implementation Checklist

## Scope
Implement recipe-derived grocery list behavior where batch size is list metadata, while preserving current standing-list behavior.

## Phased Execution Order

### Phase 1 - Data and Identity Foundation
Goal: Introduce list metadata and identity rules without changing user workflows yet.
- [x] Define recipe-derived list metadata fields (recipe id/version id and batch size).
- [x] Ensure lookup can find one non-deleted recipe-derived list by recipe/version.
- [x] Keep standing-list schema/records backward compatible.
- [x] Confirm import/export support for new metadata fields.

Exit criteria:
- [x] Existing data loads without migration regressions.
- [x] Metadata can be saved/read for recipe-derived lists.

### Phase 2 - Recipe Flow Behavior
Goal: Enforce single-list-per-recipe/version behavior and batch-aware creation/reuse logic.
- [x] Update recipe add-to-list path to only target recipe-derived lists.
- [x] Reuse existing non-deleted recipe-derived list for same recipe/version.
- [x] Create a new recipe-derived list only when none exists.
- [x] Remove generic existing-list selection from recipe flow.
- [x] Prevent second non-deleted recipe-derived list for same recipe/version.

Exit criteria:
- [x] Repeated add-to-list from same recipe/version always resolves to one list.
- [x] Deleting that list allows a new one to be created next time.

### Phase 3 - Batch Size UX and Additive Item Updates
Goal: Let users set batch size in recipe add flow and apply additive per-item updates while keeping recipe source data unchanged.
- [x] Add initial batch size selection during recipe-derived list creation.
- [x] On repeat add-to-list, allow selecting an additional batch amount.
- [x] Remove batch size edit control inside recipe-derived list view.
- [x] Apply additive updates only to selected items; selected existing items increment and selected new items are added.
- [x] Leave unselected existing recipe-derived items unchanged.
- [x] Keep manual/ad hoc list items unaffected unless explicitly recipe-derived.
- [x] Make copy explicit that recipe source quantities are unchanged.

Exit criteria:
- [x] Repeat add applies additive per-item updates without changing unselected items.
- [x] Recipe records/version snapshots remain unchanged.

### Phase 4 - Validation and Ship Readiness
Goal: Validate behavior end-to-end and prepare branch for merge.
- [x] Run full validation checklist for create/reuse/delete/additional-batch flows.
- [x] Verify standing-list behavior remains unchanged.
- [x] Verify mixed list rendering remains clear and error free.
- [x] Resolve diagnostics in touched files.
- [x] Update release notes for user-visible behavior changes (via CI/CD process).

Exit criteria:
- [x] Definition of Done section is fully checked.

## Product Rules (Confirmed)
- [x] Two list modes remain: recipe-derived lists and standing lists.
- [x] Both modes appear in the same grocery lists view.
- [x] Recipe-to-list flow does not target standing lists.
- [x] A recipe/version can have at most one non-deleted recipe-derived list.
- [x] "Active" means list exists and is not deleted.
- [x] Batch size is metadata on recipe-derived lists, not part of identity.
- [x] Initial batch size is chosen only when creating a recipe-derived list.
- [x] Additional batch is chosen in recipe add-to-list flow; list detail does not expose batch editing.
- [x] Adding additional batch does not create a new list.
- [x] Recipe records and version snapshots are never modified by list batch operations.

## Data Model Checklist
- [x] Add recipe-derived list metadata fields needed to identify recipe/version association.
- [x] Add a batch size field to recipe-derived list metadata.
- [x] Ensure identity lookup uses recipe/version and excludes deleted lists.
- [x] Keep standing-list records backward compatible.
- [x] Confirm import/export behavior includes new metadata safely.

## Behavior Checklist
- [x] From recipe flow: find existing non-deleted recipe-derived list for same recipe/version.
- [x] If found: reuse that list.
- [x] If not found: create new recipe-derived list and set initial batch size.
- [x] Prevent creation of a second non-deleted recipe-derived list for same recipe/version.
- [x] Support additional-batch updates through the recipe add-to-list flow.
- [x] Pre-check only items already on the existing recipe-derived list while still showing all ingredients.
- [x] Keep ad hoc/manual list items unaffected by recipe-derived additive updates unless explicitly flagged as recipe-derived.

## UI Checklist
- [x] Recipe add-to-list flow includes initial batch size selection.
- [x] Recipe add-to-list flow no longer offers generic existing-list selection.
- [x] Existing recipe-derived list view does not expose batch size editing control.
- [x] Batch size control copy is clear that recipe source is unchanged.
- [x] Standing-list UI behavior remains unchanged.

## Validation Checklist
- [x] Create recipe-derived list from recipe/version with selected batch size.
- [x] Repeat add-to-list from same recipe/version reuses same non-deleted list.
- [x] Delete recipe-derived list, then add from same recipe/version creates a new list.
- [x] Re-add from recipe with additional batch and verify selected existing items increment while unselected items remain unchanged.
- [x] Verify recipe source quantities remain unchanged after list creation and batch edits.
- [x] Verify standing-list add/edit flows still work as before.
- [x] Verify mixed view (standing + recipe-derived lists) renders correctly.
- [x] Verify no runtime errors in startup, navigation, create/edit/delete flows.

## Definition of Done
- [x] All Product Rules (Confirmed) are satisfied.
- [x] Core behavior and UI checklist items are implemented and manually validated.
- [x] Existing standing-list behavior is unchanged for non-recipe workflows.
- [x] No data-loss regressions observed in recipe/list operations.
- [x] No unresolved errors in touched files.
- [x] Release notes updated for user-facing changes (via CI/CD process).

## Explicitly Out of Scope (This Branch)
- Prompting users to delete recipe-derived lists when all items are removed.
- Adding a separate active/closed lifecycle state for grocery lists.
- Supporting multiple simultaneous non-deleted recipe-derived lists for the same recipe/version.
