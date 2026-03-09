# ADR: Resolve `AnyProp` `oneOf` schema violation between `TextProp` and `IconProp`

**Branch**: `015-anyprop-oneOf-discrimination`
**Created**: 2026-03-09
**Status**: DRAFT
**Deciders**: Nathan Curtis (author), *(collaborators TBD)*
**Supersedes**: *(none)*

---

## Context

`AnyProp` in `schema/component.schema.json` uses `oneOf` to discriminate between five prop types:

```yaml
AnyProp:
  oneOf:
    - $ref: BooleanProp    # type: "boolean"
    - $ref: TextProp       # type: "string"
    - $ref: IconProp       # type: "string"  <-- identical shape to TextProp
    - $ref: EnumProp       # type: "string" + required enum[]
    - $ref: SlotProp       # type: "slot"
```

`TextProp` and `IconProp` have **identical schemas**: same `const` value for `type` (`"string"`), same optional fields (`default`, `nullable`, `examples`), same `required` array (`["type"]`), and same `additionalProperties: false`. The TypeScript interfaces in `types/Props.ts` are likewise identical except for their names and JSDoc comments.

Under JSON Schema `oneOf` semantics, a value must match **exactly one** branch. Any valid `TextProp` instance also validates against `IconProp` (and vice versa), producing two matches. This causes `oneOf` to **reject** the value — making every text or icon prop invalid according to the schema.

This is a violation of **Constitution IV** (Schema Validity Must Be Mechanically Verifiable).

---

## Decision Drivers

- **Schema validity (Constitution IV)**: The JSON schema must be valid and mechanically verifiable. A `oneOf` with two indistinguishable branches is structurally broken.
- **Type-schema symmetry (Constitution I)**: Changes to the schema must be reflected in the TypeScript types and vice versa.
- **Stable public API (Constitution III)**: `TextProp` and `IconProp` are individually exported from `types/index.ts`. Removing either is a breaking change to the type surface.
- **No logic in this package (Constitution II)**: The fix must remain purely declarative — types and schema only.
- **Minimal change**: Prefer the smallest structural change that restores schema validity.
- **Future divergence potential**: Text and icon props may evolve differently. Text examples are plain strings; icon examples may reference named assets, icon sets, or component references. A solution that forecloses future structural divergence incurs design debt.

---

## Options Considered

### Option A: Merge `TextProp` and `IconProp` into a single `StringProp`

Collapse both types into one `StringProp` since they are structurally identical. The `oneOf` would have four branches instead of five, each structurally distinct.

**Type changes**:
```yaml
# Before (types/Props.ts)
AnyProp: BooleanProp | TextProp | IconProp | EnumProp | SlotProp

TextProp:
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]

IconProp:
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]

# After
AnyProp: BooleanProp | StringProp | EnumProp | SlotProp

StringProp:
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]
```

**Schema changes**: Replace `TextProp` and `IconProp` definitions with a single `StringProp`; update `AnyProp.oneOf` to reference it.

**Pros**:
- Eliminates the `oneOf` violation cleanly — four branches, all structurally unique
- Reflects truth: the output shape genuinely has no text-vs-icon distinction *today*
- Simplest structural change to the schema

**Cons / Trade-offs**:
- **Breaking change**: Removes two exported types (`TextProp`, `IconProp`) from the public API and replaces them with `StringProp` — requires a MAJOR bump
- Erases the semantic intent that text props and icon props are conceptually different prop categories
- All downstream consumers must update import references
- **Forecloses divergence**: If text and icon props later need different shapes — e.g., icon `examples` items become asset references (`{ name: "check", set: "system-icons" }`) while text `examples` remain plain strings — the merged type would need to be re-split, incurring a second MAJOR bump. The merge optimizes for today's identical shape at the cost of a harder future separation.

---

### Option B: Add a `kind` discriminator property

Add a required `kind` field with a `const` value to each prop type, making them structurally distinguishable.

**Type changes**:
```yaml
# After
TextProp:
  kind: "text"        # const — new required field
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]

IconProp:
  kind: "icon"        # const — new required field
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]
```

**Schema changes**: Add `kind` as a required `const` property to both `TextProp` and `IconProp` definitions.

**Pros**:
- Preserves the semantic distinction between text and icon props
- Both existing type names survive — no breaking rename
- Standard JSON Schema discrimination pattern
- **Supports future divergence**: Once `kind` is in place, `TextProp` and `IconProp` can evolve independently (e.g., icon-specific `examples` item shapes, text-specific formatting hints) without another breaking change to the discrimination mechanism

