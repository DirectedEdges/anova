/**
 * Type-level tests for TextProp and GlyphProp examples field
 * and optional default.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { TextProp, GlyphProp, BooleanProp, EnumProp, SlotProp } from '../types/index.js';

// ─── TextProp — examples field ──────────────────────────────────────────────

// examples is optional and accepts string[]
const textWithExamples: TextProp = { type: 'string', examples: ['Label', 'Title'] };
const textNoExamples: TextProp = { type: 'string' };

// default is now optional
const textWithDefault: TextProp = { type: 'string', default: 'Label' };
const textBoth: TextProp = { type: 'string', default: 'Label', examples: ['Label'] };

// default accepts null for nullable props
const textNullDefault: TextProp = { type: 'string', default: null, nullable: true };
const textNullDefaultOnly: TextProp = { type: 'string', default: null };

// @ts-expect-error: default must be string | null, not number
const _textBadDefault: TextProp = { type: 'string', default: 42 };

// @ts-expect-error: examples must be string[], not number[]
const _textBadExamples: TextProp = { type: 'string', examples: [42] };

// @ts-expect-error: examples must be an array, not a string
const _textBadExamplesStr: TextProp = { type: 'string', examples: 'Label' };

// ─── GlyphProp — examples field ─────────────────────────────────────────────

// examples is optional and accepts string[]
const glyphWithExamples: GlyphProp = { type: 'string', examples: ['Check', 'Close'] };
const glyphNoExamples: GlyphProp = { type: 'string' };

// default is now optional
const glyphWithDefault: GlyphProp = { type: 'string', default: 'Check' };
const glyphBoth: GlyphProp = { type: 'string', default: 'Check', examples: ['Check'] };

// default accepts null for nullable props
const glyphNullDefault: GlyphProp = { type: 'string', default: null, nullable: true };
const glyphNullDefaultOnly: GlyphProp = { type: 'string', default: null };

// @ts-expect-error: default must be string | null, not number
const _glyphBadDefault: GlyphProp = { type: 'string', default: 42 };

// @ts-expect-error: examples must be string[], not number[]
const _glyphBadExamples: GlyphProp = { type: 'string', examples: [42] };

// ─── BooleanProp — default remains required, no examples ────────────────────

const boolProp: BooleanProp = { type: 'boolean', default: true };

// @ts-expect-error: default is required on BooleanProp
const _boolNoDefault: BooleanProp = { type: 'boolean' };

// ─── EnumProp — default remains required, no examples ───────────────────────

const enumProp: EnumProp = { type: 'string', default: 'sm', enum: ['sm', 'md', 'lg'] };

// @ts-expect-error: default is required on EnumProp
const _enumNoDefault: EnumProp = { type: 'string', enum: ['sm', 'md'] };

// ─── SlotProp — default remains required, no examples ───────────────────────

const slotProp: SlotProp = { type: 'slot', default: 'Content' };

// @ts-expect-error: default is required on SlotProp
const _slotNoDefault: SlotProp = { type: 'slot' };
