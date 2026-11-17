"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warm = exports.warmedTerrain = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const WarmedTerrain_1 = require("../Rules/WarmedTerrain");
/** What `tile` becomes in a warming after `warmings` earlier ones: the first `WarmedTerrain` answer, or `null`. */
const warmedTerrain = (tile, warmings, ruleRegistry = RuleRegistry_1.instance) => {
    var _a;
    return (_a = ruleRegistry
        .process(WarmedTerrain_1.default, tile, warmings)
        .find((answer) => typeof answer === 'function')) !== null && _a !== void 0 ? _a : null;
};
exports.warmedTerrain = warmedTerrain;
/**
 * Warms `tiles` (the world's squares) after `warmings` earlier warmings, and returns the squares that changed, in the
 *  order given.
 *
 * Every square is decided first and changed after, so no answer depends on a square already changed by this warming.
 *  A square whose answer is its own terrain's class stays as it is. Each change is a new terrain given through
 *  `Tile.setTerrain`, which processes core-world's `TerrainChanged`: what the square keeps (features, improvements) is
 *  the rule set's `TerrainChanged` rules' choice.
 */
const warm = (tiles, warmings, ruleRegistry = RuleRegistry_1.instance) => {
    const changes = tiles
        .map((tile) => [
        tile,
        (0, exports.warmedTerrain)(tile, warmings, ruleRegistry),
    ])
        .filter((change) => change[1] !== null && change[0].terrain().constructor !== change[1]);
    changes.forEach(([tile, To]) => tile.setTerrain(new To(ruleRegistry)));
    return changes.map(([tile]) => tile);
};
exports.warm = warm;
exports.default = exports.warm;
//# sourceMappingURL=warm.js.map