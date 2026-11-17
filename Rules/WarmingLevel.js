"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmingLevel = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * The warming level after this turn's move, given the level before it and this turn's target (`WarmingTarget`).
 * Register one: the reader takes the highest answer, so a second rule can't adjust the first; change it with
 *  `RuleRegistry.replace` (by the rule's id) instead.
 */
class WarmingLevel extends Rule_1.default {
}
exports.WarmingLevel = WarmingLevel;
exports.default = WarmingLevel;
//# sourceMappingURL=WarmingLevel.js.map