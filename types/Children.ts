import { ReferenceValue } from './ReferenceValue.js';

/**
 * Data output for children.
 * Can be an array of child names or a ReferenceValue when bound to a prop.
 */
export type Children = string[] | ReferenceValue;
