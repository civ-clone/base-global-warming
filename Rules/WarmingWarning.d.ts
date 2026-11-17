import Rule from '@civ-clone/core-rule/Rule';
/** Whether to warn of warming this turn, given the level after this turn's move and the pollution that counts. */
export declare class WarmingWarning extends Rule<[number, number], boolean> {}
export default WarmingWarning;
