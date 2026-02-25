import { ReferenceValue } from "./ReferenceValue.js";

export type Styles = Partial<{
  rotation: Style;
  visible: Style;
  opacity: Style;
  locked: Style;
  backgroundColor: Style;
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
  strokes: Style;
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
  textColor: Style;
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
 * A single evaluated shadow (drop or inner).
 * Fields are identical for both roles; the containing key
 * (`dropShadows` vs `innerShadows`) determines render role.
 * `x`, `y`, `blur`, `spread` may be a raw number or a Figma variable reference.
 * `color` is an 8-digit hex string (`#RRGGBBAA`) or a Figma variable reference.
 * `visible` is always a boolean — Figma does not support variable binding on
 * the `visible` field of individual effect items.
 */
export interface Shadow {
  visible: boolean;
  x: number | VariableStyle;
  y: number | VariableStyle;
  blur: number | VariableStyle;
  spread: number | VariableStyle;
  color: string | VariableStyle;
}

/**
 * A single evaluated blur effect (layer blur or background blur).
 * Singular per type; the containing key (`layerBlur` vs `backgroundBlur`)
 * determines render role.
 * `visible` is always a boolean — Figma does not support variable binding on
 * the `visible` field of individual effect items.
 */
export interface Blur {
  visible: boolean;
  radius: number | VariableStyle;
}

/**
 * Inline effects grouped by role.
 * Each key is optional; a key is omitted when no effects of that type are present.
 * Maps directly to platform properties:
 * - `dropShadows` → `box-shadow` / `.shadow()`
 * - `innerShadows` → `inset box-shadow`
 * - `layerBlur` → `filter: blur()`
 * - `backgroundBlur` → `backdrop-filter: blur()`
 */
export interface EffectsGroup {
  /** Ordered list of drop shadows */
  dropShadows?: Shadow[];
  /** Ordered list of inner shadows */
  innerShadows?: Shadow[];
  /** Singular layer blur (filter effect on the node itself) */
  layerBlur?: Blur;
  /** Singular background blur (backdrop filter) */
  backgroundBlur?: Blur;
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
