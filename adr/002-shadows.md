# ADR: Replace `effectStyleId` with `effects` — Add `Shadow`, `Blur`, and `EffectsGroup` Types

**Branch**: `v0.11.0`
**Created**: 2026-02-24
**Status**: ACCEPTED
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

`@directededges/anova` currently exposes `effectStyleId?: Style` in the `Styles` type and the `StyleKey` union. In serialised output this key carries either a raw Figma style ID string or a `FigmaStyle` reference object. It provides no structure for the shadow values themselves — downstream consumers who need shadow geometry must look up the referenced style out-of-band.

`@directededges/anova-transformer` intends to enrich effect output. When a node's effects come from a *named Figma style*, emit the existing `FigmaStyle` reference under the key `effects`. When effects are inline, emit resolved geometry under `effects`.

`effectStyleId` is removed entirely — no deprecation shim. This is a breaking change that requires a MAJOR bump.

However, Figma's effects model is **mixed-type and order-dependent**: a single node can carry drop shadows, inner shadows, a layer blur, and a background blur simultaneously, in any order. A flat array forces downstream consumers to filter by type and understand Figma render-order semantics before they can use any value. This is a poor contract for web, iOS, and Android, where each effect type maps to a **distinct platform property** with no overlap:

| Effect type | Web | iOS | Android |
|---|---|---|---|
| Drop shadow | `box-shadow` | `.shadow()` | `elevation` / custom |
| Inner shadow | `box-shadow inset` | No native equivalent | No native equivalent |
| Layer blur | `filter: blur()` | `.blur()` | `RenderEffect` (API 31+) |
| Background blur | `backdrop-filter: blur()` | `.ultraThinMaterial` | Limited support |

Because each effect type maps to a wholly independent platform property, **cross-type render order is never meaningful to consumers**:

- On Web, `box-shadow`, `filter: blur()`, and `backdrop-filter: blur()` are separate CSS properties. Their relative order in Figma's effect stack has no bearing on how they composite.
- CSS itself re-sorts shadow values: all non-inset (`drop`) values are rendered before `inset` values regardless of declaration order, so inter-type ordering within shadow groups is also irrelevant at the CSS layer.
- On iOS and Android, each effect binds to an independent modifier or render property. There is no shared stack.

**Within a type, order does matter**: multiple drop shadows or inner shadows stack in the order they are declared (`box-shadow: A, B` differs visually from `box-shadow: B, A`). This ordering is preserved inside each array in `EffectsGroup` (`dropShadows[]`, `innerShadows[]`). No cross-group ordering mechanism is needed.

The shape of `effects` must be decided with cross-platform translation in mind, not only Figma fidelity.

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
- **Minimal new surface**: New exports must serve a genuine consumer need. `Shadow`, `Blur`, and `EffectsGroup` are required so downstream consumers can type-check `effects` output values; no other new types are exported.
- **Platform-unbiased output**: The `effects` contract must not require consumers to understand Figma render-order semantics to extract values. Each effect role must be accessible via a predictable, named key.

---

## Options Considered

### Option A — Flat union `FigmaStyle | Shadow[]` *(rejected)*

`effects` carries either a `FigmaStyle` reference or a homogeneous array of `Shadow` objects.

```yaml
# Option A
Styles:
  effects?: FigmaStyle | Shadow[]   # only drop shadows; inner shadows and blurs excluded
```

**Pros:**
- Minimal surface area for the drop-shadow-only case
- Simple to implement in the first iteration

**Cons:**
- Cannot represent inner shadows or blurs — the type must be revisited as soon as those effects are added, incurring another MAJOR bump
- Forces a second breaking change when the scope inevitably expands
- Does not satisfy the **platform-unbiased output** driver; consumers reading the array must still infer type from geometry context

---

### Option B — Discriminated union array `FigmaStyle | Effect[]` *(rejected)*

Define an `Effect` type with a `type` discriminant field. `effects` carries a flat mixed array.

```yaml
# Option B — Effect union member
Effect:
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  # ...type-specific fields via discriminated union
```

**Pros:**
- Matches Figma's internal data model exactly
- Preserves Figma render order

