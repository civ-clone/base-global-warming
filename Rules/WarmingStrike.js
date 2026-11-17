"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmingStrike = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether the world warms this turn, given the level after this turn's move and the pollution that counts. Any rule
 *  saying yes strikes, so a second rule can only add a case, never take one away: change a rule with
 *  `RuleRegistry.replace` (by its id) instead.
 */
class WarmingStrike extends Rule_1.default {
}
exports.WarmingStrike = WarmingStrike;
exports.default = WarmingStrike;
//# sourceMappingURL=WarmingStrike.js.map