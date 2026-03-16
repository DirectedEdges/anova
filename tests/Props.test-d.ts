/**
 * Type-level tests for StringProp (merged from TextProp + GlyphProp)
 * and other prop types.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { StringProp, BooleanProp, EnumProp, SlotProp, AnyProp, FigmaCodeOnlySource, FigmaPropExtension, PropExtensions } from '../types/index.js';

// ─── StringProp — examples field ──────────────────────────────────────────────

// examples is optional and accepts string[]
const stringWithExamples: StringProp = { type: 'string', examples: ['Label', 'Title'] };
const stringNoExamples: StringProp = { type: 'string' };

// default is optional
const stringWithDefault: StringProp = { type: 'string', default: 'Label' };
const stringBoth: StringProp = { type: 'string', default: 'Label', examples: ['Label'] };

// nullable is optional
const stringNullable: StringProp = { type: 'string', nullable: true };

// default accepts null for nullable props
const stringNullDefault: StringProp = { type: 'string', default: null, nullable: true };
const stringNullDefaultOnly: StringProp = { type: 'string', default: null };

// @ts-expect-error: default must be string | null, not number
const _stringBadDefault: StringProp = { type: 'string', default: 42 };

// @ts-expect-error: examples must be string[], not number[]
const _stringBadExamples: StringProp = { type: 'string', examples: [42] };

// @ts-expect-error: examples must be an array, not a string
const _stringBadExamplesStr: StringProp = { type: 'string', examples: 'Label' };

// ─── StringProp assignable to AnyProp ─────────────────────────────────────────

const anyFromString: AnyProp = { type: 'string' } satisfies StringProp;
const anyFromStringExamples: AnyProp = { type: 'string', examples: ['Check', 'Close'] } satisfies StringProp;

// ─── TextProp, IconProp, and GlyphProp no longer exist ────────────────────────

// @ts-expect-error: TextProp is not exported
type _TextPropCheck = import('../types/index.js').TextProp;

// @ts-expect-error: IconProp is not exported
type _IconPropCheck = import('../types/index.js').IconProp;

// @ts-expect-error: GlyphProp is not exported
type _GlyphPropCheck = import('../types/index.js').GlyphProp;

// ─── BooleanProp — default remains required, no examples ────────────────────

const boolProp: BooleanProp = { type: 'boolean', default: true };

// @ts-expect-error: default is required on BooleanProp
const _boolNoDefault: BooleanProp = { type: 'boolean' };

// ─── EnumProp — default remains required, no examples ───────────────────────

const enumProp: EnumProp = { type: 'string', default: 'sm', enum: ['sm', 'md', 'lg'] };

// @ts-expect-error: default is required on EnumProp
const _enumNoDefault: EnumProp = { type: 'string', enum: ['sm', 'md'] };

// ─── SlotProp — default optional, nullable optional, null default ────────────

const slotProp: SlotProp = { type: 'slot', default: 'Content' };
const slotNullable: SlotProp = { type: 'slot', default: 'Content', nullable: true };
const slotNullDefault: SlotProp = { type: 'slot', default: null, nullable: true };
const slotNullDefaultOnly: SlotProp = { type: 'slot', default: null };

// default is now optional — SlotProp without default is valid (ADR 023)
const slotNoDefault: SlotProp = { type: 'slot' };

// @ts-expect-error: default must be string | null, not number
const _slotBadDefault: SlotProp = { type: 'slot', default: 42 };

// ─── FigmaCodeOnlySource — code-only prop provenance ────────────────────────

const codeOnlyText: FigmaCodeOnlySource = { kind: 'codeOnlyProp', layer: 'Accessibility label' };
const codeOnlyEnum: FigmaCodeOnlySource = { kind: 'codeOnlyProp', layer: 'Heading Level', instanceOf: 'Heading Level' };

// @ts-expect-error: kind must be 'codeOnlyProp'
const _badKind: FigmaCodeOnlySource = { kind: 'other', layer: 'x' };

// @ts-expect-error: layer is required
const _noLayer: FigmaCodeOnlySource = { kind: 'codeOnlyProp' };

// ─── FigmaPropExtension — Figma-specific metadata on props ──────────────────

const figmaExt: FigmaPropExtension = { type: 'TEXT' };
const figmaExtWithSource: FigmaPropExtension = { type: 'BOOLEAN', source: { kind: 'codeOnlyProp', layer: 'hasA11y' } };
const figmaExtEmpty: FigmaPropExtension = {};

// ─── PropExtensions — $extensions on prop interfaces ────────────────────────

const extensions: PropExtensions = { 'com.figma': { type: 'TEXT' } };
const extensionsEmpty: PropExtensions = {};

// ─── $extensions on each prop type ──────────────────────────────────────────

const boolWithExt: BooleanProp = {
  type: 'boolean',
  default: false,
  $extensions: { 'com.figma': { type: 'BOOLEAN', source: { kind: 'codeOnlyProp', layer: 'hasOverrides' } } }
};

const stringWithExt: StringProp = {
  type: 'string',
  $extensions: { 'com.figma': { type: 'TEXT', source: { kind: 'codeOnlyProp', layer: 'ariaLabel' } } }
};

const enumWithExt: EnumProp = {
  type: 'string',
  default: 'h2',
  enum: ['h1', 'h2', 'h3'],
  $extensions: { 'com.figma': { type: 'VARIANT', source: { kind: 'codeOnlyProp', layer: 'Heading Level', instanceOf: 'Heading Level' } } }
};

const slotWithExt: SlotProp = {
  type: 'slot',
  $extensions: { 'com.figma': { type: 'INSTANCE_SWAP' } }
};

// $extensions is optional — all props work without it
const boolNoExt: BooleanProp = { type: 'boolean', default: true };
const stringNoExt: StringProp = { type: 'string' };

// $extensions assignable to AnyProp
const anyWithExt: AnyProp = boolWithExt;
const anyWithExt2: AnyProp = stringWithExt;
const anyWithExt3: AnyProp = enumWithExt;
