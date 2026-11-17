import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import WarmingLevel from '../Rules/WarmingLevel';
import WarmingStrike from '../Rules/WarmingStrike';
import WarmingTarget from '../Rules/WarmingTarget';
import WarmingWarning from '../Rules/WarmingWarning';

/** This turn's target level: the highest `WarmingTarget` answer, or `fallback` (0) when none is registered. */
export const warmingTarget = (
  pollution: number,
  warmings: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  fallback: number = 0
): number => {
  const answers = ruleRegistry.process(WarmingTarget, pollution, warmings);

  return answers.length === 0 ? fallback : Math.max(...answers);
};

/**
 * A `WarmingLevel` effect: the level moves `step` toward the target (stopping at it), then is kept between `minimum`
 *  and `maximum`.
 */
export const stepToward =
  (
    step: number = 1,
    minimum: number = 0,
    maximum: number = Infinity
  ): ((level: number, target: number) => number) =>
  (level: number, target: number): number => {
    const moved =
      target > level
        ? Math.min(target, level + step)
        : Math.max(target, level - step);

    return Math.min(maximum, Math.max(minimum, moved));
  };

/** The level after this turn's move: the highest `WarmingLevel` answer, or `stepToward()`'s when none is registered. */
export const warmingLevel = (
  level: number,
  target: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): number => {
  const answers = ruleRegistry.process(WarmingLevel, level, target);

  return answers.length === 0
    ? stepToward()(level, target)
    : Math.max(...answers);
};

/** Whether any `WarmingWarning` rule warns at `level` with `pollution`. With none registered, nothing warns. */
export const warns = (
  level: number,
  pollution: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): boolean =>
  ruleRegistry
    .process(WarmingWarning, level, pollution)
    .some((answer: boolean): boolean => answer === true);

/** Whether any `WarmingStrike` rule strikes at `level` with `pollution`. With none registered, the world never warms. */
export const strikes = (
  level: number,
  pollution: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): boolean =>
  ruleRegistry
    .process(WarmingStrike, level, pollution)
    .some((answer: boolean): boolean => answer === true);

/** A `WarmingWarning` effect: warn when the level is exactly `level` and the pollution is above `pollutionAbove`. */
export const atLevel =
  (
    level: number,
    pollutionAbove: number = -Infinity
  ): ((current: number, pollution: number) => boolean) =>
  (current: number, pollution: number): boolean =>
    current === level && pollution > pollutionAbove;

/** A `WarmingStrike` effect: strike when the level is above `level`. */
export const aboveLevel =
  (level: number): ((current: number) => boolean) =>
  (current: number): boolean =>
    current > level;
