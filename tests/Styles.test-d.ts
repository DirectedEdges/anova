/**
 * Type-level tests for Styles, Shadow, Blur, Effects, Typography, and gradient types.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type {
  Styles, Shadow, Blur, Effects, Typography,
  TokenReference, ColorStyle, GradientStop, GradientCenter, LinearGradient, RadialGradient,
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
  offsetX: { $token: 'Space.2', $type: 'dimension' } satisfies TokenReference,
  offsetY: { $token: 'Space.4', $type: 'dimension' } satisfies TokenReference,
  blur: 4,
  spread: 0,
  color: { $token: 'DS Color.Text.Primary', $type: 'color' } satisfies TokenReference,
};

// Old VariableStyle shape must NOT compile as Shadow field — breaking change
// @ts-expect-error: VariableStyle is no longer valid for Shadow.offsetX
const _oldVarAsOffset: Shadow['offsetX'] = { id: 'var:1' };

// visible must be boolean — @ts-expect-error: string is not boolean
const _badVisible: Shadow = {
  // @ts-expect-error
  visible: 'yes',
  offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: '#000000FF',
};

// ─── Blur ──────────────────────────────────────────────────────────────────

const blurRaw: Blur = { visible: true, radius: 12 };
const blurToken: Blur = { visible: false, radius: { $token: 'Blur.Soft', $type: 'dimension' } satisfies TokenReference };

// Old VariableStyle shape must NOT compile as Blur.radius — breaking change
// @ts-expect-error: VariableStyle is no longer valid for Blur.radius
const _oldVarAsRadius: Blur['radius'] = { id: 'var:4' };

// @ts-expect-error: missing required radius
const _badBlur: Blur = { visible: true };

// ─── Effects ──────────────────────────────────────────────────────────────

// All keys optional — empty Effects is valid
const emptyGroup: Effects = {};

const fullGroup: Effects = {
  shadows: [shadowRaw, { ...shadowVariable, inset: true }],
  layerBlur: blurRaw,
  backgroundBlur: blurToken,
};

// shadows is Shadow[], not Shadow
const _shadowsType: Shadow[] | undefined = fullGroup.shadows;

// layerBlur is singular Blur, not array
const _layerType: Blur | undefined = fullGroup.layerBlur;

// ─── Styles.effects ────────────────────────────────────────────────────────

// Named style reference — now uses TokenReference ($type: 'effects')
const withEffectsRef: Styles = {
  effects: { $token: 'Elevation.Shadow.Card', $type: 'effects' } satisfies TokenReference,
};

// Old FigmaStyle shape must NOT compile as Styles.effects — breaking change
// @ts-expect-error: FigmaStyle is no longer valid for Styles.effects
const _oldFigmaAsEffects: NonNullable<Styles['effects']> = { id: 'S:abc123' };

// Inline effects via Effects
const withEffectsGroup: Styles = {
  effects: fullGroup,
};

// effects is optional — no effects key at all is valid
const withNoEffects: Styles = {};

// ─── effects must not be a Shadow[] array directly (old shape) ─────────────
// @ts-expect-error: Shadow[] is not assignable to TokenReference | Effects
const _oldEffectsShape: TokenReference | Effects = [shadowRaw];

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

// An { id } object must NOT be assignable to AspectRatioStyle
// @ts-expect-error: { id } is not a valid AspectRatioStyle
const _varRatio: AspectRatioStyle = { id: 'var:1' };

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

// Typography with TokenReference values
const fullTypographyToken: Typography = {
  fontSize: { $token: 'Typography.Body.Size', $type: 'dimension' } satisfies TokenReference,
  fontFamily: 'Inter', // font primitive does not accept TokenReference
  fontStyle: 'Regular', // font primitive does not accept TokenReference
  lineHeight: { $token: 'Typography.Body.LineHeight', $type: 'dimension' } satisfies TokenReference,
  letterSpacing: { $token: 'Typography.Body.LetterSpacing', $type: 'dimension' } satisfies TokenReference,
  textCase: { $token: 'Typography.Body.TextCase', $type: 'string' } satisfies TokenReference,
  textDecoration: { $token: 'Typography.Body.Decoration', $type: 'string' } satisfies TokenReference,
  paragraphIndent: { $token: 'Typography.Body.Indent', $type: 'dimension' } satisfies TokenReference,
  paragraphSpacing: { $token: 'Typography.Body.ParaSpacing', $type: 'dimension' } satisfies TokenReference,
  leadingTrim: { $token: 'Typography.Body.LeadingTrim', $type: 'dimension' } satisfies TokenReference,
  listSpacing: { $token: 'Typography.Body.ListSpacing', $type: 'dimension' } satisfies TokenReference,
  hangingPunctuation: { $token: 'Typography.Body.HangingPunct', $type: 'boolean' } satisfies TokenReference,
  hangingList: { $token: 'Typography.Body.HangingList', $type: 'boolean' } satisfies TokenReference,
};

// Old VariableStyle shape must NOT compile as Typography sub-field — breaking change
// @ts-expect-error: VariableStyle is no longer valid for Typography.fontSize
const _oldVarAsFontSize: Typography['fontSize'] = { id: 'var:fontSize' };

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

// fontSize accepts number, 'mixed', or TokenReference
const _fontSizeNumber: number | 'mixed' | TokenReference | undefined = fullTypographyRaw.fontSize;

// fontFamily/fontStyle accept string, number, 'mixed', or VariableStyle (number for registered families)
const _fontFamily: string | number | 'mixed' | undefined = fullTypographyRaw.fontFamily;

// hangingPunctuation accepts boolean or TokenReference
const _hangingBool: boolean | TokenReference | undefined = fullTypographyRaw.hangingPunctuation;

// @ts-expect-error: fontSize must not accept string
const _badFontSize: Typography = { fontSize: '16px' };

// @ts-expect-error: fontFamily must not accept TokenReference (font primitive restriction)
const _badFontFamily: Typography['fontFamily'] = { $token: 'X', $type: 'string' };

// @ts-expect-error: fontStyle must not accept TokenReference (font primitive restriction)
const _badFontStyle: Typography['fontStyle'] = { $token: 'X', $type: 'string' };

// @ts-expect-error: hangingPunctuation must not accept string
const _badHanging: Typography = { hangingPunctuation: 'yes' };

// ─── Styles.typography ─────────────────────────────────────────────────────

// Named text style reference — now uses TokenReference ($type: 'typography')
const withTextStyle: Styles = {
  typography: { $token: 'Body.Medium', $type: 'typography' } satisfies TokenReference,
};

// Old FigmaStyle shape must NOT compile as Styles.typography — breaking change
// @ts-expect-error: FigmaStyle is no longer valid for Styles.typography
const _oldFigmaAsTypo: NonNullable<Styles['typography']> = { id: 'S:textStyle123' };

// Inline typography via Typography
const withTypographyGroup: Styles = {
  typography: fullTypographyRaw,
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
