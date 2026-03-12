import { Anatomy } from "./Anatomy.js";
import { Props } from "./Props.js";
import { Subcomponents } from "./Subcomponent.js";
import { Variant, Variants } from "./Variant.js";
import { Metadata } from "./Metadata.js";
import { PropConfigurations } from "./PropConfigurations.js";

/**
 * Represents a component specification in the Anova format.
 * 
 * This is the top-level structure produced by the anova-transformer
 * and validated against the Anova JSON schema.
 */
export type Component = {
  /**
   * The title of the component.
   */
  title: string;

  /**
   * The anatomy of the component.
   */
  anatomy: Anatomy;

  /**
   * The properties of the component.
   */
  props?: Props;

  /**
   * The subcomponents of the component.
   */
  subcomponents?: Subcomponents;

  /**
   * The default variant of the component.
   */
  default: Variant;

  /**
   * The variants of the component.
   */
  variants?: Variants;

  /**
   * Prop configurations that represent invalid component states.
   */
  invalidPropConfigurations?: PropConfigurations[];

  /**
   * Metadata associated with the component.
   */
  metadata?: Metadata;
};
