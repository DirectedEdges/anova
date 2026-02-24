---
description: Applies the changes described in an ADR directly to types, schema, tests, and changelog. Runs all validation gates. Author reviews the result as a normal code diff before merging.
handoffs:
  - label: Accept ADR
    agent: AnovaADR.accept
    prompt: All gates passed — mark the ADR as ACCEPTED
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `REPO_ROOT`, `BRANCH`, `FEATURE_DIR`. All paths must be absolute.

2. **Load context**:
   - **REQUIRED**: Read `$FEATURE_DIR/adr.md` — source of truth for what changes and why
   - **REQUIRED**: Read `.specify/memory/constitution.md` — all six gates must pass
   - Read every `types/*.ts` file named in the ADR Decision section
   - Read every `schema/*.json` file named in the ADR Decision section
   - Read `package.json` for the current version
   - Read `CHANGELOG.md` for the existing format

3. **Verify ADR completeness**: The ADR must have a clear Decision section (type and schema changes listed) and a Semver Decision with `CURRENT → NEW`. If either is missing or marked NEEDS CLARIFICATION, halt and ask the author to complete the ADR first.

4. **Constitution gate check**: Evaluate all six gates against the ADR's stated changes. If any gate fails without a documented exception in the ADR, halt and report the violation before touching any file.

5. **Apply type changes**: For each type file listed in the ADR Decision:
   - Edit the file directly — add, remove, or rename the fields as described
   - Additive changes only for MINOR; structural changes require MAJOR
   - Add JSDoc comments for every new exported type member
   - Preserve all existing exports and comments not mentioned in the ADR

6. **Apply schema changes**: For each schema file listed in the ADR Decision:
   - Edit the file directly — add, remove, or update the property definitions as described
   - New optional field → add to `"properties"` only; leave `"required"` array unchanged
   - New required field → add to both `"properties"` and `"required"` (MAJOR bump)
   - Add `"description"` for every new schema property
   - Validate JSON syntax before saving (malformed JSON must not be written)

7. **Gate 4 — TypeScript compilation**:
   - Run: `tsc -p tsconfig.build.json --noEmit`
   - If exit code ≠ 0: display errors, revert the files changed in steps 5–6, and halt. Report the specific errors for the author to resolve in the ADR before re-running.

8. **Gate — JSON Schema validation**:
   - Run: `.specify/scripts/bash/validate-schema.sh`
   - If any schema fails: revert steps 5–6 changes and halt. Report which file failed and why.

9. **Write or update tests**:
   - Tests live in `tests/` at the repo root (create directory if absent)
   - For a pure types package, tests are TypeScript compilation assertions: files that import the changed types and confirm the expected shape compiles correctly
   - Create or update `tests/[type-name].test-d.ts` for each changed type using `tsd`-style assertions or `@ts-expect-error` patterns
   - Run: `tsc --noEmit --strict tests/*.test-d.ts` to confirm test files compile
   - If tests fail: halt and report

10. **Update CHANGELOG.md**:
    - Prepend a new entry at the top using the existing format in the file
    - **Format**: one top-level bullet per user-visible change; no sub-bullets; no bold
    - **Names**: `<Parent>.<field>` in backticks, em dash separator — e.g. `Styles.cornerSmoothing` — corner smoothing factor
    - **Sections**: use `### Added`, `### Changed`, `### Removed` as needed; add `### Migration` (MAJOR or rename only) with `<Parent>.<old>` → `<Parent>.<new>`: imperative callsite instruction

11. **Bump version in `package.json`**: Apply the `NEW` version from the ADR's Semver Decision.

12. **Report**: List every file modified (with one-line description each). State that the author should review the diff and run `/speckit.accept` once satisfied.

## Key rules

- Apply changes directly — do not produce a description document.
- Halt and revert on any gate failure. Do not partially apply a change set.
- Never modify files not listed in the ADR Decision section.
- If the actual change required is a higher semver bump than the ADR states, halt and report before touching any file.
- Use absolute paths for all file operations.
