"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGlobalWarmingState = exports.globalWarmingState = exports.GLOBAL_WARMING_STATE = void 0;
const PendingEffectRegistry_1 = require("@civ-clone/core-pending-effect/PendingEffectRegistry");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
/**
 * The `PendingEffect` handler name the saved state is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so warming needs no saved class or registry of its own.
 */
exports.GLOBAL_WARMING_STATE = 'base-global-warming:state';
const recordOf = (pendingEffectRegistry) => { var _a; return (_a = pendingEffectRegistry.getByHandler(exports.GLOBAL_WARMING_STATE)[0]) !== null && _a !== void 0 ? _a : null; };
const numberOf = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
/** The saved state, or 0 and 0 in a game that has none yet. */
const globalWarmingState = (pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const record = recordOf(pendingEffectRegistry);
    if (record === null) {
        return { level: 0, warmings: 0 };
    }
    const data = record.data();
    return {
        level: numberOf(data.level),
        warmings: numberOf(data.warmings),
    };
};
exports.globalWarmingState = globalWarmingState;
/**
 * Saves `state`. A game whose level and warmings are both still 0 gets no record, so a game in which nothing has
 *  happened saves exactly as it did before.
 */
const setGlobalWarmingState = ({ level, warmings }, pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const record = recordOf(pendingEffectRegistry), data = { level: String(level), warmings: String(warmings) };
    if (record !== null) {
        record.setData(data);
        return;
    }
    if (level === 0 && warmings === 0) {
        return;
    }
    pendingEffectRegistry.register(new PendingEffect_1.default(exports.GLOBAL_WARMING_STATE, null, data));
};
exports.setGlobalWarmingState = setGlobalWarmingState;
exports.default = exports.globalWarmingState;
//# sourceMappingURL=state.js.map