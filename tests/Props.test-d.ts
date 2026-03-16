/**
 * Type-level tests for StringProp (merged from TextProp + GlyphProp)
 * and other prop types.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { StringProp, BooleanProp, EnumProp, SlotProp, AnyProp, FigmaPropExtension, PropExtensions } from '../types/index.js';

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

// ─── $extensions — DTCG §5.2.3 platform metadata (ADR 026) ─────────────────

// FigmaPropExtension is the Figma metadata shape
const _figmaExt: FigmaPropExtension = { type: 'BOOLEAN' };
const _figmaExtEmpty: FigmaPropExtension = {};

// PropExtensions composes platform extensions
const _extCheck: PropExtensions = { 'com.figma': { type: 'BOOLEAN' } };
const _extEmpty: PropExtensions = {};

// $extensions is optional on all prop types
const boolWithExt: BooleanProp = { type: 'boolean', default: true, $extensions: { 'com.figma': { type: 'BOOLEAN' } } };
const boolNoExt: BooleanProp = { type: 'boolean', default: false };
const stringWithExt: StringProp = { type: 'string', $extensions: { 'com.figma': { type: 'TEXT' } } };
const enumWithExt: EnumProp = { type: 'string', default: 'sm', enum: ['sm', 'md'], $extensions: { 'com.figma': { type: 'VARIANT' } } };
const slotWithExt: SlotProp = { type: 'slot', $extensions: { 'com.figma': { type: 'INSTANCE_SWAP' } } };

// $extensions with empty com.figma
const boolEmptyFigma: BooleanProp = { type: 'boolean', default: true, $extensions: { 'com.figma': {} } };

// $extensions with empty object
const boolEmptyExt: BooleanProp = { type: 'boolean', default: true, $extensions: {} };

// Props with $extensions are assignable to AnyProp
const anyFromBoolExt: AnyProp = boolWithExt;
const anyFromStringExt: AnyProp = stringWithExt;
const anyFromEnumExt: AnyProp = enumWithExt;
const anyFromSlotExt: AnyProp = slotWithExt;
