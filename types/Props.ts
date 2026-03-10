/**
 * Represents properties of a component.
 */
export type Props = Record<string, AnyProp>;

/**
 * Union of all supported property types
 */
export type AnyProp = BooleanProp | TextProp | GlyphProp | EnumProp | SlotProp;

/**
 * Boolean property definition
 */
export interface BooleanProp {
  type: 'boolean';
  default: boolean;
}

/**
 * Text content property definition
 */
export interface TextProp {
  type: 'string';
  /** @deprecated Use `examples` for demo content */
  default?: string;
  nullable?: boolean;
  /** Sample values demonstrating typical content for this prop */
  examples?: string[];
}

/**
 * Glyph/instance swap property definition
 */
export interface GlyphProp {
  type: 'string';
  /** @deprecated Use `examples` for demo content */
  default?: string;
  nullable?: boolean;
  /** Sample values demonstrating typical content for this prop */
  examples?: string[];
}

/**
 * Enumeration property definition
 */
export interface EnumProp {
  type: 'string';
  default: string;
  enum: string[];
  nullable?: boolean;
}

/**
 * Slot/nested content property definition
 */
export interface SlotProp {
  type: 'slot';
  default: string;
}
