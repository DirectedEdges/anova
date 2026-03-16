# ADR: Unify Platform-Specific Properties Under `$extensions`

**Branch**: `026-platform-extensions`
**Created**: 2026-03-16
**Status**: DRAFT
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

The schema currently uses **two different patterns** to carry Figma-specific metadata:

1. **`x-platform`** on `BooleanProp` (`component.schema.json`) — an object keyed by platform name (`FIGMA`) that stores Figma's native prop type. This property exists only in the schema; it has **no TypeScript counterpart** in `types/Props.ts`, which means types and schema have drifted.

2. **`$extensions`** on `TokenReference` (`types/Styles.ts`, `styles.schema.json`) — follows the DTCG (Design Tokens Community Group) `$extensions` convention with reverse-domain namespacing (`com.figma`). Types and schema are in sync.

As more Figma-specific metadata needs arise (e.g., native prop types on `StringProp`, `EnumProp`, `SlotProp`; element-level Figma node IDs; other extraction provenance), the inconsistency will spread. A single, well-defined pattern is needed before additional Figma extensions are added.

---

## Decision Drivers

- **Types ↔ schema symmetry (Constitution I)**: Both artifacts must describe the same structure. `x-platform` exists only in the schema today — this is already a drift bug.
- **No logic (Constitution II)**: The solution must be pure type/schema additions only.
- **Stable, intentional API (Constitution III)**: The chosen pattern should align with established community standards to avoid inventing a bespoke convention.
- **Additive change preferred**: A MINOR bump is preferable to a MAJOR bump. The existing `x-platform` field is schema-only with no typed consumer, so removing it is low-risk.
- **Extensibility**: The pattern must scale to additional platforms and additional Figma metadata categories without schema restructuring.

---

## Options Considered

### Option A: `$extensions` with DTCG reverse-domain namespacing *(Selected)*

Adopt the DTCG `$extensions` pattern already used on `TokenReference` as the single standard for all platform-specific metadata throughout the schema. Figma metadata lives under the `com.figma` key.

```yaml
# On prop types (BooleanProp example)
showLabel:
  type: boolean
  default: true
  $extensions:
    com.figma:
      type: BOOLEAN          # Figma-native prop type

# On TokenReference (already uses this pattern — no change)
$token: "DS Color.Text.Primary"
$type: color
$extensions:
  com.figma:
    id: "VariableID:1234"
    name: "Text/Primary"
```

**Pros**:
- Aligns with the DTCG Design Tokens specification (§5.2.3) — the same standard `TokenReference` already follows
- Reverse-domain namespacing (`com.figma`, `com.sketch`, etc.) is extensible to other platforms without schema changes
- Eliminates the current inconsistency — one pattern everywhere
- Already validated in production on `TokenReference`
- `$`-prefixed properties are already permitted by `patternProperties: { "^\\$": {} }` on all prop schemas

**Cons / Trade-offs**:
- Slightly more verbose than `x-platform` (`$extensions.com.figma.type` vs `x-platform.FIGMA.type`)
- Requires removing `x-platform` from the schema (low-risk: no typed consumer exists)

---

### Option B: `x-platform` everywhere *(Rejected)*

Standardize on `x-platform` across all types, including refactoring `TokenReference` to use `x-platform.FIGMA` instead of `$extensions["com.figma"]`.

```yaml
# TokenReference would become:
$token: "DS Color.Text.Primary"
$type: color
x-platform:
  FIGMA:
    id: "VariableID:1234"
    name: "Text/Primary"
```

**Rejected because**:
- Contradicts the DTCG specification that `TokenReference` was designed to follow
- Requires a **breaking change** to `TokenReference` (which has typed consumers and is in active use) — forces a MAJOR bump
- `x-platform` is a bespoke convention with no external standard backing it
- Uses SCREAMING_CASE platform keys (`FIGMA`) instead of the established reverse-domain convention, limiting extensibility

---

### Option C: Keep both patterns *(Rejected)*

Leave `x-platform` on props and `$extensions` on `TokenReference` as-is, documenting when to use each.

