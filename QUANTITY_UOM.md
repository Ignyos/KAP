# Quantity + Unit of Measure (UOM) Plan

## Purpose
Define a robust and user-friendly quantity system for recipe ingredients that supports measurement units, clearer ingredient display, and future conversion logic when adding recipe ingredients to grocery lists.

## Goals
1. Support ingredient quantities with units of measure.
2. Improve quantity entry/edit UX in ingredient add/edit flows.
3. Improve ingredient quantity visibility in recipe detail without visual noise.
4. Introduce a maintainable UnitOfMeasure data model with seeded groups.
5. Allow end users to add and edit units.
6. Store quantity canonically as decimal values.
7. Use UOM classification metadata to drive quantity input and display behavior.
8. Prepare Add To Grocery List for quantity conversion logic.

## In Scope (Initial Slice)
1. Recipes only for quantity + UOM behavior.
2. Decimal quantity persistence for all ingredients.
3. UnitOfMeasure persistence with seeded grouped units.
4. UOM classification metadata to direct quantity UX (examples: whole-or-half, decimal, user-defined).
5. Reusable UOM UI component that can be embedded in multiple places.
6. Recipe ingredient display update with subtle quantity/UOM badge and strict text alignment.
7. Conversion-prep contract for Add To Grocery List (no full conversion engine yet).
8. Remove ingredient-row `More/Less` action from the three-dot menu for MVP simplification.

## Out of Scope (Initial Slice)
1. Full cross-unit conversion engine (e.g. tsp to cups, g to oz across all unit families).
2. Grocery list persistence model changes for UOM.
3. Automatic normalization across incompatible units.

---

## UX Requirements

### 1) Entry and Editing (Add/Edit Ingredient Modal)
1. Quantity values are stored as decimals for all units.
2. Unit selection is shown adjacent to the quantity field.
3. Quantity input behavior is driven by selected UOM classification.
4. Validation feedback is immediate and clear for invalid quantity text.
5. Edit Ingredient flow must allow updating quantity and UOM together.

Classification-driven behavior examples:
- Gallon: defaults to whole-or-half step behavior (`1`, `1.5`, `2`) to reflect common usage.
- Ounce: defaults to decimal behavior (free decimal entry).
- Pound: defaults to decimal behavior (free decimal entry).
- Packet/Bag/Box: behavior is user-defined on the UOM definition.

> **Open question**: The current edit ingredient modal hides the quantity field (`showQuantityField: false`). Does the edit flow need to show quantity + UOM too, or add-flow only for the initial slice?

### 2) Ingredient List Display (Recipe Detail)
1. Show quantity + UOM in a subtle badge.
2. Ingredient names must remain vertically aligned regardless of quantity/UOM presence.
3. Rows with missing quantity/UOM must preserve spacing to avoid layout jitter.
4. Read-only and edit mode keep the same alignment behavior.
5. Ingredient row action menu excludes `More/Less` in MVP scope.

### 3) User-Managed UOM
1. Provide one reusable UOM component embeddable in:
   - Ingredient add/edit modal
   - Future settings surface
2. Users can add new units.
3. Users can edit user-defined units.
4. Seeded units remain stable for data integrity (not editable/deletable by user).

---

## Data Model

### New Store: UnitOfMeasure
Fields:
| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| key | string | Stable seed key (e.g. `imperial.tsp`), null for user-created |
| name | string | Display name (e.g. Teaspoon) |
| abbreviation | string | Short form (e.g. tsp) |
| group | string | Imperial, Metric, Unit, Size, Other |
| quantityBehavior | string | One of `whole_or_half`, `decimal`, `user_defined` |
| quantityStep | number \| null | Suggested step for controls (e.g. 0.5 for gallon, 0.25 for custom) |
| isSeeded | boolean | True for system seeds |
| isActive | boolean | Soft-delete support |
| sortOrder | number | Within-group display order |
| createdDate | string | ISO date |
| updatedDate | string | ISO date |

Indexes:
- `by_name` on `name`
- `by_group` on `group`
- `by_active` on `isActive`

### Recipe Ingredient Record Extensions
Extend existing ingredient join records with:
| Field | Type | Notes |
|---|---|---|
| quantityValue | number \| null | Canonical decimal value (e.g. 0.5) |
| unitOfMeasureId | string \| null | FK to UnitOfMeasure |

### Version Snapshot Extensions
Recipe version snapshot items should include:
- `quantityValue`
- `unitOfMeasureId`

**Backward compatibility**: Existing records without these fields must render safely. Missing values map to empty quantity/UOM state.

---

## Quantity Parsing and Validation

Accept decimal input and reject invalid forms with specific messages.

| User Input | quantityValue |
|---|---|
| `0.5` | 0.5 |
| `1.25` | 1.25 |
| `2` | 2 |
| `abc` | error |

**Canonical strategy**:
- Store `quantityValue` (decimal numeric) for persistence and any future computation.
- UOM classification determines input affordance and formatting behavior in UI.
- Keep parsing deterministic and side-effect free.

