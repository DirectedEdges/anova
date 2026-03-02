# ADR: Unified Token Reference Type — Replace `VariableStyle` and `FigmaStyle` with `TokenReference`

**Branch**: `v0.11.0/006-token-references`
**Created**: 2026-02-28
**Status**: DRAFT
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

`@directededges/anova` currently represents references to Figma variables and Figma named styles as two separate types within the `Style` union:

- `VariableStyle` — a Figma variable reference carrying `id`, `rawValue`, `name`, `variableName`, `collectionName`, `collectionId`
- `FigmaStyle` — a Figma named style reference carrying `id` and `name`

Current `Style` shape:

```yaml
# types/Styles.ts
Style: string | boolean | number | null | VariableStyle | FigmaStyle | ReferenceValue

VariableStyle:
  id: string                  # Figma variable UUID
  rawValue?: string | number | boolean
  name?: string
  variableName?: string       # e.g. "DS Color/Text/Primary"
  collectionName?: string     # e.g. "DS Color"
  collectionId?: string

FigmaStyle:
  id: string                  # Figma style UUID
  name?: string               # e.g. "Body/Medium"
```

> **`ReferenceValue` is not a token reference.** `ReferenceValue` — `{ "$ref": "#/props/{PropName}" }` — is a *prop binding*: it signals that a style property's value is driven by a component prop at runtime (e.g., `visible` driven by an `isVisible` prop). It is orthogonal to design token references and remains unchanged in the `Style` union.

Serialized output for a style property carrying a reference currently appears as either an object or a plain string, with no discriminator marking it as a reference vs a literal:

```
backgroundColor: { id: "VAR:123", variableName: "DS Color/Text/Primary" }
textStyleId: { id: "STY:456", name: "Body/Medium" }
```

## Problems

### Implicit reference kind

a property value may be a `VariableStyle`, a `FigmaStyle`, or a plain string literal. Consumers cannot distinguish a reference from a raw value without inspecting field shape. `FigmaStyle` and `VariableStyle` both look like objects with an `id` string but carry different semantics.

### Figma-biased field names

`variableName`, `collectionName`, `collectionId`, and `id` (a raw Figma UUID) are Figma API concepts with no equivalents in any platform-neutral token format. Output consumers (anova-kit CLI, platform adapters) cannot treat this representation as platform-independent.

### Expanding composite reference surface

`typography`, `effects`, and `gradient` properties now use named-style references (`FigmaStyle`) alongside their inline structured types (`Typography`, `EffectsGroup`, `GradientValue`). A fourth category — composites referenced by name — currently reuses `FigmaStyle`, which lacks a `$type` signal telling consumers what the reference resolves to. Additionally, inline composite values (`GradientStop.color`, `Blur.radius`, all variable-bindable `Typography` sub-fields) use `VariableStyle` at the leaf level — the same Figma-biased shape described in point 2, requiring the same replacement.

