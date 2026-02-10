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
    /** Depth of variant expansion: 1-3 or 9999 for unlimited */
    variantDepth: 1 | 2 | 3 | 9999;
    /** Level of detail in output */
    details: 'FULL' | 'LAYERED';
  };
  format: {
    /** Output format */
    output: 'JSON' | 'YAML';
    /** Key naming convention */
    keys: 'SAFE' | 'CAMEL' | 'SNAKE' | 'KEBAB' | 'PASCAL' | 'TRAIN';
    /** Layout representation format */
    layout: 'LAYOUT' | 'PARENT_CHILDREN' | 'BOTH';
    /** Variable naming format */
    variables: 'NAME_WITH_COLLECTION' | 'NAME' | 'OBJECT';
    /** Whether to simplify variable references */
    simplifyVariables: boolean;
    /** Whether to simplify style references */
    simplifyStyles: boolean;
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
