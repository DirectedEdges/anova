# ADR: Flowing Content into a Nested Instance's Slot

**Branch**: `025-nested-slot-api`
**Created**: 2026-03-15
**Status**: DRAFT
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

The Anova schema models elements, slots, and prop bindings, but it has not yet addressed a fundamental compositional pattern: a parent component that nests a child instance and **flows defined content into that child's slot**.

### The example

`ProductCard` contains a `Card` instance. `Card` exposes a `children` slot — a generic, unopinionated container beneath a built-in "Featured Header." `ProductCard` fills that slot with two elements: a `Title` (text) and an `Action1` (Button instance).

The visual nesting:
```
ProductCard
  root
    card ← instance of Card
      (inside Card's slot)
        Title ← text element
        Action1 ← instance of Button
```

### Card's spec (the child being nested)

Card defines its own layout, anatomy, and a `children` slot prop. The `children` element is a container bound to the slot prop — it's the insertion point for consumers:

```yaml
# Card's spec
title: Card

anatomy:
  root:
    type: container
  featuredHeader:
    type: text
  children:
    type: container          # the slot receiver element

props:
  children:
    type: slot

layout:
  - root:
    - featuredHeader
    - children               # bound to the children slot prop

default:
  elements:
    children:
      children: { $binding: "#/props/children" }
```

### ProductCard's layout

ProductCard's layout tree describes only *its own* element hierarchy. The slot content (Title, Action1) lives inside the Card instance — it's not part of ProductCard's direct layout:

```yaml
# ProductCard's layout
layout:
  - root:
    - card                   # the nested Card instance — that's it
```

ProductCard doesn't list `Title` or `Action1` in its layout. Those elements exist inside Card's `children` slot. ProductCard's layout stops at `card`.

### The core question

In ProductCard's `default.elements.card`, we need to express: "set the `children` slot to content containing a Title text element and an Action1 Button instance."

Card's `children` is a slot prop. Setting scalar props on a nested instance is straightforward — `propConfigurations: { type: solid }` handles that. But **slot content is not a scalar**. It's a structured tree of elements, each with their own types, styles, prop configurations, and layout. There's no mechanism in the current schema to express this.

```yaml
# ProductCard's default variant — what goes here?
default:
  elements:
    card:
      instanceOf: Card
      propConfigurations:
        # Scalar props work fine:
        # someCardProp: someValue
        #
        # But how do you set a slot prop to structured content?
        # children: ???
```

The question is: **what is the shape of that slot content value?** Does it need its own `anatomy`, `layout`, and `elements`? Is it a mini component spec? Something else entirely?

---

## What the schema can express today

### propConfigurations: scalars only

`PropConfigurations` is `Record<string, string | number | boolean>`. It handles setting scalar props on nested instances:

```yaml
Action1:
  propConfigurations:
    type: solid       # ✓ string scalar
    size: medium      # ✓ string scalar
```

But a slot's "value" is not a scalar — it's structured content. `propConfigurations` cannot carry it.

### PropBinding: references a prop on *this* component

`PropBinding` lets an element property point to a prop on the *same* component:

```yaml
# Title's content is bound to ProductCard's title prop
Title:
  content: { $binding: "#/props/title" }
```

This works for properties on elements that ProductCard owns directly. But it doesn't help with setting slot content on a nested instance — there's no `PropBinding` that says "flow this structured content into the instance's slot."

### Element.children: names or a binding

`Children` is `string[] | PropBinding`. When an element's children are bound to a slot prop, it uses `PropBinding`:

```yaml
# Card's children element — bound to its own slot prop
children:
  children: { $binding: "#/props/children" }
```

When children are known statically, it's a string array:

```yaml
root:
  children: [card]
```

Neither form lets an *outer* component inject structured content into an *inner* instance's slot.

### What about anatomy?

ProductCard's `anatomy` could list the slot content elements:

```yaml
anatomy:
  root:
    type: container
  card:
    type: instance
    instanceOf: Card
  Title:
    type: text
  Action1:
    type: instance
    instanceOf: Button
```

But this creates ambiguity — `Title` and `Action1` appear in ProductCard's anatomy as if they're direct children, when they actually live inside Card's slot. The `anatomy` has no concept of "this element exists inside a nested instance's slot."

---

## The fundamental gap

The schema has no way to express **structured content as a slot prop value**. The three related gaps:

### 1. Slot content as a value

A slot prop's value is not a scalar — it's a tree of elements with types, styles, configurations, and layout. Today, `propConfigurations` only carries scalars. There's no field on `Element` where you can say "here's the structured content for this instance's slot."

The content would need to include at minimum:
- Element definitions (types, instanceOf, content)
- Element styles
- Prop configurations on nested instances within the slot
- Layout/ordering of the slot children

