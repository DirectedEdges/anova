# ADR: Replace `effectStyleId` with `effects` — Add `Shadow` Type

**Branch**: `v0.11.0`
**Created**: 2026-02-24
**Status**: ACCEPTED
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

`@directededges/anova` currently exposes `effectStyleId?: Style` in the `Styles` type and the `StyleKey` union. In serialised output this key carries either a raw Figma style ID string or a `FigmaStyle` reference object. It provides no structure for the shadow values themselves — downstream consumers who need shadow geometry must look up the referenced style out-of-band.

`@directededges/anova-transformer` intends to enrich effect output in two ways:

1. When a node's effects come from a *named Figma style*, emit the existing `FigmaStyle` reference under the key `effects` (same data, new key name).
2. When a node has *inline drop shadows* (no named style), emit the full shadow geometry as a `Shadow[]` array under `effects`.

Both paths converge on one output key (`effects`) with a union value type. `effectStyleId` is removed entirely — no deprecation shim. This is a breaking change that requires a MAJOR bump.

Current `Styles` shape (abbreviated):

```yaml
# types/Styles.ts
Styles:
  effectStyleId?: Style          # carries string | FigmaStyle | null
  # ...all other style keys...
  # effects — ABSENT
```

---

## Decision Drivers

- **Type–schema sync**: Every type change must have a corresponding schema change in the same release. No drift between `types/` and `schema/` is permitted.
- **No runtime logic**: This package declares shapes only. No processing, evaluation, or conditional logic may be added.
- **Stable public API / MAJOR for breaking changes**: Removing `effectStyleId` from `Styles`, `StyleKey`, and schema breaks any consumer reading that key. A MAJOR version bump and migration note are required.
- **Minimal new surface**: New exports must serve a genuine consumer need. `Shadow` is required so downstream consumers can type-check `effects` output values; no other new types are exported.

---

## Options Considered

*(Pre-decided — no alternatives evaluated.)*

The decision to replace `effectStyleId` with `effects: FigmaStyle | Shadow[]` and to define `Shadow` as a flat interface was reached during feature planning for shadow effects support in downstream tooling. This ADR records the `anova` package type and schema changes required to declare that contract.

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|---|---|---|
| `types/Styles.ts` | Remove `effectStyleId?: Style` from `Styles`; add `effects?: FigmaStyle \| Shadow[]` | MAJOR (removal) |
| `types/Styles.ts` | Remove `'effectStyleId'` from `StyleKey` union; add `'effects'` | MAJOR (removal) |
| `types/Styles.ts` | Add `Shadow` interface (new export) | MINOR (additive) |
| `types/index.ts` | Export `Shadow` from `'./Styles.js'` | MINOR (additive) |

**`Shadow` interface** (`types/Styles.ts`):

```yaml
# New interface — added to types/Styles.ts
Shadow:
  visible: boolean                   # whether this shadow is active
  x: number | VariableStyle          # horizontal offset (px)
  y: number | VariableStyle          # vertical offset (px)
  blur: number | VariableStyle       # blur radius (px)
  spread: number | VariableStyle     # spread radius (px)
  color: string | VariableStyle      # #RRGGBBAA hex string, or VariableStyle reference
```

**`Styles` field change** (`types/Styles.ts`):

```yaml
# Before
Styles:
  effectStyleId?: Style              # string | boolean | number | null | VariableStyle | FigmaStyle | ...

# After
Styles:
  effects?: FigmaStyle | Shadow[]    # FigmaStyle when named style; Shadow[] when inline
  # effectStyleId — REMOVED
```

**`StyleKey` change** (`types/Styles.ts`):

```yaml
# Before
StyleKey: '...' | 'effectStyleId' | '...'

# After
StyleKey: '...' | 'effects' | '...'
# 'effectStyleId' — REMOVED
```

### Schema changes (`schema/`)

| File | Change | Bump |
|---|---|---|
| `schema/styles.schema.json` | Remove `effectStyleId` from `#/definitions/Styles/properties` | MAJOR (removal) |
| `schema/styles.schema.json` | Add `effects` property to `#/definitions/Styles/properties` | MAJOR (see above) |
| `schema/styles.schema.json` | Add `Shadow` definition to `#/definitions` | MINOR (additive) |
| `schema/styles.schema.json` | Add `EffectsStyleValue` definition to `#/definitions` | MINOR (additive) |

