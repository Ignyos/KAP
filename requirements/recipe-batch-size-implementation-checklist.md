# Recipe Batch Size Controls - Implementation Checklist

## Scope
Implement recipe-derived grocery list behavior where batch size is list metadata, while preserving current standing-list behavior.

## Phased Execution Order

### Phase 1 - Data and Identity Foundation
Goal: Introduce list metadata and identity rules without changing user workflows yet.
- [ ] Define recipe-derived list metadata fields (recipe id/version id and batch size).
- [ ] Ensure lookup can find one non-deleted recipe-derived list by recipe/version.
- [ ] Keep standing-list schema/records backward compatible.
- [ ] Confirm import/export support for new metadata fields.

Exit criteria:
- [ ] Existing data loads without migration regressions.
- [ ] Metadata can be saved/read for recipe-derived lists.

### Phase 2 - Recipe Flow Behavior
Goal: Enforce single-list-per-recipe/version behavior and batch-aware creation/reuse logic.
- [ ] Update recipe add-to-list path to only target recipe-derived lists.
- [ ] Reuse existing non-deleted recipe-derived list for same recipe/version.
- [ ] Create a new recipe-derived list only when none exists.
- [ ] Remove generic existing-list selection from recipe flow.
- [ ] Prevent second non-deleted recipe-derived list for same recipe/version.

Exit criteria:
- [ ] Repeated add-to-list from same recipe/version always resolves to one list.
- [ ] Deleting that list allows a new one to be created next time.

### Phase 3 - Batch Size UX and Recompute
Goal: Let users set and edit batch size while keeping recipe source data unchanged.
- [ ] Add initial batch size selection during recipe-derived list creation.
- [ ] Add batch size edit control inside recipe-derived list view.
- [ ] Recompute recipe-derived quantities in list context when batch changes.
- [ ] Keep manual/ad hoc list items unaffected unless explicitly recipe-derived.
- [ ] Make copy explicit that recipe source quantities are unchanged.

Exit criteria:
- [ ] Batch-size edits update list quantities only.
- [ ] Recipe records/version snapshots remain unchanged.

### Phase 4 - Validation and Ship Readiness
Goal: Validate behavior end-to-end and prepare branch for merge.
- [ ] Run full validation checklist for create/reuse/delete/change-batch flows.
- [ ] Verify standing-list behavior remains unchanged.
- [ ] Verify mixed list rendering remains clear and error free.
- [ ] Resolve diagnostics in touched files.
- [ ] Update release notes for user-visible behavior changes.

Exit criteria:
- [ ] Definition of Done section is fully checked.

## Product Rules (Confirmed)
- [ ] Two list modes remain: recipe-derived lists and standing lists.
- [ ] Both modes appear in the same grocery lists view.
- [ ] Recipe-to-list flow does not target standing lists.
- [ ] A recipe/version can have at most one non-deleted recipe-derived list.
- [ ] "Active" means list exists and is not deleted.
- [ ] Batch size is metadata on recipe-derived lists, not part of identity.
- [ ] Initial batch size is chosen only when creating a recipe-derived list.
- [ ] Batch size can be changed only from within the existing recipe-derived list.
- [ ] Changing batch size does not create a new list.
- [ ] Recipe records and version snapshots are never modified by list batch operations.

## Data Model Checklist
- [ ] Add recipe-derived list metadata fields needed to identify recipe/version association.
- [ ] Add a batch size field to recipe-derived list metadata.
- [ ] Ensure identity lookup uses recipe/version and excludes deleted lists.
- [ ] Keep standing-list records backward compatible.
- [ ] Confirm import/export behavior includes new metadata safely.

## Behavior Checklist
- [ ] From recipe flow: find existing non-deleted recipe-derived list for same recipe/version.
- [ ] If found: reuse that list.
- [ ] If not found: create new recipe-derived list and set initial batch size.
- [ ] Prevent creation of a second non-deleted recipe-derived list for same recipe/version.
- [ ] Support batch size updates inside the recipe-derived list view.
- [ ] Recompute recipe-derived list quantities for current list context when batch size changes.
- [ ] Keep ad hoc/manual list items unaffected by batch-size recomputation unless explicitly flagged as recipe-derived.

## UI Checklist
- [ ] Recipe add-to-list flow includes initial batch size selection.
- [ ] Recipe add-to-list flow no longer offers generic existing-list selection.
- [ ] Existing recipe-derived list view exposes batch size editing control.
- [ ] Batch size control copy is clear that recipe source is unchanged.
- [ ] Standing-list UI behavior remains unchanged.

## Validation Checklist
- [ ] Create recipe-derived list from recipe/version with selected batch size.
- [ ] Repeat add-to-list from same recipe/version reuses same non-deleted list.
- [ ] Delete recipe-derived list, then add from same recipe/version creates a new list.
- [ ] Change batch size in existing recipe-derived list and verify quantities update in list context.
- [ ] Verify recipe source quantities remain unchanged after list creation and batch edits.
- [ ] Verify standing-list add/edit flows still work as before.
- [ ] Verify mixed view (standing + recipe-derived lists) renders correctly.
- [ ] Verify no runtime errors in startup, navigation, create/edit/delete flows.

## Definition of Done
- [ ] All Product Rules (Confirmed) are satisfied.
- [ ] Core behavior and UI checklist items are implemented and manually validated.
- [ ] Existing standing-list behavior is unchanged for non-recipe workflows.
- [ ] No data-loss regressions observed in recipe/list operations.
- [ ] No unresolved errors in touched files.
- [ ] Release notes updated for user-facing changes.

## Explicitly Out of Scope (This Branch)
- Prompting users to delete recipe-derived lists when all items are removed.
- Adding a separate active/closed lifecycle state for grocery lists.
- Supporting multiple simultaneous non-deleted recipe-derived lists for the same recipe/version.
