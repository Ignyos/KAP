# Requirements

This document records only confirmed requirements needed for the application to function.

## Document Status

- Status: Draft
- Scope: Functional baseline only
- Last updated: 2026-04-02

## Objective

Define the minimum confirmed requirements for a browser-based application hosted as a static GitHub Pages site with browser-based persistence.

## Purpose Definition

The application is a place to:

- Store and create shopping lists.
- Store and create shopping list templates.
- Create food recipes with versioning.

The primary user is anyone who wants to manage shopping lists and/or create and refine recipes.

## In Scope

- Requirements necessary for the application to run as a static site
- Requirements necessary for the application to persist data in the browser

## Out of Scope

- Unconfirmed product features
- Unconfirmed user workflows
- Unconfirmed implementation details beyond confirmed hosting and persistence constraints

## Functional Requirements

### Platform and Persistence

- The application must be deployable as a static site on GitHub Pages.
- The application must run in the browser.
- The application must use IndexedDB in the browser for persistence.

### Shopping Lists

- As a user, I can add a new list by providing a list name with no items.
- As a user, I can edit an existing list name.
- As a user, I can add and remove items in an existing list.
- As a user, I can set an optional integer quantity when adding or editing a list item.
- As a user, I can delete an existing list.

### Shopping List Templates

- As a user, I can add a new list template by providing a template name with no items.
- As a user, I can edit an existing list template name.
- As a user, I can add and remove items in an existing list template.
- As a user, I can update item quantities in an existing list template using optional integer values.
- As a user, I can delete an existing list template.

### Shared Data Model

- The data model for shopping lists and shopping list templates must use a shared item catalog with join tables.
- The Item record set must function as a shared catalog that is reused across List, Template, and Recipe records.
- Item definition updates must propagate to lists and templates that reference the updated item.
- Quantity must be stored on the relationship record (ListRecord-Item), not on Item.
- Quantity for list/template items is optional; when provided it must be an integer.
- The shared entity type discriminator must include List, Template, and Recipe.
- Description must be supported on ListRecord, Item, and ListRecord-Item.
- UnitOfMeasure is deferred for the current list/template milestone and is not required for item records in this phase.

### Item Discovery and Reuse

- As a user, I get item suggestions from the shared Item catalog while typing a new item name.
- As a user, I can select an existing suggested item to link it to the current List, Template, or Recipe context.
- As a user, I can create a new Item when no suitable suggestion exists.
- New Items must be persisted to the shared Item catalog for future suggestions and reuse.

### Recipe Versioning

- Recipe versioning must be diff-style, where each version inherits from prior versions unless explicitly changed.
- The initial recipe version must store its base state as Added change records.
- Ingredient changes must be tracked per version with Added, Modified, and Removed change types.
- Instruction changes must be tracked per version with Added, Modified, and Removed change types.
- Instruction identity must be stable across versions so an instruction can be modified over time.
- Instruction order must be version-specific.
- The model must support creator version notes that explain why a version changed.
- The model must support end-user recipe notes that resolve as-of the selected version.

## Feature Definitions

### Shopping Lists

#### Feature

- Name: List Manager
- Necessary function: Users must be able to create, modify, and delete lists.

#### Minimum User Actions

- As a user, I can add a new list by naming a new list with no items.
- As a user, I can edit an existing list by editing the list name and adding or removing list items.
- As a user, while adding a list item, I can search and select an existing Item from suggestions or create a new Item.
- As a user, I can delete an existing list.

#### Data Model (Confirmed)

- ListRecord: Id<guid>, Name<string>, Description<string>, Type<enum: List|Template|Recipe>, CreatedDate<dateTime>, UpdatedDate<dateTime>
- Item: Id<guid>, Name<string>, Description<string>
- ListRecord-Item: ListRecordId<guid>, ItemId<guid>, Quantity<int nullable>, Description<string>

### Shopping List Templates

#### Feature

- Name: List Template Manager
- Necessary function: Users must be able to create, modify, and delete list templates.

#### Minimum User Actions

- As a user, I can add a new list template by naming a new list template with no items.
- As a user, I can edit an existing list template by editing the template name, adding or removing items, and updating item quantities.
- As a user, while adding a template item, I can search and select an existing Item from suggestions or create a new Item.
- As a user, I can delete an existing list template.

#### Data Model (Confirmed)

Option B: Shared item catalog with join table

- ListRecord: Id<guid>, Name<string>, Description<string>, Type<enum: List|Template|Recipe>, CreatedDate<dateTime>, UpdatedDate<dateTime>
- Item: Id<guid>, Name<string>, Description<string>
- ListRecord-Item: ListRecordId<guid>, ItemId<guid>, Quantity<int nullable>, Description<string>

