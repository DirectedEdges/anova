# Changelog

All notable changes to the Anova schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-02

### Added

- `PropBinding` — component-prop binding type; discriminated by `$binding` key; replaces `ReferenceValue`
- `TokenReference` — unified DTCG-aligned token reference; replaces `VariableStyle` and `FigmaStyle`; `$token` and `$type` are the complete platform-facing API
- `TokenReference.$token` — DTCG dot-separated token path, usable directly as a DTCG alias
- `TokenReference.$type` — DTCG token type discriminator: `color`, `dimension`, `string`, `number`, `boolean`, `shadow`, `gradient`, `typography`, `effects`
- `TokenReference.$extensions["com.figma"]` — optional Figma extraction metadata: `id`, `name`, `collectionName`, `rawValue`
- `Styles.typography` — composite typography; value is `TokenReference`, `Typography`, or omitted
- `Typography` — 13 optional inline text properties: `fontSize`, `fontFamily`, `fontStyle`, `lineHeight`, `letterSpacing`, `textCase`, `textDecoration`, `paragraphIndent`, `paragraphSpacing`, `leadingTrim`, `listSpacing`, `hangingPunctuation`, `hangingList`
- `Styles.aspectRatio` — aspect ratio constraint; `AspectRatioValue` pair or `null` when unconstrained
- `AspectRatioValue` — required `x` (numerator) and `y` (denominator) number fields
- `AspectRatioStyle` — type alias `AspectRatioValue | null`
- `Metadata.license?` — optional `{ status: string; description: string }` field
- `styles.textColor` — style key for text colour
- `styles.cornerSmoothing` — style key for corner smoothing (Figma squircle factor)
- `styles.effects` — style key replacing `effectStyleId`; `TokenReference` or inline `Effects`
- `Shadow` — fields: `visible`, `inset?`, `offsetX`, `offsetY`, `blur`, `spread`, `color`
- `Blur` — fields: `visible`, `radius`
- `Effects` — fields: `shadows?`, `layerBlur?`, `backgroundBlur?`
- `GradientStop` — fields: `position` (0–1), `color`
- `GradientCenter` — fields: `x`, `y` (0–1)
- `LinearGradient` — discriminated by `type: 'LINEAR'`; fields: `angle`, `stops`
- `RadialGradient` — discriminated by `type: 'RADIAL'`; fields: `center`, `stops`
- `AngularGradient` — discriminated by `type: 'ANGULAR'`; fields: `center`, `stops`
- `GradientValue` — discriminated union `LinearGradient | RadialGradient | AngularGradient`
- `ColorStyle` — `string | TokenReference | GradientValue | null`

### Changed

- `Element.instanceOf` — accepts `string | PropBinding`; bound form is `{ $binding: "#/props/..." }`
- `Element.text` — accepts `string | PropBinding`; bound form is `{ $binding: "#/props/..." }`
- `Style` — `PropBinding` replaces `ReferenceValue`; `TokenReference` replaces `VariableStyle` and `FigmaStyle`
- `Styles.backgroundColor` — narrowed to `ColorStyle`; inline gradients representable
- `Styles.textColor` — narrowed to `ColorStyle`; inline gradients representable
- `Styles.strokes` — narrowed to `ColorStyle`; inline gradients representable
- `styles.fills` renamed to `styles.backgroundColor`

### Removed

- `ReferenceValue` — removed; use `PropBinding` instead
- `isReferenceValue` — removed; no replacement; prop-binding guards are upstream consumer responsibility
- `VariableStyle` — removed; use `TokenReference` instead
- `FigmaStyle` — removed; use `TokenReference` instead
- `Styles.fontSize` — removed; use `typography.fontSize` instead
- `Styles.fontFamily` — removed; use `typography.fontFamily` instead
- `Styles.fontStyle` — removed; use `typography.fontStyle` instead
- `Styles.lineHeight` — removed; use `typography.lineHeight` instead
- `Styles.letterSpacing` — removed; use `typography.letterSpacing` instead
- `Styles.textCase` — removed; use `typography.textCase` instead
- `Styles.textDecoration` — removed; use `typography.textDecoration` instead
- `Styles.paragraphIndent` — removed; use `typography.paragraphIndent` instead
- `Styles.paragraphSpacing` — removed; use `typography.paragraphSpacing` instead
- `Styles.leadingTrim` — removed; use `typography.leadingTrim` instead
- `Styles.listSpacing` — removed; use `typography.listSpacing` instead
- `Styles.hangingPunctuation` — removed; use `typography.hangingPunctuation` instead
- `Styles.hangingList` — removed; use `typography.hangingList` instead
- `Styles.textStyleId` — removed; use `typography` with a `TokenReference` instead
- `styles.effectStyleId` — removed with no deprecation period; consumers must migrate to `styles.effects`

