# Recipe Step Editor v2 Requirements

## Purpose
Define requirements for updating recipe step entry and editing so each step can include optional ingredient links and one optional timer, while keeping existing step behavior compatible.

## Confirmed Current State
- Add Step and Edit Step currently collect text only.
- Instruction persistence currently stores step number and text.
- Version snapshots currently store instruction id, step number, and text.
- Recipe import/export currently serializes instruction id, step number, and text.

## Confirmed Goals
- Add a dedicated Step Editor modal for Add Step and Edit Step flows.
- Keep step text as required.
- Allow optional multi-select ingredient links for each step.
- Allow one optional timer per step.
- Store timer duration internally in seconds.
- Allow users to enter timer values with second precision.
- Preserve backward compatibility for existing recipes and old import payloads.
- Prepare data/UI foundations for a future Prepare Recipe Mode without implementing that mode in this update.

## Functional Requirements
1. Add Step opens a Step Editor modal instead of a single text prompt.
2. Edit Step opens the same Step Editor modal prefilled with current values.
3. Step Editor includes these fields:
   - Step text (required).
   - Ingredients used (optional multi-select).
   - Timer enabled/disabled control (optional).
   - Timer duration input supporting hours, minutes, and seconds.
   - Timer label input (optional).
4. Ingredient selection source is limited to ingredients currently on the recipe.
5. Ingredient selection stores links by `itemId` only.
6. Ingredient selection does not allow ad-hoc free-text ingredient tags.
7. Exactly one timer is allowed per step.
8. Timer duration must be greater than zero when timer is enabled.
9. Save action is blocked when step text is empty.
10. Save action is blocked when timer is enabled but duration is invalid.
11. If no ingredients are selected and timer is disabled, step behavior remains equivalent to text-only steps.
12. Latest-version and non-latest-version step flows both support create, edit, remove, and move operations without losing timer or ingredient-link fields.

## Data Requirements
1. Instruction records support these fields:
   - `text` (required string).
   - `ingredientRefs` (optional array of `itemId` strings; default `[]`).
   - `timer` (optional object or `null`).
2. Timer object supports these fields:
   - `durationSeconds` (required positive integer when timer exists).
   - `label` (optional string).
3. Instruction ordering remains controlled by `stepNumber`.
4. Version snapshot instructions persist and round-trip the same new fields (`ingredientRefs`, `timer`).
5. Existing instructions with no new fields must resolve to defaults (`ingredientRefs = []`, `timer = null`).
6. Ingredient refs should be de-duplicated before persistence.

## Import/Export Requirements
1. Export includes new instruction fields (`ingredientRefs`, `timer`) when present.
2. Import accepts both:
   - Older instruction shape (id, stepNumber, text only).
   - New instruction shape with optional `ingredientRefs` and `timer`.
3. Import normalizes missing new fields to defaults.
4. Import validates timer duration when timer data is provided.
5. Import ignores ingredient refs that are empty values.

## UI Requirements
1. Step list display in recipe detail should indicate step timer when present.
2. Step list display in recipe detail should indicate linked ingredients when present.
3. Timer and ingredient indicators must not block current step action menus.
4. Step Editor modal should follow existing modal accessibility patterns:
   - Keyboard reachable controls.
   - Escape closes without saving.
   - Clear validation feedback when save is blocked.
5. Ingredient multi-select should visually indicate ingredients already linked to other steps in the same recipe/version context.
6. Already-used ingredients remain selectable and are not blocked from selection.
7. Used-state indication must not rely on color alone; it must include supporting text and/or icon treatment.
8. Ingredient picker should show a simple used-state indicator when overlap exists, without requiring a full list of every overlapping step.
9. Ingredient picker should keep current step selections distinct from overlap detection; only other steps count as overlap.

## Ingredient Overlap Behavior
1. Ingredient overlap is advisory, not blocking.
2. Overlap detection scope is limited to other steps within the same effective recipe context:
   - Latest recipe view compares against other latest recipe steps.
   - Historical version view compares against other steps in that version snapshot.
3. When an ingredient is already linked to another step, the ingredient option should render in a muted/used state while remaining selectable.
4. Used-state messaging should communicate that the ingredient is already used in another step without requiring a full overlap list.
5. If the user saves a step with one or more overlapping ingredients, the app should show a warning before final save.
6. The overlap warning should be simple summary messaging and should not require a full listing of affected ingredients or every existing step reference.
7. Default warning copy for v1 should be: `Some selected ingredients are already used in other steps.`
8. The overlap warning should provide these actions:
   - `Continue and Save`
   - `Review Selection`
9. Overlap warning is evaluated only after blocking validation passes.
10. Blocking validation continues to take precedence over overlap warnings:
   - Required step text.
   - Valid timer duration when timer is enabled.
11. v1 warning behavior should trigger on any overlap at save time rather than only newly introduced overlap.

## Backward Compatibility Requirements
1. Existing recipes and versions load without migration failures.
2. Existing text-only steps remain editable and saveable.
3. Existing move/remove behavior remains unchanged for text-only and enriched steps.
4. Existing clone/new version behavior preserves new step fields when they exist.

## Non-Functional Requirements
1. Step Editor interactions should be immediate and not require page navigation.
2. Validation behavior should be deterministic and consistent across latest and version views.
3. New fields should not introduce regressions in step ordering logic.

## Out of Scope (This Update)
- Prepare Recipe Mode runtime UI and walkthrough flow.
- Timer runtime controls (start, pause, restart, background execution, notifications).
- Multiple timers per step.
- Ingredient selection from non-recipe sources (pantry/global catalog).
- Auto-highlighting linked ingredients in a future preparation flow.

## Acceptance Checks
- [ ] Add Step opens the Step Editor modal.
- [ ] Edit Step opens the Step Editor modal with existing values.
- [ ] Step text is required and validated.
- [ ] Ingredient multi-select lists recipe ingredients only.
- [ ] Selected ingredients are stored by `itemId` only.
- [ ] Ingredients already used in other steps render with a visible used-state indicator.
- [ ] Used-state indicators do not rely on color alone.
- [ ] Already-used ingredients remain selectable.
- [ ] Saving with overlap shows a non-blocking warning.
- [ ] Overlap warning uses simple summary messaging rather than a full overlap list.
- [ ] Overlap warning provides `Continue and Save` and `Review Selection` actions.
- [ ] Timer is optional and limited to one per step.
- [ ] Timer supports second precision input and stores `durationSeconds`.
- [ ] Steps with no timer/ingredients behave as text-only steps.
- [ ] Latest-version and version-snapshot step edits preserve new fields.
- [ ] Step move/remove flows keep data integrity.
- [ ] Export includes new fields.
- [ ] Import supports both old and new instruction shapes.
- [ ] Existing recipes with legacy instructions continue to work.

## Open Questions
- Should timer label be displayed directly in the step list or only in the Step Editor detail?
- Should step timer badges include formatted duration only, or formatted duration plus label when label exists?