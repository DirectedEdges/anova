/**
 * Anova Schema Types
 * 
 * TypeScript type definitions matching the Anova JSON schema.
 * These types represent the serialized output format produced by
 * @directededges/anova-transformer and other Anova-compatible tools.
 */

// Core component types
export type { Component } from './Component.js';
export type { Anatomy, AnatomyElement } from './Anatomy.js';
export type { Props, AnyProp, BooleanProp, TextProp, IconProp, EnumProp, SlotProp } from './Props.js';
export type { Variant, Variants } from './Variant.js';
export type { Metadata } from './Metadata.js';
export type { Subcomponent, Subcomponents } from './Subcomponent.js';

// Element and structure types
export type { Element, Elements, ElementType } from './Element.js';
export type { Layout, LayoutNode } from './Layout.js';
export type { Children } from './Children.js';

// Configuration types
export type { PropConfigurations } from './PropConfigurations.js';
export type { Config } from './Config.js';
export { DEFAULT_CONFIG } from './Config.js';

// Style types
export type { Styles, Style, StyleKey, VariableStyle, FigmaStyle } from './Styles.js';

// Reference types
export type { ReferenceValue, BindingKey } from './ReferenceValue.js';
export { isReferenceValue } from './ReferenceValue.js';
