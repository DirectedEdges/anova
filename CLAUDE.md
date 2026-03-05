# CLAUDE.md

## What This Is

`@directededges/anova` is the shared types and schema package for the Anova ecosystem. It defines the canonical TypeScript types and JSON schemas that describe component specifications. All other packages depend on this.

## Public API (minimal surface)

```typescript
import type { Component, Config, Anatomy, Props, Variant, Element, Styles } from '@directededges/anova';
import { DEFAULT_CONFIG } from '@directededges/anova';
```

Exports are type-only except for `DEFAULT_CONFIG`. Everything is a type definition — this package has no runtime logic.

## Architecture

```
types/                       # TypeScript type definitions (source of truth)
├── index.ts                 # Barrel export
├── Component.ts             # Top-level component spec shape
├── Config.ts                # Config interface + DEFAULT_CONFIG
├── Anatomy.ts               # Structural skeleton types
├── Props.ts                 # Property types (Boolean, Text, Icon, Enum, Slot)
├── PropConfigurations.ts    # Per-prop rules and defaults
├── PropBinding.ts           # Prop-to-element binding types
├── Variant.ts               # Variant permutation types
├── Element.ts               # Renderable node types
├── Layout.ts                # Sizing, spacing, constraints
├── Styles.ts                # Color, token references, typography, aspect ratio
├── Effects.ts               # Shadow, Blur
├── Gradient.ts              # Linear, Radial, Angular gradients
├── Children.ts              # Slot-based child content
├── Subcomponent.ts          # Referenced child component types
└── Metadata.ts              # Name, description, author, version
schema/                      # JSON Schema definitions (for validation)
├── component.schema.json    # Single component spec schema
├── components.schema.json   # Collection of components
├── styles.schema.json       # Styles schema
└── root.schema.json         # Root schema
adr/                         # Architecture Decision Records
reference/                   # Reference documentation
```

## Config Type

The `Config` interface controls how `anova-transformer` produces output:

| Group | Key | Values | Default |
|---|---|---|---|
| `processing` | `details` | `'FULL'` \| `'LAYERED'` | `'LAYERED'` |
| `processing` | `variantDepth` | `1` \| `2` \| `3` \| `9999` | `9999` |
| `format` | `keys` | `'SAFE'` \| `'CAMEL'` \| `'SNAKE'` \| `'KEBAB'` \| `'PASCAL'` \| `'TRAIN'` | `'SAFE'` |
| `format` | `output` | `'JSON'` \| `'YAML'` | `'JSON'` |
| `format` | `layout` | `'LAYOUT'` \| `'PARENT_CHILDREN'` \| `'BOTH'` | `'LAYOUT'` |
| `format` | `tokens` | `'TOKEN'` \| `'TOKEN_NAME'` \| `'TOKEN_FIGMA_EXTENSIONS'` \| `'FIGMA_NAME'` \| `'CUSTOM'` | `'TOKEN'` |
| `include` | `subcomponents` | `boolean` | `false` |
| `include` | `variantNames` | `boolean` | `false` |
| `include` | `invalidVariants` | `boolean` | `false` |
| `include` | `invalidCombinations` | `boolean` | `true` |

## Build

```bash
npm run build    # tsc only (produces dist/ from types/)
```

No tests in this repo — types are validated by downstream consumers.
