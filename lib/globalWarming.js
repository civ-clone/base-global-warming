"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGlobalWarming = exports.GLOBAL_WARMING_WARNING = exports.GLOBAL_WARMING = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const PendingEffectRegistry_1 = require("@civ-clone/core-pending-effect/PendingEffectRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const TileImprovementRegistry_1 = require("@civ-clone/core-tile-improvement/TileImprovementRegistry");
const state_1 = require("./state");
const pollution_1 = require("./pollution");
const level_1 = require("./level");
const warm_1 = require("./warm");
/** Emitted when the world warms, with how many times it has warmed (this one included) and the squares that changed. */
exports.GLOBAL_WARMING = 'world:global-warming';
/** Emitted when a `WarmingWarning` rule warns, with the level and the pollution that counted. */
exports.GLOBAL_WARMING_WARNING = 'world:global-warming-warning';
/**
 * A turn of global warming, for a rule set to call once a turn from a rule of its own:
 *
 * 1. the polluted squares are counted (`lib/pollution`) and weighed (`WarmingPollution`);
 * 2. the saved level moves toward this turn's target (`WarmingTarget`, `WarmingLevel`);
 * 3. `world:global-warming-warning` is emitted if a `WarmingWarning` rule says so;
 * 4. if a `WarmingStrike` rule says so, the world warms: the warmings go up by one, the level goes back to 0, every
 *    square of the world is warmed (`lib/warm`, with the warmings before this one) and `world:global-warming` is
 *    emitted.
 *
 * The level and warmings are saved (`lib/state`) before anything is emitted. With no rules registered, the target is 0,
 *  the level stays 0, nothing warns or strikes and nothing is saved.
 */
const updateGlobalWarming = ({ Pollution, engine = Engine_1.instance, pendingEffectRegistry = PendingEffectRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, tileImprovementRegistry = TileImprovementRegistry_1.instance, world, }) => {
    var _a, _b;
    const squares = (0, pollution_1.pollutedSquares)(Pollution, tileImprovementRegistry), before = (0, state_1.globalWarmingState)(pendingEffectRegistry), pollution = (0, pollution_1.warmingPollution)(squares, ruleRegistry), target = (0, level_1.warmingTarget)(pollution, before.warmings, ruleRegistry), moved = (0, level_1.warmingLevel)(before.level, target, ruleRegistry), warned = (0, level_1.warns)(moved, pollution, ruleRegistry), struck = (0, level_1.strikes)(moved, pollution, ruleRegistry), level = struck ? 0 : moved, warmings = struck ? before.warmings + 1 : before.warmings;
    (0, state_1.setGlobalWarmingState)({ level, warmings }, pendingEffectRegistry);
    if (warned) {
        engine.emit(exports.GLOBAL_WARMING_WARNING, moved, pollution);
    }
    if (!struck) {
        return {
            squares,
            pollution,
            target,
            level,
            warmings,
            warned,
            struck,
            changed: [],
        };
    }
    const map = world ? world() : (_b = (_a = squares[0]) === null || _a === void 0 ? void 0 : _a.map()) !== null && _b !== void 0 ? _b : null, changed = map === null ? [] : (0, warm_1.default)(map.entries(), before.warmings, ruleRegistry);
    engine.emit(exports.GLOBAL_WARMING, warmings, changed);
    return {
        squares,
        pollution,
        target,
        level,
        warmings,
        warned,
        struck,
        changed,
    };
};
exports.updateGlobalWarming = updateGlobalWarming;
exports.default = exports.updateGlobalWarming;
//# sourceMappingURL=globalWarming.js.map