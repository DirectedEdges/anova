---
description: Release @directededges/anova to GitHub Packages. Verifies version, CHANGELOG, builds, and publishes with confirmation gates.
---

## User Input

```text
$ARGUMENTS
```

The argument is the version to release (e.g., `0.12.0`). You **MUST** have a version before proceeding.

## Outline

1. **Verify version**: Read `package.json`. Confirm the `version` field matches the argument. If not, STOP and ask whether to update it or abort.

2. **Verify CHANGELOG**: Read `CHANGELOG.md`. Confirm:
   - An entry exists for this version (e.g., `## [0.12.0]`)
   - The entry has a date (use today if missing)
   - The entry has content under Added/Changed/Removed/Fixed
   If incomplete, STOP and report what's missing.

3. **Verify clean working tree**:
   ```bash
   git status --porcelain
   ```
   If dirty, STOP and report. Exception: changes made by this agent (e.g., CHANGELOG date added) are expected.

4. **Verify GitHub Packages auth**:
   ```bash
   npm whoami --registry=https://npm.pkg.github.com
   ```
   If this fails, STOP.

5. **Build**:
   ```bash
   npm run build
   ```
   If build fails, STOP.

6. **Run type-level tests**:
   ```bash
   npx tsc --noEmit --strict tests/*.test-d.ts
   ```
   If tests fail, report errors and ask the user whether to proceed or abort.

7. **Present setup summary**:
   ```
   @directededges/anova v[version] — Setup Summary
     ✓ Version: [version]
     ✓ CHANGELOG: [version] — [date]
     ✓ Working tree: clean
     ✓ Auth: [username]
     ✓ Build: passed
     ✓ Type tests: passed (or ⚠ with note)
   ```

8. **Commit gate**: Use `AskUserQuestion` with Yes/No options: **"Ready to commit @directededges/anova v[version]?"**
   On Yes, if there are uncommitted changes:
   ```bash
   git add -A && git commit -m "release: @directededges/anova v[version]"
   ```

9. **Publish gate**: Use `AskUserQuestion` with Yes/No options: **"Ready to publish @directededges/anova@[version] to GitHub Packages?"**
   On Yes:
   ```bash
   npm publish
   ```
   If publish fails with "previously published version", report and ask the user whether to bump the patch version or skip.

10. **PR gate**: Use `AskUserQuestion` with Yes/No options: **"Ready to create a PR to main for @directededges/anova v[version]?"**
    On Yes:
    ```bash
    gh pr create --base main --title "release: @directededges/anova v[version]" --body "$(cat <<'EOF'
    ## Summary
    - Release @directededges/anova v[version]
    - See CHANGELOG.md for details
    EOF
    )"
    ```
    If a PR already exists for this branch, report the existing PR URL instead of failing.
    Push to remote before creating the PR if needed.

11. **Cleanup gate** (after PR is merged): Use `AskUserQuestion` with Yes/No options: **"PR merged. Switch to main and delete the release branch?"**
    On Yes:
    ```bash
    git checkout main && git pull && git branch -d [release-branch] && git push origin --delete [release-branch]
    ```
    Skip if already on main.

## Key rules

- Use absolute paths for all file operations.
- Each gate (commit, publish, PR) uses `AskUserQuestion` with Yes/No options for clickable confirmation.
- If any verification step fails, halt immediately — do not skip to later steps. For test failures, ask the user whether to proceed.
- This package has no @directededges dependencies, so no reference swapping is needed.
