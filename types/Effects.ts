import { VariableStyle } from "./Styles.js";

/**
 * A single evaluated shadow (drop or inner).
 * Fields are identical for both roles; the containing key
 * (`dropShadows` vs `innerShadows`) determines render role.
 * `x`, `y`, `blur`, `spread` may be a raw number or a Figma variable reference.
 * `color` is an 8-digit hex string (`#RRGGBBAA`) or a Figma variable reference.
 * `visible` is always a boolean — Figma does not support variable binding on
 * the `visible` field of individual effect items.
 */
export interface Shadow {
  visible: boolean;
  x: number | VariableStyle;
  y: number | VariableStyle;
  blur: number | VariableStyle;
  spread: number | VariableStyle;
  color: string | VariableStyle;
}

/**
 * A single evaluated blur effect (layer blur or background blur).
 * Singular per type; the containing key (`layerBlur` vs `backgroundBlur`)
 * determines render role.
 * `visible` is always a boolean — Figma does not support variable binding on
 * the `visible` field of individual effect items.
 */
export interface Blur {
  visible: boolean;
  radius: number | VariableStyle;
}

/**
 * Inline effects grouped by role.
 * Each key is optional; a key is omitted when no effects of that type are present.
 * Maps directly to platform properties:
 * - `dropShadows` → `box-shadow` / `.shadow()`
 * - `innerShadows` → `inset box-shadow`
 * - `layerBlur` → `filter: blur()`
 * - `backgroundBlur` → `backdrop-filter: blur()`
 */
export interface EffectsGroup {
  /** Ordered list of drop shadows */
  dropShadows?: Shadow[];
  /** Ordered list of inner shadows */
  innerShadows?: Shadow[];
  /** Singular layer blur (filter effect on the node itself) */
  layerBlur?: Blur;
  /** Singular background blur (backdrop filter) */
  backgroundBlur?: Blur;
}