**Cons / Trade-offs**:
- Adds a new required field to the output — all producers must emit `kind`, all consumers must handle it
- Breaking change if `kind` is required (existing valid output lacks it), or weakens the schema if optional
- Adds structural overhead for a distinction that no current consumer acts on at the output level
- Introduces a field whose sole purpose is schema discrimination — it carries no domain meaning beyond "this is a text prop" vs "this is an icon prop"

---

### Option C: Replace `oneOf` with `anyOf` on `AnyProp`

Switch `AnyProp` from `oneOf` (exactly one match) to `anyOf` (at least one match). Multiple matching branches would no longer cause a validation failure.

**Schema changes**:
```yaml
# Before
AnyProp:
  oneOf: [BooleanProp, TextProp, IconProp, EnumProp, SlotProp]

# After
AnyProp:
  anyOf: [BooleanProp, TextProp, IconProp, EnumProp, SlotProp]
```

**Type changes**: None — TypeScript union semantics already behave like `anyOf`.

**Pros**:
- Zero-cost fix: one keyword change, no type changes, no downstream impact
- Preserves both type names and all existing shapes
- TypeScript union (`|`) already has `anyOf` semantics, so this aligns the schema with the type system
- **Keeps the door open**: If the shapes diverge later (e.g., icon examples become asset references), the types are already separate and the schema can be tightened back to `oneOf` once the shapes are naturally distinct — no breaking change needed at that point

**Cons / Trade-offs**:
- Weakens validation: `anyOf` permits ambiguous matches by design, which may mask future schema errors if other branches become overlapping
- Does not solve the underlying issue (identical shapes) — defers it
- Validators can no longer assert that exactly one prop type matched, reducing diagnostic precision
- **Bets on future divergence that may never happen**: If the shapes remain identical indefinitely, the two definitions stay redundant and the schema carries dead weight with no validation benefit

---

### Option D: Add an icon-specific structural property to `IconProp`

Introduce a property unique to `IconProp` (e.g., `iconSet`, `iconLibrary`, or `iconName`) that makes it structurally distinct from `TextProp`.

**Type changes**:
```yaml
# After
IconProp:
  type: "string"
  default?: string
  nullable?: boolean
  examples?: string[]
  iconSet?: string     # new optional field — icon library or collection name
```

**Schema changes**: Add the new property to `IconProp` definition only.

**Pros**:
- Preserves both type names and the semantic distinction
- Makes the shapes genuinely different, so `oneOf` works correctly
- Additive change — MINOR bump if the field is optional
- **Naturally accommodates divergence**: An icon-specific property like `iconSet` would carry real domain meaning. If icon `examples` later evolve to reference named assets, `iconSet` provides the namespace context those references need.

**Cons / Trade-offs**:
- Invents a property that no producer currently emits and no consumer currently reads — the field would be empty or absent in all current output
- Must justify that the new property represents a genuine shared concept (Constitution III) rather than a schema workaround
- **Does not actually fix `oneOf` if optional**: An always-absent optional field technically still allows both branches to match simultaneously. Only `required` + `const` fields reliably discriminate under `oneOf`. Making `iconSet` required would be a breaking change (MAJOR), defeating the MINOR advantage.
- If the divergence direction turns out to be something other than icon sets (e.g., icon examples become structured objects), this field may end up as dead weight alongside the actual differentiating property

---

## Decision

**No option selected.** This ADR is in DRAFT for collaborative review. The decision will be recorded after discussion with collaborators.

---

## Type <> Schema Impact

- **Symmetric**: All options maintain or restore type-schema symmetry
- **Current state**: The types and schema are symmetric in their brokenness — both define `TextProp` and `IconProp` with identical shapes. The fix must update both in tandem per Constitution I.

---

## Downstream Impact

| Consumer | Impact | Action required |
|----------|--------|-----------------|
| `anova-kit` | Depends on option selected — ranges from none (Option C) to recompile with updated type imports (Options A, B, D) | TBD after option selection |

---

## Semver Decision

**Depends on option selected**:

| Option | Bump | Rationale |
|--------|------|-----------|
| A (Merge into `StringProp`) | **MAJOR** | Removes two exported types — breaking change per Constitution III |
| B (Add `kind` discriminator) | **MAJOR** | Adds a required field to existing types — breaking for existing output |
| C (`anyOf` instead of `oneOf`) | **PATCH** | Schema-only keyword change, no type changes, no output shape change |
| D (Add icon-specific property) | **MINOR** | Additive optional field — non-breaking per Constitution III |

---

## Consequences

Outcomes common to all options:
- `AnyProp` schema validation will no longer reject valid prop instances
- Schema compliance with Constitution IV is restored
- Runtime validators consuming `component.schema.json` will produce correct results for text and icon props

Option-specific consequences are deferred until an option is selected.
