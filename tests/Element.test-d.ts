/**
 * Type-level tests for Element.content field.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Element, PropBinding } from '../types/index.js';

// ─── Element.content accepts string | PropBinding ───────────────────────────

const contentString: Element = { content: 'Submit' };
const contentIcon: Element = { content: 'caret-down' };
const contentBound: Element = { content: { $binding: '#/props/label' } };

// content is optional — empty element is valid
const emptyElement: Element = {};

// Old { $ref } shape must NOT compile as Element.content
// @ts-expect-error: { $ref } is not valid for content
const _oldContent: Element = { content: { $ref: '#/props/label' } };

// ─── Element.text has been removed ──────────────────────────────────────────

// @ts-expect-error: text property no longer exists on Element
const _removedText: Element = { text: 'Submit' };
