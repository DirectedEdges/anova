---
description: Draft an Architecture Decision Record (ADR) for a proposed change to the anova types or schema package.
handoffs:
  - label: Implement the ADR
    agent: AnovaADR.implement
    prompt: Implement the necessary changes for this ADR
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Interactive setup** — ask the user two questions using VS Code's interactive question UI before doing anything else:

   **Question 1 — Branch name**
   - Header: `Branch`
   - Question: "Which branch should this ADR be filed under?"
   - Options (single-select):
     1. `Use the current branch` — read the active git branch name via `git rev-parse --abbrev-ref HEAD` and use it as `BRANCH_NAME`
     2. `Next minor version` — read the current version from `package.json`, increment the minor component, and format as `v[MAJOR].[MINOR+1].0`
     3. `New ADR number` — count existing files in `adr/` and format as `[N+1]-[slugified user input]`; prompt user for the short description via the free-form fallback
     4. `Other` — allow free-form text input
   - After the user selects, resolve `BRANCH_NAME` per the rule above before continuing.

   **Question 2 — ADR file name**
   - Header: `ADR file`
   - Question: "What should the ADR file be named? This becomes `adr/[name].md`. Use the format `###-short-description` (e.g. `002-shadows`)."
   - Allow free-form input. No predefined options.

   Parse the answers as `BRANCH_NAME` and `ADR_NAME`. All subsequent paths must use these values.

2. **File setup**:
   - Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `REPO_ROOT`.
   - Set `SPEC_FILE=$REPO_ROOT/adr/$ADR_NAME.md`.
   - Check whether `$SPEC_FILE` already exists. If it does, read it and continue editing rather than overwriting.
   - All paths must be absolute.

3. **Load context**: Read `.specify/memory/constitution.md`. Read `.specify/templates/adr-template.md` — this is the output template you will fill.

4. **Understand the change**: From the user input and any open files, determine:
   - Which schema files in `schema/` are affected
   - Which types in `types/` are affected (added, removed, renamed fields)
   - Whether the change is MAJOR (breaking), MINOR (additive), or PATCH (non-semantic) per the constitution

5. **Evaluate options** *(skip if the decision is already made)*:
   - If the user input or context indicates the decision is pre-decided (e.g., "record and implement this decision"), omit this step and leave the Options Considered section of the ADR with a single entry marked *(Pre-decided — no alternatives evaluated)*.
   - Otherwise, identify at least two alternative approaches and for each: assess against the constitution's Decision Drivers (type-schema sync, no logic, stable API, etc.) and state which is selected and which are rejected with clear rationale.

6. **Draft the ADR**: Fill `adr-template.md` and write to `$SPEC_FILE`:
   - **Branch**: `BRANCH_NAME`
   - **Status**: `DRAFT`
   - **Context**: Current state of the relevant types/schema and what gap or opportunity this addresses
   - **Decision Drivers**: Enumerate the constraints from the constitution that apply
   - **Options Considered**: At least two options with pros/cons relative to the drivers
   - **Decision**: Precise list of type and schema changes (file, field, modification type)
   - **Type ↔ Schema Impact**: Confirm symmetry or document justified asymmetry
   - **Downstream Impact**: `anova-kit` only — see Key rules below
   - **Semver Decision**: MAJOR / MINOR / PATCH with justification citing the constitution
   - **Consequences**: What becomes true after acceptance

7. **Report**: Output `$SPEC_FILE` path and a one-paragraph summary of the decision.
## Formatting rules (apply when drafting the ADR)

- **Examples over prose**: Wherever a type shape, schema property, or field change is described, include a YAML example showing the before/after or the new structure. Prefer this over sentences explaining the same idea in abstract terms.
- **Bullets over enumeration**: Use bullet lists for Decision Drivers, Consequences, and any list of more than two items. Do not write "X, Y, and Z" as a sentence when a list would be clearer.
- **Backticks for terms**: All type names, field names, file names, and schema property paths MUST be in backtick format (e.g., `Config`, `license`, `types/Config.ts`, `#/properties/license`).
- **Types and schema only**: The ADR MUST describe only changes to `types/` and `schema/` within this package. Do NOT reference implementation classes, internal files, or processing logic from downstream packages (`anova-transformer`, `anova-plugin`, `anova-kit`). Downstream impact is described in terms of the observable API surface — what types or schema keys change — not how those packages implement consumption.

## Key rules

- Status MUST be `DRAFT` — never set to `ACCEPTED` in this command.
- The ADR describes *what* will change and *why*. It does not contain type or schema file content — those changes are applied directly by `/speckit.implement`.
- **Downstream Impact table**: Include only `anova-kit` as a consumer row. Do not add rows for `anova-transformer` or `anova-plugin` — those packages manage their own ADR and change workflows.
- If the change clearly violates a constitution gate (e.g., adds runtime logic), state the violation explicitly in the ADR and halt rather than proceeding without justification.
- Use absolute paths for all file operations.
