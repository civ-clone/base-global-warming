"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboveLevel = exports.atLevel = exports.strikes = exports.warns = exports.warmingLevel = exports.stepToward = exports.warmingTarget = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WarmingLevel_1 = require("../Rules/WarmingLevel");
const WarmingStrike_1 = require("../Rules/WarmingStrike");
const WarmingTarget_1 = require("../Rules/WarmingTarget");
const WarmingWarning_1 = require("../Rules/WarmingWarning");
/** This turn's target level: the highest `WarmingTarget` answer, or `fallback` (0) when none is registered. */
const warmingTarget = (pollution, warmings, ruleRegistry = RuleRegistry_1.instance, fallback = 0) => {
    const answers = ruleRegistry.process(WarmingTarget_1.default, pollution, warmings);
    return answers.length === 0 ? fallback : Math.max(...answers);
};
exports.warmingTarget = warmingTarget;
/**
 * A `WarmingLevel` effect: the level moves `step` toward the target (stopping at it), then is kept between `minimum`
 *  and `maximum`.
 */
const stepToward = (step = 1, minimum = 0, maximum = Infinity) => (level, target) => {
    const moved = target > level
        ? Math.min(target, level + step)
        : Math.max(target, level - step);
    return Math.min(maximum, Math.max(minimum, moved));
};
exports.stepToward = stepToward;
/** The level after this turn's move: the highest `WarmingLevel` answer, or `stepToward()`'s when none is registered. */
const warmingLevel = (level, target, ruleRegistry = RuleRegistry_1.instance) => {
    const answers = ruleRegistry.process(WarmingLevel_1.default, level, target);
    return answers.length === 0
        ? (0, exports.stepToward)()(level, target)
        : Math.max(...answers);
};
exports.warmingLevel = warmingLevel;
/** Whether any `WarmingWarning` rule warns at `level` with `pollution`. With none registered, nothing warns. */
const warns = (level, pollution, ruleRegistry = RuleRegistry_1.instance) => ruleRegistry
    .process(WarmingWarning_1.default, level, pollution)
    .some((answer) => answer === true);
exports.warns = warns;
/** Whether any `WarmingStrike` rule strikes at `level` with `pollution`. With none registered, the world never warms. */
const strikes = (level, pollution, ruleRegistry = RuleRegistry_1.instance) => ruleRegistry
    .process(WarmingStrike_1.default, level, pollution)
    .some((answer) => answer === true);
exports.strikes = strikes;
/** A `WarmingWarning` effect: warn when the level is exactly `level` and the pollution is above `pollutionAbove`. */
const atLevel = (level, pollutionAbove = -Infinity) => (current, pollution) => current === level && pollution > pollutionAbove;
exports.atLevel = atLevel;
/** A `WarmingStrike` effect: strike when the level is above `level`. */
const aboveLevel = (level) => (current) => current > level;
exports.aboveLevel = aboveLevel;
//# sourceMappingURL=level.js.map