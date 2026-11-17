import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
/**
 * This turn's target level: the highest `WarmingTarget` answer, or `fallback` (0) when none is registered. The highest,
 *  not a sum: put every term of the target in one rule, and `replace` it to change it.
 */
export declare const warmingTarget: (
  pollution: number,
  warmings: number,
  ruleRegistry?: RuleRegistry,
  fallback?: number
) => number;
/**
 * A `WarmingLevel` effect: the level moves `step` toward the target (stopping at it), then is kept between `minimum`
 *  and `maximum`.
 */
export declare const stepToward: (
  step?: number,
  minimum?: number,
  maximum?: number
) => (level: number, target: number) => number;
/**
 * The level after this turn's move: the highest `WarmingLevel` answer, or `stepToward()`'s when none is registered.
 *  Register one rule, and `replace` it to change it.
 */
export declare const warmingLevel: (
  level: number,
  target: number,
  ruleRegistry?: RuleRegistry
) => number;
/** Whether any `WarmingWarning` rule warns at `level` with `pollution`. With none registered, nothing warns. */
export declare const warns: (
  level: number,
  pollution: number,
  ruleRegistry?: RuleRegistry
) => boolean;
/** Whether any `WarmingStrike` rule strikes at `level` with `pollution`. With none registered, the world never warms. */
export declare const strikes: (
  level: number,
  pollution: number,
  ruleRegistry?: RuleRegistry
) => boolean;
/** A `WarmingWarning` effect: warn when the level is exactly `level` and the pollution is above `pollutionAbove`. */
export declare const atLevel: (
  level: number,
  pollutionAbove?: number
) => (current: number, pollution: number) => boolean;
/** A `WarmingStrike` effect: strike when the level is above `level`. */
export declare const aboveLevel: (
  level: number
) => (current: number) => boolean;
