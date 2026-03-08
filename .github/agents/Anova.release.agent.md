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
   If dirty, STOP and report.

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
   tsc --noEmit --strict tests/*.test-d.ts
   ```
   If tests fail, STOP and report errors.

7. **Present setup summary**:
   ```
   @directededges/anova v[version] — Setup Summary
     ✓ Version: [version]
     ✓ CHANGELOG: [version] — [date]
     ✓ Working tree: clean
     ✓ Auth: [username]
     ✓ Build: passed
     ✓ Type tests: passed
   ```

8. **Commit gate**: Ask **"Ready to commit @directededges/anova v[version]?"**
   Wait for confirmation. If there are uncommitted changes (e.g., CHANGELOG date added):
   ```bash
   git add -A && git commit -m "release: @directededges/anova v[version]"
   ```

9. **Publish gate**: Ask **"Ready to publish @directededges/anova@[version] to GitHub Packages?"**
   Wait for confirmation.
   ```bash
   npm publish
   ```

10. **PR gate**: Ask **"Ready to create a PR to main for @directededges/anova v[version]?"**
   Wait for confirmation.
   ```bash
   gh pr create --base main --title "release: @directededges/anova v[version]" --body "$(cat <<'EOF'
   ## Summary
   - Release @directededges/anova v[version]
   - See CHANGELOG.md for details
   EOF
   )"
   ```
   Present the PR URL.

## Key rules

- Use absolute paths for all file operations.
- Each gate (commit, publish, PR) requires explicit user confirmation before proceeding.
- If any verification step fails, halt immediately — do not skip to later steps.
- This package has no @directededges dependencies, so no reference swapping is needed.
