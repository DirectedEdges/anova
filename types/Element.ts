import { Children } from "./Children.js";
import { Styles } from "./Styles.js";
import { PropConfigurations } from "./PropConfigurations.js";
import { PropBinding } from "./PropBinding.js";

/**
 * Represents elements within a component.
 */
export type Elements = Record<string, Element>;

/**
 * Represents a single element within a component.
 */
export type Element = {
  children?: Children;
  parent?: string | null;
  styles?: Styles;
  propConfigurations?: PropConfigurations;
  instanceOf?: string | PropBinding;
  /** The content for content-bearing elements: text string for text elements, glyph name for icon elements, or a PropBinding reference. */
  content?: string | PropBinding;
};

/**
 * Element types derived from Figma node analysis
 */
export type ElementType =
  | 'text'
  | 'icon'
  | 'vector'
  | 'container'
  | 'slot'
  | 'instance'
  | 'line'
  | 'ellipse'
  | 'rectangle'
  | 'polygon'
  | 'star';
