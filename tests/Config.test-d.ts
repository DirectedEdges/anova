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
    tokens: 'TOKEN',
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
const tokenConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'TOKEN' } };
const tokenNameConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'TOKEN_NAME' } };
const tokenFigmaExtConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'TOKEN_FIGMA_EXTENSIONS' } };
const figmaNameConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'FIGMA_NAME' } };
const customConfig: Config = { ...fullConfig, format: { ...fullConfig.format, tokens: 'CUSTOM' } };

// DEFAULT_CONFIG should be a valid Config
const defaultIsValid: Config = DEFAULT_CONFIG;

// DEFAULT_CONFIG.format.tokens should be 'TOKEN'
const defaultTokensValue: typeof DEFAULT_CONFIG.format.tokens = 'TOKEN';

// Type narrowing works
const tokensValue: Config['format']['tokens'] = fullConfig.format.tokens;
if (tokensValue === 'TOKEN') {
  const _token: 'TOKEN' = tokensValue;
}
if (tokensValue === 'TOKEN_NAME') {
  const _tokenName: 'TOKEN_NAME' = tokensValue;
}
if (tokensValue === 'TOKEN_FIGMA_EXTENSIONS') {
  const _tokenFigmaExt: 'TOKEN_FIGMA_EXTENSIONS' = tokensValue;
}
if (tokensValue === 'FIGMA_NAME') {
  const _figmaName: 'FIGMA_NAME' = tokensValue;
}
if (tokensValue === 'CUSTOM') {
  const _custom: 'CUSTOM' = tokensValue;
}

// tokens can be undefined
const _undefined: Config['format']['tokens'] = undefined;

// glyphNamePattern is optional — Config compiles without it
const configWithoutGlyph: Config = {
  processing: {
    subcomponentNamePattern: '{C} / _ / {S}',
    variantDepth: 9999,
    details: 'LAYERED',
  },
  format: { output: 'JSON', keys: 'SAFE', layout: 'LAYOUT' },
  include: { subcomponents: false, variantNames: false, invalidVariants: false, invalidCombinations: true },
};

// glyphNamePattern accepts a string
const configWithGlyph: Config = {
  processing: {
    subcomponentNamePattern: '{C} / _ / {S}',
    glyphNamePattern: 'DS Icon Glyph /',
    variantDepth: 9999,
    details: 'LAYERED',
  },
  format: { output: 'JSON', keys: 'SAFE', layout: 'LAYOUT' },
  include: { subcomponents: false, variantNames: false, invalidVariants: false, invalidCombinations: true },
};

// glyphNamePattern can be undefined
const _glyphUndefined: Config['processing']['glyphNamePattern'] = undefined;

// ─── slotConstraints — opt-in slot constraint consolidation (ADR 028) ───────

// slotConstraints is optional — Config compiles without it
const configWithoutSlotConstraints: Config = {
  processing: { subcomponentNamePattern: '{C} / _ / {S}', variantDepth: 9999, details: 'LAYERED' },
  format: { output: 'JSON', keys: 'SAFE', layout: 'LAYOUT' },
  include: { subcomponents: false, variantNames: false, invalidVariants: false, invalidCombinations: true },
};

// slotConstraints accepts a boolean
const configWithSlotConstraints: Config = {
  processing: { subcomponentNamePattern: '{C} / _ / {S}', slotConstraints: true, variantDepth: 9999, details: 'LAYERED' },
  format: { output: 'JSON', keys: 'SAFE', layout: 'LAYOUT' },
  include: { subcomponents: false, variantNames: false, invalidVariants: false, invalidCombinations: true },
};

// slotConstraints can be undefined
const _slotConstraintsUndefined: Config['processing']['slotConstraints'] = undefined;
