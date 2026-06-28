# Recipe Import/Export - Implementation Checklist

## Scope
Enable users to export a single recipe/version in three formats (PDF, user-readable text, .kap file) and import recipes from .kap files with validation and upsert behavior.

## Phased Execution Order

### Phase 1 - Export Functionality
Goal: Add export options for recipe/version with three output formats.
- [x] Add Export action to recipe detail view actions; open an Export Recipe modal.
- [x] Implement PDF export (<recipe name>_<version>.pdf) with readable layout.
- [x] Implement text export (user-readable format) copied to clipboard.
- [x] Implement .kap export (JSON with .kap extension) as file download.
- [x] Ensure all recipe metadata and ingredients included in exports.
- [ ] Test export integrity for recipes with various ingredient types and quantities.

Exit criteria:
- [ ] All three export formats available and downloadable/copyable.
- [ ] Export content is complete and human-readable.
- [ ] PDF renders clearly with recipe name, version, and ingredients.

### Phase 2 - Import Functionality
Goal: Add import capability for .kap files with validation and upsert behavior.
- [x] Add import button/action to recipes view.
- [x] Implement .kap file picker and JSON parser.
- [x] Resolve import scope to recipe/version from file payload before full validation.
- [x] Validate .kap file structure (required fields: recipe id/version id, instructions, ingredients, etc.).
- [x] Implement recipe/version upsert logic: if recipe/version id exists, update; else create.
- [x] Implement instruction upsert by instruction id (incoming overwrites existing when ids match).
- [x] Implement ingredient upsert by ingredient id (incoming overwrites existing when ids match).
- [x] If target recipe/version does not exist, run background ingredient id/name compare before apply.
- [x] Prompt user only when ingredient id exists and ingredient name differs.
- [x] If no ingredient id/name conflicts are found, import proceeds without extra prompts.
- [x] Handle version conflicts (duplicate versions, newer versions, older versions).
- [x] Preserve existing recipe-derived lists when importing updated recipe.
- [x] Present import options after background validation and before destructive apply.
- [x] Display validation results to user (success/errors/conflicts).
- [x] Reject invalid .kap files with clear error messages.

Exit criteria:
- [ ] Valid .kap files import and upsert recipes successfully.
- [ ] Invalid .kap files rejected with helpful validation messages.
- [ ] Duplicate imports handled gracefully (no data loss).
- [ ] Existing recipe-derived grocery lists unaffected by recipe import.

### Phase 3 - Edge Cases and Data Integrity
Goal: Validate edge cases and ensure no data loss or corruption.
- [ ] Test import of recipe that already exists (same version).
- [ ] Test import of recipe with newer version number.
- [ ] Test import of recipe with older version number.
- [ ] Test import when recipe has no ingredients.
- [ ] Verify recipe source quantities in recipe-derived lists remain correct after import.
- [ ] Test export/import round-trip integrity (export a recipe, import it, verify data matches).
- [ ] Verify import does not overwrite other recipes or lists.
- [ ] Verify PDF/text exports are readable and include all necessary information.

Exit criteria:
- [ ] Export/import round-trip preserves all recipe data.
- [ ] No unintended side effects on existing recipes or lists.
- [ ] Version conflict handling is predictable and documented.

### Phase 4 - Validation and Ship Readiness
Goal: Validate behavior end-to-end and prepare branch for merge.
- [ ] Run full validation checklist for export and import workflows.
- [ ] Verify existing recipe edit/delete/view flows remain unchanged.
- [ ] Verify no errors in touched files (compile/lint).
- [ ] Test with various recipe data sizes and ingredient counts.
- [ ] Update release notes for user-visible changes (via CI/CD process).

Exit criteria:
- [ ] All export/import workflows tested end-to-end.
- [ ] Definition of Done section is fully checked.