**`Shadow` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions
Shadow:
  type: object
  description: >
    A single evaluated drop shadow. Emitted as part of the effects array when
    inline shadows are present on a node.
  properties:
    visible:
      type: boolean
      description: Whether this shadow is active
    x:
      oneOf: [{ type: number }, { $ref: '#/definitions/VariableStyle' }]
      description: Horizontal offset in pixels
    y:
      oneOf: [{ type: number }, { $ref: '#/definitions/VariableStyle' }]
      description: Vertical offset in pixels
    blur:
      oneOf: [{ type: number }, { $ref: '#/definitions/VariableStyle' }]
      description: Blur radius in pixels
    spread:
      oneOf: [{ type: number }, { $ref: '#/definitions/VariableStyle' }]
      description: Spread radius in pixels
    color:
      oneOf:
        - { type: string, description: '#RRGGBBAA hex string' }
        - { $ref: '#/definitions/VariableStyle' }
      description: Shadow color
  required: [visible, x, y, blur, spread, color]
  additionalProperties: false
```

**`EffectsStyleValue` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions
EffectsStyleValue:
  description: >
    Effect style value. FigmaStyle when the node references a named effects style;
    Shadow array when effects are defined inline.
  oneOf:
    - { $ref: '#/definitions/FigmaStyle', description: Named effects style reference }
    - { type: array, items: { $ref: '#/definitions/Shadow' }, description: Inline drop shadows }
    - { type: null }
```

**`effects` property entry** (under `#/definitions/Styles/properties`):

```yaml
# Added to Styles properties
effects:
  $ref: '#/definitions/EffectsStyleValue'
  description: >
    Drop shadow output. FigmaStyle when the node references a named effects style;
    Shadow[] when effects are defined inline. effectStyleId — REMOVED.

# Removed from Styles properties:
# effectStyleId: { $ref: '#/definitions/StyleIdValue', description: 'Effect style reference' }
```

### Notes

- `Shadow` fields `x`, `y`, `blur`, `spread` allow `VariableStyle` in addition to `number` to support Figma variable bindings on those fields. In practice this is uncommon; the primary case is a raw number.
- `color` allows `string` (`#RRGGBBAA`) or `VariableStyle`. The alpha channel is always present in the hex encoding.
- `visible` is always `boolean` (no `VariableStyle` variant) — Figma does not support variable binding on the `visible` field of individual effect items.
- Inline effects always serialize as an array (`Shadow[]`), even when only one shadow is present. A single-element array is valid and expected.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes
- **Parity check**:
  - `Shadow` interface in `types/Styles.ts` ↔ `Shadow` definition in `schema/styles.schema.json`
  - `Styles.effects?: FigmaStyle | Shadow[]` ↔ `#/definitions/Styles/properties/effects` → `EffectsStyleValue`
  - `StyleKey` union member `'effects'` ↔ key present in `#/definitions/Styles/properties`
  - `effectStyleId` removed from `types/Styles.ts` ↔ `effectStyleId` removed from `#/definitions/Styles/properties`

---

## Downstream Impact

| Consumer | Impact | Action required |
|---|---|---|
| `anova-transformer` | **MAJOR** — serialised output key changes from `effectStyleId` to `effects`; must recompile against new types | Migrate all references from `effectStyleId` to `effects`; update processing to emit new output shape |
| `anova-kit` (CLI / MCP) | Recompile required; `effectStyleId` removed from type | If reading `styles.effectStyleId`, migrate to `styles.effects` |
| `anova-plugin` | Recompile required; `effectStyleId` removed from type | If reading `styles.effectStyleId`, migrate to `styles.effects` |

---

## Semver Decision

**Version bump**: `0.10.x → 0.11.0` (`MAJOR`)

**Justification**:
- `effectStyleId` is removed from `Styles`, `StyleKey`, and the JSON schema with no deprecation period — a breaking change for any consumer reading that key. Per constitution Principle III: *"Any change to an existing export is a breaking change and MUST follow semantic versioning rules."*
- The addition of `Shadow` interface and `effects` key is additive (MINOR on its own) but the removal forces MAJOR.

---

## Consequences

- Consumers can now represent fully specified drop shadow geometry in component spec output — `x`, `y`, `blur`, `spread`, `color` are all available as first-class typed fields.
- Consumers reading `styles.effectStyleId` will receive `undefined` after upgrading; they must migrate to `styles.effects`.
- When `styles.effects` is a `FigmaStyle`, the named style `id` and resolved `name` are available — identical data to the former `effectStyleId` output, under a new key.
- When `styles.effects` is a `Shadow[]`, each entry carries the full shadow geometry including variable-bound fields.
- Any JSON schema validation against `styles.schema.json` that previously passed `{ "effectStyleId": { "id": "..." } }` will fail after this change — consumers must revalidate against the new schema version.
- `Shadow` is now a first-class exported type; downstream consumers can import it directly: `import type { Shadow } from '@directededges/anova'`.
