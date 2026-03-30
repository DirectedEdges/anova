# ADR: Add Config.include.emptyVariants to support filtering layered variants without elements

**Branch**: `034-empty-variants`
**Created**: 2026-03-30
**Status**: DRAFT
**Deciders**: nathanacurtis (author)
**Supersedes**: *(none)*

---

## Context

The `anova-plugin` UI exposes an "Include layered variants without elements" checkbox setting (`DATA_EMPTY_VARIANTS` in `src/UI/App/Settings/VariantsChildren.ts`), but toggling it has no effect on the transformer output. The setting is purely cosmetic — it persists in localStorage but is never passed through to the transformer pipeline.

Currently, the `Config.include` type in `types/Config.ts` defines three boolean fields:

```typescript
include: {
  variantNames: boolean;
  invalidVariants: boolean;
  invalidCombinations: boolean;
}
```

There is no `emptyVariants` field (or equivalent) for the transformer to read. This means:
1. The plugin setting cannot be mapped to the `Config` object passed to the transformer
2. The transformer has no signal to filter out layered variants that contain no elements
3. All valid variants are always included in output regardless of element presence

When `processing.details` is set to `'LAYERED'`, the transformer computes diffs between each variant and the default variant. In some cases, a layered variant may have no elements — its diff is structurally present but semantically empty. Consumers may wish to exclude these variants from the output to reduce noise.

This ADR addresses the missing contract field that would enable downstream filtering behavior.

---

## Decision Drivers

- **Additive-only change**: Must not break existing consumers; should be MINOR version bump
- **Type ↔ schema symmetry**: Both `types/Config.ts` and `schema/component.schema.json` must be updated in lockstep per Constitution I
- **No runtime logic**: This package defines the contract only; filtering logic belongs in `anova-transformer` per Constitution II
- **Explicit defaults**: `DEFAULT_CONFIG` must specify the default value to ensure consistent behavior across CLI and plugin per existing pattern
- **Consistency with existing include fields**: Should follow the same boolean flag pattern as `variantNames`, `invalidVariants`, and `invalidCombinations`

---

## Options Considered

### Option A: Add `emptyVariants: boolean` to `Config.include` *(Selected)*

Add a new optional boolean field `emptyVariants` to the `Config.include` type and schema. When `false` (default), all variants are included in output regardless of element presence. When `true`, layered variants without elements are excluded from output.

**Pros**:
- Follows existing pattern of other `include` fields (boolean flags that control output filtering)
- Additive change — existing code continues to work without modification (MINOR bump)
- Provides clear signal to transformer for filtering behavior
- Name aligns with plugin UI terminology and existing `invalidVariants` precedent

**Cons / Trade-offs**:
- Field name could be interpreted two ways: "include empty variants" (keep them) vs "filter empty variants" (remove them). We follow the "include" semantics: `true` = include them, `false` = exclude them.
- Adds another required field to the `include` object in schema (must be present in all serialized configs)

---

### Option B: Add `Config.include.emptyVariants` as optional field *(Rejected)*

Make the field optional in both type and schema, defaulting to `true` (include empty variants) when absent.

**Rejected because**: Making the field optional adds ambiguity — consumers must handle both presence and absence. The existing pattern in `Config.include` is that all fields are required with explicit defaults in `DEFAULT_CONFIG`. Deviating from this pattern increases maintenance burden and breaks symmetry.

---

### Option C: Add `Config.processing.filterEmptyVariants: boolean` *(Rejected)*

Place the field under `processing` rather than `include`, since it affects the processing pipeline.

**Rejected because**: The field controls *what to include in output*, not *how to process input*. It parallels `invalidVariants` and `invalidCombinations`, both of which live in `include`. Separating conceptually related fields undermines discoverability and consistency.

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| `Config.ts` | Add optional field `emptyVariants: boolean` to `Config.include` interface | MINOR |
| `Config.ts` | Add `emptyVariants: false` to `DEFAULT_CONFIG.include` | MINOR |

**Example — new shape** (`types/Config.ts`):

```typescript
// Before
include: {
  variantNames: boolean;
  invalidVariants: boolean;
  invalidCombinations: boolean;
}

// After
include: {
  variantNames: boolean;
  invalidVariants: boolean;
  invalidCombinations: boolean;
  emptyVariants: boolean;
}
```