## Product Rules (To Be Confirmed)
- [ ] Export action is available on recipe detail view and opens a modal with three format options.
- [ ] Import button available on recipes view or settings.
- [ ] .kap file format is JSON with .kap extension for user identification.
- [ ] Only .kap files accepted for import (not PDF or text files).
- [ ] Import resolves target recipe/version from payload before full validation and apply.
- [ ] Import upserts recipe/version: updates if id exists, creates if new.
- [ ] Import upserts instructions by id and overwrites existing rows on id match.
- [ ] Import upserts ingredients by id and overwrites existing rows on id match.
- [ ] For brand-new recipe/version imports, perform ingredient id/name compare and prompt only on id match with different name.
- [ ] For brand-new recipe/version imports with no ingredient id/name conflicts, add ingredients and create recipe/version without extra prompts.
- [ ] Version handling: imported version overwrites only that specific version.
- [ ] Recipes with recipe-derived grocery lists can be imported without losing the lists.
- [ ] Recipe source snapshots in existing recipe-derived lists are not modified by import.
- [ ] Export includes recipe name, version name, all ingredients with quantities.

## Data Model Checklist
- [x] Confirm .kap file structure and required fields for export.
- [ ] Confirm .kap file parsing expectations for import.
- [ ] Define validation rules for .kap files (required fields, data types, etc.).
- [x] Ensure recipe metadata (id, name, versions, ingredients) are exported completely.

## Behavior Checklist
- [ ] From recipe detail view: user can export to PDF, text, or .kap file.
- [x] From recipes view: user can import a .kap file.
- [x] On import: parse payload and resolve target recipe/version scope before full validation.
- [x] On import: validate .kap file structure.
- [x] On valid import: upsert recipe/version (update if exists, create if new).
- [x] On valid import: upsert instructions by id (overwrite on id match).
- [x] On valid import: upsert ingredients by id (overwrite on id match).
- [x] On brand-new recipe/version import: run ingredient id/name compare in background.
- [x] Show user prompt only when an ingredient id matches an existing record but names differ.
- [x] Conflict prompt options are: Use Incoming Name, Keep Existing Name, Cancel Import.
- [x] Conflict prompt includes Apply to all remaining conflicts option.
- [x] Conflict prompt default focus is Keep Existing Name (safe default).
- [x] Enter activates the currently focused conflict action.
- [x] Esc maps to Cancel Import.
- [x] If no ingredient id/name conflicts: add ingredients and build recipe/version automatically.
- [x] On invalid import: display error message with reason.
- [x] After import: recipe appears in recipe list immediately.
- [x] Text export copied to clipboard with success notification.
- [x] PDF export downloads with filename <recipe name>_<version>.pdf.
- [x] .kap export downloads with filename <recipe name>_<version>.kap.
- [x] Export success feedback is non-blocking, auto-dismisses after ~3 seconds, and has manual close (X).

## UI Checklist
- [ ] Recipe detail view includes export action with three format options.
- [x] Recipes view includes import action/button.
- [ ] Import success/error feedback is clear and actionable.
- [x] Text export confirmation (copied to clipboard) is visible to user.
- [x] File picker for import defaults to .kap files.
- [x] Export button copy clearly indicates three export options.
- [x] Export completion feedback does not block recipe editing flow.
- [x] Ingredient conflict prompt follows Windows-style keyboard behavior (default focus, Enter, Esc).
- [x] Apply to all option is visible, keyboard reachable, and announced clearly in prompt copy.

