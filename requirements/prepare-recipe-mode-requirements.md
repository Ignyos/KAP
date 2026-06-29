# Prepare Recipe Mode Requirements

## Purpose
Define requirements for a future Prepare Recipe Mode that reduces back-and-forth between ingredients and instructions by presenting a step-focused cooking workflow.

## Confirmed Current State
- Recipe detail currently shows ingredients and instructions as separate sections.
- Normal recipe viewing can require users to look back and forth between the ingredient list and the current instruction step.
- Recipe Step Editor v2 establishes step-level ingredient links and optional single-step timers as supporting data for this future mode.
- Prepare Recipe Mode does not exist yet in the current product experience.

## Confirmed Goals
- Prepare Recipe Mode should minimize clicks during active recipe preparation.
- Prepare Recipe Mode should make it easier for the user to clearly see what they are dealing with at each step.
- Recipe detail should replace the current Batch Size section with a single action row containing:
  - `Prepare Recipe Mode`
  - `Add To Grocery List`
- `Add To Grocery List` should remain available in the existing recipe action menu (the row addition is for discoverability, not replacement).
- Users should be able to step through the recipe process in a guided way.
- Each step should surface only the ingredients relevant to that step as part of the workflow.
- The user should not need to keep bouncing back and forth between the full ingredient list and the instruction list while cooking.
- If a step has a timer, the user should be able to start that timer from the step.
- Starting a timer must not prevent the user from moving on to the next step.
- Pause/restart timer controls are expected in the future, but this document should not assume they are part of the first Prepare Recipe Mode release unless explicitly confirmed later.

## Functional Requirements (Confirmed)
1. Prepare Recipe Mode provides a dedicated step-by-step recipe flow separate from normal recipe detail viewing.
2. Recipe detail should expose a two-action row in place of Batch Size with:
  - `Prepare Recipe Mode`
  - `Add To Grocery List`
3. Existing recipe action menu should continue to include `Add To Grocery List`.
4. The active step is the primary unit of focus in the UI.
5. The active step displays the instruction text for that step.
6. The active step displays the ingredients linked to that step.
7. The user can move through the recipe step by step with fewer interactions than normal detail view navigation.
8. If the active step has a timer, the step should expose a start action for that timer.
9. Timer start behavior should not block navigation to later steps.

## Workflow Requirements
1. The mode should reduce the need to cross-reference the full ingredient list while preparing the recipe.
2. The mode should emphasize the current step and current-step ingredients over the full recipe context.
3. Step progression should feel like a guided walkthrough rather than a generic detail page.
4. Users should be able to understand what to do next without excessive scrolling or section switching.
5. The mode should use a dedicated view with grouped accordions.
6. The full Ingredients section should be available in mode as its own accordion and default to collapsed.
7. Steps should render as one accordion per step, with step 1 expanded by default and remaining steps collapsed by default.
8. Each step should offer a simple progression affordance for moving to the next step.
9. If a step has a timer, the collapsed representation of that step should still communicate timer presence.

## Data Dependencies
1. Prepare Recipe Mode depends on step-level instruction text.
2. Prepare Recipe Mode depends on step-level ingredient references so ingredients can be scoped to a specific step.
3. Prepare Recipe Mode depends on optional step-level timer metadata for steps that require timing.
4. Steps without ingredient links must still render in Prepare Recipe Mode.
5. Steps without timers must still render in Prepare Recipe Mode.

## UI Requirements (Confirmed)
1. The UI should show the current step clearly.
2. The UI should show only the ingredients for the current step in the primary step workflow.
3. The UI should support low-friction step navigation.
4. Timer actions, when present, should be available from the active step surface.
5. Mode UI is a dedicated screen/view rather than a minor inline panel in the existing recipe detail body.
6. Mode UI should include:
  - A full-recipe Ingredients accordion (default collapsed).
  - A Steps accordion group with one accordion per step.
7. Default accordion state should be first step expanded and remaining steps collapsed.
8. Collapsed step headers should still indicate timer presence when a timer exists for that step.
9. Recipe detail should provide a single row containing both `Prepare Recipe Mode` and `Add To Grocery List` to improve discoverability.
10. The existing `Add To Grocery List` menu action should remain available.

## Non-Functional Requirements
1. Prepare Recipe Mode should optimize for active cooking use, where the user benefits from reduced cognitive load and fewer taps/clicks.
2. The flow should be easy to scan quickly while working through a recipe.
3. The mode should work as a focused workflow layer and should not require mutation of stored recipe content during use.

## Open Questions
- What navigation controls are required in v1:
  - Next/Previous only?
  - Step list overview?
  - Jump-to-step?
- Should the mode open on step 1 every time, or remember the user’s last position for that recipe/version?
- Should the mode show any persistent context outside the active step, such as recipe name, batch size, or progress count?
- What should be shown when a step has no linked ingredients:
  - No ingredients section?
  - A placeholder such as `No step-specific ingredients`?
  - A fallback to broader recipe ingredients?
- Should the user have optional access to the full ingredient list while in Prepare Recipe Mode, or should v1 remain strictly step-focused?
- What timer lifecycle behavior is required after Start in v1:
  - Should countdown continue while the user opens other step accordions?
  - Should countdown continue if the timed step becomes collapsed?
  - Should active timers be visible in a global area, per-step header only, or both?
- What timer completion behavior is required:
  - Visual alert only?
  - Sound?
  - Notification?
- Should multiple running timers be possible across different steps if the user starts one and moves on?
- How should timer sound settings be controlled:
  - Global app setting only?
  - Global setting plus per-recipe override?
  - Override precedence rules?
- How should scaling interact with Prepare Recipe Mode:
  - Use currently selected batch size?
  - Show scaled step ingredients automatically?
- Should versioned recipes behave exactly the same in Prepare Recipe Mode as latest recipes?

## Out of Scope (For This Requirements Draft)
- Final timer runtime specification beyond confirmed start-and-continue behavior.
- Pause/restart timer control details.
- Notification policy for completed timers.
- Detailed visual design or layout styling.
- Voice guidance, hands-free controls, or device-specific cooking modes.

## Suggested Next Discussion Areas
1. Entry point and navigation model.
2. What persistent context should remain visible during the walkthrough.
3. Timer lifecycle expectations after Start is pressed.
4. Behavior for steps with incomplete or missing ingredient links.
5. Relationship between Prepare Recipe Mode and batch scaling.