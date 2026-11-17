"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarmedTerrain = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * What a square becomes when the world warms, given the square and how many times the world had warmed before this
 *  one: a terrain class, or `null` (or nothing) to leave it as it is. Asked for every square of the world. The first
 *  rule to name a terrain decides, in the registry's order, so a later rule can't override an earlier one: change it
 *  with `RuleRegistry.replace` (by its id), or place a rule ahead of it with `RuleRegistry.before`.
 */
class WarmedTerrain extends Rule_1.default {
}
exports.WarmedTerrain = WarmedTerrain;
exports.default = WarmedTerrain;
//# sourceMappingURL=WarmedTerrain.js.map