import { ReferenceValue } from "./ReferenceValue.js";
import { EffectsGroup } from "./Effects.js";
import { GradientValue } from "./Gradient.js";

export type Styles = Partial<{
  rotation: Style;
  visible: Style;
  opacity: Style;
  locked: Style;
  backgroundColor: ColorStyle;
  effects: FigmaStyle | EffectsGroup;
  clipContent: Style;
  cornerRadius: Style;
  width: Style;
  height: Style;
  minWidth: Style;
  minHeight: Style;
  maxWidth: Style;
  maxHeight: Style;
  x: Style;
  y: Style;
  layoutPositioning: Style;
  layoutSizingHorizontal: Style;
  layoutSizingVertical: Style;
  strokes: ColorStyle;
  strokeAlign: Style;
  strokeWeight: Style;
  strokeTopWeight: Style;
  strokeBottomWeight: Style;
  strokeLeftWeight: Style;
  strokeRightWeight: Style;
  fontSize: Style;
  fontFamily: Style;
  fontWeight: Style;
  lineHeight: Style;
  letterSpacing: Style;
  textDecoration: Style;
  textCase: Style;
  paragraphIndent: Style;
  paragraphSpacing: Style;
  leadingTrim: Style;
  listSpacing: Style;
  hangingPunctuation: Style;
  hangingList: Style;
  textStyleId: Style;
  textAlignHorizontal: Style;
  textAlignVertical: Style;
  textColor: ColorStyle;
  primaryAxisAlignItems: Style;
  primaryAxisSizingMode: Style;
  counterAxisAlignItems: Style;
  counterAxisAlignContent: Style;
  layoutMode: Style;
  layoutWrap: Style;
  itemReverseZIndex: Style;
  itemSpacing: Style;
  paddingLeft: Style;
  paddingRight: Style;
  paddingTop: Style;
  paddingBottom: Style;
  counterAxisSpacing: Style;
  topLeftRadius: Style;
  topRightRadius: Style;
  bottomLeftRadius: Style;
  bottomRightRadius: Style;
  cornerSmoothing: Style;
}>;

/**
 * Style value types supported in the output format.
 * Can be primitives, variable references, Figma style references, or prop bindings.
 */
export type Style = string | boolean | number | null | VariableStyle | FigmaStyle | ReferenceValue;

/**
 * Colour-specific style value type.
 * Mirrors `ColorStyleValue` in `schema/styles.schema.json`.
 * Used for `backgroundColor`, `textColor`, and `strokes` — the three properties
 * whose values are always colour-semantics and may carry gradient data.
 */
export type ColorStyle = string | VariableStyle | FigmaStyle | ReferenceValue | GradientValue | null;

/**
 * Variable-based style reference
 */
export interface VariableStyle {
  id: string;
  rawValue?: string | number | boolean;
  name?: string;
  variableName?: string;
  collectionName?: string;
  collectionId?: string;
}

/**
 * Figma published style reference
 */
export interface FigmaStyle {
  id: string;
  name?: string;
}

/**
 * Style property keys that can appear in the serialized output
 */
export type StyleKey =
  | 'rotation'
  | 'visible'
  | 'opacity'
  | 'locked'
  | 'backgroundColor'
  | 'effects'
  | 'clipContent'
  | 'cornerRadius'
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'x'
  | 'y'
  | 'layoutPositioning'
  | 'layoutSizingHorizontal'
  | 'layoutSizingVertical'
  | 'strokes'
  | 'strokeAlign'
  | 'strokeWeight'
  | 'strokeTopWeight'
  | 'strokeBottomWeight'
  | 'strokeLeftWeight'
  | 'strokeRightWeight'
  | 'fontSize'
  | 'fontFamily'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textDecoration'
  | 'textCase'
  | 'paragraphIndent'
  | 'paragraphSpacing'
  | 'leadingTrim'
  | 'listSpacing'
  | 'hangingPunctuation'
  | 'hangingList'
  | 'textStyleId'
  | 'textAlignHorizontal'
  | 'textAlignVertical'
  | 'textColor'
  | 'primaryAxisAlignItems'
  | 'primaryAxisSizingMode'
  | 'counterAxisAlignItems'
  | 'counterAxisAlignContent'
  | 'layoutMode'
  | 'layoutWrap'
  | 'itemReverseZIndex'
  | 'itemSpacing'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingTop'
  | 'paddingBottom'
  | 'counterAxisSpacing'
  | 'cornerSmoothing'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius';
