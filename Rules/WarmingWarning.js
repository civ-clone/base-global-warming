"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmingWarning = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether to warn of warming this turn, given the level after this turn's move and the pollution that counts. Any rule
 *  saying yes warns, so a second rule can only add a case, never take one away: change a rule with
 *  `RuleRegistry.replace` (by its id) instead.
 */
class WarmingWarning extends Rule_1.default {
}
exports.WarmingWarning = WarmingWarning;
exports.default = WarmingWarning;
//# sourceMappingURL=WarmingWarning.js.map