### Migration

- `Element.instanceOf` → `Element.instanceOf`: replace `{ $ref: "#/props/..." }` with `{ $binding: "#/props/..." }`; update any `isReferenceValue` guards to narrow against `$binding` directly
- `Element.text` → `Element.text`: same key rename from `$ref` to `$binding`
- `Styles.visible` → `Styles.visible`: same key rename from `$ref` to `$binding`
- `VariableStyle` → `TokenReference`: replace `{ id, variableName, collectionName }` with `{ $token: "<Collection>.<name>", $type: "<type>", $extensions: { "com.figma": { id, name, collectionName } } }`; read token path from `$token` and token category from `$type`
- `FigmaStyle` → `TokenReference`: replace `{ id, name }` with `{ $token: "<dot.path>", $type: "typography" | "effects" | ... }` and move the Figma UUID to `$extensions["com.figma"].id`
- `Styles.<typographyProperty>` → `Styles.typography.<property>`: all 14 flat typography properties replaced with single composite `typography` field; when `typography` is a `TokenReference`, read `$token` for the style path; when `typography` is a `Typography` object, read individual fields
- `fills` → `backgroundColor`: any consumer reading `component.styles.fills` must update to `component.styles.backgroundColor`
- `effectStyleId` → `effects`: any consumer reading `styles.effectStyleId` must update to `styles.effects`; when `effects` is a `TokenReference`, read `$token` and `$type`; when `effects` is an `Effects`, read from `shadows`, `layerBlur`, or `backgroundBlur` by role

## [0.9.0] - 2026-02-12

### Added

- **DEFAULT_CONFIG** - Default configuration constant for transformer setup
  - Provides sensible defaults for all Config fields
  - Ensures consistent behavior across CLI, MCP, and Plugin environments
  - Co-located with Config type definition for easy maintenance

## [0.10.0] - 2026-02-16

### Added

- **Runtime JS build** - Compile TypeScript types to `dist/index.js` for ESM consumers
  - Enables ESM runtime imports without loading `.ts` files
  - Keeps type definitions in `types/` for TypeScript tooling

## [0.8.0] - 2026-02-10

### Added

- **TypeScript type definitions** (`types/` package): Complete type definitions for all schema entities
  - Core types: Component, Anatomy, Props, Variant, Metadata, Config, Styles, Element, Layout
  - Property types with proper discriminators: BooleanProp, TextProp, IconProp, EnumProp, SlotProp
  - Style types supporting all 59 properties with specific value types
  - Reference value types for prop bindings and style references

### Changed

- **Component.metadata** - Now optional to support components without full metadata
- **Variant.layout** - Changed from single LayoutNode to array of LayoutNode for proper hierarchical representation
- **Props type values** - TextProp, IconProp, and EnumProp now use `type: 'string'` with discriminators (matching schema)
- **Style properties** - Changed from generic `Record<string, Style>` to specific Partial interface with all 59 style properties
- **VariableStyle** - Now includes all properties from schema: id (required), rawValue, name, variableName, collectionName, collectionId (all optional)
- **FigmaStyle** - Simplified to match schema: id (required), name (optional)

### Fixed

- **SlotProp.default** - Now accepts both `null` and `string` types
- **TextProp/IconProp nullable** - Made nullable field optional (was incorrectly required)
- **Metadata.source** - Added missing nodeType field with enum: COMPONENT | COMPONENT_SET | FRAME
- **Metadata.config** - Added complete Config definition with processing, format, and include options
- **StyleKey type** - Expanded from incomplete list to all 59 valid style properties matching schema

## [0.7.0]

### Changed

- Added distinct `anatomy` types for line, ellipse, star, polygon and rectange, all which were previously vector
- Removed autodetecion of icon assets based on `isAsset` plugin since this function is unavailable in the REST API

