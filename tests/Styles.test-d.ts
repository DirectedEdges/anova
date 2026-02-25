/**
 * Type-level tests for Styles, Shadow, Blur, EffectsGroup, and gradient types.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type {
  Styles, Shadow, Blur, EffectsGroup, FigmaStyle, VariableStyle,
  ColorStyle, GradientStop, GradientCenter, LinearGradient, RadialGradient,
  AngularGradient, GradientValue, AspectRatioValue, AspectRatioStyle,
} from '../types/index.js';

// ─── Shadow ────────────────────────────────────────────────────────────────

const shadowRaw: Shadow = {
  visible: true,
  x: 0,
  y: 4,
  blur: 8,
  spread: 0,
  color: '#000000FF',
};

const shadowVariable: Shadow = {
  visible: false,
  x: { id: 'var:1' } satisfies VariableStyle,
  y: { id: 'var:2' } satisfies VariableStyle,
  blur: 4,
  spread: 0,
  color: { id: 'var:3' } satisfies VariableStyle,
};

// visible must be boolean — @ts-expect-error: string is not boolean
const _badVisible: Shadow = {
  // @ts-expect-error
  visible: 'yes',
  x: 0, y: 0, blur: 0, spread: 0, color: '#000000FF',
};

// ─── Blur ──────────────────────────────────────────────────────────────────

const blurRaw: Blur = { visible: true, radius: 12 };
const blurVariable: Blur = { visible: false, radius: { id: 'var:4' } satisfies VariableStyle };

// @ts-expect-error: missing required radius
const _badBlur: Blur = { visible: true };

// ─── EffectsGroup ──────────────────────────────────────────────────────────

// All keys optional — empty group is valid
const emptyGroup: EffectsGroup = {};

const fullGroup: EffectsGroup = {
  dropShadows: [shadowRaw],
  innerShadows: [shadowVariable],
  layerBlur: blurRaw,
  backgroundBlur: blurVariable,
};

// dropShadows is Shadow[], not Shadow
const _dropType: Shadow[] | undefined = fullGroup.dropShadows;

// layerBlur is singular Blur, not array
const _layerType: Blur | undefined = fullGroup.layerBlur;

// ─── Styles.effects ────────────────────────────────────────────────────────

// Named style reference
const withFigmaStyle: Styles = {
  effects: { id: 'S:abc123' } satisfies FigmaStyle,
};

// Inline effects via EffectsGroup
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
// @ts-expect-error: Shadow[] is not assignable to FigmaStyle | EffectsGroup
const _oldEffectsShape: FigmaStyle | EffectsGroup = [shadowRaw];

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
