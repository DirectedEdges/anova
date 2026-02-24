---
description: Draft an Architecture Decision Record (ADR) for a proposed change to the anova types or schema package.
handoffs:
  - label: Implement the ADR
    agent: speckit.implement
    prompt: Implement the necessary changes for this ADR
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**:
   - Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `REPO_ROOT` and `BRANCH`.
   - Check whether `adr/$BRANCH.md` already exists in the repo root.
   - If the file **exists**: the ADR is already started. Skip `create-new-feature.sh`. Set `BRANCH_NAME=$BRANCH`, `SPEC_FILE=$REPO_ROOT/adr/$BRANCH.md`.
   - If the file **does not exist**: run `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` from repo root. Parse JSON for `BRANCH_NAME` and `FEATURE_NUM`. Set `SPEC_FILE=$REPO_ROOT/adr/$BRANCH_NAME.md`.
   - All paths must be absolute.

2. **Load context**: Read `.specify/memory/constitution.md`. Read `.specify/templates/adr-template.md` — this is the output template you will fill.

3. **Understand the change**: From the user input and any open files, determine:
   - Which schema files in `schema/` are affected
   - Which types in `types/` are affected (added, removed, renamed fields)
   - Which downstream consumers are affected (`anova-transformer`, `anova-kit`, `anova-plugin`)
   - Whether the change is MAJOR (breaking), MINOR (additive), or PATCH (non-semantic) per the constitution

4. **Evaluate options** *(skip if the decision is already made)*:
   - If the user input or context indicates the decision is pre-decided (e.g., "record and implement this decision"), omit this step and leave the Options Considered section of the ADR with a single entry marked *(Pre-decided — no alternatives evaluated)*.
   - Otherwise, identify at least two alternative approaches and for each: assess against the constitution's Decision Drivers (type-schema sync, no logic, stable API, etc.) and state which is selected and which are rejected with clear rationale.

5. **Draft the ADR**: Fill `adr-template.md` and write to `adr/[branch].md`:
   - **Status**: `DRAFT`
   - **Context**: Current state of the relevant types/schema and what gap or opportunity this addresses
   - **Decision Drivers**: Enumerate the constraints from the constitution that apply
   - **Options Considered**: At least two options with pros/cons relative to the drivers
   - **Decision**: Precise list of type and schema changes (file, field, modification type)
   - **Type ↔ Schema Impact**: Confirm symmetry or document justified asymmetry
   - **Downstream Impact**: Per-consumer impact table
   - **Semver Decision**: MAJOR / MINOR / PATCH with justification citing the constitution
   - **Consequences**: What becomes true after acceptance

6. **Report**: Output `adr/[branch].md` path and a one-paragraph summary of the decision.
## Formatting rules (apply when drafting the ADR)

- **Examples over prose**: Wherever a type shape, schema property, or field change is described, include a YAML example showing the before/after or the new structure. Prefer this over sentences explaining the same idea in abstract terms.
- **Bullets over enumeration**: Use bullet lists for Decision Drivers, Consequences, and any list of more than two items. Do not write "X, Y, and Z" as a sentence when a list would be clearer.
- **Backticks for terms**: All type names, field names, file names, and schema property paths MUST be in backtick format (e.g., `Config`, `license`, `types/Config.ts`, `#/properties/license`).

## Key rules

- Status MUST be `DRAFT` — never set to `ACCEPTED` in this command.
- The ADR describes *what* will change and *why*. It does not contain type or schema file content — those changes are applied directly by `/speckit.implement`.
- If the change clearly violates a constitution gate (e.g., adds runtime logic), state the violation explicitly in the ADR and halt rather than proceeding without justification.
- Use absolute paths for all file operations.
