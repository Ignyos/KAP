# Recipe Scaling Requirements

## Purpose
Capture the next-step requirements for recipe scaling behavior in Kitchen & Pantry.

## Confirmed Current State
- Recipe ingredients now retain both:
  - A user-readable quantity text value (example: `1/2`).
  - A numeric quantity value for computation.
- Ingredient quantity text should remain user-readable in the UI and should not be replaced with decimal formatting when the user entered a fraction.
- The stored base recipe should remain unchanged when users view scaled quantities.

## Confirmed Goals
- Users can scale a recipe up or down from its base quantities.
- Scaled quantities are computed from stored numeric values.
- Base recipe ingredient values remain unchanged.
- UI output remains readable for cooking workflows (example expectation: `1/2 cup` can scale to `1 cup`).

## Functional Requirements (Next Step)
1. Add a scaling control on recipe detail view.
2. Scaling applies to ingredient quantities only for the current rendered view.
3. Scaling factor multiplies numeric ingredient quantity values.
4. Scaled values are formatted for display separately from stored base values.
5. Original ingredient quantity text is preserved as entered for base view.
6. Unit labels continue to display with each quantity.
7. Optional ingredient state remains unchanged by scaling.

## Data Requirements
1. Persist base quantity text exactly as user entered.
2. Persist base numeric quantity for calculations.
3. Do not overwrite base quantity text during scaling operations.
4. Do not overwrite base numeric quantity during scaling operations.

## Non-Functional Requirements
1. Scaling interaction should be immediate in the UI (no page navigation required).
2. Scaling should be deterministic for a given factor and ingredient set.
3. Existing recipes without quantity text should still scale using numeric values.

## Open Questions
- What scaling inputs are required in v1: fixed multipliers (`0.5x`, `1x`, `2x`) or custom numeric factor?
- What display format rules should be used for scaled quantities:
  - Prefer fractions where possible?
  - Always decimal for some units?
  - Unit-specific formatting behavior?
- What rounding policy is required for scaled values?
- Should scaling state persist per recipe between visits?
- Should instruction text also support scaling hints (not quantity replacement), or remain unchanged?
- Is recipe yield required in this step or a later step?

## Out of Scope (This Step)
- Import/export behavior.
- Nutrition recalculation.
- Automatic unit conversion (example: cups to tablespoons).
- Mutation of stored base recipe values.

## Suggested Implementation Sequence
1. Define scaling state model in recipe detail view.
2. Implement pure scaling computation from numeric values.
3. Implement display formatter for scaled quantity output.
4. Add UI controls for factor selection.
5. Verify unchanged persistence of base values.
6. Add regression checks for fraction display expectations.
