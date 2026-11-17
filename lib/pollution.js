"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warmingPollution = exports.discounted = exports.pollutedSquares = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const WarmingPollution_1 = require("../Rules/WarmingPollution");
/**
 * Every square that holds a `Pollution` improvement, each once, in the order its pollution was registered.
 *
 * Read from the tile improvements as they stand, so it is right after a load with nothing of its own to save. It walks
 *  the improvements (not the map) once per call: a turn's update calls it once. Counting as pollution comes and goes
 *  would need every way an improvement leaves the registry to say so, and some unregister it directly (pillage, a city
 *  destroyed).
 *
 * `Pollution` is the rule set's class (`base-tile-improvement-pollution`'s, for both of today's), passed in so this
 *  package never brings a copy of its own.
 */
const pollutedSquares = (Pollution, tileImprovementRegistry = TileImprovementRegistry_1.instance) => {
    const squares = new Set();
    tileImprovementRegistry.forEach((improvement) => {
        if (improvement instanceof Pollution) {
            squares.add(improvement.tile());
        }
    });
    return [...squares];
};
exports.pollutedSquares = pollutedSquares;
/**
 * A `WarmingPollution` effect that counts some squares at a discount: each square counts 1, less `timesCounted(tile)`
 *  for the times it falls in a discounted area, plus the total of those times over `divisor`, rounded down. With
 *  `divisor` 2 and squares near computer players' cities counted once per city, a square near one such city counts a
 *  half, the halves added before rounding, and one near two counts nothing.
 */
const discounted = (timesCounted, divisor = 2) => (squares) => {
    const discountedTimes = squares.reduce((total, tile) => total + timesCounted(tile), 0);
    return (squares.length - discountedTimes + Math.floor(discountedTimes / divisor));
};
exports.discounted = discounted;
/**
 * How much `squares` count toward warming: the highest `WarmingPollution` answer, or one each when none is registered.
 *  The highest, not a sum: register one rule, and `replace` it to change it.
 */
const warmingPollution = (squares, ruleRegistry = RuleRegistry_1.instance) => {
    const answers = ruleRegistry.process(WarmingPollution_1.default, squares);
    return answers.length === 0 ? squares.length : Math.max(...answers);
};
exports.warmingPollution = warmingPollution;
exports.default = exports.pollutedSquares;
//# sourceMappingURL=pollution.js.map