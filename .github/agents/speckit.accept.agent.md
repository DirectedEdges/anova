---
description: Confirms the implementation is clean, then marks the ADR as ACCEPTED. Run this after reviewing the diff from /speckit.implement.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `REPO_ROOT`, `BRANCH`, `FEATURE_DIR`. All paths must be absolute.

2. **Load context**:
   - **REQUIRED**: Read `$FEATURE_DIR/adr.md` — confirm Status is `PROPOSED` (if already `ACCEPTED`, report and halt)
   - Confirm that `types/`, `schema/`, `package.json`, and `CHANGELOG.md` have been modified by `/speckit.implement` (check git status or file timestamps)
   - If no changes are detected, halt: "Run `/speckit.implement` first."

3. **Re-run validation gates**:
   - Run: `tsc -p tsconfig.build.json --noEmit`
     - If exit code ≠ 0: halt and display errors. Do not set ACCEPTED.
   - Run: `.specify/scripts/bash/validate-schema.sh`
     - If any schema fails: halt and report. Do not set ACCEPTED.
   - Run: `tsc --noEmit --strict tests/*.test-d.ts` (if `tests/*.test-d.ts` files exist)
     - If exit code ≠ 0: halt and display errors. Do not set ACCEPTED.

4. **Mark ADR ACCEPTED**: In `$FEATURE_DIR/adr.md` header, change to `Status: ACCEPTED`.

5. **Report**: Confirm all gates passed and the ADR is now ACCEPTED. List the next steps: open PR → merge → `npm publish`.

## Key rules

- This command only flips the ADR status — it does not apply any code changes.
- Status MUST only move to `ACCEPTED` after all three validation gates pass in step 3.
- Use absolute paths for all file operations.
