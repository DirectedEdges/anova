/**
 * Type-level tests for Anatomy and AnatomyElement.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Anatomy, AnatomyElement, ElementType } from '../types/index.js';

// AnatomyElement.type accepts all known ElementType values
const textElement: AnatomyElement = { type: 'text' };
const iconElement: AnatomyElement = { type: 'icon' };
const vectorElement: AnatomyElement = { type: 'vector' };
const containerElement: AnatomyElement = { type: 'container' };
const slotElement: AnatomyElement = { type: 'slot' };
const instanceElement: AnatomyElement = { type: 'instance' };
const lineElement: AnatomyElement = { type: 'line' };
const ellipseElement: AnatomyElement = { type: 'ellipse' };
const rectangleElement: AnatomyElement = { type: 'rectangle' };
const polygonElement: AnatomyElement = { type: 'polygon' };
const starElement: AnatomyElement = { type: 'star' };

// AnatomyElement.type does NOT accept arbitrary strings
// @ts-expect-error — 'unknown-type' is not a valid ElementType
const invalidElement: AnatomyElement = { type: 'unknown-type' };

// AnatomyElement with optional fields
const fullElement: AnatomyElement = {
  type: 'instance',
  detectedIn: 'variant-1',
  instanceOf: 'Button',
};

// AnatomyElement without optional fields
const minimalElement: AnatomyElement = { type: 'container' };

// Anatomy is a record of named AnatomyElements
const anatomy: Anatomy = {
  root: { type: 'container' },
  label: { type: 'text' },
  icon: { type: 'icon' },
};

// ElementType assignability
const elementType: ElementType = 'icon';
const anatomyType: AnatomyElement['type'] = elementType;
