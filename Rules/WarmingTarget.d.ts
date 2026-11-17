import Rule from '@civ-clone/core-rule/Rule';
/** The level warming moves toward this turn, given the pollution that counts (`WarmingPollution`) and the warmings so far. */
export declare class WarmingTarget extends Rule<[number, number], number> {}
export default WarmingTarget;
