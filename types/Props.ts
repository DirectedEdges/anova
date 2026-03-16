/**
 * Represents properties of a component.
 */
export type Props = Record<string, AnyProp>;

/**
 * Union of all supported property types
 */
export type AnyProp = BooleanProp | StringProp | EnumProp | SlotProp;

/**
 * Provenance metadata for props extracted from a Figma code-only container layer.
 * Code-only props are non-visual properties embedded in a hidden container layer
 * within the Figma component, used to encode accessibility labels, semantic
 * heading levels, ARIA roles, and similar concerns.
 * @since 0.14.0
 */
export interface FigmaCodeOnlySource {
  /** Discriminator identifying this prop as originating from a code-only container. */
  kind: 'codeOnlyProp';
  /** Sub-layer name within the code-only container tree corresponding to this prop. */
  layer: string;
  /** For enum code-only props: the component name of the nested instance whose variants define the enum values. */
  instanceOf?: string;
}

/**
 * DTCG §5.2.3 Figma-specific metadata for a prop definition.
 * @since 0.14.0
 */
export interface FigmaPropExtension {
  /** Figma-native property type (e.g., BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT). */
  type?: string;
  /** Provenance metadata — present only for props extracted from a code-only container layer. @since 0.14.0 */
  source?: FigmaCodeOnlySource;
}

/**
 * DTCG §5.2.3 platform-specific extensions for prop definitions.
 * Each property is a reverse-domain key whose value is a platform extension type.
 * @since 0.14.0
 */
export interface PropExtensions {
  /** Figma extraction provenance for this prop. */
  'com.figma'?: FigmaPropExtension;
}

/**
 * Boolean property definition
 */
export interface BooleanProp {
  type: 'boolean';
  default: boolean;
  /** DTCG §5.2.3 platform-specific extensions. @since 0.14.0 */
  $extensions?: PropExtensions;
}

/**
 * String property definition (text content, glyph/instance swap, or other string-valued props)
 */
export interface StringProp {
  type: 'string';
  /** @deprecated Use `examples` for demo content */
  default?: string | null;
  nullable?: boolean;
  /** Sample values demonstrating typical content for this prop */
  examples?: string[];
  /** DTCG §5.2.3 platform-specific extensions. @since 0.14.0 */
  $extensions?: PropExtensions;
}

/**
 * Enumeration property definition
 */
export interface EnumProp {
  type: 'string';
  default: string;
  enum: string[];
  nullable?: boolean;
  /** DTCG §5.2.3 platform-specific extensions. @since 0.14.0 */
  $extensions?: PropExtensions;
}

/**
 * Slot/nested content property definition
 */
export interface SlotProp {
  type: 'slot';
  /** Default slot content. Optional — omitted when no meaningful default exists. */
  default?: string | null;
  /** Whether this slot prop accepts a null value */
  nullable?: boolean;
  /** Minimum number of items this slot accepts. @since 0.14.0 */
  minItems?: number;
  /** Maximum number of items this slot accepts. @since 0.14.0 */
  maxItems?: number;
  /** Component type names permitted in this slot. @since 0.14.0 */
  anyOf?: string[];
  /** DTCG §5.2.3 platform-specific extensions. @since 0.14.0 */
  $extensions?: PropExtensions;
}
