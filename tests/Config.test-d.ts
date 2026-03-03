/**
 * Type-level tests for Config.
 * These files are intentionally never executed — they are compiled with tsc
 * to assert that the type shape is correct.
 */
import type { Config } from '../types/index.js';
import { DEFAULT_CONFIG } from '../types/index.js';

// Config format with all fields including optional tokens
const fullConfig: Config = {
  processing: {
    subcomponentNamePattern: '{C} / _ / {S}',
    variantDepth: 9999,
    details: 'LAYERED',
  },
  format: {
    output: 'JSON',
    keys: 'SAFE',
    layout: 'LAYOUT',
    tokens: 'DTCG',
  },
  include: {
    subcomponents: false,
    variantNames: false,
    invalidVariants: false,
    invalidCombinations: true,
  },
};

// Config format without optional tokens field — should compile
const configWithoutTokens: Config = {
  processing: {
    subcomponentNamePattern: '{C} / _ / {S}',
    variantDepth: 9999,
    details: 'FULL',
  },
  format: {
    output: 'YAML',
    keys: 'CAMEL',
    layout: 'PARENT_CHILDREN',
    // tokens is optional
  },
  include: {
    subcomponents: true,
    variantNames: true,
    invalidVariants: true,
    invalidCombinations: false,
  },
};

// All tokens enum values are valid
const dtcgConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'DTCG' } };
const dtcgCompactConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'DTCG_COMPACT' } };
const figmaConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'FIGMA' } };
const figmaCompactConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'FIGMA_COMPACT' } };
const customConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'CUSTOM' } };

// DEFAULT_CONFIG should be a valid Config
const defaultIsValid: Config = DEFAULT_CONFIG;

// DEFAULT_CONFIG.format.tokens should be 'DTCG'
const defaultTokensValue: typeof DEFAULT_CONFIG.format.tokens = 'DTCG';

// Type narrowing works
const tokensValue: Config['format']['tokens'] = fullConfig.format.tokens;
if (tokensValue === 'DTCG') {
  const _dtcg: 'DTCG' = tokensValue;
}
if (tokensValue === 'DTCG_COMPACT') {
  const _compact: 'DTCG_COMPACT' = tokensValue;
}
if (tokensValue === 'FIGMA') {
  const _figma: 'FIGMA' = tokensValue;
}
if (tokensValue === 'FIGMA_COMPACT') {
  const _figmaCompact: 'FIGMA_COMPACT' = tokensValue;
}
if (tokensValue === 'CUSTOM') {
  const _custom: 'CUSTOM' = tokensValue;
}

// tokens can be undefined
const _undefined: Config['format']['tokens'] = undefined;