This is essentially a fragment of a component spec — `anatomy` + `elements` + `layout` — scoped to what lives inside the slot.

### 2. Prop bindings across the instance boundary

If ProductCard exposes an `action1Label` prop and wants to bind it to the Button's `label` inside the slot content, the binding needs to cross from ProductCard's prop space into the nested instance's prop space. `PropBinding` currently only references `#/props/...` within the same component.

### 3. No "filled slot" signal

Both Card's `children` (an open slot for consumers) and ProductCard's use of it (a filled slot with fixed content) would be `type: slot` in anatomy. There's no way to distinguish "this component exposes a slot" from "this component filled a nested instance's slot."

---

## Summary of schema gaps

| What needs expressing | Current mechanism | Gap |
|----------------------|-------------------|-----|
| Set structured content on a nested instance's slot prop | `propConfigurations` (scalars only) | **No mechanism** — slot content is not a scalar |
| Include slot content elements in the parent's spec | `anatomy` (flat map of element names) | Ambiguous — no way to indicate these elements live inside a nested instance's slot |
| Define layout of slot content within the nested instance | `layout` (parent's own tree) | **No mechanism** — parent's layout stops at the instance boundary |
| Bind a parent prop to a nested instance's prop | `propConfigurations` (static values only) | `propConfigurations` doesn't accept `PropBinding` |
| Distinguish "open slot" from "filled slot" | Both are `type: slot` in anatomy | No signal |

---

## Proposed solution: `Composition` type + widened `PropConfigurations`

### The `Composition` type

A `Composition` is a component fragment — structured content that fills a slot. Unlike a `Component`, it has no `root`, no `default` wrapper, no variants, and no props of its own. It describes only the elements injected into the slot:

```typescript
type Composition = {
  anatomy: Anatomy;
  layout: Layout;       // top-level array — the slot's direct children
  elements?: Elements;
};
```

Key differences from `Component`:

| | `Component` | `Composition` |
|---|---|---|
| Layout root | Always a singular `root` | Array of top-level children (the slot's content list) |
| Variants | `default` + `variants[]` | Just `elements` — one resolved state |
| Anatomy | Full element map | Only the elements in the fragment |
| Props | Its own prop surface | None — bindings reference the *parent* component's props |

### Widened `PropConfigurations`

`PropConfigurations` expands to accept both `Composition` (for slot prop values) and `PropBinding` (for scalar props bound to the parent's props):

```yaml
# Before
PropConfigurations: Record<string, string | number | boolean>

# After
PropConfigurations: Record<string, string | number | boolean | PropBinding | Composition>
```

This is a single type change that unlocks two capabilities:
- **`Composition`**: structured content as a slot prop value
- **`PropBinding`**: a scalar prop on a nested instance bound to the parent component's prop (rather than set to a static value)

### Full example: ProductCard

```yaml
title: ProductCard

anatomy:
  root:
    type: container
  card:
    type: instance
    instanceOf: Card

props:
  title:
    type: string
    examples: ["Product Name"]
  action1Label:
    type: string
    examples: ["Buy Now"]

layout:
  - root:
    - card

default:
  elements:
    card:
      instanceOf: Card
      propConfigurations:
        children:                              # Card's slot prop — value is a Composition
          anatomy:
            title:
              type: text
            action1:
              type: instance
              instanceOf: Button
          layout:
            - title
            - action1
          elements:
            title:
              content: { $binding: "#/props/title" }
            action1:
              instanceOf: Button
              propConfigurations:
                type: solid                    # fixed — static scalar
                size: medium                   # fixed — static scalar
                label: { $binding: "#/props/action1Label" }  # bound to parent's prop
```

Reading this from top to bottom:

1. ProductCard's `layout` is `root > card` — its own tree stops at the instance
2. The `card` element's `propConfigurations` sets Card's `children` slot prop to a `Composition`
3. The `Composition` has its own `anatomy` (title, action1), `layout` (title, action1 as top-level children), and `elements`
4. Inside the composition's `elements`, the `title` text element's `content` uses `{ $binding: "#/props/title" }` — referencing ProductCard's prop, not a prop on the composition (which has none)
5. The `action1` element's `propConfigurations` sets Button's `type` and `size` to static scalars, and binds `label` to ProductCard's `action1Label` via `PropBinding`

### How `$binding` works across boundaries

`PropBinding` references always resolve against the **owning component's** prop space — in this case, ProductCard. A `$binding` inside a `Composition` or inside a nested instance's `propConfigurations` still points to `#/props/...` on ProductCard. There's no change to the `PropBinding` type itself; the resolution scope is implicit from context (the composition is authored by ProductCard, so bindings reference ProductCard's props).

### What this does NOT address

This proposal focuses on the structural mechanism — flowing content into a slot. It intentionally leaves out:

- **Hidden/ignored props**: Button's `disabled` and `startIcon` are simply absent from `propConfigurations`. There's no signal that they were *intentionally* omitted vs. left at their defaults. A future ADR could add prop disposition metadata if needed.
- **Internal state**: Button's `state` (rest/hover/active) operates autonomously. There's no representation of "this prop exists but is not part of the parent's API." Same future-ADR territory.
- **Filled-slot signal**: The presence of a `Composition` value in `propConfigurations` for a slot prop implicitly signals the slot is filled. Whether an explicit flag is also needed is TBD.

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| New: `Composition.ts` | Add `Composition` type with `anatomy`, `layout`, `elements` | MINOR |
| `PropConfigurations.ts` | Widen value type to include `PropBinding \| Composition` | MINOR |
| `index.ts` | Export `Composition` | MINOR |

**New type** (`types/Composition.ts`):
```yaml
Composition:
  anatomy: Anatomy         # required — element type map for the fragment
  layout: Layout           # required — top-level array of slot children
  elements?: Elements      # optional — element data (styles, content, propConfigurations)
```

**Widened type** (`types/PropConfigurations.ts`):
```yaml
# Before
PropConfigurations: Record<string, string | number | boolean>

# After
PropConfigurations: Record<string, string | number | boolean | PropBinding | Composition>
```

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `component.schema.json` | Add `Composition` definition; update `PropConfigurations` `additionalProperties` to include `PropBinding` and `Composition` refs | MINOR |

**New definition** (`#/definitions/Composition`):
```yaml
Composition:
  type: object
  description: "Structured content fragment that fills a slot prop on a nested instance."
  required: [anatomy, layout]
  properties:
    anatomy:
      $ref: "#/definitions/Anatomy"
    layout:
      $ref: "#/definitions/Layout"
    elements:
      $ref: "#/definitions/Elements"
  additionalProperties: false
```

**Updated `PropConfigurations`**:
```yaml
# Before
PropConfigurations:
  type: object
  additionalProperties:
    oneOf:
      - type: string
      - type: number
      - type: boolean

# After
PropConfigurations:
  type: object
  additionalProperties:
    oneOf:
      - type: string
      - type: number
      - type: boolean
      - $ref: "#/definitions/PropBinding"
      - $ref: "#/definitions/Composition"
```

### Notes

- `Composition.layout` uses the existing `Layout` type (`LayoutNode[]`). Unlike `Component`, there is no convention of a singular `root` — the array items are the slot's direct children.
- `Composition` has no `props`, `variants`, `default`, `subcomponents`, or `metadata` — it is not a component. It is content authored by the parent, using the parent's prop scope for bindings.
- `PropBinding` in `propConfigurations` is a natural extension: it uses the same `{ $binding: "#/props/..." }` shape already used on `Element.content`, `Element.instanceOf`, `Element.children`, and `Styles.visible`. Adding it to `propConfigurations` values completes the pattern.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes — `Composition` type maps to `#/definitions/Composition` in schema; `PropConfigurations` value union is widened symmetrically in both
- **Parity check**:
  - `Composition { anatomy, layout, elements? }` ↔ `#/definitions/Composition` with same required/optional fields
  - `PropConfigurations` value type `string | number | boolean | PropBinding | Composition` ↔ `additionalProperties.oneOf` with five branches

---

## Downstream Impact

| Consumer | Impact | Action required |
|----------|--------|-----------------|
| `anova-kit` | New optional value types in `propConfigurations` | No immediate action — existing scalar entries remain valid. Future: may render composition content in CLI output |

---

## Semver Decision

**Version bump**: `MINOR`

**Justification**: All changes are additive. `Composition` is a new type. `PropConfigurations` value type is widened (new union members added), but existing valid values (`string | number | boolean`) remain valid. No existing field is removed, renamed, or made required. Per Constitution III: "MINOR for additive types or new optional fields."

---

## Consequences

- Slot content on a nested instance can be expressed as a `Composition` value in `propConfigurations`, using the same prop name the child component defines for its slot
- `PropBinding` in `propConfigurations` enables binding a nested instance's scalar prop to the parent component's prop, completing the pattern already established for `Element.content`, `Element.instanceOf`, and `Styles.visible`
- `Composition` is self-contained — it carries its own `anatomy`, `layout`, and `elements`, scoped to the slot fragment. No changes to the parent component's anatomy or layout are needed
- `$binding` references inside a `Composition` resolve against the parent component's props, maintaining a single prop scope per component
- Hidden/ignored props, internal state, and explicit filled-slot signals are out of scope — they can be addressed in future ADRs once the basic content-flow mechanism is established
- The `Composition` type could be reused for other structured-content scenarios (e.g., default slot content on the slot-owning component itself)