## [0.6.0] - 2026-01-27

### Added

- **Styles schema**: New `styles.schema.json` providing complete validation for style properties
  - Defines 60+ style properties (fills, opacity, cornerRadius, fontSize, etc.)
  - Type-specific validation for each property based on Style processor classes
  - Supports all style value types: primitives, variables, Figma styles, and prop bindings
  - Documents which value shapes depend on config.format settings (simplifyVariables, simplifyStyles)
  
- **Style value types**: Precise type definitions for style property values
  - `NumberStyleValue`: number | VariableStyle | null
  - `BooleanStyleValue`: boolean | VariableStyle | null
  - `BooleanBindableStyleValue`: boolean | VariableStyle | ReferenceValue | null (for `visible` only)
  - `ColorStyleValue`: string | VariableStyle | FigmaStyle | null
  - `StringStyleValue`: string | VariableStyle | null
  - `MixedNumberStyleValue`: number | "mixed" | VariableStyle | null
  - `MixedStringStyleValue`: string | VariableStyle | null
  - `StrokeStyleValue`: number | "mixed" | VariableStyle | null
  - `CornerStyleValue`: number | "mixed" | VariableStyle | null
  - `FontStyleValue`: string | number | "mixed" | null
  - `LineHeightStyleValue`: string | number | VariableStyle | null
  - `StyleIdValue`: string | FigmaStyle | null

- **Styles reference documentation**: New `reference/styles.yaml` providing human-readable documentation
  - Maps style properties to their applicable element types (COMPONENT, FRAME, TEXT, etc.)
  - Documents style processing categories from RAW_STYLES_LOOKUP
  - Lists all 60+ style properties with descriptions and value types
  - Generated from StyleKeys.ts and RawStyles.ts constants

### Changed

- **VariableStyle definition**: Removed internal-only `rawValue` property
  - Only includes properties emitted by Style.data(): id, name, variableName, collectionName, collectionId
  - `rawValue` is used internally for rendering but never serialized

- **FigmaStyle definition**: Improved descriptions
  - Documents simplified vs full object output based on config.format.simplifyStyles

- **Styles property**: Now references `styles.schema.json#/definitions/Styles`
  - Replaces generic `additionalProperties: Style` with precise property-level validation
  - Each style property validates against its specific value type union

## [0.5.0] - 2025-12-29

### Added

- **Instance of attribute**: Added optional `instanceOf` property to element definitions
  - Indicates the component or component set name that an instance element references
  - Only present for instance elements (Figma INSTANCE nodes)
  - Shows ComponentSet name for variant instances, or Component name for standalone instances
  - Also added to anatomy element definitions

- **Text property**: Added optional `text` property to element definitions
  - Contains the text content for text elements
  - Can be a string value or a `ReferenceValue` when bound to a text prop

- **Unified property bindings**: Property bindings now appear as `$ref` values on their natural properties
  - `children` can now be a `ReferenceValue` (for slot content bindings)
  - `instanceOf` can now be a `ReferenceValue` (for instance swap bindings)
  - `visible` style can now be a `ReferenceValue` (for boolean prop bindings)
  - `text` can be a `ReferenceValue` (for text prop bindings)
  - Added `ReferenceValue` definition with `$ref` JSON pointer to props

### Removed

- **propBindings section**: Removed separate `propBindings` property from elements
  - Bindings are now represented directly on their target properties using `$ref`

## [0.4.0] - 2025-12-27

### Added

- **Layout structure**: Added optional `layout` property to variant definitions that provides hierarchical element structure as a nested tree
  - Layout represents element nesting relationships in a recursive format
  - Leaf nodes are strings (element names)
  - Parent nodes are objects with element name as key and children array as value
  - Example: `{ "parentElement": ["childA", { "childB": ["grandchild"] }] }`
  
### Changed

- Schema now supports both structure representations:
  - New: `layout` at variant level (hierarchical tree)
  - Existing: `parent` and `children` properties in each element (maintained for backward compatibility)
  
### Deprecated

- `included` property has been removed from element definitions
  - Element inclusion is now determined by presence in the `layout` tree
  - Elements not present in `layout` are considered excluded from that variant

## [0.3.0] - Previous release