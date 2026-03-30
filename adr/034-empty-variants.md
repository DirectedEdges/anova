# ADR: Make Config.include fields optional and add emptyVariants

**Branch**: `034-empty-variants`
**Created**: 2026-03-30
**Status**: DRAFT
**Deciders**: nathanacurtis (author)
**Supersedes**: *(none)*

---

## Context

The `anova-plugin` UI exposes an "Include layered variants without elements" checkbox setting (`DATA_EMPTY_VARIANTS` in `src/UI/App/Settings/VariantsChildren.ts`), but toggling it has no effect on the transformer output. The setting is purely cosmetic — it persists in localStorage but is never passed through to the transformer pipeline.

Currently, the `Config.include` type in `types/Config.ts` defines three required boolean fields:

```typescript
include: {
  variantNames: boolean;
  invalidVariants: boolean;
  invalidCombinations: boolean;
}
```

There is no `emptyVariants` field (or equivalent) for the transformer to read. Additionally, all three existing fields are required, which deviates from the broader Config pattern where most fields are optional with defaults specified in `DEFAULT_CONFIG` (e.g., `tokens?`, `inferNumberProps?`, `slotConstraints?`, `subcomponents?`, `glyphNamePattern?`).

This creates two issues:
1. The plugin setting cannot be mapped to the `Config` object passed to the transformer
2. The `include` section is inconsistent with the rest of the Config structure

This ADR addresses both by adding the missing `emptyVariants` field and making all `include` fields optional for consistency.

---

## Decision Drivers

- **Additive-only change**: Must not break existing consumers; should be MINOR version bump
- **Type ↔ schema symmetry**: Both `types/Config.ts` and `schema/component.schema.json` must be updated in lockstep per Constitution I
- **No runtime logic**: This package defines the contract only; filtering logic belongs in `anova-transformer` per Constitution II
- **Explicit defaults**: `DEFAULT_CONFIG` must specify the default value to ensure consistent behavior across CLI and plugin per existing pattern
- **Consistency with Config pattern**: Optional fields with defaults are the established norm (e.g., `tokens?`, `inferNumberProps?`, `slotConstraints?`)
- **Internal consistency**: The `include` section should follow a uniform pattern — all fields optional with defaults

---

## Options Considered

### Option A: Make all `Config.include` fields optional with defaults *(Selected)*

Add new field `emptyVariants?: boolean` and make existing fields (`variantNames`, `invalidVariants`, `invalidCombinations`) optional as well. All fields default to their current `DEFAULT_CONFIG` values when absent.

**Pros**:
- Creates consistency within the `include` section — all fields follow the same pattern
- Follows established Config pattern of optional fields with sensible defaults (`tokens?`, `inferNumberProps?`, `slotConstraints?`, etc.)
- Additive change — existing code continues to work without modification (MINOR bump)
- Serialized configs can omit fields when using default behavior, reducing output size
- Consumers don't need to update existing config construction code
- Makes the intent explicit: "if not specified, use the sensible default"

**Cons / Trade-offs**:
- Consumers must handle both presence and absence for all include fields (but this is already the pattern for many Config fields)
- Changes the shape of the `include` section in a broader way than just adding one field

---

### Option B: Add only `emptyVariants?` as optional, keep others required *(Rejected)*

Add new optional field `emptyVariants?: boolean` but leave `variantNames`, `invalidVariants`, and `invalidCombinations` as required.

**Rejected because**: Creates inconsistency within the `include` section — some fields required, some optional. This makes the API harder to learn and understand. If we're adopting optional-with-defaults for new fields, existing fields should follow the same pattern for consistency.

---

### Option C: Add `Config.processing.filterEmptyVariants: boolean` *(Rejected)*

Place the field under `processing` rather than `include`, since it affects the processing pipeline.

**Rejected because**: The field controls *what to include in output*, not *how to process input*. It parallels `invalidVariants` and `invalidCombinations`, both of which live in `include`. Separating conceptually related fields undermines discoverability and consistency.

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| `Config.ts` | Make `variantNames`, `invalidVariants`, `invalidCombinations` optional in `Config.include` interface | MINOR |
| `Config.ts` | Add new optional field `emptyVariants?: boolean` to `Config.include` interface | MINOR |
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
  variantNames?: boolean;
  invalidVariants?: boolean;
  invalidCombinations?: boolean;
  emptyVariants?: boolean;
}
```

**Default values** (`DEFAULT_CONFIG` — unchanged):

```typescript
include: {
  variantNames: false,
  invalidVariants: false,
  invalidCombinations: true,
  emptyVariants: false,  // NEW
}
```

**Rationale for `emptyVariants` default**: Setting `emptyVariants: false` (exclude empty variants) aligns with the principle of minimal output — consumers typically want only semantically meaningful variants. Users can opt in to including empty variants when debugging or analyzing variant coverage. This matches the plugin's current default behavior.

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `component.schema.json` | Remove `variantNames`, `invalidVariants`, `invalidCombinations` from `#/definitions/Config/properties/include/required` array | MINOR |
| `component.schema.json` | Add optional `emptyVariants` property to `#/definitions/Config/properties/include/properties` | MINOR |

**Example — new shape** (`schema/component.schema.json`):

```json
"include": {
  "type": "object",
  "properties": {
    "variantNames": {
      "type": "boolean",
      "description": "Include variant names"
    },
    "invalidVariants": {
      "type": "boolean",
      "description": "Include invalid variants"
    },
    "invalidCombinations": {
      "type": "boolean",
      "description": "Include invalid combinations"
    },
    "emptyVariants": {
      "type": "boolean",
      "description": "When false, exclude layered variants that contain no elements from output. When true, include all variants regardless of element presence. Defaults to false when absent."
    }
  },
  "required": [
    // All fields now optional — empty array or remove property
  ],
  "additionalProperties": false
}
```

### Notes

- **Scope expansion**: This ADR initially focused on adding `emptyVariants`, but was expanded to make all `include` fields optional for consistency with the broader Config pattern
- All `include` fields now follow the same pattern: optional in the type/schema, explicit defaults in `DEFAULT_CONFIG`
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

- The entire `Config.include` section now follows a consistent pattern: all fields optional with explicit defaults in `DEFAULT_CONFIG`
- Serialized configs can omit `include` fields when using default values, reducing output size
- The `Config` contract now supports signaling whether to include or exclude empty variants in output
- The transformer can implement filtering logic for layered variants without elements once this ADR is accepted
- The plugin can wire its existing UI setting to the config field, making the checkbox functional
- Consumers validating against `schema/component.schema.json` must update to the new version to accept specs with optional `include` fields
- Consumers constructing `Config` objects can now omit any `include` field and rely on `DEFAULT_CONFIG` merging or explicit defaults
- Existing code that provides all `include` fields continues to work without modification (backward compatible)
- Establishes `Config.include` as a clean example of the optional-with-defaults pattern for future Config additions