**Default value** (`DEFAULT_CONFIG`):

```typescript
include: {
  variantNames: false,
  invalidVariants: false,
  invalidCombinations: true,
  emptyVariants: false,  // NEW: exclude empty variants by default
}
```

**Rationale for default value**: Setting `emptyVariants: false` (exclude empty variants) aligns with the principle of minimal output — consumers typically want only semantically meaningful variants. Users can opt in to including empty variants when debugging or analyzing variant coverage. This matches the plugin's current default behavior.

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `component.schema.json` | Add `emptyVariants` property to `#/definitions/Config/properties/include/properties` | MINOR |
| `component.schema.json` | Add `emptyVariants` to `#/definitions/Config/properties/include/required` array | MINOR |

**Example — new shape** (`schema/component.schema.json`):

```json
"include": {
  "type": "object",
  "properties": {
    "variantNames": {
      "type": "boolean"
    },
    "invalidVariants": {
      "type": "boolean"
    },
    "invalidCombinations": {
      "type": "boolean"
    },
    "emptyVariants": {
      "type": "boolean",
      "description": "When false, exclude layered variants that contain no elements from output. When true, include all variants regardless of element presence."
    }
  },
  "required": [
    "variantNames",
    "invalidVariants",
    "invalidCombinations",
    "emptyVariants"
  ],
  "additionalProperties": false
}
```

### Notes

- The field name `emptyVariants` follows the "include" semantics: `false` = exclude empty variants from output, `true` = include them
- "Empty variant" is defined as: a layered variant (when `processing.details = 'LAYERED'`) that contains no elements in its diff from the default variant
- The filtering logic implementation is deferred to `anova-transformer` (separate issue)
- The plugin UI mapping is deferred to `anova-plugin` (separate issue)

---

## Type ↔ Schema Impact

- **Symmetric**: Yes
- **Parity check**: 
  - TypeScript: `Config.include.emptyVariants: boolean`
  - JSON Schema: `#/definitions/Config/properties/include/properties/emptyVariants` with `type: "boolean"`
  - Both add the field to their respective required lists
  - Both maintain `additionalProperties: false` to prevent drift

---

## Downstream Impact

| Consumer | Impact | Action required |
|----------|--------|-----------------|
| `anova-kit` | CLI must update to pass new config field from settings | Add default value handling; expose flag in CLI if applicable |
| `anova-transformer` | Must implement filtering logic to read and act on the flag | Separate issue: filter out empty variants when `config.include.emptyVariants === false` |
| `anova-plugin` | Must wire `DATA_EMPTY_VARIANTS` UI setting to the config field | Separate issue: map plugin setting to `config.include.emptyVariants` in `settingsToModelConfig()` |

---

## Semver Decision

**Version bump**: `[CURRENT] → [NEXT MINOR]` (`MINOR`)

**Justification**: Per Constitution III, adding a new optional field to an existing type is a non-breaking additive change and requires a MINOR version bump. The field is optional in the sense that existing code will continue to work (the transformer ignores unknown fields), but the schema marks it as required to ensure explicit intent in serialized configs via `DEFAULT_CONFIG`.

More precisely:
- Adding `emptyVariants` to the TypeScript type is additive (MINOR)
- Adding it to the schema with a default value in `DEFAULT_CONFIG` ensures backward compatibility
- All downstream consumers will receive the new field via `DEFAULT_CONFIG` without code changes
- Consumers that construct `Config` objects manually must add the field, but this is a compilation error (caught at build time), not a runtime break

---

## Consequences

- The `Config` contract now supports signaling whether to include or exclude empty variants in output
- The transformer can implement filtering logic for layered variants without elements once this ADR is accepted
- The plugin can wire its existing UI setting to the config field, making the checkbox functional
- Consumers validating against `schema/component.schema.json` must update to the new version to accept specs with the `emptyVariants` field
- Serialized specs will include `config.include.emptyVariants: false` by default, explicitly documenting the filtering behavior
- Adding this field establishes a precedent for other "include" flags that control output filtering based on variant characteristics
