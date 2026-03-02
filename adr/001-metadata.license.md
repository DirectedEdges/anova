# ADR: Add `license?` to `Metadata` type and schema

**Branch**: `001-license-check`
**Created**: 2026-02-24
**Status**: DRAFT
**Deciders**: Nathan Curtis (author)
**Supersedes**: *(none)*

---

## Context

`@directededges/anova` currently exports a `Metadata` type with six fields (`author`, `lastUpdated`, `generator`, `schema`, `source`, `config`). There is no field to carry license state in the serialised component output.

Downstream tools need a standard place in the component spec to read whether a valid license was present at generation time, and a human-readable description of that state. Adding an optional `license?` field to `Metadata` satisfies this without breaking any existing consumer.

Current `Metadata` shape (abbreviated):

```yaml
Metadata:
  author: string
  lastUpdated: string
  generator: { url, version, name }
  schema: { url, version }
  source: { pageId, nodeId, nodeType }
  config: Config
  # license — ABSENT
```

---

## Decision Drivers

- **Type-schema symmetry**: Constitution I requires every type change have a corresponding schema change before publishing; drift is a bug.
- **Additive only**: The `license` field MUST be optional so existing consumers that do not supply a license receive identical output — no MAJOR bump.
- **No logic**: Constitution II forbids algorithms or runtime behaviour; this ADR introduces only type declarations and schema properties.
- **Stable, intentional API**: Constitution III requires that every new export represent a genuine shared concept. `license?` on `Metadata` is a standard output field consumed by all downstream packages.
- **Strict TypeScript**: All new declarations must compile under strict mode with zero errors (Constitution V).

---

## Options Considered

*(Pre-decided — no alternatives evaluated.)*

---

## Decision

### Type changes (`types/`)

| File | Change | Bump |
|------|--------|------|
| `Metadata.ts` | Add optional `license?` field | MINOR |

**Updated `Metadata` shape** (`types/Metadata.ts`):

```yaml
# Before
Metadata:
  author: string
  lastUpdated: string
  generator: { url, version, name }
  schema: { url, version }
  source: { pageId, nodeId, nodeType }
  config: Config

# After
Metadata:
  author: string
  lastUpdated: string
  generator: { url, version, name }
  schema: { url, version }
  source: { pageId, nodeId, nodeType }
  config: Config
  license?:             # optional — absent for callers that never resolve a license
    status: string
    description: string
```

### Schema changes (`schema/`)

| File | Change | Bump |
|------|--------|------|
| `component.schema.json` | Add `license` property to `#/definitions/Metadata/properties` (NOT in `required[]`) | MINOR |

**Updated `Metadata` properties** (`#/definitions/Metadata`):

```yaml
# New property added to #/definitions/Metadata/properties
license:
  type: object
  description: "Resolved license state at the time this component spec was generated. Absent when no license was supplied."
  properties:
    status:
      type: string
    description:
      type: string
      description: "Human-readable description of the license state."
  required:
    - status
    - description
  additionalProperties: false
  # license is NOT added to Metadata's top-level required[] — it remains optional
```

### Notes

- `license` is intentionally absent from the `Metadata` `required[]` array. Consumers that do not provide a license receive identical output to the current version.
- `additionalProperties: false` on `Metadata` is retained; adding `license` to `properties` is the correct mechanism — no schema constraint is relaxed.

---

## Type ↔ Schema Impact

- **Symmetric**: Yes
- **Parity check**:
  - `types/Metadata.ts → license?` maps to `schema/component.schema.json → #/definitions/Metadata/properties/license`
  - Both changes are optional/non-required in their respective artifacts

---

## Consequences

- `Metadata` output may now include `license.status` and `license.description` when a generator resolves a license.
- Any tool performing runtime validation against `component.schema.json` will accept the new optional field automatically; no validator changes are required for consumers that never produce `license`.
