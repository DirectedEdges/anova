/**
 * Represents properties of a component.
 */
export type Props = Record<string, AnyProp>;

/**
 * Union of all supported property types
 */
export type AnyProp = BooleanProp | TextProp | IconProp | EnumProp | SlotProp;

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
  type: 'text';
  default: string;
}

/**
 * Icon/instance swap property definition
 */
export interface IconProp {
  type: 'icon';
  default: string;
  options?: string[];
}

/**
 * Enumeration property definition
 */
export interface EnumProp {
  type: 'enum';
  default: string;
  options: string[];
}

/**
 * Slot/nested content property definition
 */
export interface SlotProp {
  type: 'slot';
  default: string;
}