**Cons:**
- Mirrors Figma's bias rather than eliminating it — every consumer must `.filter(e => e.type === 'DROP_SHADOW')` before use
- Discriminated union with optional fields per variant is verbose in both TypeScript and JSON Schema
- Render order is irrelevant to web/iOS/Android since each platform has independent stacking rules
- Violates the **platform-unbiased output** driver

---

### Option C — Grouped object `EffectsGroup` *(selected)*

Inline effects are emitted as an `EffectsGroup` object with a named key per effect role. A `FigmaStyle` reference is the alternative when a named style is present.

```yaml
# Option C
Styles:
  effects?: FigmaStyle | EffectsGroup

EffectsGroup:
  dropShadows?: Shadow[]     # ordered list; maps to box-shadow / .shadow()
  innerShadows?: Shadow[]    # ordered list; maps to inset box-shadow
  layerBlur?: Blur           # singular; maps to filter: blur()
  backgroundBlur?: Blur      # singular; maps to backdrop-filter: blur()
```

**Pros:**
- Each platform property maps directly to a named key — no filtering required
- `Shadow` geometry is reused for both drop and inner shadows (same fields, different render role)
- Blurs are singular by platform convention — stacking blurs has no meaningful cross-platform equivalent
- Extensible without breaking changes: adding a new effect role adds an optional key to `EffectsGroup`
- Satisfies all Decision Drivers, particularly **platform-unbiased output** and **minimal new surface**

**Cons:**
- Slightly more surface area than Option A (`Blur` and `EffectsGroup` are new exports)
- Departs from Figma's array-order model — acceptable because render order is Figma-internal

**Selected.** This shape is stable across the full range of Figma effect types without requiring a future breaking change.

---

### Option D — Flat keys on `Styles` *(rejected)*

Expose `dropShadows?`, `innerShadows?`, `layerBlur?`, and `backgroundBlur?` as top-level `Styles` keys, bypassing a wrapper type entirely.

```yaml
# Option D
Styles:
  dropShadows?: Shadow[]
  innerShadows?: Shadow[]
  layerBlur?: Blur
  backgroundBlur?: Blur
  # effectStyleRef? — needed separately for named style reference
```

**Pros:**
- No intermediate wrapper type; effect keys are immediately visible alongside all other style properties
- Consumers read `styles.dropShadows` directly without destructuring a nested object

**Cons:**
- No single key to attach a `FigmaStyle` named-style reference to — requires a fifth key (`effectStyleRef?`) solely to carry that case; consumers must check two locations instead of one
- Adds 4–5 members to `StyleKey` and `schema/styles.schema.json` instead of 1, expanding public API surface across a wide and shallow plane
- The mutual exclusion between named style and inline geometry is unenforceable at the type level — a consumer could populate both `dropShadows` and a hypothetical `effectStyleRef` simultaneously with no type error

---

### Option E — Explicit split: `effectStyleRef?` + `effects?: EffectsGroup` *(rejected)*

Separate concerns across two keys: `effectStyleRef?` carries the `FigmaStyle` named-style reference; `effects?` carries inline resolved geometry as an `EffectsGroup`. Both are optional; at runtime exactly one is present when effects exist.

```yaml
# Option E
Styles:
  effectStyleRef?: FigmaStyle    # named style reference path
  effects?: EffectsGroup         # inline geometry path
```

**Pros:**
- Eliminates the `FigmaStyle | EffectsGroup` union — consumers read the key they need without discriminating
- Each key has a single clear type

**Cons:**
- Mutual exclusion is a runtime constraint that cannot be expressed in the TypeScript type or JSON Schema; the type system permits both keys to be populated simultaneously, which is an invalid state
- Two `StyleKey` additions and two schema properties instead of one — wider surface for a distinction that can be encoded in the value
- Upstream tooling emitting output must know to write to one key or the other based on the source type, adding conditional logic that Option C avoids

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|---|---|---|
| `types/Styles.ts` | Remove `effectStyleId?: Style` from `Styles`; add `effects?: FigmaStyle \| EffectsGroup` | MAJOR (removal) |
| `types/Styles.ts` | Remove `'effectStyleId'` from `StyleKey` union; add `'effects'` | MAJOR (removal) |
| `types/Styles.ts` | Add import for `EffectsGroup` from `'./Effects.js'` | MINOR (additive) |
| `types/Effects.ts` | New file — add `Shadow`, `Blur`, `EffectsGroup` interfaces (new exports) | MINOR (additive) |
| `types/index.ts` | Export `Shadow`, `Blur`, `EffectsGroup` from `'./Effects.js'` | MINOR (additive) |