## Validation Checklist
- [ ] Export recipe to PDF and verify readability.
- [ ] Export recipe to text clipboard and verify format.
- [x] Export recipe to .kap and verify JSON structure.
- [ ] Import valid .kap file and verify recipe is added/updated.
- [ ] Import .kap for existing recipe and verify it updates correctly.
- [ ] Import .kap for existing recipe/version and verify instructions are upserted by id.
- [ ] Import .kap for existing recipe/version and verify ingredients are upserted by id.
- [ ] Import .kap with brand-new recipe/version and no ingredient id/name conflicts; verify no additional prompt is shown.
- [ ] Import .kap with brand-new recipe/version and ingredient id/name conflict; verify user prompt is shown.
- [ ] For conflict prompt: choose Use Incoming Name and verify imported ingredient name overwrites existing name.
- [ ] For conflict prompt: choose Keep Existing Name and verify existing ingredient name is preserved.
- [ ] For conflict prompt: choose Cancel Import and verify no writes are applied.
- [ ] For multiple conflicts: choose Apply to all and verify same decision is applied to remaining conflicts.
- [ ] With default focus unchanged, press Enter and verify Keep Existing Name is applied.
- [ ] Press Esc in conflict prompt and verify Cancel Import path with no writes.
- [ ] Use keyboard-only navigation (Tab/Shift+Tab + Enter) to resolve conflicts successfully.
- [ ] Import invalid .kap file and verify error message is displayed.
- [ ] Export/import round-trip for recipe with various ingredient types.
- [ ] Verify recipe-derived lists remain intact after recipe import.
- [ ] Verify no errors in startup, recipe views, export/import flows.

## Definition of Done
- [ ] All Product Rules (Confirmed) are satisfied.
- [ ] Export and import functionality implemented and manually validated.
- [ ] Existing recipe workflows remain unchanged.
- [ ] No data-loss or corruption observed in export/import operations.
- [ ] No unresolved errors in touched files.
- [ ] Release notes updated for user-facing changes (via CI/CD process).

## Explicitly Out of Scope (This Branch)
- Bulk recipe export/import.
- Recipe sharing via cloud or external services.
- Recipe versioning history UI (import always targets current active version).
- Migrating standing lists to recipe-derived lists via import.

## Import Workflow Options (Discussion)
Proposed flow:
1. User selects a .kap file.
2. System parses file and resolves recipe/version scope.
3. If recipe/version is new, system runs background ingredient id/name compare.
4. System runs background validation and builds a preflight summary.
5. System shows Import Review modal with options and impact summary.
6. If ingredient id/name conflicts exist, user resolves or confirms conflict handling.
7. User confirms destructive apply.
8. System executes upsert and shows result summary.

Potential options to present in Import Review modal (to confirm):
- [ ] Apply import (destructive overwrite by id for recipe/version, instructions, ingredients).
- [x] No dry-run option in UI; Import Review presents user-friendly apply/cancel decisions.
- [ ] Cancel import.
- [ ] Keep existing when id matches (non-destructive mode) instead of overwrite.
- [ ] Backup current recipe/version to .kap before apply.

Ingredient id/name conflict resolution prompt (Windows-style):
- [ ] Use Incoming Name.
- [ ] Keep Existing Name.
- [ ] Cancel Import.
- [ ] Apply to all remaining conflicts.

Keyboard contract for conflict prompt (Windows-like):
- [x] Initial focus lands on Keep Existing Name.
- [x] Enter triggers the focused action.
- [x] Esc triggers Cancel Import.
- [x] Tab/Shift+Tab traverses all actionable controls, including Apply to all.

Prompt copy contract (to implement as written unless updated):
- [x] Prompt title: Ingredient Name Conflict.
- [x] Prompt body line 1: Imported ingredient uses the same Id as an existing ingredient, but the names are different.
- [x] Prompt body line 2 template: Id: {ingredientId}
- [x] Prompt body line 3 template: Existing: {existingName}
- [x] Prompt body line 4 template: Incoming: {incomingName}
- [x] Primary action label: Use Incoming Name.
- [x] Secondary action label: Keep Existing Name.
- [x] Cancel action label: Cancel Import.
- [x] Apply-to-all label: Apply this decision to all remaining conflicts.

Preflight summary fields (to confirm):
- [x] Target recipe id and name.
- [x] Target version id and version name.
- [x] Instruction counts: new, overwrite, unchanged.
- [x] Ingredient counts: new, overwrite, unchanged.
- [x] Ingredient id/name conflict count (same id, different name).
- [x] Blocking validation errors and non-blocking warnings.
