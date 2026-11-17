"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmingTarget = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The level warming moves toward this turn, given the pollution that counts (`WarmingPollution`) and the warmings so far.
 * Register one: the reader takes the highest answer, so a second rule can't adjust the first; change it with
 *  `RuleRegistry.replace` (by the rule's id) instead.
 */
class WarmingTarget extends Rule_1.default {
}
exports.WarmingTarget = WarmingTarget;
exports.default = WarmingTarget;
//# sourceMappingURL=WarmingTarget.js.map