/**
 * Type-level tests for Metadata.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Metadata } from '../types/index.js';

const baseConfig: Metadata['config'] = {
  processing: { subcomponentNamePattern: '{C} / _ / {S}', variantDepth: 9999, details: 'LAYERED' },
  format: { output: 'JSON', keys: 'SAFE', layout: 'LAYOUT', variables: 'NAME_WITH_COLLECTION', simplifyVariables: true, simplifyStyles: true },
  include: { subcomponents: false, variantNames: false, invalidVariants: false, invalidCombinations: true },
};

// Minimal valid Metadata — license absent (optional field)
const withoutLicense: Metadata = {
  author: 'test',
  lastUpdated: '2026-02-24T00:00:00Z',
  generator: { url: 'https://example.com', version: 1, name: 'test' },
  schema: { url: 'https://example.com/schema', version: '1.0.0' },
  source: { pageId: 'p1', nodeId: 'n1', nodeType: 'COMPONENT' },
  config: baseConfig,
};

// With license present — both subfields required
const withLicense: Metadata = {
  ...withoutLicense,
  license: {
    status: 'active',
    description: 'License is valid.',
  },
};

// status and description are strings
const _status: string = withLicense.license!.status;
const _description: string = withLicense.license!.description;

// license is optional — can be undefined
const _optional: { status: string; description: string } | undefined = withoutLicense.license;
