import Rule from '@civ-clone/core-rule/Rule';
/**
 * Whether the world warms this turn, given the level after this turn's move and the pollution that counts. Any rule
 *  saying yes strikes, so a second rule can only add a case, never take one away: change a rule with
 *  `RuleRegistry.replace` (by its id) instead.
 */
export declare class WarmingStrike extends Rule<[number, number], boolean> {}
export default WarmingStrike;
