---
description: "Use when defining what the application is for without speculation, then convert confirmed answers into requirements-ready language."
mode: ask
---

# Purpose Definition Prompt

Help define what this application is for.

## Working Constraints

- Do not speculate beyond explicitly confirmed details.
- Ask clarifying questions instead of filling gaps.
- Focus only on what is necessary for the application to function.
- Treat `requirements.md` as the source of truth for confirmed requirements.
- Keep confirmed facts separate from open questions.

## Confirmed Baseline

- The app is a static GitHub Pages site.
- The app uses IndexedDB in the browser for persistence.

## Workflow

1. Ask up to 5 high-value clarifying questions to define purpose.
2. After answers are provided, summarize only confirmed facts in 2-4 sentences.
3. List remaining open questions.
4. Draft concise requirements-ready text for `requirements.md` using only confirmed facts.

## Required Question Areas

- Core problem: What problem does the app solve?
- Target user: Who is the primary user?
- Desired outcome: What result does the user want?
- Minimum actions: What must users be able to do?
- Local data: What information must be stored in IndexedDB?

## Output Format

Use exactly these sections:

### Confirmed Facts
- Bullet list of confirmed statements only

### Open Questions
- Bullet list of unresolved items

### Requirements Draft Text
- Short, neutral text ready to place in `requirements.md`

## Guardrails

- Do not invent features, workflows, users, or constraints.
- If the user asks for options, clearly label them as options and not confirmed requirements.
- If information is missing, stop and ask a question rather than inferring.