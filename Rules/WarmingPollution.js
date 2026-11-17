"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmingPollution = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * How much the world's polluted squares count toward warming, given every polluted square (each once, in the order
 *  its pollution was registered). A rule sees the whole list, so it can count a square more than once or not at all.
 * Register one: the reader takes the highest answer, so a second rule can't adjust the first; change it with
 *  `RuleRegistry.replace` (by the rule's id) instead.
 */
class WarmingPollution extends Rule_1.default {
}
exports.WarmingPollution = WarmingPollution;
exports.default = WarmingPollution;
//# sourceMappingURL=WarmingPollution.js.map