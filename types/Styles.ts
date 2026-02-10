import { ReferenceValue } from "./ReferenceValue.js";

export type Styles = Record<string, Style>;

/**
 * Style value types supported in the output format.
 * Can be primitives, variable references, Figma style references, or prop bindings.
 */
export type Style = string | boolean | number | null | VariableStyle | FigmaStyle | ReferenceValue;

/**
 * Variable-based style reference
 */
export interface VariableStyle {
  variable: string;
  collection?: string;
  mode?: string;
  resolvedValue?: string | number | boolean;
}

/**
 * Figma published style reference
 */
export interface FigmaStyle {
  styleId: string;
  styleName: string;
  styleType: 'FILL' | 'STROKE' | 'TEXT' | 'EFFECT' | 'GRID';
}

/**
 * Style property keys that can appear in the serialized output
 */
export type StyleKey =
  | 'backgroundColor'
  | 'borderColor'
  | 'borderWidth'
  | 'borderRadius'
  | 'color'
  | 'fontSize'
  | 'fontWeight'
  | 'fontFamily'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textAlign'
  | 'textDecoration'
  | 'textTransform'
  | 'opacity'
  | 'visible'
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'padding'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'gap'
  | 'alignItems'
  | 'justifyContent'
  | 'flexDirection'
  | 'flexWrap';
