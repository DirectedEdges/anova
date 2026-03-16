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
 * DTCG §5.2.3 tool-specific metadata for prop definitions.
 * Carries Figma-native property type and optional code-only prop provenance.
 */
export interface FigmaPropExtension {
  /** Figma-native property type (e.g., BOOLEAN, TEXT, INSTANCE_SWAP, VARIANT). */
  type?: string;
  /** Provenance metadata — present only for props extracted from a code-only container layer. */
  source?: FigmaCodeOnlySource;
}

/**
 * DTCG §5.2.3 platform-specific extensions for prop definitions.
 * Uses reverse-domain namespacing (e.g., "com.figma") for extensibility.
 */
export interface PropExtensions {
  'com.figma'?: FigmaPropExtension;
}

/**
 * Boolean property definition
 */
export interface BooleanProp {
  type: 'boolean';
  default: boolean;
  /** DTCG §5.2.3 platform-specific extensions. */
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
  /** DTCG §5.2.3 platform-specific extensions. */
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
  /** DTCG §5.2.3 platform-specific extensions. */
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
  /** DTCG §5.2.3 platform-specific extensions. */
  $extensions?: PropExtensions;
}
