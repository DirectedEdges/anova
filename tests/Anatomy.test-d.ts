/**
 * Type-level tests for Anatomy, AnatomyElement, and ElementTypeRef.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Anatomy, AnatomyElement, ElementTypeRef } from '../types/index.js';

// AnatomyElement.type accepts plain strings
const textElement: AnatomyElement = { type: 'text' };
const iconElement: AnatomyElement = { type: 'icon' };
const vectorElement: AnatomyElement = { type: 'vector' };
const containerElement: AnatomyElement = { type: 'container' };
const customString: AnatomyElement = { type: 'any-string-value' };

// AnatomyElement.type accepts ElementTypeRef objects
const refElement: AnatomyElement = {
  type: { $ref: 'foundations#/definitions/icon' },
};
const refWithPath: AnatomyElement = {
  type: { $ref: 'https://example.com/schema#/definitions/container' },
};

// ElementTypeRef shape
const ref: ElementTypeRef = { $ref: 'foundations#/definitions/text' };

// @ts-expect-error — ElementTypeRef requires $ref field
const invalidRef: ElementTypeRef = {};

// @ts-expect-error — ElementTypeRef.$ref must be a string
const invalidRefType: ElementTypeRef = { $ref: 123 };

// AnatomyElement with optional fields and ref type
const fullRefElement: AnatomyElement = {
  type: { $ref: 'foundations#/definitions/icon' },
  detectedIn: 'variant-1',
  instanceOf: 'IconGlyph',
};

// AnatomyElement with optional fields and plain string type
const fullStringElement: AnatomyElement = {
  type: 'instance',
  detectedIn: 'variant-1',
  instanceOf: 'Button',
};

// Anatomy is a record of named AnatomyElements — mix of string and ref types
const anatomy: Anatomy = {
  root: { type: 'container' },
  label: { type: 'text' },
  icon: { type: { $ref: 'foundations#/definitions/icon' } },
};

// Type guard discrimination works
const element: AnatomyElement = { type: 'icon' };
if (typeof element.type === 'string') {
  const _str: string = element.type;
} else {
  const _ref: string = element.type.$ref;
}