**`Shadow` interface** (`types/Effects.ts`):

```yaml
# New interface — used for both dropShadows and innerShadows entries
Shadow:
  visible: boolean                   # whether this shadow is active
  x: number | VariableStyle          # horizontal offset (px)
  y: number | VariableStyle          # vertical offset (px)
  blur: number | VariableStyle       # blur radius (px)
  spread: number | VariableStyle     # spread radius (px)
  color: string | VariableStyle      # #RRGGBBAA hex string, or VariableStyle reference
```

**`Blur` interface** (`types/Effects.ts`):

```yaml
# New interface — used for layerBlur and backgroundBlur entries
Blur:
  visible: boolean                   # whether this blur is active
  radius: number | VariableStyle     # blur radius (px)
```

**`EffectsGroup` interface** (`types/Effects.ts`):

```yaml
# New interface — inline effects grouped by role
EffectsGroup:
  dropShadows?: Shadow[]             # one or more drop shadows; box-shadow / .shadow()
  innerShadows?: Shadow[]            # one or more inner shadows; inset box-shadow
  layerBlur?: Blur                   # singular layer blur; filter: blur()
  backgroundBlur?: Blur              # singular background blur; backdrop-filter: blur()
```

**`Styles` field change** (`types/Styles.ts`):

```yaml
# Before
Styles:
  effectStyleId?: Style              # string | boolean | number | null | VariableStyle | FigmaStyle | ...

# After
Styles:
  effects?: FigmaStyle | EffectsGroup  # FigmaStyle when named style; EffectsGroup when inline
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
| `schema/styles.schema.json` | Add `Blur` definition to `#/definitions` | MINOR (additive) |
| `schema/styles.schema.json` | Add `EffectsGroup` definition to `#/definitions` | MINOR (additive) |
| `schema/styles.schema.json` | Add `EffectsStyleValue` definition to `#/definitions` | MINOR (additive) |

**`Shadow` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions — shared by dropShadows and innerShadows
Shadow:
  type: object
  description: >
    A single evaluated shadow (drop or inner). Fields are identical for both roles;
    the containing key (dropShadows vs innerShadows) determines render role.
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

**`Blur` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions — shared by layerBlur and backgroundBlur
Blur:
  type: object
  description: >
    A single evaluated blur effect. Singular per type; the containing key
    (layerBlur vs backgroundBlur) determines render role.
  properties:
    visible:
      type: boolean
      description: Whether this blur is active
    radius:
      oneOf: [{ type: number }, { $ref: '#/definitions/VariableStyle' }]
      description: Blur radius in pixels
  required: [visible, radius]
  additionalProperties: false
```

**`EffectsGroup` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions
EffectsGroup:
  type: object
  description: >
    Inline effects grouped by role. Each key is optional; a key is omitted when
    no effects of that type are present on the node.
  properties:
    dropShadows:
      type: array
      items: { $ref: '#/definitions/Shadow' }
      description: Ordered list of drop shadows
    innerShadows:
      type: array
      items: { $ref: '#/definitions/Shadow' }
      description: Ordered list of inner shadows
    layerBlur:
      $ref: '#/definitions/Blur'
      description: Layer blur (filter effect on the node itself)
    backgroundBlur:
      $ref: '#/definitions/Blur'
      description: Background blur (backdrop filter)
  additionalProperties: false
```

**`EffectsStyleValue` schema definition** (`schema/styles.schema.json`):

```yaml
# New entry under #/definitions
EffectsStyleValue:
  description: >
    Effect value. FigmaStyle when the node references a named effects style;
    EffectsGroup when effects are defined inline.
  oneOf:
    - { $ref: '#/definitions/FigmaStyle', description: Named effects style reference }
    - { $ref: '#/definitions/EffectsGroup', description: Inline effects grouped by role }
    - { type: null }
```