### UOM Classification Rules
1. `whole_or_half`: quantity controls and validation allow increments matching `quantityStep` (default 0.5).
2. `decimal`: free-form decimal entry allowed.
3. `user_defined`: behavior and step are configured by the user when creating/editing that unit.

---

## Seeded UOM Groups

| Group | Examples |
|---|---|
| Imperial | tsp, tbsp, fl oz, cup, pint, quart, gallon, oz, lb |
| Metric | ml, l, mg, g, kg |
| Unit | each, piece, clove, bunch, can, jar, packet, bag, box |
| Size | small, medium, large |
| Other | (user-added customs land here by default) |

Seed behavior examples:
- `gallon` seeds as `quantityBehavior=whole_or_half` and `quantityStep=0.5`.
- `oz` and `lb` seed as `quantityBehavior=decimal`.
- `packet`, `bag`, and `box` can seed as `quantityBehavior=user_defined` with editable step.

---

## Reusable UOM Component Requirements
1. Grouped browse/search by group name.
2. Fast selection for common units (e.g. recent or most used).
3. Add new unit flow (name + abbreviation + group + quantity behavior + optional step).
4. Edit user-defined unit flow, including quantity behavior and optional step.
5. Clear visual distinction between seeded and custom units.
6. Embeddable API contract — the component accepts `onSelect(uom)` and `currentUomId` props.

---

## Add To Grocery List — Conversion Prep
1. Pass `quantityValue` and `unitOfMeasureId` in the add-to-list payload.
2. Design the payload structure to support same-unit aggregation in a future pass.
3. Define fallback behavior when conversion is unavailable (pass quantity as-is, no conversion attempt).
4. Defer cross-unit conversion prompts to a follow-up scope.

---

## Migration Plan
1. Bump IndexedDB schema version (currently 5 → 6).
2. Create `unitOfMeasures` object store with indexes in `stores.js`.
3. Seed grouped units idempotently in the `upgrade` handler in `stores.js`.
4. Preserve existing recipe data — no destructive migration of ingredient records.
5. Ensure old recipes render without runtime errors (missing fields treated as null/empty).

---

## Technical Touchpoints

| File | Change |
|---|---|
| `src/data/stores.js` | Add `UNIT_OF_MEASURES` store name + indexes; add seed data; bump upgrade logic |
| `src/data/db.js` | Bump `DATABASE_VERSION` to 6 |
| `src/shared/item-entry-rules.js` | Add decimal-first quantity parser/validator and behavior-aware step validation |
| `src/features/recipes/recipes-service.js` | Persist/read `quantityValue` and `unitOfMeasureId` on add/edit/snapshot |
| `src/features/recipes/recipes-page.js` | Wire UOM selector into add/edit modal; pass new fields to service; prep add-to-list payload; remove ingredient-row `More/Less` action |
| `src/ui/ui.js` | Add reusable UOM selector component; extend `ShowDiscoveryItemModal` with UOM field option |
| `src/styles.css` | Subtle quantity+UOM badge styles; ensure ingredient name alignment is preserved |

---

## Acceptance Checks
1. User can add a recipe ingredient with a decimal quantity and a selected UOM.
2. Gallon-based quantities enforce or strongly guide whole-or-half increments.
3. User can edit quantity and UOM from the ingredient edit flow.
4. Ounce and pound quantities allow decimal entry.
5. Packet/bag/box units support user-defined quantity behavior.
6. Ingredient rows show a subtle quantity/UOM badge with consistent name alignment across all rows.
7. Ingredient row three-dot menus no longer include `More/Less` for MVP.
8. Custom units can be added and are immediately available for selection.
9. Seeded units are available by group after first DB migration.
10. Existing recipes without UOM continue to render correctly (no errors, no blank screens).
11. Version snapshots retain `quantityValue` and `unitOfMeasureId` for newly created versions.
12. Add To Grocery List receives quantity/UOM metadata in the payload.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Inconsistent quantity entry across UOMs | UOM-level `quantityBehavior` plus optional `quantityStep` validation |
| Seed mutability breaking UOM references | Stable seed keys; seeded units not editable/deletable |
| UI clutter from quantity+UOM badge | Subtle badge (muted color, small font); strict alignment so rows without UOM don't shift |
| Migration breaking existing data | All new fields optional; backward-compat render path required |

---

## Open Questions
1. Should the edit ingredient flow expose quantity + UOM, or add-flow only for the initial slice?
2. Should the UOM selector in the modal be a simple flat dropdown or grouped (with group headers)?
3. How should "no unit" be represented — empty selection, a sentinel "None" option, or omit the field?
4. For `whole_or_half` units, should users be blocked from off-step values or allowed with a warning?
5. For `user_defined` units, should default behavior be decimal with optional step override, or step-only entry?

---

## Follow-Up Items (Out of Scope Now)
1. Full conversion rules matrix by unit family (e.g. tsp → tbsp → cup).
2. Grocery list UOM persistence and display integration.
3. Advanced conversion conflict UX (e.g. combining oz + grams).
4. Reintroducing equivalent `More/Less` quantity shortcut UX if still desired after MVP.
