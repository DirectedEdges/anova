/**
 * JSON Reference value pointing to a prop configuration.
 * Used when a property is bound to a component property.
 */
export interface ReferenceValue {
  "$ref": string;  // Format: "#/props/{PropName}"
}

/**
 * Type guard to check if a value is a ReferenceValue
 */
export function isReferenceValue(value: unknown): value is ReferenceValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$ref' in value &&
    typeof (value as ReferenceValue)['$ref'] === 'string'
  );
}

/**
 * Keys for properties that can be bound to component props.
 * Maps to Element properties: children, instanceOf, visible (in styles), text
 */
export type BindingKey = 'children' | 'instanceOf' | 'visible' | 'text';
