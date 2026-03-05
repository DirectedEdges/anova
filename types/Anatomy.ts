/**
 * Represents the anatomy of a component.
 */
export type Anatomy = Record<string, AnatomyElement>;

/**
 * Reference to an external element type definition.
 * Used when element types are linked to a foundations schema
 * rather than using plain string identifiers.
 */
export type ElementTypeRef = {
  /** URI reference to an external element type definition (e.g. "foundations#/definitions/icon"). */
  $ref: string;
};

/**
 * Represents an element within the anatomy of a component.
 */
export type AnatomyElement = {
  /**
   * The mapped element type. Either a plain string identifier (e.g. "icon", "text")
   * or an `ElementTypeRef` object referencing an external definition.
   */
  type: string | ElementTypeRef;
  detectedIn?: string;
  instanceOf?: string;
};
