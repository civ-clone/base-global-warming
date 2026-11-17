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
const numberOf = (value, fallback) => {
    const parsed = value === undefined || value === '' ? NaN : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
/** The saved state: level 0, no warmings and no turn in a game that has none. */
const globalWarmingState = (pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const record = recordOf(pendingEffectRegistry);
    if (record === null) {
        return { level: 0, warmings: 0, turn: null };
    }
    const data = record.data(), turn = numberOf(data.turn, NaN);
    return {
        level: numberOf(data.level, 0),
        warmings: numberOf(data.warmings, 0),
        turn: Number.isFinite(turn) ? turn : null,
    };
};
exports.globalWarmingState = globalWarmingState;
/**
 * Saves `state`. The record is dropped when the level and the warmings are both back at 0, and none is made for that
 *  state, so a game in which nothing has happened, or everything has gone back to the start, saves exactly as one
 *  that never had warming. Its `turn` goes with it: see `updateGlobalWarming` for what that means.
 */
const setGlobalWarmingState = ({ level, warmings, turn }, pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const record = recordOf(pendingEffectRegistry);
    if (level === 0 && warmings === 0) {
        if (record !== null) {
            pendingEffectRegistry.unregister(record);
        }
        return;
    }
    const data = {
        level: String(level),
        warmings: String(warmings),
    };
    if (turn !== null && turn !== undefined) {
        data.turn = String(turn);
    }
    if (record !== null) {
        record.setData(data);
        return;
    }
    pendingEffectRegistry.register(new PendingEffect_1.default(exports.GLOBAL_WARMING_STATE, null, data));
};
exports.setGlobalWarmingState = setGlobalWarmingState;
exports.default = exports.globalWarmingState;
//# sourceMappingURL=state.js.map