**Rejected because**:
- Perpetuates the inconsistency that prompted this ADR
- Forces downstream consumers to understand and handle two different extension mechanisms
- Violates the principle of a stable, intentional API — two patterns for the same concept is confusing
- The `x-platform` schema has no TypeScript counterpart, which is already a Constitution I violation

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| `Props.ts` | Add optional `$extensions` property to `BooleanProp`, `StringProp`, `EnumProp`, `SlotProp` | MINOR |

**Example — new shape** (`types/Props.ts`):
```yaml
# Before
BooleanProp:
  type: 'boolean'
  default: boolean

# After
BooleanProp:
  type: 'boolean'
  default: boolean
  $extensions?:                    # optional — MINOR
    com.figma?:
      type?: string                # Figma-native prop type
```

A shared `PropExtensions` type should be introduced to avoid duplicating the `$extensions` shape across all four prop interfaces:

```typescript
/** DTCG §5.2.3 tool-specific metadata for prop definitions. */
interface PropExtensions {
  'com.figma'?: {
    /** Figma-native property type (e.g., BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT). */
    type?: string;
  };
}
```

Each prop interface gains:
```typescript
$extensions?: PropExtensions;
```

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `component.schema.json` | Remove `x-platform` from `BooleanProp`; add `$extensions` definition to `BooleanProp`, `StringProp`, `EnumProp`, `SlotProp` | MINOR |

**Example — new shape** (`component.schema.json` under `BooleanProp/properties`):
```yaml
# Remove
x-platform:
  type: object
  properties:
    FIGMA:
      type: object
      properties:
        type:
          type: string
          enum: [BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT]

# Add
$extensions:
  type: object
  description: "DTCG §5.2.3 tool-specific metadata (reverse domain name notation)."
  properties:
    com.figma:
      type: object
      properties:
        type:
          type: string
          enum: [BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT]
          description: "Figma-native property type"
      additionalProperties: false
  additionalProperties: true
```

The existing `patternProperties: { "^\\$": {} }` on all prop definitions already permits `$`-prefixed keys, so adding explicit `$extensions` properties is purely additive.

### Notes

- `TokenReference.$extensions` in `types/Styles.ts` and `styles.schema.json` is **unchanged** — it already follows the target pattern.
- The `x-platform` property has no TypeScript counterpart today, so its removal from the schema does not break any typed consumer. Downstream transformers that emit `x-platform` will need to emit `$extensions` instead.
- The `$extensions` object uses `additionalProperties: true` at the top level to allow future platform keys beyond `com.figma` without schema changes.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes — after this change, every prop type in `types/Props.ts` that gains `$extensions` will have a matching schema property in `component.schema.json`.
- **Parity check**:
  - `BooleanProp.$extensions` ↔ `#/definitions/BooleanProp/properties/$extensions`
  - `StringProp.$extensions` ↔ `#/definitions/StringProp/properties/$extensions`
  - `EnumProp.$extensions` ↔ `#/definitions/EnumProp/properties/$extensions`
  - `SlotProp.$extensions` ↔ `#/definitions/SlotProp/properties/$extensions`
  - `TokenReference.$extensions` ↔ `#/definitions/TokenReference/properties/$extensions` (unchanged)

---

## Downstream Impact

| Consumer | Impact | Action required |
|----------|--------|-----------------|
| `anova-kit` | Recompile | No usage changes — `$extensions` on props is optional and informational. Recompile against updated types. |

---

## Semver Decision

**Version bump**: `0.13.0 → 0.14.0` (`MINOR`)

**Justification**: All changes are additive optional fields. The removal of `x-platform` from the schema is not a breaking change because it had no TypeScript counterpart and was not part of the typed public API. Per Constitution III, additive optional fields are a MINOR bump.

---

## Consequences

- All Figma-specific metadata across the schema follows a single pattern: `$extensions["com.figma"]`
- The `x-platform` pattern is eliminated, resolving the current type ↔ schema drift on `BooleanProp`
- Future Figma extensions (e.g., node IDs on elements, layer metadata) can be added under `com.figma` without introducing new top-level properties
- Other platforms can be supported via their own reverse-domain key (e.g., `com.sketch`, `io.penpot`) without schema restructuring
- Downstream transformers that currently emit `x-platform` must update to emit `$extensions` instead
