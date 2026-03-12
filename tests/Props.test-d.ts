/**
 * Type-level tests for StringProp (merged from TextProp + IconProp)
 * and other prop types.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { StringProp, BooleanProp, EnumProp, SlotProp, AnyProp } from '../types/index.js';

// ─── StringProp — examples field ──────────────────────────────────────────────

// examples is optional and accepts string[]
const stringWithExamples: StringProp = { type: 'string', examples: ['Label', 'Title'] };
const stringNoExamples: StringProp = { type: 'string' };

// default is optional
const stringWithDefault: StringProp = { type: 'string', default: 'Label' };
const stringBoth: StringProp = { type: 'string', default: 'Label', examples: ['Label'] };

// nullable is optional
const stringNullable: StringProp = { type: 'string', nullable: true };

// @ts-expect-error: examples must be string[], not number[]
const _stringBadExamples: StringProp = { type: 'string', examples: [42] };

// @ts-expect-error: examples must be an array, not a string
const _stringBadExamplesStr: StringProp = { type: 'string', examples: 'Label' };

// ─── StringProp assignable to AnyProp ─────────────────────────────────────────

const anyFromString: AnyProp = { type: 'string' } satisfies StringProp;
const anyFromStringExamples: AnyProp = { type: 'string', examples: ['Check', 'Close'] } satisfies StringProp;

// ─── TextProp and IconProp no longer exist ────────────────────────────────────

// @ts-expect-error: TextProp is not exported
type _TextPropCheck = import('../types/index.js').TextProp;

// @ts-expect-error: IconProp is not exported
type _IconPropCheck = import('../types/index.js').IconProp;

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
