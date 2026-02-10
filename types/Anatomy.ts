/**
 * Represents the anatomy of a component.
 */
export type Anatomy = Record<string, AnatomyElement>;

/**
 * Represents an element within the anatomy of a component.
 */
export type AnatomyElement = {
  /**
   * The mapped element type based on Figma node analysis.
   */
  type: string;
  detectedIn?: string;
  instanceOf?: string;
};
