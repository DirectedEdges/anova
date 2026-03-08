import { ElementType } from "./Element.js";

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
   * Constrained to known element types defined in `ElementType`.
   */
  type: ElementType;
  /** The variant in which this element was first detected. */
  detectedIn?: string;
  /** The component or component set name that this instance element references. */
  instanceOf?: string;
};
