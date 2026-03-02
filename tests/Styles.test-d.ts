/**
 * Type-level tests for Styles, Shadow, Blur, Effects, Typography, and gradient types.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type {
  Styles, Shadow, Blur, Effects, Typography, FigmaStyle, VariableStyle,
  ColorStyle, GradientStop, GradientCenter, LinearGradient, RadialGradient,
  AngularGradient, GradientValue, AspectRatioValue, AspectRatioStyle,
} from '../types/index.js';

// ─── Shadow ────────────────────────────────────────────────────────────────

const shadowRaw: Shadow = {
  visible: true,
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  spread: 0,
  color: '#000000FF',
};

const shadowVariable: Shadow = {
  visible: false,
  inset: true,
  offsetX: { id: 'var:1' } satisfies VariableStyle,
  offsetY: { id: 'var:2' } satisfies VariableStyle,
  blur: 4,
  spread: 0,
  color: { id: 'var:3' } satisfies VariableStyle,
};

// visible must be boolean — @ts-expect-error: string is not boolean
const _badVisible: Shadow = {
  // @ts-expect-error
  visible: 'yes',
  offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: '#000000FF',
};

// ─── Blur ──────────────────────────────────────────────────────────────────

const blurRaw: Blur = { visible: true, radius: 12 };
const blurVariable: Blur = { visible: false, radius: { id: 'var:4' } satisfies VariableStyle };

// @ts-expect-error: missing required radius
const _badBlur: Blur = { visible: true };

// ─── Effects ──────────────────────────────────────────────────────────────

// All keys optional — empty Effects is valid
const emptyGroup: Effects = {};

const fullGroup: Effects = {
  shadows: [shadowRaw, { ...shadowVariable, inset: true }],
  layerBlur: blurRaw,
  backgroundBlur: blurVariable,
};

// shadows is Shadow[], not Shadow
const _shadowsType: Shadow[] | undefined = fullGroup.shadows;

// layerBlur is singular Blur, not array
const _layerType: Blur | undefined = fullGroup.layerBlur;

// ─── Styles.effects ────────────────────────────────────────────────────────

// Named style reference
const withFigmaStyle: Styles = {
  effects: { id: 'S:abc123' } satisfies FigmaStyle,
};

// Inline effects via Effects
const withEffectsGroup: Styles = {
  effects: fullGroup,
};

// null is valid (effects absent in output)
const withNullEffects: Styles = {
  effects: null as unknown as FigmaStyle, // value-level; type allows omission
};

// effects is optional — no effects key at all is valid
const withNoEffects: Styles = {};

// ─── effects must not be a Shadow[] array directly (old shape) ─────────────
// @ts-expect-error: Shadow[] is not assignable to FigmaStyle | Effects
const _oldEffectsShape: FigmaStyle | Effects = [shadowRaw];

// ─── AspectRatioValue ──────────────────────────────────────────────────────

const ratio16x9: AspectRatioValue = { x: 16, y: 9 };
const ratioSquare: AspectRatioValue = { x: 1, y: 1 };
const ratioIrrational: AspectRatioValue = { x: 1.618, y: 1 };

// @ts-expect-error: missing required y
const _missingY: AspectRatioValue = { x: 16 };

// @ts-expect-error: missing required x
const _missingX: AspectRatioValue = { y: 9 };

// @ts-expect-error: string not assignable to number
const _stringX: AspectRatioValue = { x: '16', y: 9 };

// ─── AspectRatioStyle ──────────────────────────────────────────────────────

// Object pair is valid
const ratioStyle: AspectRatioStyle = { x: 4, y: 3 };

// null is valid (no ratio constraint)
const noRatio: AspectRatioStyle = null;

// VariableStyle must NOT be assignable to AspectRatioStyle
// @ts-expect-error: VariableStyle is not a valid AspectRatioStyle
const _varRatio: AspectRatioStyle = { id: 'var:1' } satisfies VariableStyle;

// ─── Styles.aspectRatio ────────────────────────────────────────────────────

// Field is optional — omitting it is valid
const noAspectRatio: Styles = {};

// Object pair
const withRatio: Styles = { aspectRatio: { x: 16, y: 9 } };

// null is valid
const withNullRatio: Styles = { aspectRatio: null };

// @ts-expect-error: plain number is not valid
const _numberRatio: Styles = { aspectRatio: 1.777 };

// @ts-expect-error: string is not valid
const _stringRatio: Styles = { aspectRatio: '16:9' };

// ─── Typography ────────────────────────────────────────────────────────────

// All keys optional — empty typography group is valid
const emptyTypography: Typography = {};

// Typography with all raw primitive values
const fullTypographyRaw: Typography = {
  fontSize: 16,
  fontFamily: 'Inter',
  fontStyle: 'Regular',
  lineHeight: '150%',
  letterSpacing: 0,
  textCase: 'ORIGINAL',
  textDecoration: 'NONE',
  paragraphIndent: 0,
  paragraphSpacing: 12,
  leadingTrim: 0,
  listSpacing: 8,
  hangingPunctuation: false,
  hangingList: false,
};

// Typography with VariableStyle values
const fullTypographyVariable: Typography = {
  fontSize: { id: 'var:fontSize' } satisfies VariableStyle,
  fontFamily: 'Inter', // font primitive does not accept VariableStyle
  fontStyle: 'Regular', // font primitive does not accept VariableStyle
  lineHeight: { id: 'var:lineHeight' } satisfies VariableStyle,
  letterSpacing: { id: 'var:letterSpacing' } satisfies VariableStyle,
  textCase: { id: 'var:textCase' } satisfies VariableStyle,
  textDecoration: { id: 'var:textDecoration' } satisfies VariableStyle,
  paragraphIndent: { id: 'var:paragraphIndent' } satisfies VariableStyle,
  paragraphSpacing: { id: 'var:paragraphSpacing' } satisfies VariableStyle,
  leadingTrim: { id: 'var:leadingTrim' } satisfies VariableStyle,
  listSpacing: { id: 'var:listSpacing' } satisfies VariableStyle,
  hangingPunctuation: { id: 'var:hangingPunctuation' } satisfies VariableStyle,
  hangingList: { id: 'var:hangingList' } satisfies VariableStyle,
};

// Typography with 'mixed' values (for multi-selection)
const mixedTypography: Typography = {
  fontSize: 'mixed',
  fontFamily: 'mixed',
  fontStyle: 'mixed',
  letterSpacing: 'mixed',
  textCase: 'mixed',
  textDecoration: 'mixed',
  leadingTrim: 'mixed',
};

// fontSize accepts number, 'mixed', or VariableStyle
const _fontSizeNumber: number | 'mixed' | VariableStyle | undefined = mixedTypography.fontSize;

// fontFamily/fontStyle accept string, number, 'mixed', or VariableStyle (number for registered families)
const _fontFamily: string | number | 'mixed' | undefined = fullTypographyRaw.fontFamily;

// hangingPunctuation accepts boolean or VariableStyle
const _hangingBool: boolean | VariableStyle | undefined = fullTypographyRaw.hangingPunctuation;

// @ts-expect-error: fontSize must not accept string
const _badFontSize: Typography = { fontSize: '16px' };

// @ts-expect-error: fontFamily must not accept VariableStyle (font primitive restriction)
const _badFontFamily: Typography = { fontFamily: { id: 'var:1' } satisfies VariableStyle };

// @ts-expect-error: fontStyle must not accept VariableStyle (font primitive restriction)
const _badFontStyle: Typography = { fontStyle: { id: 'var:2' } satisfies VariableStyle };

// @ts-expect-error: hangingPunctuation must not accept string
const _badHanging: Typography = { hangingPunctuation: 'yes' };

// ─── Styles.typography ─────────────────────────────────────────────────────

// Named text style reference
const withTextStyle: Styles = {
  typography: { id: 'S:textStyle123' } satisfies FigmaStyle,
};

// Inline typography via Typography
const withTypographyGroup: Styles = {
  typography: fullTypographyRaw,
};

// null is valid (typography absent in output)
const withNullTypography: Styles = {
  typography: null as unknown as FigmaStyle, // value-level; type allows omission
};

// typography is optional — no typography key at all is valid
const withNoTypography: Styles = {};

// ─── Verify flat typography properties removed from Styles ────────────────

// @ts-expect-error: fontSize no longer exists on Styles
const _oldFontSize: Styles = { fontSize: 16 };

// @ts-expect-error: fontFamily no longer exists on Styles
const _oldFontFamily: Styles = { fontFamily: 'Inter' };

// @ts-expect-error: fontStyle no longer exists on Styles
const _oldFontStyle: Styles = { fontStyle: 'Regular' };

// @ts-expect-error: lineHeight no longer exists on Styles
const _oldLineHeight: Styles = { lineHeight: { value: 24, unit: 'PIXELS' } };

// @ts-expect-error: letterSpacing no longer exists on Styles
const _oldLetterSpacing: Styles = { letterSpacing: 0 };

// @ts-expect-error: textCase no longer exists on Styles
const _oldTextCase: Styles = { textCase: 'ORIGINAL' };

// @ts-expect-error: textDecoration no longer exists on Styles
const _oldTextDecoration: Styles = { textDecoration: 'NONE' };

// @ts-expect-error: paragraphIndent no longer exists on Styles
const _oldParagraphIndent: Styles = { paragraphIndent: 0 };

// @ts-expect-error: paragraphSpacing no longer exists on Styles
const _oldParagraphSpacing: Styles = { paragraphSpacing: 12 };

// @ts-expect-error: leadingTrim no longer exists on Styles
const _oldLeadingTrim: Styles = { leadingTrim: 'NONE' };

// @ts-expect-error: listSpacing no longer exists on Styles
const _oldListSpacing: Styles = { listSpacing: 8 };

// @ts-expect-error: hangingPunctuation no longer exists on Styles
const _oldHangingPunctuation: Styles = { hangingPunctuation: false };

// @ts-expect-error: hangingList no longer exists on Styles
const _oldHangingList: Styles = { hangingList: false };

// @ts-expect-error: textStyleId no longer exists on Styles
const _oldTextStyleId: Styles = { textStyleId: 'S:123' };