**`effects` property entry** (under `#/definitions/Styles/properties`):

```yaml
# Added to Styles properties
effects:
  $ref: '#/definitions/EffectsStyleValue'
  description: >
    Effect output. FigmaStyle when the node references a named effects style;
    EffectsGroup when effects are defined inline. effectStyleId — REMOVED.

# Removed from Styles properties:
# effectStyleId: { $ref: '#/definitions/StyleIdValue', description: 'Effect style reference' }
```

### Notes

- `Shadow` fields `x`, `y`, `blur`, `spread` allow `VariableStyle` in addition to `number` to support Figma variable bindings on those fields. In practice this is uncommon; the primary case is a raw number.
- `Shadow.color` allows `string` (`#RRGGBBAA`) or `VariableStyle`. The alpha channel is always present in the hex encoding.
- `Blur.radius` allows `VariableStyle` for the same reason.
- `visible` on both `Shadow` and `Blur` is always `boolean` (no `VariableStyle` variant) — Figma does not support variable binding on `visible` for individual effect items.
- `dropShadows` and `innerShadows` are arrays even when only one shadow is present. A single-element array is valid and expected.
- `layerBlur` and `backgroundBlur` are singular objects, not arrays — Figma stacks multiple blurs of the same type as a single resolved value; emitting an array would be misleading.
- An `EffectsGroup` with all keys absent is not emitted — `effects` is omitted entirely when no effects are present.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes
- **Parity check**:
  - `Shadow` interface in `types/Effects.ts` ↔ `Shadow` definition in `schema/styles.schema.json`
  - `Blur` interface in `types/Effects.ts` ↔ `Blur` definition in `schema/styles.schema.json`
  - `EffectsGroup` interface in `types/Effects.ts` ↔ `EffectsGroup` definition in `schema/styles.schema.json`
  - `Styles.effects?: FigmaStyle | EffectsGroup` ↔ `#/definitions/Styles/properties/effects` → `EffectsStyleValue`
  - `StyleKey` union member `'effects'` ↔ key present in `#/definitions/Styles/properties`
  - `effectStyleId` removed from `types/Styles.ts` ↔ `effectStyleId` removed from `#/definitions/Styles/properties`

---

## Downstream Impact

| Consumer | Impact | Action required |
|---|---|---|
| `anova-kit` (CLI / MCP) | Recompile required; `effectStyleId` removed, `effects` shape changed to `EffectsGroup` | Migrate `styles.effectStyleId` reads to `styles.effects`; destructure by role (`dropShadows`, `layerBlur`, etc.) |

---

## Semver Decision

**Version bump**: `0.10.x → 0.11.0` (`MAJOR`)

**Justification**:
- `effectStyleId` is removed from `Styles`, `StyleKey`, and the JSON schema with no deprecation period — a breaking change for any consumer reading that key. Per constitution Principle III: *"Any change to an existing export is a breaking change and MUST follow semantic versioning rules."*
- The addition of `Shadow` interface and `effects` key is additive (MINOR on its own) but the removal forces MAJOR.

---

## Consequences

- Consumers can represent all Figma effect types — drop shadows, inner shadows, layer blur, background blur — via predictable, role-named keys without filtering an array.
- Each effect role maps directly to a platform property: `dropShadows` → `box-shadow`, `innerShadows` → `inset box-shadow`, `layerBlur` → `filter: blur()`, `backgroundBlur` → `backdrop-filter: blur()`.
- Consumers reading `styles.effectStyleId` will receive `undefined` after upgrading; they must migrate to `styles.effects`.
- When `styles.effects` is a `FigmaStyle`, the named style `id` and resolved `name` are available — identical data to the former `effectStyleId` output, under a new key.
- When `styles.effects` is an `EffectsGroup`, each present key carries the resolved geometry for that effect role.
- New effect roles can be added to `EffectsGroup` as optional keys in future releases without a breaking change.
- Any JSON schema validation that previously passed `{ "effectStyleId": { "id": "..." } }` will fail after this change — consumers must revalidate against the new schema version.
- `Shadow`, `Blur`, and `EffectsGroup` are now first-class exported types: `import type { Shadow, Blur, EffectsGroup } from '@directededges/anova'`.
