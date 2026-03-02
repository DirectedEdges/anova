import { PropBinding } from "./ReferenceValue.js";
import { Effects } from "./Effects.js";
import { GradientValue } from "./Gradient.js";

export type Styles = Partial<{
  rotation: Style;
  visible: Style;
  opacity: Style;
  locked: Style;
  backgroundColor: ColorStyle;
  effects: TokenReference | Effects;
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
  typography: TokenReference | Typography;
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
  aspectRatio: AspectRatioStyle;
}>;

/**
 * Platform-neutral token reference. Uses `$token` and `$type` as the
 * complete platform-facing API surface; `$extensions["com.figma"]` carries
 * Figma extraction provenance only and is not required by platform consumers.
 * @since 0.11.0
 */
export interface TokenReference {
  /** DTCG dot-separated token path, e.g. "DS Color.Text.Primary". Usable directly as DTCG alias {DS Color.Text.Primary}. */
  $token: string;
  /**
   * DTCG token type (Format Module §9). Standard values: color, dimension, string, number, boolean,
   * shadow, gradient, typography. "effects" is an Anova extension for EffectsGroup references
   * (multi-shadow + blur composite) with no DTCG equivalent.
   */
  $type:
    | 'color'
    | 'dimension'
    | 'string'
    | 'number'
    | 'boolean'
    | 'shadow'
    | 'gradient'
    | 'typography'
    | 'effects';
  /** Tool-specific metadata per DTCG §5.2.3 (reverse domain name notation). Optional; not required for platform code generation. */
  $extensions?: {
    'com.figma'?: {
      /** Figma variable or style UUID. */
      id: string;
      /** Figma name within collection, e.g. "Text/Primary". */
      name?: string;
      /** Figma collection name, e.g. "DS Color" (variables only; presence distinguishes variable from named-style reference). */
      collectionName?: string;
      /** Value resolved by Figma at extraction time. No DTCG equivalent; Figma extraction provenance only. */
      rawValue?: string | number | boolean;
    };
  };
}

/**
 * Style value types supported in the output format.
 * Can be primitives, token references, or prop bindings.
 */
export type Style = string | boolean | number | null | TokenReference | PropBinding;

/**
 * Colour-specific style value type.
 * Mirrors `ColorStyleValue` in `schema/styles.schema.json`.
 * Used for `backgroundColor`, `textColor`, and `strokes` — the three properties
 * whose values are always colour-semantics and may carry gradient data.
 */
export type ColorStyle = string | TokenReference | GradientValue | null;

/**
 * Inline typography properties grouped into a composite object.
 * All fields are optional; only properties set on the text node are present.
 * Maps to transformer primitive types: font, mixableNumber, mixableString, pureNumber, boolean, lineHeight.
 */
export interface Typography {
  /** Font size in pixels (mixableNumber primitive) */
  fontSize?: number | 'mixed' | TokenReference;
  /** Font family name; 'mixed' when text has multiple families (font primitive) */
  fontFamily?: string | number | 'mixed';
  /** Style name or numeric (e.g., 400, "Bold"); 'mixed' allowed (font primitive) */
  fontStyle?: string | number | 'mixed';
  /** Line height: "150%", "auto", or pixel value (lineHeight primitive) */
  lineHeight?: string | number | TokenReference;
  /** Letter spacing in pixels; 'mixed' allowed (mixableNumber primitive) */
  letterSpacing?: number | 'mixed' | TokenReference;
  /** Text case: "UPPER", "LOWER", "TITLE", "ORIGINAL", or 'mixed' (mixableString primitive) */
  textCase?: string | 'mixed' | TokenReference;
  /** Text decoration: "UNDERLINE", "STRIKETHROUGH", "NONE", or 'mixed' (mixableString primitive) */
  textDecoration?: string | 'mixed' | TokenReference;
  /** Paragraph indent in pixels (pureNumber primitive) */
  paragraphIndent?: number | TokenReference;
  /** Spacing between paragraphs in pixels (pureNumber primitive) */
  paragraphSpacing?: number | TokenReference;
  /** Leading trim value (mixableNumber primitive) */
  leadingTrim?: number | 'mixed' | TokenReference;
  /** Spacing for list items in pixels (pureNumber primitive) */
  listSpacing?: number | TokenReference;
  /** Whether hanging punctuation is enabled (boolean primitive) */
  hangingPunctuation?: boolean | TokenReference;
  /** Whether hanging list is enabled (boolean primitive) */
  hangingList?: boolean | TokenReference;
}

/**
 * Aspect ratio expressed as a numerator/denominator pair.
 * `x` is the numerator (e.g. 16), `y` is the denominator (e.g. 9).
 * Both components are required; irrational ratios are expressed as `{ x: 1.618, y: 1 }`.
 */
export interface AspectRatioValue {
  /** Ratio numerator (e.g. 16 for 16:9) */
  x: number;
  /** Ratio denominator (e.g. 9 for 16:9) */
  y: number;
}

/**
 * Aspect ratio style value.
 * Present only when the node has a locked ratio; `null` when unconstrained.
 * `TokenReference` is intentionally excluded — aspect ratio is a structural
 * lock of literal numbers in the Figma API, not a token-driven value.
 */
export type AspectRatioStyle = AspectRatioValue | null;

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
  | 'typography'
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
  | 'bottomRightRadius'
  | 'aspectRatio';
