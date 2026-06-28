# Recipe Detail Information Layout - Implementation Checklist

## Scope
Rework the recipe detail view so Versions, Description, and Tags use a new consolidated layout, and add an Information section to the recipe detail experience. The attached reference image is layout guidance only; final styling should use the existing app color scheme.

## Confirmed Inputs
- [x] Versions, Description, and Tags display changes are in scope.
- [x] Add an Information section to the recipe detail view.
- [x] Use the attached `Recipe_Details_Tabbed-Accordion.png` as the layout reference.
- [x] Keep the existing application color scheme rather than copying the mockup colors.
- [x] The layout reference shows these top-level selectors: Information, Description, Versions, and Tags.
- [x] The layout reference shows these Information fields: Prep Time, Cook Time, Additional Time, Total Time, Servings, and Yield.
- [x] Existing content and interactivity for Versions, Description, and Tags should remain the same while moving into the new layout.
- [x] Information values are edited individually with inline inputs and save on blur.
- [x] Versions section controls currently shown in the header row (version select and add version) should move into the expanded Versions body.

## Current Implementation Anchor
- [x] Recipe detail UI is currently controlled in `src/features/recipes/recipes-page.js`.
- [x] Versions, Description, and Tags currently use separate accordion visibility/state keys.
- [x] No existing recipe Information fields were found in `src/**/*.js` for Prep Time, Cook Time, Additional Time, Total Time, Servings, or Yield.

## Phased Execution Order

### Phase 1 - UX Contract
Goal: Define the exact interaction model for the new recipe detail header/body layout before changing persistence or rendering logic.
- [x] Confirm whether the selector row behaves as tabs, accordions, or a hybrid tabbed-accordion control.
- [x] Confirm whether only one section body is open at a time.
- [x] Confirm whether the left-most affordance in the mockup is a collapse/expand control for the whole block.
- [x] Confirm desktop and mobile behavior for the selector row when space is constrained.
- [x] Confirm whether the default open section should be Information, Description, Versions, or the last viewed section.

Confirmed UX decisions:
- The selector row behaves as a hybrid tabbed-accordion control.
- Only one section body is open at a time.
- The expanded area shows the content for the currently selected section.
- Default open section is Information.
- The left-most affordance is a collapse/expand control for the whole block.
- Section-state memory scope is global.

Constrained-width selector row options:
- Option A: Allow the selector row to wrap to a second line on narrow widths while keeping the selected body below.
- Option B: Keep one line and make the selector row horizontally scrollable.
- Option C: Keep one visible selected tab and collapse the remaining sections into an overflow trigger such as `More`.
- Chosen behavior: Option A (wrap to multiple lines on constrained widths).

Exit criteria:
- [x] One interaction model is chosen and documented.
- [x] Default/open-state behavior is defined for both desktop and mobile.

### Phase 2 - Information Data Contract
Goal: Define what Information means in the data model and whether each field is recipe-level or version-level.
- [x] Confirm storage scope for Information: recipe-level, version-level, or mixed by field.
- [x] Confirm whether all six reference fields are required: Prep Time, Cook Time, Additional Time, Total Time, Servings, Yield.
- [x] Confirm whether Total Time is user-entered, derived from the other time fields, or both.
- [x] Confirm allowed value formats for time fields.
- [x] Confirm allowed value formats for Servings and Yield.
- [ ] Confirm whether empty Information fields are hidden or shown as blank placeholders.

Exit criteria:
- [ ] Each Information field has an owner, format, and empty-state rule.
- [ ] Persistence requirements are explicit enough for service/storage work.

Confirmed data decisions:
- Information is recipe-level.
- Total Time is derived from Prep Time, Cook Time, and Additional Time.

Time input UX suggestions (hours/minutes):
- Option 1: Two compact numeric inputs per duration field (`h` and `m`) with minute normalization on blur (for example, `90m` becomes `1h 30m`).
- Option 2: Single freeform duration input per field (examples: `1h 30m`, `90m`, `2h`) parsed on blur into canonical display.
- Option 3: Minute-stepper control with quick chips (`+15m`, `+30m`, `+1h`) for touch-friendly updates.
- Chosen implementation: Option 1 (`h` + `m` split inputs with minute normalization on blur).

### Phase 3 - UI Rendering and Editing
Goal: Replace the current detail layout with the new selector/body structure and add Information rendering/editing.
- [x] Replace the current separate Versions/Description/Tags presentation with one consolidated selector row and content body.
- [x] Add an Information panel that matches the reference layout using the existing app visual language.
- [x] Keep current recipe name, ingredient list, instructions, and batch-size behavior intact unless separately approved.
- [x] Define where edit actions for Information live in the recipe flow.
- [x] Define Information editing interaction model.
- [x] Implement inline per-field Information inputs that save on blur.
- [x] Preserve existing Description interactivity inside the new layout.
- [x] Preserve existing Versions editing inside the new layout without losing current version-management capabilities.
- [x] Move Versions controls (version select and add version) from header row into the expanded Versions body.
- [x] Preserve existing Tags editing inside the new layout without losing current tag-management capabilities.
- [x] Define empty-state copy for Description, Tags, Versions, and Information.

