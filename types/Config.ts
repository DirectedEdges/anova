/**
 * Model configuration used to generate the component spec.
 * Full structure matches the transformer's configuration options.
 *
 * @property processing - Processing options for component transformation.
 * @property format - Output format and key naming conventions.
 * @property include - Feature flags for what to include in output.
 */
export interface Config {
  processing: {
    /** Pattern for naming subcomponents */
    subcomponentNamePattern: string;
    /** Naming pattern used to detect glyph content assets (e.g. "DS Icon Glyph /"). Optional; absence means no glyph detection. */
    glyphNamePattern?: string;
    /** Depth of variant expansion: 1-3 or 9999 for unlimited */
    variantDepth: 1 | 2 | 3 | 9999;
    /** Level of detail in output */
    details: 'FULL' | 'LAYERED';
    /** When true, TEXT code-only props whose default and all examples parse as valid numbers (no leading zeros) are emitted as NumberProp instead of StringProp */
    inferNumberProps?: boolean;
  };
  format: {
    /** Output format */
    output: 'JSON' | 'YAML';
    /** Key naming convention */
    keys: 'SAFE' | 'CAMEL' | 'SNAKE' | 'KEBAB' | 'PASCAL' | 'TRAIN';
    /** Layout representation format */
    layout: 'LAYOUT' | 'PARENT_CHILDREN' | 'BOTH';
    /** Token reference serialization profile. Optional; defaults to TOKEN. */
    tokens?: 'TOKEN' | 'TOKEN_NAME' | 'TOKEN_FIGMA_EXTENSIONS' | 'FIGMA_NAME' | 'CUSTOM';
  };
  include: {
    /** Include subcomponents in output */
    subcomponents: boolean;
    /** Include variant names */
    variantNames: boolean;
    /** Include invalid variants */
    invalidVariants: boolean;
    /** Include invalid combinations */
    invalidCombinations: boolean;
  };
}

/**
 * Default Model Configuration
 * 
 * Used by both CLI and Plugin to ensure identical behavior with same settings.
 * 
 * Rationale for defaults:
 * - processing.subcomponentNamePattern: Standard "{C} / _ / {S}" pattern for identifying subcomponents
 * - processing.variantDepth: 9999 (no limit) allows full variant combination exploration
 * - processing.details: LAYERED reduces output size by only showing differences from default
 * - format.keys: SAFE prevents corruption of special characters while maintaining readability
 * - format.layout: LAYOUT provides tree structure with layout properties
 * - format.tokens: TOKEN provides platform-neutral token references with $token path and $type
 * - include.subcomponents: false (opt-in) to avoid unnecessary processing overhead
 * - include.variantNames: false reduces output size (names can be reconstructed from configuration)
 * - include.invalidVariants: false excludes variants that can't be instantiated
 * - include.invalidCombinations: true helps designers identify property conflicts
 */
export const DEFAULT_CONFIG: Config = {
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