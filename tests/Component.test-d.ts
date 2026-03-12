/**
 * Type-level tests for Component.invalidPropConfigurations rename.
 *
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Component } from '../types/index.js';

// ─── invalidPropConfigurations — renamed from invalidVariantCombinations ─────

// accepts PropConfigurations[]
const withInvalid: Component = {
  title: 'Button',
  anatomy: {},
  default: {},
  invalidPropConfigurations: [
    { state: 'disabled', interaction: 'hover' },
  ],
};

// optional — omitting is valid
const withoutInvalid: Component = {
  title: 'Button',
  anatomy: {},
  default: {},
};

const oldName: Component = {
  title: 'Button',
  anatomy: {},
  default: {},
  // @ts-expect-error: old field name no longer exists
  invalidVariantCombinations: [{ state: 'disabled' }],
};