#### Data Mapping (Confirmed)

- Use one shared entity for both list and template records, distinguished by a type field.
- Entity: ListRecord Id<guid>, Name<string>, Description<string>, Type<enum: List|Template|Recipe>, CreatedDate<dateTime>, UpdatedDate<dateTime>
- Relationship: ListRecord-Item ListRecordId<guid>, ItemId<guid>, Quantity<int nullable>, Description<string>

### Food Recipes

#### Feature

- Name: Recipe Version Manager
- Necessary function: Users must be able to create recipes, update recipes through diff-style versions, and view a selected version state.

#### Minimum User Actions

- As a user, I can create a recipe record.
- As a user, I can add, modify, and remove ingredients through versioned diffs.
- As a user, while adding a recipe ingredient, I can search and select an existing Item from suggestions or create a new Item.
- As a user, I can add, modify, and remove instruction steps through versioned diffs.
- As a user, I can add creator version notes for why a version changed.
- As a user, I can add end-user notes and view notes as-of the selected version.
- As a user, I can view a selected version with inherited state applied.

#### Data Model (Confirmed)

- RecipeVersion: Id<guid>, RecipeId<guid>, VersionNumber<int>, ParentVersionId<guid nullable>, CreatedDate<dateTime>
- RecipeVersion-ItemDiff: VersionId<guid>, ItemId<guid>, ChangeType<enum: Added|Modified|Removed>, Quantity<string>, Description<string>
- Instruction: Id<guid>, RecipeId<guid>, CreatedDate<dateTime>
- RecipeVersion-InstructionDiff: VersionId<guid>, InstructionId<guid>, ChangeType<enum: Added|Modified|Removed>, StepNumber<int>, Text<string>
- RecipeVersionNote: Id<guid>, VersionId<guid>, Text<string>
- RecipeVersionEndUserNoteDiff: VersionId<guid>, ChangeType<enum: Added|Modified|Removed>, Text<string>

## Non-Functional Requirements

- The deployed application must be compatible with GitHub Pages static hosting.
- Persistent application data must rely on browser IndexedDB support.

## Constraints

- Hosting target: GitHub Pages
- Persistence mechanism: IndexedDB in the browser

## Assumptions

None recorded.

## Open Questions

None recorded.

## Decisions

- The application will be hosted on GitHub Pages.
- The application will use IndexedDB in the browser for persistence.
- The shopping list and template model will use Option B (shared item catalog with join tables).
- The Item record set is a shared catalog that supports type-ahead discovery, reuse, and growth over time.
- Item definition updates will propagate across lists and templates that reference the same item.
- Quantity values are relationship-specific and will be stored on ListRecord-Item records.
- Quantity values for list/template items are optional integers on ListRecord-Item records.
- UnitOfMeasure is deferred for list/template item management and will be revisited during recipe-phase requirements.
- Lists and templates will use one shared entity model with a type discriminator.
- Recipe is a supported ListRecord type.
- Recipe versioning uses a diff-style inheritance model.
- Version 1 is represented using Added change records.
- Instruction identity is stable across versions and instruction content is version-diff driven.
- End-user notes are version-aware and resolve as-of the selected version.
- Creator version notes are stored per version.

## Change Log

- 2026-03-31: Initial document created with structure only.
- 2026-03-31: Added confirmed functional baseline for static GitHub Pages hosting and IndexedDB persistence.
- 2026-03-31: Added confirmed purpose details for shopping lists, shopping list templates, and versioned food recipes.
- 2026-03-31: Added confirmed primary user definition.
- 2026-03-31: Added confirmed Shopping Lists feature definition, actions, and data model.
- 2026-03-31: Added confirmed Shopping List Templates feature requirements and unconfirmed data model suggestions.
- 2026-03-31: Confirmed Shopping List Templates data model Option B and propagation behavior for shared item definitions.
- 2026-03-31: Confirmed quantity-on-relationship behavior and added a pending unified List/Template entity decision.
- 2026-04-01: Confirmed unified entity model for lists and templates using a type discriminator.
- 2026-04-01: Normalized list/template data model terms to unified ListRecord and ListRecord-Item entities.
- 2026-04-01: Added confirmed recipe versioning requirements, shared model description fields, and version-aware instruction and notes behavior.
- 2026-04-02: Performed a light deduplication pass on overlapping functional requirement statements.
- 2026-04-02: Restructured functional requirements into categories and converted user-facing statements to As a user phrasing.
- 2026-04-02: Standardized Feature Definitions minimum user actions to As a user phrasing.
- 2026-04-02: Added confirmed Item catalog discovery, select-existing, and create-new item reuse requirements.
- 2026-04-08: Confirmed list/template item quantities are optional integers and deferred UnitOfMeasure to recipe-phase requirements.