The [W3C Design Tokens Community Group format module](https://www.designtokens.org/tr/2025.10/format/) (Candidate Recommendation, published 28 October 2025, considered stable and intended for implementation) identifies tokens by path, not by source-tool ID, and reserves `$`-prefixed keys for standard semantics. Figma-specific metadata belongs in a `$extensions` block per that convention, with keys in reverse domain name notation (§5.2.3). Anova output should be structurally compatible with that direction rather than mirroring Figma internals.

### Compact output and human readability

A full `TokenReference` object (`{ $token: "DS Color.Text.Primary", $type: "color" }`) is more verbose than the current flat string representation. This is an intentional trade-off: the structured object makes the token type explicit and is machine-parseable without heuristics. A "simplified" profile — where the transformer emits just the `$token` string instead of the full object — is a valid serialization option for human-readable audit output. That serialization choice belongs in `anova-transformer`'s output configuration, not in the type contract. `TokenReference` defines the canonical typed shape; simplified string output is a projection of it.

---

## Decision Drivers

- **Type–schema sync**: Every type change must have a corresponding schema change. No drift between `types/` and `schema/` is permitted (Constitution I).
- **No runtime logic**: This package declares shapes only. No processing or conditional logic may be added (Constitution II).
- **Stable public API — MAJOR for breaking changes**: Removing or restructuring `VariableStyle` and `FigmaStyle` breaks consumers that type-check against them. A MAJOR version bump is required (Constitution III).
- **Platform-independent output**: Reference representation must not require consumers to understand Figma variable collections or style IDs to extract a token path.
- **Explicit type discrimination**: The resolved token type (`color`, `typography`, `shadow`, `effects`, etc.) must be statically identifiable without field-shape inspection, using DTCG `$type` semantics.
- **Design tokens format alignment**: Reference paths and metadata placement should follow the DTCG convention — `$`-prefixed keys for standard fields, `$extensions` for tool-specific data.
- **Minimal new surface**: New types must represent a genuine shared concept. `TokenReference` replaces two types with one; no net surface expansion.

---

## Options Considered

### Option A: Retain `VariableStyle` and `FigmaStyle` as-is *(Rejected)*

Keep both types unchanged. Accept the current dual-type representation for the foreseeable future.

**Rejected because**:
- `VariableStyle` and `FigmaStyle` have structurally identical shapes (`{ id: string, name?: string }`) with no discriminator — consumers must distinguish them by which property they appear on, which is fragile
- `variableName`, `collectionName`, `collectionId` are Figma-internal metadata with no platform-neutral equivalent; they cannot be mapped to token paths without Figma-specific parsing logic
- Composite named references (`effects`, `typography`) are currently typed as `FigmaStyle` even though they resolve to structured shapes — the absence of a `$type` signal creates ambiguity that will only compound as more composite types are added
- The platform-independence driver is structurally unsatisfiable without replacing the Figma-centric field set

---

### Option B: `TokenReference` — unified discriminated reference with DTCG-aligned extensions *(Selected)*

Introduce a single `TokenReference` interface with a `$type` discriminator using DTCG token type values, a `$token` path field, and Figma-specific metadata isolated in `$extensions["com.figma"]`. Replace all uses of `VariableStyle` and `FigmaStyle` in `Style`, `ColorStyle`, and composite property types with `TokenReference`. Deprecate and eventually remove `VariableStyle` and `FigmaStyle` from the public API.

```yaml
# Option B — new shape
TokenReference:
  $token: string                  # DTCG dot-path, e.g. "DS Color.Text.Primary"; usable directly as DTCG alias {DS Color.Text.Primary}
  $type: color | dimension | string | number | boolean
       | shadow | gradient | typography
       | effects                   # Anova-extended: named reference to an EffectsGroup (multi-shadow + blur); no DTCG equivalent
  $extensions?:
    "com.figma":                  # reverse domain name per DTCG §5.2.3
      id: string                  # Figma variable or style UUID
      name?: string               # Figma name within collection, e.g. "Text/Primary"
      collectionName?: string     # Figma collection name, e.g. "DS Color" (variables only)
      rawValue?: string | number | boolean  # value resolved by Figma at extraction time; no DTCG equivalent

Style: string | boolean | number | null | TokenReference | ReferenceValue

ColorStyle: HexColor | TokenReference | ReferenceValue | GradientValue | null
# HexColor = string (see Color strong-typing note in Decision section)
```

**Pros**:
- Single reference type — no ambiguity between variable and named-style references
- `$type` uses DTCG token type semantics — values describe what the token resolves to (`color`, `typography`, `shadow`, etc.) rather than how Figma stores it (`variable`, `style`, `composite`); this is platform-neutral by definition
- `$type: "effects"` is the only non-DTCG value; it is explicitly documented as an Anova extension for `EffectsGroup` references (multi-shadow + blur) that have no standard DTCG composite equivalent
- The Figma variable vs. named-style origin is fully captured by `$extensions["com.figma"]` — the presence of `collectionName` distinguishes a variable reference from a named-style reference without a top-level Figma-taxonomy field
- `$token` path is platform-neutral; `variableName`/`collectionName`/`collectionId` are retired
- Figma UUID is namespaced under `$extensions["com.figma"]`, consistent with DTCG §5.2.3 reverse domain name notation for tool-specific metadata
- `$extensions` key is open for other tool namespaces without changing the top-level contract

**Cons / Trade-offs**:
- MAJOR break: `VariableStyle` and `FigmaStyle` are referenced throughout `anova-transformer` and `anova-kit`; both packages must update after this is published
- `$token`, `$type`, and `$extensions` use `$` prefixes — unconventional in TypeScript interfaces but intentional for DTCG alignment
- `"effects"` deviates from DTCG `$type` values; this must be explicitly documented as an extension
- Full object form is more verbose than a plain string; compact output is a transformer concern, not a type contract concern (see Context above)

---

### Option C: Additive `StyleReference` union alias over existing types *(Rejected)*

Add a `kind` field to both `VariableStyle` (`kind: "variable"`) and `FigmaStyle` (`kind: "style"`) and export a union alias `StyleReference = VariableStyle | FigmaStyle`. Update `Style` to include `StyleReference` alongside the existing members.

**Rejected because**:
- Retains all Figma-biased field names (`variableName`, `collectionName`, `collectionId`, Figma `id`)
- Platform-independence driver is not satisfied — consumers must still parse Figma-internal metadata to extract a usable token path
- `StyleReference` is syntactic sugar over an unchanged Figma-specific contract

---

### Option D: String-only token reference `{ $token: string }` without `$type` *(Rejected)*

Use a minimal shape `{ $token: string }` for all references (variables, styles, composites), omitting the `$type` discriminator and `$extensions`.

**Rejected because**:
- Without `$type`, consumers cannot determine what shape a resolved token value takes without out-of-band knowledge (e.g., cannot distinguish a `color` token from a `dimension` token or an `effects` composite)
- The implicit-reference-kind problem (driver 3 in Context) is only partially resolved
- References to `EffectsGroup` and `Typography` composites require explicit `$type` discrimination so consumers know to expect a structured shape, not a scalar

---

## Decision

### Color strong-typing and DTCG alignment

`ColorStyle` uses `string` as the arm for raw hex color values (e.g., `"#FF0000AA"`). Per the [DTCG Color Module §4.1](https://www.designtokens.org/tr/2025.10/color/#format) (stable), the canonical color value is a structured object:

```yaml
# DTCG Color Module §4.1 — canonical color value shape
# colorSpace: one of "srgb", "hsl", "oklch", etc.
# components: numeric array for the given color space
# alpha: 0–1, default 1 (fully opaque) if omitted
# hex: optional fallback — 6-digit #RRGGBB only (NOT 8-digit; alpha is stored separately)
{
  colorSpace: "srgb",
  components: [1, 0, 0],
  alpha: 0.5,
  hex: "#ff0000"
}
```

**Canonical vs compact in Anova**:
- **Canonical form** — `$extensions["com.figma"].rawValue` records the scalar value Figma resolved at extraction time (e.g. `"#FF0000FF"` for a color variable). It is Figma extraction provenance, not a DTCG field. The full DTCG color object `{ colorSpace, components[], alpha?, hex? }` would require a richer type for `rawValue`; that expansion is deferred to a follow-up change.
- **Compact/simplified form** — the “hex-alpha” string `#RRGGBBAA`, which encodes the DTCG `hex` field plus alpha in a single 8-digit value. This is what Anova currently emits and what compact output projects to. Note: DTCG stores `hex` and `alpha` separately; Anova compact combines them for human-readable brevity.

| Concept | Anova canonical (`DTCG`) | Anova compact (`COMPACT`) | DTCG equivalent |
|---------|--------------------------|---------------------------|-----------------|
| Variable color reference | `{ $token: "DS Color.Text.Primary", $type: "color", $extensions: { "com.figma": { id: "VAR:123", name: "Text/Primary", collectionName: "DS Color" } } }` | `"DS Color.Text.Primary"` | `{DS Color.Text.Primary}` |
| Named text style reference | `{ $token: "Body.Medium", $type: "typography", $extensions: { "com.figma": { id: "STY:456", name: "Body/Medium" } } }` | `"Body.Medium"` | `{Body.Medium}` |
| Raw hex color | `"#FF0000FF"` | `"#FF0000FF"` | `{ colorSpace: "srgb", components: [1,0,0], alpha: 1, hex: "#ff0000" }` |
| Color via variable | `{ $token: "DS Color.Text.Primary", $type: "color", $extensions: { "com.figma": { id: "VAR:123", name: "Text/Primary", collectionName: "DS Color", rawValue: "#FF0000FF" } } }` | `"DS Color.Text.Primary"` | `{DS Color.Text.Primary}` |

> ⚠️ **See ADR 007 — `007-token-reference-config.md`**: The `DTCG`/`COMPACT` split above is addressed by `Config.format.tokens: 'DTCG' | 'DTCG_COMPACT' | 'FIGMA' | 'FIGMA_COMPACT' | 'CUSTOM'`, retiring `format.simplifyVariables`, `format.simplifyStyles`, and `format.variables`. It is a MAJOR break to `Config` bundled into `v0.11.0` alongside this ADR.

The schema `string` arm for `ColorStyleValue` is strengthened with a pattern constraint matching the compact form:

```yaml
# schema/styles.schema.json — ColorStyleValue string arm (compact hex form)
{
  "type": "string",
  "pattern": "^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$",
  "description": "Compact color: #RRGGBB or #RRGGBBAA (Anova compact form). Canonical form per DTCG Color Module §4.1 is the color object."
}
```

The TypeScript type retains `string` (branded types are not appropriate in a pure-declaration package), but the schema gains machine-verifiable color validation. This is additive to `ColorStyle` and does not affect the `TokenReference` replacement. Full DTCG color object support in `$extensions["com.figma"].rawValue` is a follow-up change.

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| `Styles.ts` | Add `TokenReference` interface | MINOR (additive) |
| `Styles.ts` | Replace `VariableStyle \| FigmaStyle` in `Style` with `TokenReference` | MAJOR (breaking) |
| `Styles.ts` | Replace `VariableStyle \| FigmaStyle` in `ColorStyle` with `TokenReference` | MAJOR (breaking) |
| `Styles.ts` | Mark `VariableStyle` as `@deprecated` | MAJOR |
| `Styles.ts` | Mark `FigmaStyle` as `@deprecated` | MAJOR |
| `Styles.ts` | Replace `FigmaStyle` in `effects: FigmaStyle \| EffectsGroup` with `TokenReference` | MAJOR (breaking) |
| `Styles.ts` | Replace `FigmaStyle` in `typography: FigmaStyle \| Typography` with `TokenReference` | MAJOR (breaking) |
| `Effects.ts` | Rename `Shadow.x` → `Shadow.offsetX` | MAJOR (breaking) |
| `Effects.ts` | Rename `Shadow.y` → `Shadow.offsetY` | MAJOR (breaking) |
| `Effects.ts` | Add `Shadow.inset?: boolean` | MINOR (additive) |
| `Effects.ts` | Replace `VariableStyle` in `Shadow` field types with `TokenReference` | MAJOR (breaking) |
| `Effects.ts` | Merge `EffectsGroup.dropShadows?: Shadow[]` and `EffectsGroup.innerShadows?: Shadow[]` into `EffectsGroup.shadows?: Shadow[]` | MAJOR (breaking) |
| `Effects.ts` | Replace `VariableStyle` in `Blur.radius` field type with `TokenReference` | MAJOR (breaking) |
| `Gradient.ts` | Replace `VariableStyle` in `GradientStop.color` field type with `TokenReference` | MAJOR (breaking) |
| `Styles.ts` | Replace `VariableStyle` in `Typography` sub-field types (`fontSize`, `letterSpacing`, `lineHeight`, `textCase`, `textDecoration`, `paragraphIndent`, `paragraphSpacing`, `leadingTrim`, `listSpacing`, `hangingPunctuation`, `hangingList`) with `TokenReference` | MAJOR (breaking) |

**Example — current vs new shape** (`types/Styles.ts`):

```yaml
# Before
VariableStyle:
  id: string
  rawValue?: string | number | boolean
  name?: string
  variableName?: string
  collectionName?: string
  collectionId?: string

FigmaStyle:
  id: string
  name?: string

Style: string | boolean | number | null | VariableStyle | FigmaStyle | ReferenceValue

ColorStyle: string | VariableStyle | FigmaStyle | ReferenceValue | GradientValue | null

# After
TokenReference:
  $token: string       # DTCG dot-path, e.g. "DS Color.Text.Primary" or "Body.Medium"
  $type: "color" | "dimension" | "string" | "number" | "boolean"
       | "shadow" | "gradient" | "typography"
       | "effects"   # Anova-extended: EffectsGroup reference (multi-shadow + blur)
  $extensions?:
    "com.figma":       # reverse domain name per DTCG §5.2.3
      id: string       # Figma UUID
      name?: string    # Figma name within collection, e.g. "Text/Primary"
      collectionName?: string  # Figma collection, e.g. "DS Color" (variables only)
      rawValue?: string | number | boolean  # value resolved by Figma at extraction time

Style: string | boolean | number | null | TokenReference | ReferenceValue

ColorStyle: string | TokenReference | ReferenceValue | GradientValue | null
# string arm: hex color "#RRGGBB" or "#RRGGBBAA" — pattern-constrained in schema only
```

**Composite property example** (effects and typography):

```yaml
# Before
effects: FigmaStyle | EffectsGroup
#   FigmaStyle { id: "STY:789", name: "Elevation/Shadow/Card" }
#   EffectsGroup { shadows: [...], blur: ... }

typography: FigmaStyle | Typography
#   FigmaStyle { id: "STY:456", name: "Body/Medium" }
#   Typography { fontSize: 14, lineHeight: "150%", ... }

# After
effects: TokenReference | EffectsGroup
#   TokenReference { $token: "Elevation.Shadow.Card", $type: "effects", $extensions: { "com.figma": { id: "STY:789", name: "Elevation/Shadow/Card" } } }
#   EffectsGroup { shadows: [...], blur: ... }

typography: TokenReference | Typography
#   TokenReference { $token: "Body.Medium", $type: "typography", $extensions: { "com.figma": { id: "STY:456", name: "Body/Medium" } } }
#   Typography { fontSize: 14, lineHeight: "150%", ... }
```

**Simplified (compact) output projection** *(transformer concern — shown here for clarity)*:

```yaml
# Full TokenReference form (canonical spec output)
backgroundColor:
  $token: "DS Color.Text.Primary"
  $type: color
  $extensions:
    "com.figma":
      id: "VAR:123"
      name: "Text/Primary"
      collectionName: "DS Color"

# Simplified form (human-readable audit view — emitted by transformer when compact mode enabled)
backgroundColor: "DS Color.Text.Primary"
```

### Shadow shape alignment (DTCG §9.6)

Anova’s `Shadow` interface in `types/Effects.ts` uses `x` and `y` for offset fields. The [DTCG Format Module §9.6](https://www.designtokens.org/tr/2025.10/format/#shadow) (stable) defines the shadow composite with `offsetX` and `offsetY`. This ADR includes renaming these fields for DTCG alignment.

```yaml
# Before (types/Effects.ts — Shadow)
Shadow:
  visible: boolean
  x: number | VariableStyle      # horizontal offset
  y: number | VariableStyle      # vertical offset
  blur: number | VariableStyle
  spread: number | VariableStyle
  color: string | VariableStyle
  # inset: not present

# After
Shadow:
  visible: boolean
  offsetX: number | TokenReference   # renamed to match DTCG §9.6
  offsetY: number | TokenReference   # renamed to match DTCG §9.6
  blur: number | TokenReference
  spread: number | TokenReference
  color: string | TokenReference
  inset?: boolean                    # added: inner shadow flag per DTCG §9.6
```

**Notes on remaining DTCG §9.6 divergence**:
- DTCG defines `offsetX`, `offsetY`, `blur`, `spread` as dimension objects `{ value: number, unit: "px" | "rem" }`. Anova uses `number` (unitless, assumed `px`). Full dimension-unit alignment is deferred to a separate ADR; only the field rename is included in `v0.11.0`.
- DTCG defines shadow `color` as a DTCG color object. Anova currently uses `string` (8-digit hex) or `TokenReference`. Full color-object alignment follows from the color section above (deferred).

### Gradient stop, blur, and typography inline sub-fields

Beyond the named-style replacements above, `VariableStyle` also appears inside inline composite values wherever individual sub-fields can be variable-bound in Figma:

```yaml
# Before — VariableStyle in inline sub-fields
GradientStop:
  position: number
  color: string | VariableStyle      # variable-bound stop color

Blur:
  visible: boolean
  radius: number | VariableStyle      # variable-bound blur radius

Typography:
  fontSize: number | VariableStyle
  letterSpacing: number | VariableStyle
  lineHeight: string | number | VariableStyle
  textCase: string | VariableStyle
  textDecoration: string | VariableStyle
  paragraphIndent: number | VariableStyle
  # ... (all variable-bindable sub-fields follow the same pattern)

# After — TokenReference replaces VariableStyle in all inline sub-fields
GradientStop:
  position: number
  color: string | TokenReference      # $type: "color"

Blur:
  visible: boolean
  radius: number | TokenReference     # $type: "dimension"

Typography:
  fontSize: number | TokenReference
  letterSpacing: number | TokenReference
  lineHeight: string | number | TokenReference
  textCase: string | TokenReference
  textDecoration: string | TokenReference
  paragraphIndent: number | TokenReference
  # ... (all variable-bindable sub-fields follow the same pattern)
```

This is distinct from the named-style `FigmaStyle` → `TokenReference` replacements for `effects` and `typography` properties: those operate at the *property* level (the whole value is a reference). These sub-field replacements operate at the *leaf* level — the inline composite is present, but one or more of its constituent values is variable-bound.

**Notes**:
- `GradientStop.color` with `$type: "color"` carries the token path for the color variable; `$extensions["com.figma"].rawValue` holds the resolved hex string captured at Figma extraction time.
- `Blur.radius` with `$type: "dimension"` follows the same pattern as `Shadow` offset/blur/spread fields.
- `Typography` sub-field `VariableStyle` arms are fully replaced. Sub-fields with no `VariableStyle` arm (e.g., `fontFamily`) are unchanged.

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `styles.schema.json` | Add `TokenReference` definition | MINOR (additive) |
| `styles.schema.json` | Replace all `{ "$ref": "#/definitions/VariableStyle" }` and `{ "$ref": "#/definitions/FigmaStyle" }` references in `oneOf` arrays with `{ "$ref": "#/definitions/TokenReference" }` | MAJOR (breaking) |
| `styles.schema.json` | Mark `VariableStyle` and `FigmaStyle` definitions as `deprecated: true` with `description` notes | MAJOR |
| `styles.schema.json` | Update `EffectsStyleValue` oneOf: replace `FigmaStyle` with `TokenReference` | MAJOR |
| `styles.schema.json` | Update `TypographyStyleValue` oneOf: replace `FigmaStyle` with `TokenReference` | MAJOR |
| `styles.schema.json` | Add hex color `pattern` constraint + `description` referencing DTCG Color Module §4.1 to the `string` arm of `ColorStyleValue` | MINOR (additive constraint) |
| `styles.schema.json` | Rename `Shadow.x` → `Shadow.offsetX` and `Shadow.y` → `Shadow.offsetY` in the `Shadow` definition | MAJOR (breaking) |
| `styles.schema.json` | Add `Shadow.inset` optional boolean to the `Shadow` definition | MINOR (additive) |
| `styles.schema.json` | Merge `dropShadows` and `innerShadows` into `shadows` in the `EffectsGroup` definition | MAJOR (breaking) |
| `styles.schema.json` | Update `Blur.radius` oneOf: replace `{ "$ref": "#/definitions/VariableStyle" }` with `{ "$ref": "#/definitions/TokenReference" }` | MAJOR (breaking) |
| `styles.schema.json` | Update `GradientStop.color` oneOf: replace `{ "$ref": "#/definitions/VariableStyle" }` with `{ "$ref": "#/definitions/TokenReference" }` | MAJOR (breaking) |
| `styles.schema.json` | Update all `VariableStyle` references in `Typography` definition's sub-field `oneOf` arrays with `{ "$ref": "#/definitions/TokenReference" }` (affects `fontSize`, `letterSpacing`, `lineHeight`, `textCase`, `textDecoration`, `paragraphIndent`, `paragraphSpacing`, `leadingTrim`, `listSpacing`, `hangingPunctuation`, `hangingList`) | MAJOR (breaking) |

**Example — new `TokenReference` definition** (`schema/styles.schema.json`):

```yaml
# New definition under #/definitions/TokenReference
TokenReference:
  type: object
  description: "Platform-neutral token reference. Replaces VariableStyle and FigmaStyle."
  required: [ "$token", "$type" ]
  properties:
    $token:
      type: string
      description: "DTCG dot-separated token path, e.g. 'DS Color.Text.Primary'. Usable directly as DTCG alias {DS Color.Text.Primary}."
    $type:
      type: string
      enum: [ "color", "dimension", "string", "number", "boolean",
              "shadow", "gradient", "typography",
              "effects" ]
      description: "DTCG token type. Standard values per DTCG Format Module §9; 'effects' is an Anova extension for EffectsGroup references (multi-shadow + blur composite) with no DTCG equivalent."
    $extensions:
      type: object
      description: "Tool-specific metadata per DTCG §5.2.3 $extensions convention (reverse domain name notation)"
      properties:
        "com.figma":
          type: object
          properties:
            id:
              type: string
              description: "Figma variable or style UUID"
            name:
              type: string
              description: "Figma name within collection, e.g. 'Text/Primary'"
            collectionName:
              type: string
              description: "Figma collection name, e.g. 'DS Color' (variables only)"
            rawValue:
              oneOf:
                - type: string
                - type: number
                - type: boolean
              description: "Value resolved by Figma at extraction time. No DTCG equivalent; Figma extraction provenance only."
          required: [ "id" ]
          additionalProperties: false
      additionalProperties: true   # open for other tool namespaces
  additionalProperties: false
```

**Example — updated `StyleValue` oneOf** (`schema/styles.schema.json`):

```yaml
# Before (within StyleValue/oneOf)
- { "$ref": "#/definitions/VariableStyle" }
- { "$ref": "#/definitions/FigmaStyle" }

# After
- { "$ref": "#/definitions/TokenReference" }
```

**Example — strengthened `ColorStyleValue` string arm** (`schema/styles.schema.json`):

```yaml
# Before
- { "type": "string" }

# After
- { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$",
    "description": "Hex color value: #RRGGBB or #RRGGBBAA" }
```

### Notes

- **Platform consumer API surface**: `$token` and `$type` are the only fields a platform adapter needs to process a `TokenReference`. `$token` provides the DTCG alias path for token lookup or variable-name generation; `$type` determines how the resolved value is formatted for the target platform. `$extensions["com.figma"]` is Figma extraction provenance — useful for tooling, round-tripping, and audit trails — but not required for platform code generation. A consumer with no knowledge of Figma can act on `{ $token, $type }` alone.
- `$type` values map directly to [DTCG Format Module §9](https://www.designtokens.org/tr/2025.10/format/#types) token types for all standard Anova tokens. `"effects"` is the sole Anova-defined extension: no DTCG composite type covers a collection of shadow layers plus a blur (an `EffectsGroup`). The DTCG spec explicitly permits implementation-defined `$type` values outside those it standardizes; `"effects"` must be documented as non-portable.
- The Figma variable vs. named-style distinction is fully encoded in `$extensions["com.figma"]`: the presence of `collectionName` identifies a variable reference; its absence identifies a named-style reference. Neither distinction needs a top-level field.
- `rawValue` moves from the top level of `TokenReference` into `$extensions["com.figma"]`. It is the scalar value Figma resolved at extraction time (e.g. the hex string for a color variable). It has no DTCG equivalent — DTCG does not model a cached resolved value on an alias. Placing it in `$extensions["com.figma"]` correctly signals that it is Figma extraction metadata, not part of the platform-neutral contract.
- `$token`, `$type`, and `$extensions` use the `$` prefix to signal alignment with DTCG standard fields. This is consistent with `$ref` on `ReferenceValue`.
- **`$token` stores DTCG dot-paths directly**: `$token` values use `.` as the segment separator per DTCG alias syntax ([Format §7.1.1](https://www.designtokens.org/tr/2025.10/format/#curly-brace-syntax-token-references)). The original Figma slash-path is preserved in `$extensions["com.figma"].name` (and `collectionName` for variables). Consumers can use `$token` as a DTCG alias path without any transformation.

  | `$token` | DTCG alias | Figma origin |
  |----------|-----------|-------|
  | `"DS Color.Text.Primary"` | `{DS Color.Text.Primary}` | collection `"DS Color"`, name `"Text/Primary"` |
  | `"Body.Medium"` | `{Body.Medium}` | style name `"Body/Medium"` |
  | `"Elevation.Shadow.Card"` | `{Elevation.Shadow.Card}` | style name `"Elevation/Shadow/Card"` |

- Figma UUIDs move from top-level `id` to `$extensions["com.figma"].id`, following the DTCG §5.2.3 convention that tool-specific metadata belongs in `$extensions` with reverse domain name notation (e.g., `"org.example.tool-a"`). The key `"com.figma"` is the correct reverse-domain form for Figma.
- `VariableStyle` and `FigmaStyle` are retained as `@deprecated` exports in `v0.11.0` to allow downstream packages a migration window before removal in the subsequent MAJOR release.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes
- **Parity check**:
  - `TokenReference` in `types/Styles.ts` maps to `#/definitions/TokenReference` in `schema/styles.schema.json`
  - `Style` union changes are reflected in `StyleValue` oneOf in `schema/styles.schema.json`
  - `ColorStyle` union changes are reflected in `ColorStyleValue` oneOf in `schema/styles.schema.json`
  - `effects: TokenReference | EffectsGroup` maps to `EffectsStyleValue` oneOf
  - `typography: TokenReference | Typography` maps to `TypographyStyleValue` oneOf
  - `VariableStyle` and `FigmaStyle` are marked deprecated in both `types/` and `schema/`
  - Hex color pattern constraint is schema-only (no TypeScript change — `string` arm retained as-is)
  - `Shadow.x`/`Shadow.y` renames to `Shadow.offsetX`/`Shadow.offsetY` in `types/Effects.ts` map to the same renames in the `Shadow` definition in `schema/styles.schema.json`
  - `Shadow.inset` addition and the `EffectsGroup.dropShadows`/`innerShadows` → `shadows` merge are reflected in both `types/Effects.ts` and `schema/styles.schema.json`
  - `Blur.radius` `VariableStyle` → `TokenReference` replacement in `types/Effects.ts` maps to the `Blur` definition in `schema/styles.schema.json`
  - `GradientStop.color` `VariableStyle` → `TokenReference` replacement in `types/Gradient.ts` maps to the `GradientStop` definition in `schema/styles.schema.json`
  - `Typography` sub-field `VariableStyle` → `TokenReference` replacements in `types/Styles.ts` map to the `Typography` definition in `schema/styles.schema.json`

---

## Downstream Impact

| Consumer | Impact | Action required |
|----------|--------|-----------------|
| `anova-kit` | Recompile; update any code reading `VariableStyle`- or `FigmaStyle`-shaped objects, shadow offset fields, `dropShadows`/`innerShadows` keys, gradient stop colors, blur radius, or typography sub-fields | Replace reads of `variableName`, `collectionName`, `id` (style name) with `$token` and `$type` checks; Figma UUID now at `$extensions["com.figma"].id`; variable vs. named-style origin: check presence of `$extensions["com.figma"].collectionName`; shadow offsets: `.x`/`.y` → `.offsetX`/`.offsetY`; shadow role: `dropShadows`/`innerShadows` → `shadows.filter(s => !s.inset)` / `shadows.filter(s => s.inset)`; gradient stop `.color` and blur `.radius` now `string \| TokenReference`; typography sub-fields (`fontSize`, `letterSpacing`, etc.) now `number \| TokenReference` where previously `number \| VariableStyle` |

---

## Semver Decision

**Version bump**: Incorporated into `v0.11.0` (`MAJOR`)

**Justification**: Removing `VariableStyle` and `FigmaStyle` from the `Style` and `ColorStyle` union types, from `effects` and `typography` property types, and renaming `Shadow.x`/`Shadow.y` to `Shadow.offsetX`/`Shadow.offsetY` all break consumers that type-check against those interfaces. Per Constitution III: "Removing or renaming an exported type or a named field within a type is a breaking change and MUST follow semantic versioning." This change is batched into `v0.11.0`, which carries MAJOR character, consistent with the typography composite change (ADR 005) already accepted in this release.

---

## Consequences

- All style property values that reference a design token (variable or named style) carry an explicit `$type` discriminator using DTCG token type semantics, eliminating implicit type ambiguity. The Figma variable vs. named-style origin is encoded solely in `$extensions["com.figma"]`.
- The `$token` path field stores a DTCG dot-path (e.g. `"DS Color.Text.Primary"`) usable directly as a DTCG alias. The original Figma slash-path is recoverable from `$extensions["com.figma"].collectionName` and `name`.
- Figma UUIDs are namespaced under `$extensions["com.figma"].id`, isolating Figma-specific metadata per DTCG §5.2.3 reverse domain name notation, opening the `$extensions` block to other tool namespaces without future breaking changes.
- `ReferenceValue` (`{ "$ref": "#/props/..." }`) remains unchanged — it is a prop binding, not a token reference, and continues to serve its distinct role in the `Style` union.
- Hex color values in `ColorStyle` gain schema-level pattern validation; TypeScript type is unchanged. Full DTCG color object support in `$extensions["com.figma"].rawValue` is deferred.
- `Shadow.x`/`Shadow.y` renamed to `Shadow.offsetX`/`Shadow.offsetY` per DTCG §9.6; `Shadow.inset?: boolean` added. `EffectsGroup.dropShadows` and `EffectsGroup.innerShadows` merged into a single `EffectsGroup.shadows?: Shadow[]` — `inset` on each item discriminates drop vs inner. Consumers reading `dropShadows`/`innerShadows` must update to `shadows.filter(s => !s.inset)` / `shadows.filter(s => s.inset)`.
- `Blur.radius`, `GradientStop.color`, and all variable-bindable `Typography` sub-fields (`fontSize`, `letterSpacing`, `lineHeight`, `textCase`, `textDecoration`, `paragraphIndent`, etc.) replace `VariableStyle` with `TokenReference` (carrying the appropriate `$type` for the resolved value — `"dimension"` for numeric offsets/radii, `"color"` for stop colors, etc.). Inline composite values (the `EffectsGroup`, `GradientValue`, and `Typography` objects themselves) are unchanged; only the leaf arms that previously accepted `VariableStyle` are updated.
- Compact string output for token references (`"DS Color.Text.Primary"` instead of the full object) is a valid projection for human-readable views, but is a transformer serialization concern — it does not change this type contract.
- `VariableStyle` and `FigmaStyle` remain as `@deprecated` exports in `v0.11.0` and are removed in the next MAJOR release.
- Any tool validating output against `schema/styles.schema.json` must update to the `v0.11.0` schema to pass validation after `anova-transformer` adopts the new reference shape.