Exit criteria:
- [x] All four sections render through one consistent layout pattern.
- [x] Existing edit capabilities remain available or have an approved replacement.

### Phase 4 - Persistence and Migration
Goal: Add any new stored fields safely and keep existing recipes working.
- [x] Add Information fields to recipe records and update read/write paths.
- [x] Keep existing recipes backward compatible when Information data is missing.
- [x] Confirm import/export impact for recipe-level Information fields.
- [x] Confirm clone/new-version behavior for Information fields based on the chosen ownership model.

Exit criteria:
- [x] Existing recipe data loads without migration regressions.
- [x] Information persists correctly across refresh, navigation, and version operations.

### Phase 5 - Validation and Ship Readiness
Goal: Verify the new detail layout works end-to-end and does not regress current recipe behavior.
- [ ] Validate section switching/open-state behavior in the recipe detail view.
- [ ] Validate mobile layout and wrapping behavior for the selector row.
- [ ] Validate create/edit/save flows for Information fields.
- [ ] Validate version switching with section state and Information display.
- [ ] Validate tags and description still render and edit correctly.
- [x] Resolve diagnostics in touched files.
- [ ] Update release notes for user-visible behavior changes (via CI/CD process).

Exit criteria:
- [ ] Definition of Done section is fully checked.

## Product Rules (Confirmed)
- [x] The attached image is a layout reference, not a color reference.
- [x] Existing application colors should be preserved.
- [x] The recipe detail experience must include Information, Description, Versions, and Tags as first-class sections.
- [x] The selector row uses a hybrid tabbed-accordion model.
- [x] Only one section body is open at a time.
- [x] The default open section is Information.
- [x] Existing content and interactivity for Versions, Description, and Tags should remain the same after the layout move.
- [x] On constrained widths, selector row wraps to multiple lines.
- [x] Information data is recipe-level.
- [x] Total Time is derived.
- [x] Information fields are individually editable with save-on-blur behavior.
- [x] Duration fields use split `h` + `m` inputs with minute normalization on blur.
- [x] Versions controls currently in the header row move into the expanded Versions body.
- [x] The left-most affordance is a collapse/expand control for the whole block.
- [x] Section-state memory scope is global.

## Product Rules (Open)
- [ ] Empty-state display policy for unset Information fields is finalized.

## Implementation Surface Checklist
- [x] `src/features/recipes/recipes-page.js`: replace current section state/rendering with the new layout contract.
- [ ] `src/ui/ui.js`: add reusable UI helpers only if the new selector/body pattern should be shared.
- [x] `src/styles.css`: add layout/styling for the selector row and Information grid using the current theme.
- [x] Recipe data/service modules: add recipe-level Information persistence fields and update read/write paths.
- [x] Import/export flow: include recipe-level Information fields where recipe metadata is exported/imported.

## Validation Checklist
- [ ] Opening a recipe shows the new selector row and content body without runtime errors.
- [ ] Information fields render correctly when populated.
- [ ] Information fields have a defined and acceptable empty state.
- [ ] Each Information field can be edited inline and saves on blur.
- [ ] Blur-save does not interfere with keyboard navigation across Information fields.
- [ ] Description remains readable and editable.
- [ ] Versions remain selectable/editable and do not lose current behavior.
- [ ] Versions section shows version select and add-version controls inside expanded body instead of header row.
- [ ] Tags remain visible/editable and do not lose current behavior.
- [ ] Existing recipes with no Information data still load cleanly.
- [ ] No startup or navigation regressions are introduced in recipe flows.

## Definition of Done
- [ ] The interaction model is confirmed and documented.
- [ ] Information ownership and field formats are confirmed.
- [ ] Recipe detail layout is updated to the approved structure.
- [ ] Existing recipe behaviors outside this layout remain unchanged unless explicitly approved.
- [ ] No unresolved errors remain in touched files.
- [ ] Release notes are updated for user-facing changes (via CI/CD process).

## Explicitly Out of Scope (For This Scoping Doc)
- Broader visual redesign outside the recipe detail layout.
- Changing the global application color scheme.
- Ingredient list or instruction workflow changes unrelated to the new detail sections.
- Any unconfirmed Information fields beyond the six shown in the reference image.

## Open Questions
- Should unset Information fields display as blank inputs, `Not set`, or be hidden in read-only/export contexts?